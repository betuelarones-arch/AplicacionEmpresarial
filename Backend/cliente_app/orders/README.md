# Sistema de Órdenes y Pagos con Stripe

Este módulo implementa un sistema completo de gestión de órdenes de compra con integración de pagos mediante Stripe.

## Estructura del Módulo

```
orders/
├── models.py          # Modelos Order y OrderItem
├── serializers.py     # Serializers para validación y serialización
├── views.py           # ViewSet con lógica de negocio
├── urls.py            # Configuración de rutas
├── admin.py           # Panel de administración
└── migrations/        # Migraciones de base de datos
```

## Modelos

### Order
Representa una orden de compra completa.

**Campos:**
- `user`: Usuario que realizó la orden (ForeignKey a User)
- `created_at`, `updated_at`: Timestamps automáticos
- `total_amount`: Monto total de la orden (DecimalField)
- `status`: Estado actual (pending, processing, paid, failed, completed, cancelled)
- `stripe_payment_intent_id`: ID del PaymentIntent de Stripe
- `billing_name`, `billing_email`, `billing_phone`: Datos de contacto
- `billing_address`, `billing_city`, `billing_country`: Dirección de facturación
- `notes`: Notas opcionales del cliente

### OrderItem
Representa un item individual dentro de una orden.

**Campos:**
- `order`: Orden a la que pertenece (ForeignKey a Order)
- `producto`: Producto ordenado (ForeignKey a Producto)
- `cantidad`: Cantidad de productos
- `precio_unitario`: Precio al momento de la compra
- `subtotal`: Calculado automáticamente (precio_unitario * cantidad)

**Nota importante:** El precio se guarda al momento de la compra para mantener un historial preciso incluso si los precios cambian posteriormente.

## Endpoints Disponibles

### 1. Listar Órdenes del Usuario
```
GET /api/orders/
```

**Autenticación:** Requerida (Token)

**Respuesta:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "usuario",
      "email": "usuario@ejemplo.com"
    },
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-01T10:05:00Z",
    "total_amount": "75.00",
    "status": "paid",
    "stripe_payment_intent_id": "pi_xxx",
    "billing_name": "Juan Pérez",
    "billing_email": "juan@ejemplo.com",
    "billing_phone": "+1234567890",
    "billing_address": "Calle 123",
    "billing_city": "Ciudad",
    "billing_country": "US",
    "notes": "",
    "items": [
      {
        "id": 1,
        "producto": {
          "id": 1,
          "nombre": "Producto 1",
          "precio": "25.00",
          "stock": 10
        },
        "cantidad": 2,
        "precio_unitario": "25.00",
        "subtotal": "50.00"
      }
    ]
  }
]
```

### 2. Detalle de Orden Específica
```
GET /api/orders/{id}/
```

**Autenticación:** Requerida (Token)

**Parámetros:**
- `id`: ID de la orden

**Respuesta:** Igual al formato anterior, pero solo una orden.

**Nota:** El usuario solo puede ver sus propias órdenes.

### 3. Crear Nueva Orden
```
POST /api/orders/create_order/
```

**Autenticación:** Requerida (Token)

**Request Body:**
```json
{
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 3,
      "cantidad": 1
    }
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
```

**Proceso:**
1. Valida los items del carrito y datos de facturación
2. Verifica que haya stock suficiente para todos los productos
3. Calcula el total de la orden
4. Crea un Payment Intent en Stripe
5. Crea la orden en estado "pending"
6. Crea los items de la orden
7. Retorna la orden con el `client_secret` para completar el pago en el frontend

**Respuesta Exitosa (201):**
```json
{
  "id": 1,
  "user": {...},
  "items": [...],
  "total_amount": "75.00",
  "status": "pending",
  "stripe_payment_intent_id": "pi_xxx",
  "client_secret": "pi_xxx_secret_yyy",
  "created_at": "2025-12-01T10:00:00Z",
  ...
}
```

**Errores Posibles:**
- `400 Bad Request`: Datos inválidos o stock insuficiente
- `404 Not Found`: Producto no existe
- `500 Internal Server Error`: Error al procesar con Stripe

### 4. Confirmar Pago
```
POST /api/orders/confirm_payment/
```

**Autenticación:** Requerida (Token)

**Request Body:**
```json
{
  "payment_intent_id": "pi_xxx"
}
```

**Proceso:**
1. Busca la orden asociada al payment_intent_id
2. Verifica el estado del pago con Stripe
3. Actualiza el estado de la orden según el resultado
4. Si el pago es exitoso (status = 'succeeded'):
   - Actualiza el estado a 'paid'
   - Reduce el stock de los productos
5. Retorna la orden actualizada

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "status": "paid",
  ...
}
```

**Estados posibles:**
- `succeeded` → orden = 'paid' (reduce stock)
- `processing` → orden = 'processing'
- `requires_payment_method` → orden = 'failed'
- `canceled` → orden = 'cancelled'

## Flujo de Trabajo Completo

### Frontend:

1. **El usuario agrega productos al carrito**
   - Almacenar en estado local (React Context, Redux, etc.)

2. **Usuario inicia checkout**
   ```javascript
   POST /api/orders/create_order/
   {
     items: cartItems,
     billing_details: formData
   }
   ```

3. **Recibe client_secret**
   ```javascript
   const { client_secret, id } = response.data;
   ```

4. **Procesa el pago con Stripe Elements**
   ```javascript
   const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
   const { error, paymentIntent } = await stripe.confirmCardPayment(
     client_secret,
     {
       payment_method: {
         card: cardElement,
         billing_details: {...}
       }
     }
   );
   ```

5. **Confirma el pago con el backend**
   ```javascript
   POST /api/orders/confirm_payment/
   {
     payment_intent_id: paymentIntent.id
   }
   ```

6. **Muestra confirmación al usuario**
   - Redirigir a página de éxito
   - Mostrar detalles de la orden

## Configuración de Stripe

### Variables de Entorno (.env)
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Settings.py
```python
from decouple import config

STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
```

### Obtener Claves de Stripe
1. Crear cuenta en [Stripe](https://stripe.com)
2. Ir a [Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys)
3. Copiar las claves de prueba (test mode)
4. Para producción, activar cuenta y usar claves live

## Seguridad

### Validaciones Implementadas:
- ✓ Autenticación obligatoria (IsAuthenticated)
- ✓ Los usuarios solo pueden ver sus propias órdenes
- ✓ Verificación de stock antes de crear orden
- ✓ Doble verificación de stock en transacción atómica
- ✓ Uso de `select_for_update()` para evitar race conditions
- ✓ Validación de datos con serializers
- ✓ Verificación del pago con Stripe antes de reducir stock
- ✓ Transacciones atómicas para consistencia de datos

### Recomendaciones Adicionales:
- Usar HTTPS en producción
- Configurar webhooks de Stripe para pagos asíncronos
- Implementar logging de transacciones
- Configurar rate limiting para endpoints de creación
- Monitorear intentos de pago fallidos

## Transacciones Atómicas

Ambos endpoints críticos usan `@transaction.atomic`:
- Si cualquier operación falla, se revierte toda la transacción
- Garantiza consistencia en la base de datos
- Evita órdenes sin items o stock reducido sin pago

## Estados de Orden

| Estado | Descripción | Transición |
|--------|-------------|-----------|
| pending | Orden creada, pago pendiente | → processing / paid / failed |
| processing | Pago en proceso | → paid / failed |
| paid | Pago exitoso, stock reducido | → completed |
| failed | Pago fallido | → pending (retry) |
| completed | Orden entregada | Estado final |
| cancelled | Orden cancelada | Estado final |

## Panel de Administración

El módulo incluye configuración completa para Django Admin:

### Características:
- Vista de órdenes con filtros por estado y fecha
- Búsqueda por usuario, email, nombre
- Items de la orden mostrados inline
- Campos de solo lectura para datos críticos
- No se permite crear/eliminar órdenes desde admin

### Acceso:
```
http://localhost:8000/admin/orders/order/
```

## Testing (Recomendado)

### Ejemplo de Test para Crear Orden:
```python
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from productos.models import Producto

class OrderTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test',
            password='test123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_order(self):
        # Crear producto de prueba
        producto = Producto.objects.create(
            nombre='Test',
            precio=10.00,
            stock=5
        )

        # Datos de la orden
        data = {
            'items': [
                {'producto_id': producto.id, 'cantidad': 2}
            ],
            'billing_details': {
                'name': 'Test User',
                'email': 'test@test.com',
                'phone': '123456',
                'address': 'Test St',
                'city': 'Test City',
                'country': 'US'
            }
        }

        # Crear orden
        response = self.client.post('/api/orders/create_order/', data)
        self.assertEqual(response.status_code, 201)
        self.assertIn('client_secret', response.data)
```

## Troubleshooting

### Error: "ModuleNotFoundError: No module named 'stripe'"
**Solución:** Instalar stripe
```bash
pip install stripe==11.2.0
```

### Error: "Stock insuficiente"
**Causa:** El producto no tiene suficiente stock
**Solución:** Verificar y actualizar el stock del producto

### Error: "Error al procesar con Stripe"
**Causas posibles:**
- Claves de Stripe incorrectas o no configuradas
- Problema de conectividad con Stripe API
- Formato de datos incorrecto

**Solución:** Verificar configuración en .env y logs de Stripe

### Orden en estado "pending" no se actualiza
**Causa:** No se llamó al endpoint `confirm_payment`
**Solución:** Asegurarse de confirmar el pago después de usar Stripe Elements

## Próximos Pasos

### Mejoras Recomendadas:
1. Implementar webhooks de Stripe para pagos asíncronos
2. Agregar sistema de notificaciones por email
3. Implementar historial de estados de orden
4. Agregar soporte para cupones de descuento
5. Implementar cálculo de impuestos por región
6. Agregar tracking de envío
7. Sistema de reembolsos

## Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Transactions](https://docs.djangoproject.com/en/5.2/topics/db/transactions/)

## Soporte

Para reportar bugs o solicitar características, crear un issue en el repositorio del proyecto.
