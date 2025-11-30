// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error del campo al escribir
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // Validaciones del frontend
  const validateForm = () => {
    const newErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener mínimo 8 caracteres';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener letras y números';
    }

    // Confirmar contraseña
    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Debes confirmar tu contraseña';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Las contraseñas no coinciden';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await register(formData);
      
      if (response.success) {
        // Registro exitoso, redirigir a la tienda
        navigate('/');
      }
    } catch (err) {
      // Manejar errores del backend
      setErrors({ general: err.message || 'Error al registrar usuario' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                {/* Logo */}
                <div className="text-center mb-4">
                  <h1 className="fw-bold mb-2" style={{ color: '#ff6b6b', fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem' }}>
                    cooking
                  </h1>
                  <p className="text-muted">Crea tu cuenta de cliente</p>
                </div>

                {/* Error general */}
                {errors.general && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errors.general}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setErrors({})}
                    ></button>
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                  {/* Nombre de usuario */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Usuario <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      placeholder="usuario123"
                      value={formData.username}
                      onChange={handleChange}
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Nombres */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Nombre</label>
                      <input
                        type="text"
                        name="first_name"
                        className="form-control"
                        placeholder="Juan"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Apellido</label>
                      <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        placeholder="Pérez"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Contraseña <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                    <small className="text-muted">
                      Debe contener al menos 8 caracteres, letras y números
                    </small>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Confirmar Contraseña <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      name="password_confirm"
                      className={`form-control ${errors.password_confirm ? 'is-invalid' : ''}`}
                      placeholder="Repite tu contraseña"
                      value={formData.password_confirm}
                      onChange={handleChange}
                    />
                    {errors.password_confirm && (
                      <div className="invalid-feedback">{errors.password_confirm}</div>
                    )}
                  </div>

                  {/* Botón de registro */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-danger w-100 py-3 fw-semibold mb-3"
                    style={{ borderRadius: '10px' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Crear Cuenta
                      </>
                    )}
                  </button>

                  {/* Enlaces */}
                  <div className="text-center">
                    <p className="mb-2">
                      ¿Ya tienes cuenta?{' '}
                      <Link to="/login" className="text-danger fw-semibold text-decoration-none">
                        Inicia sesión
                      </Link>
                    </p>
                    <Link to="/" className="text-decoration-none text-muted small">
                      <i className="bi bi-arrow-left me-1"></i>
                      Volver a la tienda
                    </Link>
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

export default RegisterPage;