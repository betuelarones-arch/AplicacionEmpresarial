// src/pages/shop/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productosAPI } from '../../api/productos';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/shop/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [producto, setProducto] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productoData = await productosAPI.getById(id);
        setProducto(productoData);

        try {
          const recomendacionesData = await productosAPI.getRecommendations(id);
          setRecomendaciones(recomendacionesData);
        } catch (error) {
          console.error('Error al cargar recomendaciones:', error);
        }
      } catch (error) {
        console.error('Error al cargar producto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (cantidad > 0 && cantidad <= producto.stock) {
      addToCart(producto, cantidad);
      alert(`${cantidad} x ${producto.nombre} agregado al carrito`);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-danger spinner-custom" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="fw-bold">Producto no encontrado</h2>
          <Link to="/" className="btn btn-danger mt-3">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-danger text-decoration-none">Tienda</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
          </ol>
        </nav>

        {/* Detalle */}
        <div className="card shadow-sm mb-5">
          <div className="row g-0">
            <div className="col-md-6">
              {producto.imagen ? (
                <img
                  src={producto.imagen}
                  className="img-fluid rounded-start product-image-detail"
                  alt={producto.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="image-placeholder" style={{ height: '400px' }}>
                  🍰
                </div>
              )}
            </div>
            
            <div className="col-md-6">
              <div className="card-body p-4">
                <h1 className="card-title fw-bold mb-3">{producto.nombre}</h1>
                <p className="card-text text-muted fs-5 mb-4">{producto.descripcion}</p>
                
                <h2 className="text-danger mb-4">${parseFloat(producto.precio).toFixed(2)}</h2>

                <div className="mb-4">
                  <p className="mb-1">
                    <strong>Stock disponible:</strong> {producto.stock} unidades
                  </p>
                  {producto.stock < 5 && producto.stock > 0 && (
                    <p className="text-warning mb-0">
                      <i className="bi bi-exclamation-triangle"></i> ¡Últimas unidades disponibles!
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Cantidad</label>
                  <div className="input-group" style={{ maxWidth: '200px' }}>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={producto.stock}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={producto.stock === 0}
                    className={`btn btn-lg ${producto.stock === 0 ? 'btn-secondary' : 'btn-danger'}`}
                  >
                    {producto.stock === 0 ? 'Producto agotado' : 'Agregar al carrito'}
                  </button>
                  
                  <Link to="/" className="btn btn-outline-danger btn-lg">
                    Seguir comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {recomendaciones.length > 0 && (
          <div>
            <h2 className="fw-bold mb-4">
              🤖 Te podría interesar <small className="text-muted">(Recomendaciones IA)</small>
            </h2>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {recomendaciones.map(recomendacion => (
                <div key={recomendacion.id} className="col">
                  <ProductCard producto={recomendacion} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;