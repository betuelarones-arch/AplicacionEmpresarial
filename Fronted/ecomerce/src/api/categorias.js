// src/api/categorias.js
import API_BASE_URL from './config';

export const categoriasAPI = {
  // GET /api/categorias/
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categorias/`);
    if (!response.ok) throw new Error('Error al obtener categorías');
    return response.json();
  },

  // GET /api/categorias/{id}/
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}/`);
    if (!response.ok) throw new Error('Error al obtener categoría');
    return response.json();
  },

  // POST /api/categorias/
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/categorias/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear categoría');
    return response.json();
  },

  // PUT /api/categorias/{id}/
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar categoría');
    return response.json();
  },

  // PATCH /api/categorias/{id}/
  partialUpdate: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar categoría');
    return response.json();
  },

  // DELETE /api/categorias/{id}/
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}/`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar categoría');
  }
};