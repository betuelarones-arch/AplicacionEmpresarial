// src/pages/shop/CartPage.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div style={{ fontSize: '5rem' }}>🛒</div>
          <h2 className="fw-bold mb-3">Tu carrito está vacío</h2>
          <p className="text-muted mb-4">¡Agrega algunos productos deliciosos!</p>
          <Link to="/" className="btn btn-danger btn-lg">
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        <h1 className="fw-bold mb-4">Carrito de Compras</h1>

        <div className="row">
          {/* Lista de productos */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                {cart.map((item, index) => (
                  <div key={item.id} className={`p-3 ${index !== cart.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="row align-items-center">
                      {/* Imagen */}
                      <div className="col-md-2 col-3">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="img-fluid rounded"
                          />
                        ) : (
                          <div className="bg-light rounded text-center p-3">
                            <span style={{ fontSize: '2rem' }}>🍰</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="col-md-4 col-9">
                        <Link
                          to={`/producto/${item.id}`}
                          className="text-decoration-none text-dark"
                        >
                          <h6 className="mb-1 fw-semibold">{item.nombre}</h6>
                        </Link>
                        <small className="text-muted">
                          ${parseFloat(item.precio).toFixed(2)} c/u
                        </small>
                      </div>

                      {/* Cantidad */}
                      <div className="col-md-3 col-6 mt-2 mt-md-0">
                        <div className="input-group input-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            className="form-control text-center"
                            value={item.cantidad}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-md-2 col-4 mt-2 mt-md-0 text-end">
                        <h6 className="mb-0 fw-bold">
                          ${(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                        </h6>
                      </div>

                      {/* Eliminar */}
                      <div className="col-md-1 col-2 mt-2 mt-md-0 text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.id)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                  clearCart();
                }
              }}
              className="btn btn-link text-danger mt-2"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Resumen */}
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h5 className="card-title fw-bold mb-4">Resumen de compra</h5>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Envío</span>
                    <span>Por calcular</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total</strong>
                    <strong className="text-danger fs-5">${getTotal().toFixed(2)}</strong>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-danger btn-lg">
                    Proceder al pago
                  </button>
                  
                  <Link to="/" className="btn btn-outline-danger">
                    Seguir comprando
                  </Link>
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