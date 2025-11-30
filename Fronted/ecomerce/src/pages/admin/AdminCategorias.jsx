// src/pages/admin/AdminCategorias.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriasAPI } from '../../api/categorias';

const AdminCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const data = await categoriasAPI.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`⚠️ ¿Estás seguro de eliminar "${nombre}"?\n\nSe eliminarán TODOS los productos de esta categoría.`)) {
      try {
        await categoriasAPI.delete(id);
        alert('Categoría eliminada correctamente');
        fetchCategorias();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar categoría');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary spinner-custom" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">Categorías</h1>
            <p className="text-muted mb-0">Organiza tus productos por categoría</p>
          </div>
          <Link to="/admin/categorias/nueva" className="btn btn-primary">
            + Nueva Categoría
          </Link>
        </div>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/admin" className="text-primary text-decoration-none">Admin</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Categorías</li>
          </ol>
        </nav>

        {/* Grid de categorías */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {categorias.map(categoria => (
            <div key={categoria.id} className="col">
              <div className="card shadow-sm h-100 card-hover">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-primary bg-opacity-10 rounded p-3">
                      <span style={{ fontSize: '2rem' }}>📁</span>
                    </div>
                    <div>
                      <Link
                        to={`/admin/categorias/editar/${categoria.id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(categoria.id, categoria.nombre)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  
                  <h5 className="card-title fw-bold">{categoria.nombre}</h5>
                  <p className="card-text text-muted">{categoria.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categorias.length === 0 && (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-3">No hay categorías registradas</p>
              <Link to="/admin/categorias/nueva" className="btn btn-primary">
                Crear la primera
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategorias;