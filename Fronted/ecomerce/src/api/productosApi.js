// src/api/productosApi.js
const BASE_URL = "http://localhost:8000/api/productos/";

export async function getProductos() {
  const res = await fetch(BASE_URL);          
  if (!res.ok) throw new Error("Error al obtener productos");
  return await res.json();
}

export async function getProducto(id) {
  // GET -> http://127.0.0.1:8000/api/productos/1/
  const res = await fetch(`${BASE_URL}${id}/`);
  if (!res.ok) throw new Error("Error al obtener el producto");
  return await res.json();
}

export async function createProducto(formData) {
  // formData ya viene armado desde el formulario
  const res = await fetch(BASE_URL, {
    method: "POST",
    body: formData,              // 👈 SIN headers de Content-Type
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return await res.json();
}

export async function updateProducto(id, data) {
  // PUT -> http://127.0.0.1:8000/api/productos/1/
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar producto");
  return await res.json();
}

export async function deleteProducto(id) {
  // DELETE -> http://127.0.0.1:8000/api/productos/1/
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar producto");
  return true;
}
