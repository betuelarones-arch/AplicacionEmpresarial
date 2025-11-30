// src/api/auth.js
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const authAPI = {
  // POST /api/auth/register - Registrar nuevo cliente
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Extraer mensajes de error del backend
      const errorMessage = data.message || 'Error al registrar usuario';
      throw new Error(errorMessage);
    }
    
    // Guardar token y datos del usuario automáticamente
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  // POST /api/auth/login - Iniciar sesión
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }
    
    const data = await response.json();
    
    // Guardar token y datos del usuario
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  // POST /api/auth/logout - Cerrar sesión
  logout: async () => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
    
    // Limpiar datos locales
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // GET /api/auth/user - Obtener datos del usuario actual
  getCurrentUser: async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener datos del usuario');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Obtener el usuario guardado
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si el usuario es admin/staff
  isAdmin: () => {
    const user = authAPI.getStoredUser();
    return user && (user.is_staff || user.is_superuser);
  }
};