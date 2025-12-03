// src/pages/shop/CartPage.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotal, getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (productId, newQuantity, maxStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      alert(`Solo hay ${maxStock} unidades disponibles`);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#dee2e6' }}></i>
          <h3 className="mt-4 mb-3">Tu carrito está vacío</h3>
          <p className="text-muted mb-4">¡Agrega algunos productos deliciosos!</p>
          <Link to="/" className="btn btn-danger">
            <i className="bi bi-shop me-2"></i>
            Ir a la Tienda
          </Link>
        </div>
      </div>
    );
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
          <li className="breadcrumb-item active">Carrito</li>
        </ol>
      </nav>

      <h2 className="mb-4">
        <i className="bi bi-cart3 text-danger me-2"></i>
        Mi Carrito ({getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'})
      </h2>

      <div className="row">
        {/* Lista de productos */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              {items.map((item, index) => (
                <div key={item.id}>
                  <div className="row align-items-center py-3">
                    {/* Imagen */}
                    <div className="col-md-2 col-3">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="img-fluid rounded"
                          style={{ maxHeight: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="bg-light rounded d-flex align-items-center justify-content-center"
                          style={{ height: '80px' }}
                        >
                          🍰
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="col-md-4 col-9">
                      <h6 className="mb-1">{item.nombre}</h6>
                      <p className="text-muted small mb-0">
                        ${parseFloat(item.precio).toFixed(2)} c/u
                      </p>
                    </div>

                    {/* Cantidad */}
                    <div className="col-md-3 col-6 mt-3 mt-md-0">
                      <div className="input-group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.id, item.cantidad - 1, item.stock)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          value={item.cantidad}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.stock)}
                          min="1"
                          max={item.stock}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.id, item.cantidad + 1, item.stock)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      <small className="text-muted">Stock: {item.stock}</small>
                    </div>

                    {/* Subtotal y eliminar */}
                    <div className="col-md-3 col-6 mt-3 mt-md-0 text-end">
                      <p className="fw-bold mb-2">
                        ${(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                      </p>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </div>
                  </div>
                  {index < items.length - 1 && <hr />}
                </div>
              ))}
            </div>
          </div>

          {/* Botón volver a comprar */}
          <Link to="/" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Seguir Comprando
          </Link>
        </div>

        {/* Resumen del pedido */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-body">
              <h5 className="card-title mb-4">
                <i className="bi bi-receipt text-danger me-2"></i>
                Resumen del Pedido
              </h5>

              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Envío:</span>
                <strong className="text-success">GRATIS</strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <h5>Total:</h5>
                <h5 className="text-danger">${total.toFixed(2)}</h5>
              </div>

              {/* Botón de checkout */}
              {isAuthenticated ? (
                <Link to="/checkout" className="btn btn-danger w-100 py-3 fw-semibold mb-2">
                  <i className="bi bi-lock-fill me-2"></i>
                  Proceder al Pago
                </Link>
              ) : (
                <Link to="/login" className="btn btn-danger w-100 py-3 fw-semibold mb-2">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Inicia Sesión para Comprar
                </Link>
              )}

              {/* Badges de beneficios */}
              <div className="mt-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-truck text-success me-2"></i>
                  <small>Envío gratis en todos los pedidos</small>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-shield-check text-primary me-2"></i>
                  <small>Pago seguro con Stripe</small>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-arrow-counterclockwise text-info me-2"></i>
                  <small>Devoluciones fáciles</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;