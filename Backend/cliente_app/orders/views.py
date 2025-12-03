from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.conf import settings
from decimal import Decimal
import stripe

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    CreateOrderSerializer,
    ConfirmPaymentSerializer,
)
from productos.models import Producto


# Configurar Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para gestionar órdenes de compra.

    Endpoints:
    - GET /api/orders/ - Lista de órdenes del usuario autenticado
    - GET /api/orders/{id}/ - Detalle de una orden específica
    - POST /api/orders/create_order/ - Crear nueva orden con Payment Intent
    - POST /api/orders/confirm_payment/ - Confirmar pago y actualizar orden
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retorna solo las órdenes del usuario autenticado."""
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items',
            'items__producto',
            'items__producto__categoria'
        )

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def create_order(self, request):
        """
        Crea una nueva orden con integración de Stripe.

        Proceso:
        1. Valida items del carrito y datos de facturación
        2. Verifica stock de productos
        3. Calcula el total de la orden
        4. Crea Payment Intent en Stripe
        5. Crea la orden y sus items
        6. Retorna la orden con client_secret para el frontend

        Request body:
        {
            "items": [
                {"producto_id": 1, "cantidad": 2},
                {"producto_id": 3, "cantidad": 1}
            ],
            "billing_details": {
                "name": "Juan Pérez",
                "email": "juan@ejemplo.com",
                "phone": "+1234567890",
                "address": "Calle 123",
                "city": "Ciudad",
                "country": "US"
            },
            "notes": "Notas opcionales"
        }
        """
        # Validar datos de entrada
        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        items_data = validated_data['items']
        billing_details = validated_data.get('billing_details', {})
        notes = validated_data.get('notes', '')

        # Auto-completar billing_details con datos del perfil si están vacíos
        if not billing_details.get('name'):
            full_name = f"{request.user.first_name} {request.user.last_name}".strip()
            billing_details['name'] = full_name if full_name else request.user.username

        if not billing_details.get('email'):
            billing_details['email'] = request.user.email

        # Auto-completar con datos del perfil si existen
        if hasattr(request.user, 'profile'):
            profile = request.user.profile

            if not billing_details.get('phone') and profile.phone:
                billing_details['phone'] = profile.phone

            if not billing_details.get('address') and profile.default_address:
                billing_details['address'] = profile.default_address

            if not billing_details.get('city') and profile.default_city:
                billing_details['city'] = profile.default_city

            if not billing_details.get('country') and profile.default_country:
                billing_details['country'] = profile.default_country

        # Valores por defecto para campos requeridos
        billing_details.setdefault('phone', '')
        billing_details.setdefault('address', '')
        billing_details.setdefault('city', '')
        billing_details.setdefault('country', 'US')

        try:
            # Calcular total y verificar stock
            total_amount = Decimal('0.00')
            items_to_create = []

            for item_data in items_data:
                producto = Producto.objects.select_for_update().get(
                    id=item_data['producto_id']
                )
                cantidad = item_data['cantidad']

                # Verificar stock nuevamente (doble verificación)
                if producto.stock < cantidad:
                    return Response(
                        {
                            'error': f'Stock insuficiente para {producto.nombre}. '
                                   f'Disponible: {producto.stock}'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                precio_unitario = producto.precio
                subtotal = precio_unitario * cantidad
                total_amount += subtotal

                items_to_create.append({
                    'producto': producto,
                    'cantidad': cantidad,
                    'precio_unitario': precio_unitario,
                    'subtotal': subtotal,
                })

            # Crear Payment Intent en Stripe
            try:
                payment_intent = stripe.PaymentIntent.create(
                    amount=int(total_amount * 100),  # Convertir a centavos
                    currency='usd',
                    metadata={
                        'user_id': request.user.id,
                        'user_email': request.user.email,
                    },
                    description=f'Orden para {billing_details["name"]}',
                )
            except stripe.error.StripeError as e:
                return Response(
                    {'error': f'Error al procesar con Stripe: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Crear la orden
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                status='pending',
                stripe_payment_intent_id=payment_intent.id,
                billing_name=billing_details['name'],
                billing_email=billing_details['email'],
                billing_phone=billing_details['phone'],
                billing_address=billing_details['address'],
                billing_city=billing_details['city'],
                billing_country=billing_details['country'],
                notes=notes,
            )

            # Crear items de la orden
            for item_data in items_to_create:
                OrderItem.objects.create(
                    order=order,
                    producto=item_data['producto'],
                    cantidad=item_data['cantidad'],
                    precio_unitario=item_data['precio_unitario'],
                    subtotal=item_data['subtotal'],
                )

            # Preparar respuesta con client_secret
            order_serializer = OrderSerializer(order)
            response_data = order_serializer.data
            response_data['client_secret'] = payment_intent.client_secret

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Producto.DoesNotExist:
            return Response(
                {'error': 'Uno o más productos no existen'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al crear la orden: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def confirm_payment(self, request):
        """
        Confirma un pago y actualiza el estado de la orden.

        Proceso:
        1. Recibe payment_intent_id
        2. Verifica el estado del pago con Stripe
        3. Actualiza el estado de la orden
        4. Reduce el stock si el pago fue exitoso
        5. Retorna la orden actualizada

        Request body:
        {
            "payment_intent_id": "pi_xxx"
        }
        """
        # Validar datos de entrada
        serializer = ConfirmPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_intent_id = serializer.validated_data['payment_intent_id']

        try:
            # Buscar la orden
            order = Order.objects.select_for_update().get(
                stripe_payment_intent_id=payment_intent_id,
                user=request.user
            )

            # Verificar estado del pago con Stripe
            try:
                payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            except stripe.error.StripeError as e:
                return Response(
                    {'error': f'Error al verificar el pago con Stripe: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Actualizar estado de la orden según el estado del pago
            if payment_intent.status == 'succeeded':
                order.status = 'paid'

                # Reducir stock de productos
                for item in order.items.all():
                    producto = Producto.objects.select_for_update().get(
                        id=item.producto.id
                    )
                    producto.stock -= item.cantidad
                    producto.save()

            elif payment_intent.status == 'processing':
                order.status = 'processing'
            elif payment_intent.status == 'requires_payment_method':
                order.status = 'failed'
            elif payment_intent.status == 'canceled':
                order.status = 'cancelled'
            else:
                order.status = 'failed'

            order.save()

            # Retornar orden actualizada
            order_serializer = OrderSerializer(order)
            return Response(order_serializer.data, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response(
                {'error': 'Orden no encontrada o no pertenece al usuario'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al confirmar el pago: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
