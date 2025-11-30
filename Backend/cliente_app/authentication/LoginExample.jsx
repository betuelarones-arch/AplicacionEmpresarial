/**
 * Componente de Login - Ejemplo para React
 *
 * Este es un componente de ejemplo que muestra cómo implementar
 * un formulario de login que consume la API de autenticación.
 *
 * Puedes copiar y adaptar este código a tu proyecto React.
 */

import React, { useState } from 'react';
import AuthService from './auth_service';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await AuthService.login(
        credentials.username,
        credentials.password
      );

      console.log('Login exitoso:', data);

      // Redirigir al dashboard o página principal
      // window.location.href = '/dashboard';
      // O con React Router:
      // navigate('/dashboard');

    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión - Administrador</h2>
        <p>Panel de administración de la Pastelería</p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario o Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-card {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 100%;
        }

        h2 {
          margin: 0 0 10px;
          color: #333;
          font-size: 24px;
        }

        p {
          margin: 0 0 30px;
          color: #666;
          font-size: 14px;
        }

        .alert {
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .alert-error {
          background-color: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
          font-size: 14px;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
        }

        input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;


/**
 * Hook personalizado para autenticación
 * Puedes usar este hook en cualquier componente para acceder al estado de autenticación
 */
export const useAuth = () => {
  const [user, setUser] = useState(AuthService.getUser());
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await AuthService.login(username, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    if (!AuthService.isAuthenticated()) {
      setUser(null);
      return false;
    }

    setLoading(true);
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  };
};


/**
 * Componente de ruta protegida
 * Envuelve componentes que requieren autenticación
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();

  React.useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Redirigir al login
    window.location.href = '/login';
    return null;
  }

  return children;
};
