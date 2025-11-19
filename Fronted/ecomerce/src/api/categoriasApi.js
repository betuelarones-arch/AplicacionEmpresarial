const BASE_URL = "http://localhost:8000/api/categorias/";

export async function getCategorias() {
  const res = await fetch(BASE_URL);          // GET /api/categorias/
  if (!res.ok) throw new Error("Error al obtener categorías");
  return await res.json();
}

export async function getCategoria(id) {
  const res = await fetch(`${BASE_URL}${id}/`); // GET /api/categorias/1/
  if (!res.ok) throw new Error("Error al obtener la categoría");
  return await res.json();
}

export async function createCategoria(data) {
  const res = await fetch(BASE_URL, {          // → POST /api/
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear categoría");
  return await res.json();
}

export async function updateCategoria(id, data) {
  const res = await fetch(`${BASE_URL}${id}/`, { // → PUT /api/1/
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar categoría");
  return await res.json();
}

export async function deleteCategoria(id) {
  const res = await fetch(`${BASE_URL}${id}/`, { // → DELETE /api/1/
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar categoría");
  return true;
}
