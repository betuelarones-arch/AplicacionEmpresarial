// src/pages/admin/CategoriaForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { categoriasAPI } from '../../api/categorias';

const CategoriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchCategoria();
    }
  }, [id]);

  const fetchCategoria = async () => {
    try {
      const data = await categoriasAPI.getById(id);
      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion
      });
    } catch (error) {
      console.error('Error al cargar categoría:', error);
      alert('Error al cargar categoría');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await categoriasAPI.update(id, formData);
        alert('Categoría actualizada correctamente');
      } else {
        await categoriasAPI.create(formData);
        alert('Categoría creada correctamente');
      }
      
      navigate('/admin/categorias');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/admin" className="text-primary text-decoration-none">Admin</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/admin/categorias" className="text-primary text-decoration-none">Categorías</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {isEditing ? 'Editar' : 'Nueva'}
                </li>
              </ol>
            </nav>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="card-title fw-bold mb-4">
                  {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>

                <form onSubmit={handleSubmit}>
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Pasteles de Chocolate"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Descripción *</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      rows="4"
                      value={formData.descripcion}
                      onChange={handleChange}
                      required
                      placeholder="Describe esta categoría..."
                    />
                  </div>

                  {/* Botones */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Link to="/admin/categorias" className="btn btn-outline-secondary">
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriaForm;