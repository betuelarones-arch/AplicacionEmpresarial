// src/pages/shop/MyOrdersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';

const MyOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const data = await ordersAPI.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError('No se pudieron cargar tus pedidos');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'warning', text: 'Pendiente', icon: 'clock' },
      processing: { class: 'info', text: 'Procesando', icon: 'arrow-repeat' },
      paid: { class: 'success', text: 'Pagado', icon: 'check-circle' },
      failed: { class: 'danger', text: 'Fallido', icon: 'x-circle' },
      completed: { class: 'success', text: 'Completado', icon: 'check-circle-fill' }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`badge bg-${badge.class}`}>
        <i className={`bi bi-${badge.icon} me-1`}></i>
        {badge.text}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <i className="bi bi-lock" style={{ fontSize: '5rem', color: '#dee2e6' }}></i>
          <h3 className="mt-4 mb-3">Inicia sesión para ver tus pedidos</h3>
          <Link to="/login" className="btn btn-danger">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <Link to="/" className="btn btn-danger">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <i className="bi bi-bag-x" style={{ fontSize: '5rem', color: '#dee2e6' }}></i>
          <h3 className="mt-4 mb-3">Aún no tienes pedidos</h3>
          <p className="text-muted mb-4">¡Explora nuestra tienda y haz tu primera compra!</p>
          <Link to="/" className="btn btn-danger">
            <i className="bi bi-shop me-2"></i>
            Ir a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item active">Mis Pedidos</li>
        </ol>
      </nav>

      <h2 className="mb-4">
        <i className="bi bi-bag-check text-danger me-2"></i>
        Mis Pedidos
      </h2>

      {/* Lista de pedidos */}
      <div className="row">
        {orders.map((order) => (
          <div key={order.id} className="col-12 mb-4">
            <div className="card card-hover">
              <div className="card-body">
                <div className="row align-items-center">
                  {/* Información básica */}
                  <div className="col-lg-8">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">
                          Orden #{order.id}
                        </h5>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(order.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Items del pedido */}
                    <div className="mb-2">
                      <p className="small text-muted mb-1">Productos:</p>
                      {order.items && order.items.slice(0, 3).map((item, index) => (
                        <span key={item.id} className="small">
                          {item.product_name} (x{item.quantity})
                          {index < Math.min(order.items.length - 1, 2) && ', '}
                        </span>
                      ))}
                      {order.items && order.items.length > 3 && (
                        <span className="small text-muted">
                          {' '}y {order.items.length - 3} más
                        </span>
                      )}
                    </div>

                    {/* Dirección de envío */}
                    <p className="small text-muted mb-0">
                      <i className="bi bi-geo-alt me-1"></i>
                      {order.billing_address}, {order.billing_city}
                    </p>
                  </div>

                  {/* Total y acciones */}
                  <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                    <h4 className="text-danger mb-3">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </h4>
                    <Link 
                      to={`/order-success/${order.id}`}
                      className="btn btn-outline-danger btn-sm"
                    >
                      <i className="bi bi-eye me-1"></i>
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón volver */}
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a la Tienda
        </Link>
      </div>
    </div>
  );
};

export default MyOrdersPage;