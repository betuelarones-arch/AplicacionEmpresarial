// src/pages/shop/OrderSuccessPage.jsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersAPI } from '../../api/orders';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (orderId) {
          console.log('Cargando orden ID:', orderId);
          const orderData = await ordersAPI.getOrderById(orderId);
          console.log('Datos de la orden:', orderData);
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Error al cargar la orden:', err);
        setError('No se pudo cargar la información de la orden');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información de tu pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error || 'Orden no encontrada'}
            </div>
            <Link to="/" className="btn btn-danger">
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'warning', text: 'Pendiente' },
      processing: { class: 'info', text: 'Procesando' },
      paid: { class: 'success', text: 'Pagado' },
      failed: { class: 'danger', text: 'Fallido' },
      completed: { class: 'success', text: 'Completado' }
    };
    
    const badge = badges[status] || badges.pending;
    return <span className={`badge bg-${badge.class}`}>{badge.text}</span>;
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'S/ 0.00';
    return `S/ ${numPrice.toFixed(2)}`;
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              {/* Icono de éxito */}
              <div className="text-center mb-4">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    backgroundColor: '#d4edda' 
                  }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
              </div>

              {/* Título */}
              <h2 className="text-center mb-3" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                ¡Pedido Realizado con Éxito!
              </h2>

              {/* Mensaje */}
              <p className="text-center text-muted mb-4">
                Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación en breve.
              </p>

              {/* Información del pedido */}
              <div className="bg-light rounded p-4 mb-4">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p className="small text-muted mb-1">Número de Orden</p>
                    <p className="fw-semibold mb-0">#{order.id}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="small text-muted mb-1">Fecha</p>
                    <p className="fw-semibold mb-0">
                      {new Date(order.created_at).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="small text-muted mb-1">Estado del Pago</p>
                    <p className="mb-0">{getStatusBadge(order.status)}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="small text-muted mb-1">Total Pagado</p>
                    <p className="fw-bold text-danger mb-0">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de facturación */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-person-lines-fill text-danger me-2"></i>
                  Información de Facturación
                </h6>
                <div className="row small">
                  <div className="col-md-6 mb-2">
                    <strong>Nombre:</strong> {order.billing_name || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Email:</strong> {order.billing_email || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Teléfono:</strong> {order.billing_phone || 'N/A'}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Ciudad:</strong> {order.billing_city || 'N/A'}
                  </div>
                  <div className="col-12">
                    <strong>Dirección:</strong> {order.billing_address || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Productos ordenados */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-bag-check text-danger me-2"></i>
                  Productos Ordenados
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Precio</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => {
                          const price = parseFloat(item.price) || 0;
                          const quantity = parseInt(item.quantity) || 0;
                          const subtotal = price * quantity;
                          
                          return (
                            <tr key={item.id}>
                              <td>{item.product_name || item.producto_name || 'Producto'}</td>
                              <td className="text-center">{quantity}</td>
                              <td className="text-end">{formatPrice(price)}</td>
                              <td className="text-end fw-semibold">
                                {formatPrice(subtotal)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No hay productos en esta orden
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">Total:</td>
                        <td className="text-end fw-bold text-danger">
                          {formatPrice(order.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Próximos pasos */}
              <div className="mb-4">
                <h6 className="fw-semibold mb-3">📋 Próximos pasos:</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Recibirás un email de confirmación
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Prepararemos tu pedido en 24-48 horas
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Te notificaremos cuando esté listo para envío
                  </li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="d-grid gap-2">
                <Link to="/" className="btn btn-danger btn-lg">
                  <i className="bi bi-house-door me-2"></i>
                  Volver a la Tienda
                </Link>
                <Link to="/mis-pedidos" className="btn btn-outline-secondary">
                  <i className="bi bi-bag me-2"></i>
                  Ver Mis Pedidos
                </Link>
              </div>

              {/* Ayuda */}
              <div className="mt-4 pt-4 border-top text-center">
                <p className="small text-muted mb-2">¿Necesitas ayuda?</p>
                <a href="mailto:soporte@cooking.com" className="text-danger text-decoration-none">
                  <i className="bi bi-envelope me-1"></i>
                  soporte@cooking.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;