// src/components/ListaProductos.jsx
import { useEffect, useState } from "react";
import { getProductos, deleteProducto } from "../api/productosApi";

export default function ListaProductos({ onAddToCart }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductos()
      .then((data) => setProductos(data))
      .catch((err) => {
        console.error(err);
        alert("Error al cargar productos");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await deleteProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error al eliminar producto");
    }
  };

  if (loading) return <p>Cargando productos...</p>;

  if (productos.length === 0) return <p>No hay productos registrados.</p>;

  return (
    <div>
      <h2>Catálogo de pasteles</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {productos.map((prod) => (
          <div
            key={prod.id}
            style={{
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              background: "#121212",
            }}
          >
            {prod.imagen && (
              <img
                src={prod.imagen}
                alt={prod.nombre}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "0.75rem",
                }}
              />
            )}
            <h3 style={{ margin: "0 0 0.5rem" }}>{prod.nombre}</h3>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
              {prod.descripcion}
            </p>
            <p style={{ fontWeight: "bold", margin: "0 0 0.75rem" }}>
              S/ {Number(prod.precio).toFixed(2)}
            </p>

            {/* 🛒 Botón agregar al carrito */}
            <button
              type="button"
              onClick={() => onAddToCart && onAddToCart(prod)}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "0.5rem",
                borderRadius: "999px",
                padding: "0.4rem 0.8rem",
                border: "none",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, #ffb703 0%, #fb5607 50%, #ff006e 100%)",
              }}
            >
              Agregar al carrito 🛒
            </button>

            {/* Botón eliminar (tu código de antes) */}
            <button
              type="button"
              onClick={() => handleDelete(prod.id)}
              style={{
                display: "block",
                width: "100%",
                borderRadius: "999px",
                padding: "0.4rem 0.8rem",
                border: "1px solid #444",
                background: "#1a1a1a",
                color: "#f5f5f5",
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
