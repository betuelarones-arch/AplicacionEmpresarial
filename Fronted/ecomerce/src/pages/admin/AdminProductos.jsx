// src/pages/admin/AdminProductos.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productosAPI } from '../../api/productos';

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const data = await productosAPI.getAll();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      try {
        await productosAPI.delete(id);
        alert('Producto eliminado correctamente');
        fetchProductos();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar producto');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-danger spinner-custom" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando productos...</p>
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
            <h1 className="fw-bold mb-1">Productos</h1>
            <p className="text-muted mb-0">Gestiona tu catálogo de productos</p>
          </div>
          <Link to="/admin/productos/nuevo" className="btn btn-danger">
            + Nuevo Producto
          </Link>
        </div>

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/admin" className="text-danger text-decoration-none">Admin</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Productos</li>
          </ol>
        </nav>

        {/* Tabla */}
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => (
                  <tr key={producto.id}>
                    <td>
                      <div style={{ width: '60px', height: '60px' }}>
                        {producto.imagen ? (
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="img-fluid rounded"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-light rounded d-flex align-items-center justify-content-center h-100">
                            <span style={{ fontSize: '1.5rem' }}>🍰</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">{producto.nombre}</div>
                      <small className="text-muted line-clamp-1">{producto.descripcion}</small>
                    </td>
                    <td>
                      <span className="fw-semibold">${parseFloat(producto.precio).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        producto.stock === 0 ? 'bg-danger' :
                        producto.stock < 5 ? 'bg-warning text-dark' :
                        'bg-success'
                      }`}>
                        {producto.stock} unidades
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/productos/editar/${producto.id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(producto.id, producto.nombre)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productos.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No hay productos registrados</p>
              <Link to="/admin/productos/nuevo" className="btn btn-danger">
                Crear el primero
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductos;