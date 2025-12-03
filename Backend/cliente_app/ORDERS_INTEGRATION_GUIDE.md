# Guía de Integración del Sistema de Órdenes

## Resumen de Implementación

Se ha implementado un sistema completo de órdenes con integración de Stripe para procesar pagos.

## Archivos Creados/Modificados

### Nuevos Archivos:
```
Backend/cliente_app/orders/
├── models.py                    # Modelos Order y OrderItem
├── serializers.py               # Serializers para validación
├── views.py                     # OrderViewSet con lógica de Stripe
├── urls.py                      # Configuración de URLs
├── admin.py                     # Panel de administración
├── migrations/
│   └── 0001_initial.py         # Migración inicial
└── README.md                    # Documentación completa
```

### Archivos Modificados:
- `cliente_app/settings.py` - Agregado 'orders' a INSTALLED_APPS y configuración de Stripe
- `cliente_app/urls.py` - Incluidas las URLs de orders
- `requirements.txt` - Agregado stripe==11.2.0
- `.env` - Agregadas variables STRIPE_SECRET_KEY y STRIPE_PUBLISHABLE_KEY
- `.env.example` - Documentación de variables de entorno

## Endpoints Disponibles

| Método | URL | Descripción | Auth |
|--------|-----|-------------|------|
| GET | `/api/orders/` | Lista de órdenes del usuario | Requerida |
| GET | `/api/orders/{id}/` | Detalle de orden específica | Requerida |
| POST | `/api/orders/create_order/` | Crear nueva orden | Requerida |
| POST | `/api/orders/confirm_payment/` | Confirmar pago | Requerida |

## Pasos para Usar el Sistema

### 1. Instalar Dependencias
```bash
cd Backend/cliente_app
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Editar el archivo `.env` con tus claves de Stripe:
```env
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
```

Obtener claves en: https://dashboard.stripe.com/apikeys

### 3. Aplicar Migraciones (Ya aplicadas)
```bash
python manage.py migrate
```

### 4. Iniciar el Servidor
```bash
python manage.py runserver
```

## Integración con Frontend (React)

### Instalación de Stripe en Frontend
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Ejemplo de Implementación

#### 1. Configurar Stripe Provider (App.jsx)
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51SXTIPP2Oak1K5zuFxVJzUDum7mVq8Pae5mbnLm2ZFxEi3ZkKoBfCFeAyMNtPbgrmQZKlwx2e7Dch3utkcoXLFEF009Rp6gTbX');

function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Tu app aquí */}
    </Elements>
  );
}
```

#### 2. Crear Orden (CheckoutPage.jsx)
```javascript
import axios from 'axios';

const handleCheckout = async (cartItems, billingDetails) => {
  try {
    // 1. Crear orden y obtener client_secret
    const response = await axios.post(
      'http://localhost:8000/api/orders/create_order/',
      {
        items: cartItems.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity
        })),
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
          address: billingDetails.address,
          city: billingDetails.city,
          country: billingDetails.country || 'US'
        },
        notes: billingDetails.notes || ''
      },
      {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      }
    );

    const { client_secret, id: orderId } = response.data;

    // Guardar client_secret para el siguiente paso
    return { clientSecret: client_secret, orderId };

  } catch (error) {
    console.error('Error al crear orden:', error.response?.data);
    throw error;
  }
};
```

#### 3. Procesar Pago (PaymentForm.jsx)
```javascript
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const PaymentForm = ({ clientSecret, orderId, billingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // 2. Confirmar pago con Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            phone: billingDetails.phone,
            address: {
              line1: billingDetails.address,
              city: billingDetails.city,
              country: billingDetails.country
            }
          }
        }
      }
    );

    if (error) {
      console.error('Error en el pago:', error);
      alert('Error al procesar el pago: ' + error.message);
      return;
    }

    // 3. Confirmar pago con el backend
    try {
      const response = await axios.post(
        'http://localhost:8000/api/orders/confirm_payment/',
        {
          payment_intent_id: paymentIntent.id
        },
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Orden confirmada:', response.data);

      // 4. Redirigir a página de éxito
      window.location.href = `/order-success/${orderId}`;

    } catch (error) {
      console.error('Error al confirmar pago:', error.response?.data);
      alert('Error al confirmar el pago');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pagar
      </button>
    </form>
  );
};
```

#### 4. Componente Completo de Checkout
```javascript
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe('pk_test_tu_clave_publica_aqui');

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'US',
    notes: ''
  });

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:8000/api/orders/create_order/',
        {
          items: cartItems.map(item => ({
            producto_id: item.id,
            cantidad: item.quantity
          })),
          billing_details: billingDetails,
          notes: billingDetails.notes
        },
        {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        }
      );

      setClientSecret(response.data.client_secret);
      setOrderId(response.data.id);

    } catch (error) {
      console.error('Error:', error.response?.data);
      alert('Error al crear la orden');
    }
  };

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise}>
        <PaymentForm
          clientSecret={clientSecret}
          orderId={orderId}
          billingDetails={billingDetails}
          onSuccess={() => {
            clearCart();
            window.location.href = `/order-success/${orderId}`;
          }}
        />
      </Elements>
    );
  }

  return (
    <div>
      <h1>Checkout</h1>

      {/* Resumen del carrito */}
      <div>
        <h2>Tu carrito</h2>
        {cartItems.map(item => (
          <div key={item.id}>
            {item.nombre} x {item.quantity} = ${item.precio * item.quantity}
          </div>
        ))}
        <h3>Total: ${cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0)}</h3>
      </div>

      {/* Formulario de datos de facturación */}
      <form onSubmit={handleCreateOrder}>
        <h2>Datos de facturación</h2>

        <input
          type="text"
          placeholder="Nombre completo"
          value={billingDetails.name}
          onChange={(e) => setBillingDetails({...billingDetails, name: e.target.value})}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={billingDetails.email}
          onChange={(e) => setBillingDetails({...billingDetails, email: e.target.value})}
          required
        />

        <input
          type="tel"
          placeholder="Teléfono"
          value={billingDetails.phone}
          onChange={(e) => setBillingDetails({...billingDetails, phone: e.target.value})}
          required
        />

        <input
          type="text"
          placeholder="Dirección"
          value={billingDetails.address}
          onChange={(e) => setBillingDetails({...billingDetails, address: e.target.value})}
          required
        />

        <input
          type="text"
          placeholder="Ciudad"
          value={billingDetails.city}
          onChange={(e) => setBillingDetails({...billingDetails, city: e.target.value})}
          required
        />

        <select
          value={billingDetails.country}
          onChange={(e) => setBillingDetails({...billingDetails, country: e.target.value})}
        >
          <option value="US">Estados Unidos</option>
          <option value="MX">México</option>
          <option value="ES">España</option>
        </select>

        <textarea
          placeholder="Notas adicionales (opcional)"
          value={billingDetails.notes}
          onChange={(e) => setBillingDetails({...billingDetails, notes: e.target.value})}
        />

        <button type="submit">Continuar al pago</button>
      </form>
    </div>
  );
};

export default CheckoutPage;
```

#### 5. Página de Éxito
```javascript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/orders/${orderId}/`,
          {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`
            }
          }
        );
        setOrder(response.data);
      } catch (error) {
        console.error('Error al obtener orden:', error);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return <div>Cargando...</div>;

  return (
    <div>
      <h1>¡Pago exitoso!</h1>
      <h2>Orden #{order.id}</h2>

      <div>
        <h3>Detalles de la orden</h3>
        <p>Estado: {order.status}</p>
        <p>Total: ${order.total_amount}</p>
        <p>Fecha: {new Date(order.created_at).toLocaleDateString()}</p>
      </div>

      <div>
        <h3>Productos</h3>
        {order.items.map(item => (
          <div key={item.id}>
            {item.producto.nombre} x {item.cantidad} = ${item.subtotal}
          </div>
        ))}
      </div>

      <div>
        <h3>Datos de facturación</h3>
        <p>{order.billing_name}</p>
        <p>{order.billing_email}</p>
        <p>{order.billing_phone}</p>
        <p>{order.billing_address}</p>
        <p>{order.billing_city}, {order.billing_country}</p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
```

## Tarjetas de Prueba de Stripe

Para probar en modo test, usar estas tarjetas:

| Número | Descripción |
|--------|-------------|
| 4242 4242 4242 4242 | Pago exitoso |
| 4000 0000 0000 9995 | Pago rechazado |
| 4000 0027 6000 3184 | Requiere autenticación 3D Secure |

- Fecha de expiración: Cualquier fecha futura
- CVC: Cualquier 3 dígitos
- Código postal: Cualquier 5 dígitos

## Verificación del Sistema

### Verificar que todo está correctamente configurado:
```bash
# 1. Verificar que no hay errores
python manage.py check

# 2. Verificar migraciones
python manage.py showmigrations orders

# 3. Iniciar servidor
python manage.py runserver
```

### Probar endpoints con cURL:

#### Crear orden:
```bash
curl -X POST http://localhost:8000/api/orders/create_order/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token TU_TOKEN_AQUI" \
  -d '{
    "items": [
      {"producto_id": 1, "cantidad": 2}
    ],
    "billing_details": {
      "name": "Test User",
      "email": "test@test.com",
      "phone": "1234567890",
      "address": "Test St 123",
      "city": "Test City",
      "country": "US"
    }
  }'
```

#### Listar órdenes:
```bash
curl http://localhost:8000/api/orders/ \
  -H "Authorization: Token TU_TOKEN_AQUI"
```

## Solución de Problemas

### Error: "Authentication credentials were not provided"
**Solución:** Asegúrate de incluir el header Authorization con el token del usuario.

### Error: "Stock insuficiente"
**Solución:** Verifica que los productos tengan stock disponible en la base de datos.

### Error: "Stripe API error"
**Solución:**
1. Verifica que las claves de Stripe en `.env` sean correctas
2. Asegúrate de estar en modo test (claves que empiezan con `sk_test_`)
3. Verifica tu conexión a internet

### Los pagos no se reflejan en Stripe Dashboard
**Causa:** Estás usando claves diferentes en frontend y backend
**Solución:** Usa las mismas claves en ambos lados

## Próximos Pasos Recomendados

1. **Implementar Webhooks de Stripe:**
   - Para manejar pagos asíncronos
   - Actualizar estado de órdenes automáticamente

2. **Notificaciones por Email:**
   - Confirmar orden creada
   - Confirmar pago exitoso
   - Actualización de estado

3. **Dashboard de Usuario:**
   - Ver historial de órdenes
   - Descargar facturas
   - Seguimiento de envíos

4. **Mejoras de Seguridad:**
   - Rate limiting
   - Validación adicional de datos
   - Logging de transacciones

## Recursos

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe React Elements](https://stripe.com/docs/stripe-js/react)
- [Testing con Stripe](https://stripe.com/docs/testing)
- [Django REST Framework](https://www.django-rest-framework.org/)

## Contacto y Soporte

Para preguntas o problemas, revisar la documentación completa en `orders/README.md`
