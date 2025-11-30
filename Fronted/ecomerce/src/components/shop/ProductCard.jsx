// src/components/shop/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ producto }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(producto, 1);
    alert(`${producto.nombre} agregado al carrito`);
  };

  return (
    <div className="card h-100 shadow-sm card-hover">
      <Link to={`/producto/${producto.id}`} className="text-decoration-none">
        <div className="position-relative">
          {producto.imagen ? (
            <img
              src={producto.imagen}
              className="card-img-top product-image"
              alt={producto.nombre}
            />
          ) : (
            <div className="image-placeholder" style={{ height: '250px' }}>
              🍰
            </div>
          )}
          
          {producto.stock < 5 && producto.stock > 0 && (
            <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark">
              ¡Últimas unidades!
            </span>
          )}
          
          {producto.stock === 0 && (
            <span className="position-absolute top-0 end-0 m-2 badge bg-danger">
              Agotado
            </span>
          )}
        </div>
      </Link>

      <div className="card-body d-flex flex-column">
        <Link to={`/producto/${producto.id}`} className="text-decoration-none">
          <h5 className="card-title text-dark">{producto.nombre}</h5>
        </Link>
        
        <p className="card-text text-muted line-clamp-2 flex-grow-1">
          {producto.descripcion}
        </p>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <h4 className="text-danger mb-0">${parseFloat(producto.precio).toFixed(2)}</h4>
          
          <button
            onClick={handleAddToCart}
            disabled={producto.stock === 0}
            className={`btn ${producto.stock === 0 ? 'btn-secondary' : 'btn-danger'}`}
          >
            {producto.stock === 0 ? 'Agotado' : 'Agregar'}
          </button>
        </div>

        <small className="text-muted mt-2">
          Stock: {producto.stock} unidades
        </small>
      </div>
    </div>
  );
};

export default ProductCard;