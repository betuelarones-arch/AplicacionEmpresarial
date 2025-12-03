// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ← este login ahora llama al loginClient del contexto
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error del campo que está siendo editado
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Validar email al salir del campo
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors({
          ...errors,
          email: 'Por favor ingresa un correo electrónico válido'
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un correo electrónico válido';
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    const response = await login(formData.email, formData.password);

    if (response.success) {
      // 🚨 Cliente SIEMPRE va a la tienda
      navigate('/');
    } else {
      setErrors({
        general:
          response.message ||
          'Correo electrónico o contraseña incorrectos',
      });
    }

    setLoading(false);
  };


  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                {/* Logo */}
                <div className="text-center mb-4">
                  <h1 className="fw-bold mb-2" style={{ color: '#ff6b6b', fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem' }}>
                    cooking
                  </h1>
                  <p className="text-muted">Inicia sesión en tu cuenta</p>
                </div>

                {/* Error General */}
                {errors.general && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errors.general}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setErrors({ ...errors, general: '' })}
                    ></button>
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        name="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-danger w-100 py-3 fw-semibold mb-3"
                    style={{ borderRadius: '10px' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Iniciar Sesión
                      </>
                    )}
                  </button>

                  {/* Enlaces */}
                  <div className="text-center">
                    <p className="mb-2">
                      ¿No tienes cuenta?{' '}
                      <Link to="/registro" className="text-danger fw-semibold text-decoration-none">
                        Regístrate aquí
                      </Link>
                    </p>
                    <Link to="/" className="text-decoration-none text-muted small">
                      <i className="bi bi-arrow-left me-1"></i>
                      Volver a la tienda
                    </Link>
                  </div>
                </form>

                {/* Info de prueba - Solo para desarrollo */}
                <div className="mt-4 p-3 bg-light rounded">
                  <p className="small text-muted mb-1">
                    <strong>💼 Acceso Administrador (panel admin, no esta pantalla cliente):</strong>
                  </p>
                  <p className="small mb-0">
                    <code>Email: admin@cooking.com</code><br />
                    <code>Password: admin123</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
