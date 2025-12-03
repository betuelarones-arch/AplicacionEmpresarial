// src/components/shop/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAccountClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      // Si es admin va al panel, si no a cuenta
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/mi-cuenta'); // ✅ CORREGIDO
      }
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Barra superior con iconos de usuario */}
      <div className="bg-white border-bottom py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            {/* Logo */}
            <Link to="/" className="text-decoration-none">
              <h2 className="mb-0 fw-bold" style={{ color: '#ff6b6b', fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2rem' }}>
                cooking
              </h2>
            </Link>

            {/* Barra de búsqueda central */}
            <div className="flex-grow-1 mx-5" style={{ maxWidth: '600px' }}>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Buscar productos..."
                  style={{ 
                    borderRadius: '25px',
                    border: '2px solid #e0e0e0',
                    padding: '12px 20px 12px 45px'
                  }}
                />
                <i 
                  className="bi bi-search position-absolute text-muted" 
                  style={{ 
                    left: '18px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    fontSize: '1.1rem'
                  }}
                ></i>
              </div>
            </div>

            {/* Iconos de usuario */}
            <div className="d-flex align-items-center gap-4">
              {/* Cuenta con Dropdown - SIN FLECHITA */}
              <div className="dropdown">
                <a 
                  href="#" 
                  onClick={handleAccountClick}
                  className="text-decoration-none text-dark"
                  data-bs-toggle="dropdown"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="text-center">
                    <i className="bi bi-person-circle" style={{ fontSize: '1.8rem' }}></i>
                    <div className="small fw-semibold">
                      {isAuthenticated ? user?.username : 'Cuenta'}
                    </div>
                  </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {isAuthenticated ? (
                    <>
                      <li>
                        <span className="dropdown-item-text">
                          <strong>{user?.username}</strong><br />
                          <small className="text-muted">{user?.email}</small>
                        </span>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      {isAdmin() && (
                        <li>
                          <Link className="dropdown-item" to="/admin">
                            <i className="bi bi-gear me-2"></i>Panel Admin
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link className="dropdown-item" to="/mi-cuenta">
                          <i className="bi bi-person me-2"></i>Mi Cuenta
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/mis-pedidos">
                          <i className="bi bi-bag me-2"></i>Mis Pedidos
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/login">
                          <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/registro">
                          <i className="bi bi-person-plus me-2"></i>Registrarse
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Carrito */}
              <Link to="/carrito" className="text-decoration-none text-dark position-relative">
                <div className="text-center">
                  <i className="bi bi-cart3" style={{ fontSize: '1.8rem' }}></i>
                  {getTotalItems() > 0 && (
                    <span 
                      className="position-absolute badge rounded-pill bg-danger"
                      style={{ 
                        fontSize: '0.65rem',
                        top: '-5px',
                        right: '-10px',
                        padding: '4px 7px'
                      }}
                    >
                      {getTotalItems()}
                    </span>
                  )}
                  <div className="small fw-semibold">Carrito</div>
                </div>
              </Link>

              {/* Favoritos */}
              <Link to="/favoritos" className="text-decoration-none text-dark">
                <div className="text-center">
                  <i className="bi bi-heart" style={{ fontSize: '1.8rem' }}></i>
                  <div className="small fw-semibold">Favoritos</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Menú de navegación principal */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          {/* Botón de categorías */}
          <button 
            className="btn btn-danger rounded-pill px-4 py-2 fw-semibold"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#categoriasMenu"
            style={{ fontSize: '0.95rem' }}
          >
            <i className="bi bi-list me-1"></i> NUESTRAS CATEGORÍAS
          </button>

          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-4">
              <li className="nav-item">
                <Link className="nav-link fw-semibold d-flex align-items-center gap-2" to="/">
                  <i className="bi bi-house-door-fill text-danger"></i>
                  <span>INICIO</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold d-flex align-items-center gap-2" to="/nosotros">
                  <i className="bi bi-heart-fill text-danger"></i>
                  <span>NOSOTROS</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold d-flex align-items-center gap-2" to="/tiendas">
                  <i className="bi bi-geo-alt-fill text-danger"></i>
                  <span>TIENDAS</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold d-flex align-items-center gap-2" to="/blog">
                  <i className="bi bi-chat-dots-fill text-danger"></i>
                  <span>BLOG</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Menú desplegable de categorías */}
      <div className="collapse" id="categoriasMenu">
        <div className="bg-light border-bottom">
          <div className="container py-3">
            <div className="row">
              <div className="col-md-3">
                <h6 className="fw-bold text-danger mb-3">
                  <i className="bi bi-grid-fill me-2"></i>
                  Categorías Populares
                </h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/?categoria=1" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-cake2 text-danger"></i>
                      Pasteles
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/?categoria=2" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-pie-chart-fill text-danger"></i>
                      Tartas
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/?categoria=3" className="text-decoration-none text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-cup-straw text-danger"></i>
                      Cupcakes
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;