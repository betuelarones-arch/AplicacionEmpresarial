// src/pages/admin/ProductoForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productosAPI } from '../../api/productos';
import { categoriasAPI } from '../../api/categorias';

const ProductoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    stock: '',
    imagen: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchCategorias();
    if (isEditing) {
      fetchProducto();
    }
  }, [id]);

  const fetchCategorias = async () => {
    try {
      const data = await categoriasAPI.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchProducto = async () => {
    try {
      const data = await productosAPI.getById(id);
      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        categoria: data.categoria,
        stock: data.stock,
        imagen: null
      });
      setPreviewImage(data.imagen);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      alert('Error al cargar producto');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('stock', formData.stock);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      if (isEditing) {
        await productosAPI.update(id, formDataToSend);
        alert('Producto actualizado correctamente');
      } else {
        await productosAPI.create(formDataToSend);
        alert('Producto creado correctamente');
      }
      
      navigate('/admin/productos');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/admin" className="text-danger text-decoration-none">Admin</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/admin/productos" className="text-danger text-decoration-none">Productos</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {isEditing ? 'Editar' : 'Nuevo'}
                </li>
              </ol>
            </nav>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="card-title fw-bold mb-4">
                  {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
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
                      placeholder="Ej: Pastel Red Velvet"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descripción *</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      rows="4"
                      value={formData.descripcion}
                      onChange={handleChange}
                      required
                      placeholder="Describe el producto..."
                    />
                  </div>

                  {/* Precio y Stock */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Precio ($) *</label>
                      <input
                        type="number"
                        name="precio"
                        className="form-control"
                        value={formData.precio}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="45.99"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        className="form-control"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Categoría *</label>
                    <select
                      name="categoria"
                      className="form-select"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Imagen */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Imagen {!isEditing && '*'}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!isEditing}
                    />
                    {previewImage && (
                      <div className="mt-3">
                        <p className="text-muted small mb-2">Vista previa:</p>
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="img-fluid rounded"
                          style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Link to="/admin/productos" className="btn btn-outline-secondary">
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-danger"
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

export default ProductoForm;