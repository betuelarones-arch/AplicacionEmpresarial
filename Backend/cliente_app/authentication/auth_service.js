/**
 * Servicio de Autenticación para React/JavaScript
 *
 * Módulo reutilizable para manejar autenticación de administradores
 * con la API de la pastelería.
 *
 * Uso:
 *   import AuthService from './auth_service';
 *
 *   // Login
 *   const data = await AuthService.login('admin', 'password123');
 *
 *   // Obtener usuario actual
 *   const user = await AuthService.getCurrentUser();
 *
 *   // Logout
 *   await AuthService.logout();
 */

const API_BASE_URL = 'http://localhost:8000/api';

class AuthService {
  /**
   * Realiza login de un administrador
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Datos del usuario y token
   */
  static async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en login');
      }

      if (data.success) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Realiza login usando email en lugar de username
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Datos del usuario y token
   */
  static async loginWithEmail(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en login');
      }

      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cierra sesión del usuario actual
   * @returns {Promise<boolean>} - True si fue exitoso
   */
  static async logout() {
    const token = this.getToken();

    if (!token) {
      // No hay token, solo limpiar localStorage
      this.clearAuth();
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      // Limpiar localStorage independientemente del resultado
      this.clearAuth();

      return data.success;
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar localStorage aunque falle la petición
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Obtiene información del usuario autenticado actualmente
   * @returns {Promise<Object>} - Datos del usuario
   */
  static async getCurrentUser() {
    const token = this.getToken();

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido, limpiar localStorage
          this.clearAuth();
          throw new Error('Sesión expirada');
        }
        throw new Error(data.message || 'Error obteniendo usuario');
      }

      if (data.success) {
        // Actualizar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} - True si hay token
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Obtiene el token del localStorage
   * @returns {string|null} - Token o null
   */
  static getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Obtiene el usuario del localStorage
   * @returns {Object|null} - Usuario o null
   */
  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Limpia los datos de autenticación del localStorage
   */
  static clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Realiza una petición autenticada a la API
   * @param {string} endpoint - Endpoint relativo (ej: '/productos/')
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<Response>} - Respuesta de fetch
   */
  static async authenticatedRequest(endpoint, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error('No autenticado');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
      ...options.headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        // Token inválido, limpiar sesión
        this.clearAuth();
        throw new Error('Sesión expirada');
      }

      return response;
    } catch (error) {
      console.error('Error en petición autenticada:', error);
      throw error;
    }
  }
}

export default AuthService;

// Para uso con script tag (sin módulos ES6)
if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
}
