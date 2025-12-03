# Guia de Integracion - Sistema de Ordenes

## Instalacion de Dependencias

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## 1. Configuracion de Stripe (src/config/stripe.js)

```javascript
import { loadStripe } from '@stripe/stripe-js';

// Clave publica de Stripe (modo test)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SXTIPP2Oak1K5zuFxVJzUDum7mVq8Pae5mbnLm2ZFxEi3ZkKoBfCFeAyMNtPbgrmQZKlwx2e7Dch3utkcoXLFEF009Rp6gTbX';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
```

## 2. Actualizar App.jsx

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './config/stripe';
import { CartProvider } from './context/CartContext';

// Importar nuevas paginas
import CheckoutPage from './pages/shop/CheckoutPage';
import OrderSuccessPage from './pages/shop/OrderSuccessPage';

function App() {
  return (
    <Elements stripe={stripePromise}>
      <CartProvider>
        <Router>
          <Routes>
            {/* Rutas existentes... */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </Elements>
  );
}

export default App;
```

## 3. Actualizar CartContext.jsx

Agregar funcion para limpiar el carrito:

```javascript
// En CartContext.jsx, agregar:

const clearCart = () => {
  setCartItems([]);
  localStorage.removeItem('cart');
};

// Agregar al return del provider:
return (
  <CartContext.Provider value={{
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart  // <- Agregar esto
  }}>
    {children}
  </CartContext.Provider>
);
```

## 4. Crear CheckoutPage.jsx

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1 = billing, 2 = payment
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

  // Calcular total del carrito
  const total = cartItems.reduce((sum, item) =>
    sum + (item.precio * item.quantity), 0
  );

  // Paso 1: Crear orden
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/orders/create_order/`,
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
            country: billingDetails.country
          },
          notes: billingDetails.notes
        },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setClientSecret(response.data.client_secret);
      setOrderId(response.data.id);
      setStep(2); // Pasar a paso de pago

    } catch (err) {
      console.error('Error al crear orden:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.items ||
        'Error al crear la orden. Por favor intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Procesar pago
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirmar pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
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

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Confirmar pago con backend
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/orders/confirm_payment/`,
        {
          payment_intent_id: paymentIntent.id
        },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Limpiar carrito y redirigir
      clearCart();
      navigate(`/order-success/${orderId}`);

    } catch (err) {
      console.error('Error al procesar pago:', err);
      setError('Error al procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Carrito vacio</h1>
        <p>No tienes productos en tu carrito.</p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Ir a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resumen del carrito */}
        <div>
          <h2 className="text-xl font-bold mb-4">Resumen de la orden</h2>
          <div className="bg-gray-100 p-4 rounded">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>{item.nombre} x {item.quantity}</span>
                <span>${(item.precio * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formularios */}
        <div>
          {step === 1 ? (
            // Paso 1: Datos de facturacion
            <form onSubmit={handleCreateOrder}>
              <h2 className="text-xl font-bold mb-4">Datos de facturacion</h2>

              <div className="mb-4">
                <label className="block mb-2">Nombre completo *</label>
                <input
                  type="text"
                  value={billingDetails.name}
                  onChange={(e) => setBillingDetails({...billingDetails, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Email *</label>
                <input
                  type="email"
                  value={billingDetails.email}
                  onChange={(e) => setBillingDetails({...billingDetails, email: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Telefono *</label>
                <input
                  type="tel"
                  value={billingDetails.phone}
                  onChange={(e) => setBillingDetails({...billingDetails, phone: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Direccion *</label>
                <input
                  type="text"
                  value={billingDetails.address}
                  onChange={(e) => setBillingDetails({...billingDetails, address: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Ciudad *</label>
                <input
                  type="text"
                  value={billingDetails.city}
                  onChange={(e) => setBillingDetails({...billingDetails, city: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Pais *</label>
                <select
                  value={billingDetails.country}
                  onChange={(e) => setBillingDetails({...billingDetails, country: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="US">Estados Unidos</option>
                  <option value="MX">Mexico</option>
                  <option value="ES">Espana</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Notas adicionales</label>
                <textarea
                  value={billingDetails.notes}
                  onChange={(e) => setBillingDetails({...billingDetails, notes: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Procesando...' : 'Continuar al pago'}
              </button>
            </form>
          ) : (
            // Paso 2: Pago con tarjeta
            <form onSubmit={handlePayment}>
              <h2 className="text-xl font-bold mb-4">Informacion de pago</h2>

              <div className="mb-4">
                <label className="block mb-2">Datos de la tarjeta</label>
                <div className="p-3 border rounded">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded mb-4">
                <h3 className="font-bold mb-2">Tarjetas de prueba:</h3>
                <p className="text-sm">4242 4242 4242 4242 (Exito)</p>
                <p className="text-sm">4000 0000 0000 9995 (Rechazado)</p>
                <p className="text-sm text-gray-600">Fecha: cualquier futura, CVC: cualquier 3 digitos</p>
              </div>

              <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Procesando pago...' : `Pagar $${total.toFixed(2)}`}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                disabled={loading}
              >
                Volver
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
```

## 5. Crear OrderSuccessPage.jsx

```javascript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/orders/${orderId}/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );

        setOrder(response.data);
      } catch (err) {
        console.error('Error al obtener orden:', err);
        setError('Error al cargar los detalles de la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Encabezado de exito */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded mb-6">
          <h1 className="text-2xl font-bold mb-2">Pago exitoso!</h1>
          <p>Tu orden ha sido procesada correctamente.</p>
        </div>

        {/* Detalles de la orden */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Detalles de la orden</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600">Numero de orden:</p>
              <p className="font-bold">#{order.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Estado:</p>
              <p className="font-bold capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Fecha:</p>
              <p className="font-bold">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total:</p>
              <p className="font-bold text-xl">${order.total_amount}</p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Productos</h2>

          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b py-3 last:border-0">
              <div className="flex items-center">
                {item.producto.imagen && (
                  <img
                    src={`${API_URL}${item.producto.imagen}`}
                    alt={item.producto.nombre}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                )}
                <div>
                  <p className="font-bold">{item.producto.nombre}</p>
                  <p className="text-gray-600 text-sm">
                    Cantidad: {item.cantidad} x ${item.precio_unitario}
                  </p>
                </div>
              </div>
              <div className="font-bold">
                ${item.subtotal}
              </div>
            </div>
          ))}
        </div>

        {/* Datos de facturacion */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Datos de facturacion</h2>

          <div className="space-y-2">
            <p><span className="font-bold">Nombre:</span> {order.billing_name}</p>
            <p><span className="font-bold">Email:</span> {order.billing_email}</p>
            <p><span className="font-bold">Telefono:</span> {order.billing_phone}</p>
            <p><span className="font-bold">Direccion:</span> {order.billing_address}</p>
            <p><span className="font-bold">Ciudad:</span> {order.billing_city}</p>
            <p><span className="font-bold">Pais:</span> {order.billing_country}</p>
          </div>

          {order.notes && (
            <div className="mt-4">
              <p className="font-bold">Notas:</p>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/shop')}
            className="flex-1 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700"
          >
            Continuar comprando
          </button>
          <button
            onClick={() => navigate('/my-orders')}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded font-bold hover:bg-gray-400"
          >
            Ver mis ordenes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
```

## 6. Actualizar CartPage.jsx

Agregar boton de checkout:

```javascript
// Al final de CartPage.jsx, antes del cierre del div principal:

<div className="mt-6 flex justify-between items-center">
  <div className="text-2xl font-bold">
    Total: ${getCartTotal().toFixed(2)}
  </div>
  <button
    onClick={() => navigate('/checkout')}
    className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700"
    disabled={cartItems.length === 0}
  >
    Proceder al pago
  </button>
</div>
```

## 7. Configurar Variables de Entorno

Crear/actualizar `.env` en el frontend:

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SXTIPP2Oak1K5zuFxVJzUDum7mVq8Pae5mbnLm2ZFxEi3ZkKoBfCFeAyMNtPbgrmQZKlwx2e7Dch3utkcoXLFEF009Rp6gTbX
```

## 8. Estilos CSS (opcional)

Si usas CSS puro, agregar en `index.css`:

```css
/* Estilos para Stripe CardElement */
.StripeElement {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
}

.StripeElement--focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.StripeElement--invalid {
  border-color: #ef4444;
}
```

## Flujo de Uso

1. Usuario agrega productos al carrito
2. Hace clic en "Proceder al pago" en CartPage
3. Redirige a `/checkout`
4. Completa datos de facturacion
5. Hace clic en "Continuar al pago"
6. Ingresa datos de tarjeta (usar tarjeta de prueba)
7. Hace clic en "Pagar"
8. Sistema procesa el pago
9. Redirige a `/order-success/:orderId`
10. Muestra confirmacion y detalles de la orden

## Tarjetas de Prueba

| Numero | CVC | Fecha | Resultado |
|--------|-----|-------|-----------|
| 4242 4242 4242 4242 | 123 | 12/34 | Exito |
| 4000 0000 0000 9995 | 123 | 12/34 | Rechazado |
| 4000 0027 6000 3184 | 123 | 12/34 | Requiere 3D Secure |

## Verificacion

1. Iniciar backend: `python manage.py runserver`
2. Iniciar frontend: `npm run dev`
3. Crear usuario y hacer login
4. Agregar productos al carrito
5. Ir a checkout
6. Completar proceso de pago

## Proximos Pasos Opcionales

1. Crear pagina "Mis Ordenes" (`/my-orders`)
2. Agregar filtros y busqueda de ordenes
3. Implementar notificaciones por email
4. Agregar tracking de envios
5. Implementar sistema de reembolsos
