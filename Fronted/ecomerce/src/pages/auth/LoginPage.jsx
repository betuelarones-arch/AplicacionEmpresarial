// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.username, formData.password);
      
      if (response.success) {
        // Si es admin, redirigir al panel
        if (response.data.user.is_staff || response.data.user.is_superuser) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
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

                {/* Error */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                    ></button>
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Usuario</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        placeholder="admin"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

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

                {/* Info de prueba - Solo para admin */}
                <div className="mt-4 p-3 bg-light rounded">
                  <p className="small text-muted mb-1">
                    <strong>💼 Acceso Administrador:</strong>
                  </p>
                  <p className="small mb-0">
                    <code>Usuario: admin</code><br />
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