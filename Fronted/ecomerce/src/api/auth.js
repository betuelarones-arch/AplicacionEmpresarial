// src/api/auth.js
import API_BASE_URL from './config';

const authAPI = {
  // 🔹 Registrar nuevo usuario CLIENTE
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error al registrar usuario');
    }

    // Guardar token si el registro es exitoso
    if (data.success && data.data && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  // 🔹 LOGIN CLIENTE → usa /api/auth/client/login
  loginClient: async (emailOrUsername, password) => {
    // Detectamos si escribió email o username
    const body = emailOrUsername.includes('@')
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };

    const response = await fetch(`${API_BASE_URL}/auth/client/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Error al iniciar sesión';
      if (data.message) errorMessage = data.message;
      else if (data.error) errorMessage = data.error;
      else if (data.detail) errorMessage = data.detail;
      throw new Error(errorMessage);
    }

    if (data.success && data.data && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  // 🔹 LOGIN ADMIN → usa /api/auth/login
  loginAdmin: async (emailOrUsername, password) => {
    const body = emailOrUsername.includes('@')
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Error al iniciar sesión';
      if (data.message) errorMessage = data.message;
      else if (data.error) errorMessage = data.error;
      else if (data.detail) errorMessage = data.detail;
      throw new Error(errorMessage);
    }

    if (data.success && data.data && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  // 🔹 Logout
  logout: async () => {
    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
      } catch (error) {
        console.error('Error al hacer logout:', error);
      }
    }

    // Limpiar localStorage siempre
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // 🔹 Obtener usuario actual
  getCurrentUser: async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener usuario');
    }

    // Actualizar usuario en localStorage
    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data;
  },

  // 🔹 Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // 🔹 Obtener usuario guardado
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 🔹 Verificar si es admin según los flags que devuelve el backend
  isAdmin: () => {
    const user = authAPI.getStoredUser();
    return user && (user.is_staff || user.is_superuser);
  },
};

export default authAPI;
