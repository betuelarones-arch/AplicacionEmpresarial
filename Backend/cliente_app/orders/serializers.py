from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Order, OrderItem
from productos.serializers import ProductoSerializer
from productos.models import Producto


class UserSerializer(serializers.ModelSerializer):
    """Serializer básico para información del usuario."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username', 'email']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items de la orden.
    Incluye información completa del producto.
    """

    producto = ProductoSerializer(read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(),
        write_only=True,
        source='producto'
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'producto',
            'producto_id',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]
        read_only_fields = ['id', 'precio_unitario', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer completo para órdenes.
    Incluye información del usuario, items y campos calculados.
    """

    user = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    client_secret = serializers.CharField(read_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
            'total_amount',
            'status',
            'stripe_payment_intent_id',
            'billing_name',
            'billing_email',
            'billing_phone',
            'billing_address',
            'billing_city',
            'billing_country',
            'notes',
            'items',
            'client_secret',
        ]
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
            'total_amount',
            'status',
            'stripe_payment_intent_id',
        ]


class CreateOrderItemSerializer(serializers.Serializer):
    """Serializer para validar items al crear una orden."""

    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)

    def validate_producto_id(self, value):
        """Valida que el producto exista."""
        try:
            Producto.objects.get(id=value)
        except Producto.DoesNotExist:
            raise serializers.ValidationError(f"Producto con ID {value} no existe.")
        return value


class BillingDetailsSerializer(serializers.Serializer):
    """Serializer para validar datos de facturación."""

    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=2, default='US')


class CreateOrderSerializer(serializers.Serializer):
    """
    Serializer para validar la creación de una orden.
    Valida items del carrito y datos de facturación.
    """

    items = CreateOrderItemSerializer(many=True)
    billing_details = BillingDetailsSerializer()
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_items(self, value):
        """Valida que haya al menos un item en la orden."""
        if not value:
            raise serializers.ValidationError("La orden debe tener al menos un item.")
        return value

    def validate(self, data):
        """
        Validación adicional de la orden completa.
        Verifica stock disponible para todos los productos.
        """
        items = data.get('items', [])

        # Verificar stock para cada producto
        for item_data in items:
            producto = Producto.objects.get(id=item_data['producto_id'])
            cantidad_solicitada = item_data['cantidad']

            if producto.stock < cantidad_solicitada:
                raise serializers.ValidationError({
                    'items': f"Stock insuficiente para {producto.nombre}. "
                             f"Disponible: {producto.stock}, Solicitado: {cantidad_solicitada}"
                })

        return data


class ConfirmPaymentSerializer(serializers.Serializer):
    """Serializer para confirmar un pago."""

    payment_intent_id = serializers.CharField(max_length=255)
