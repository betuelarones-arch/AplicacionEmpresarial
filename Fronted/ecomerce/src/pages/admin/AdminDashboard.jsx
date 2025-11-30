import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <--- 1. Importamos el contexto

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // <--- 2. Sacamos la función logout

  const handleLogout = async () => {
    try {
      await logout(); // Ejecuta la limpieza del token y estado
      navigate('/auth/login'); // <--- 3. Redirige al login tras salir
    } catch (error) {
      console.error("Error al salir", error);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        
        {/* ENCABEZADO: Título a la izquierda, Botón a la derecha */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold mb-0">Panel de Administración</h1>
          
          <button 
            onClick={handleLogout}
            className="btn btn-outline-danger" // Rojo bordeado para indicar salida
          >
            <i className="bi bi-box-arrow-right me-2"></i> {/* Si usas iconos de bootstrap */}
            Cerrar Sesión
          </button>
        </div>

        <div className="row g-4 mb-5">
          {/* Card Productos */}
          <div className="col-md-6">
            <Link to="/admin/productos" className="text-decoration-none">
              <div className="card shadow-sm h-100 card-hover">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="bg-danger bg-opacity-10 rounded p-3">
                      <span style={{ fontSize: '2rem' }}>🍰</span>
                    </div>
                    <span className="text-danger fw-semibold">Ver todos →</span>
                  </div>
                  <h3 className="card-title fw-bold text-dark">Productos</h3>
                  <p className="card-text text-muted">Gestiona el catálogo de productos</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Card Categorías */}
          <div className="col-md-6">
            <Link to="/admin/categorias" className="text-decoration-none">
              <div className="card shadow-sm h-100 card-hover">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded p-3">
                      <span style={{ fontSize: '2rem' }}>📁</span>
                    </div>
                    <span className="text-primary fw-semibold">Ver todas →</span>
                  </div>
                  <h3 className="card-title fw-bold text-dark">Categorías</h3>
                  <p className="card-text text-muted">Organiza tus productos por categoría</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Acceso rápido */}
        <div className="mt-5">
          <h2 className="fw-bold mb-4">Acceso Rápido</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <Link to="/admin/productos/nuevo" className="btn btn-danger w-100 py-3">
                + Nuevo Producto
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/admin/categorias/nueva" className="btn btn-primary w-100 py-3">
                + Nueva Categoría
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/" className="btn btn-outline-secondary w-100 py-3">
                Ver Tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;