// src/api/productos.js
import API_BASE_URL from './config';

export const productosAPI = {
  // GET /api/productos/ (con filtros opcionales)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.search) params.append('search', filters.search);
    if (filters.precio_min) params.append('precio__gte', filters.precio_min);
    if (filters.precio_max) params.append('precio__lte', filters.precio_max);
    
    const url = `${API_BASE_URL}/productos/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
  },

  // GET /api/productos/{id}/
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}/`);
    if (!response.ok) throw new Error('Error al obtener producto');
    return response.json();
  },

  // GET /api/productos/{id}/recommend/
  getRecommendations: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}/recommend/`);
    if (!response.ok) throw new Error('Error al obtener recomendaciones');
    return response.json();
  },

  // POST /api/productos/ (con FormData para imágenes)
  create: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/productos/`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return response.json();
  },

  // PUT /api/productos/{id}/
  update: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}/`, {
      method: 'PUT',
      body: formData
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
  },

  // PATCH /api/productos/{id}/
  partialUpdate: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
  },

  // DELETE /api/productos/{id}/
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}/`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
  }
};