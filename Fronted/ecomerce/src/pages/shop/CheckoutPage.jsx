// src/pages/shop/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../api/orders';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Cargar Stripe con tu clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Estilos personalizados para el CardElement de Stripe
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#2d3436',
      fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto"',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#adb5bd',
      },
    },
    invalid: {
      color: '#dc3545',
      iconColor: '#dc3545',
    },
  },
};

// Componente del formulario de pago
const CheckoutForm = ({ totalAmount, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  
  // Auto-completar con datos del usuario y perfil
  const [billingDetails, setBillingDetails] = useState({
    name: user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.default_address || '',
    city: user?.profile?.default_city || '',
    country: user?.profile?.default_country || 'PE'
  });

  // Actualizar email cuando cambie el usuario
  useEffect(() => {
    if (user?.email) {
      setBillingDetails(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setBillingDetails({
      ...billingDetails,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    try {
      console.log('=== INICIANDO PAGO ===');
      console.log('Usuario actual:', user?.email);
      console.log('Email de facturación:', billingDetails.email);

      // 1. Preparar datos de la orden para el backend
      const orderData = {
        items: cartItems.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad
        })),
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email, // USAR EMAIL ACTUAL
          phone: billingDetails.phone,
          address: billingDetails.address,
          city: billingDetails.city,
          country: billingDetails.country
        }
      };

      console.log('Creando orden en el backend...');

      // 2. Crear la orden en el backend
      const orderResponse = await ordersAPI.createOrder(orderData);
      console.log('Orden creada:', orderResponse);

      if (!orderResponse.client_secret) {
        throw new Error('No se recibió client_secret del backend');
      }

      // 3. Confirmar el pago con Stripe
      console.log('Confirmando pago con Stripe...');
      console.log('Email que se enviará a Stripe:', billingDetails.email);
      
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        orderResponse.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: billingDetails.name,
              email: billingDetails.email, // FORZAR EMAIL ACTUAL
              phone: billingDetails.phone,
              address: {
                line1: billingDetails.address,
                city: billingDetails.city,
                country: billingDetails.country,
              },
            },
          },
          // NO GUARDAR el método de pago para evitar mostrar emails antiguos
          setup_future_usage: null
        }
      );

      if (confirmError) {
        console.error('Error al confirmar pago:', confirmError);
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      console.log('Pago confirmado:', paymentIntent);

      // 4. Confirmar el pago en el backend
      console.log('Notificando al backend...');
      await ordersAPI.confirmPayment(orderResponse.order_id, paymentIntent.id);

      // 5. Pago exitoso
      console.log('¡Pago completado exitosamente!');
      setSucceeded(true);
      clearCart();
      setLoading(false);
      
      // Redirigir a página de confirmación con el ID de la orden
      setTimeout(() => {
        navigate(`/order-success/${orderResponse.order_id}`);
      }, 2000);

    } catch (err) {
      console.error('Error completo:', err);
      setError(err.message || 'Error al procesar el pago. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
        </div>
        <h2 className="text-success mb-3">¡Pago Exitoso!</h2>
        <p className="text-muted">Tu pedido ha sido procesado correctamente.</p>
        <p className="text-muted">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Información de facturación */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4">
            <i className="bi bi-person-lines-fill text-danger me-2"></i>
            Información de Facturación
          </h5>

          {/* Mensaje si tiene datos pre-cargados */}
          {user?.profile && (user.profile.phone || user.profile.default_address) && (
            <div className="alert alert-info small mb-3">
              <i className="bi bi-info-circle me-2"></i>
              Hemos auto-completado tus datos. Puedes modificarlos si lo deseas.
            </div>
          )}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={billingDetails.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={billingDetails.email}
                onChange={handleInputChange}
                required
                readOnly
                style={{ backgroundColor: '#f8f9fa' }}
              />
              <small className="text-muted">
                Este es el email de tu cuenta actual
              </small>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={billingDetails.phone}
                onChange={handleInputChange}
                placeholder="999888777"
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Ciudad *</label>
              <input
                type="text"
                name="city"
                className="form-control"
                value={billingDetails.city}
                onChange={handleInputChange}
                placeholder="Lima"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Dirección *</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={billingDetails.address}
              onChange={handleInputChange}
              placeholder="Av. Principal 123, Dpto 456"
              required
            />
          </div>

          {/* Link para actualizar perfil */}
          {!billingDetails.phone || !billingDetails.address ? (
            <div className="alert alert-warning small">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Tip:</strong> Completa tu perfil para que estos datos se auto-completen en futuras compras.
              <Link to="/mi-cuenta" className="alert-link ms-1">
                Ir a Mi Cuenta
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Información de pago */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4">
            <i className="bi bi-credit-card text-danger me-2"></i>
            Información de Pago
          </h5>

          <div className="mb-3">
            <label className="form-label">Tarjeta de Crédito/Débito *</label>
            <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            <small className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              Pagos seguros procesados por Stripe
            </small>
          </div>

          {/* Tarjetas de prueba */}
          <div className="alert alert-info">
            <strong>🧪 Modo de Prueba - Usa estas tarjetas:</strong>
            <ul className="mb-0 mt-2 small">
              <li><code>4242 4242 4242 4242</code> - Visa (éxito)</li>
              <li><code>4000 0025 0000 3155</code> - Visa (requiere 3D Secure)</li>
              <li>Fecha: Cualquier fecha futura</li>
              <li>CVC: Cualquier 3 dígitos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn btn-danger btn-lg w-100 py-3 fw-semibold"
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Procesando pago...
          </>
        ) : (
          <>
            <i className="bi bi-lock-fill me-2"></i>
            Pagar S/ {totalAmount.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-center text-muted mt-3 small">
        <i className="bi bi-shield-lock-fill me-1"></i>
        Tus datos están protegidos con encriptación SSL
      </p>
    </form>
  );
};

// Componente principal del Checkout
const CheckoutPage = () => {
  const { items, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (items.length === 0) {
      navigate('/carrito');
    }
  }, [isAuthenticated, items, navigate]);

  if (items.length === 0) {
    return null;
  }

  const total = getTotal();

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/carrito">Carrito</Link>
          </li>
          <li className="breadcrumb-item active">Checkout</li>
        </ol>
      </nav>

      <h2 className="mb-4">
        <i className="bi bi-bag-check text-danger me-2"></i>
        Finalizar Compra
      </h2>

      <div className="row">
        <div className="col-lg-8">
          <Elements stripe={stripePromise}>
            <CheckoutForm totalAmount={total} cartItems={items} />
          </Elements>
        </div>

        {/* Resumen del pedido */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-body">
              <h5 className="card-title mb-4">
                <i className="bi bi-receipt text-danger me-2"></i>
                Resumen del Pedido
              </h5>

              {/* Lista de productos */}
              <div className="mb-3">
                {items.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <div className="flex-grow-1">
                      <p className="mb-0 small">{item.nombre}</p>
                      <small className="text-muted">Cantidad: {item.cantidad}</small>
                    </div>
                    <strong className="text-nowrap ms-2">
                      S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <hr />

              {/* Total */}
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <strong>S/ {total.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Envío:</span>
                <strong className="text-success">GRATIS</strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-0">
                <h5>Total:</h5>
                <h5 className="text-danger">S/ {total.toFixed(2)}</h5>
              </div>

              {/* Badges de seguridad */}
              <div className="mt-4 text-center">
                <div className="badge bg-light text-dark me-2 mb-2">
                  <i className="bi bi-shield-check text-success me-1"></i>
                  Pago Seguro
                </div>
                <div className="badge bg-light text-dark mb-2">
                  <i className="bi bi-truck text-primary me-1"></i>
                  Envío Gratis
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;