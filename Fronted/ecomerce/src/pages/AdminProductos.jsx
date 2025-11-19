// src/pages/AdminProductos.jsx
import { useEffect, useState } from "react";
import FormProducto from "../components/FormProducto";
import ListaProductos from "../components/ListaProductos";
import { getProductos } from "../api/productosApi";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);

  const cargarProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (e) {
      console.error(e);
      alert("Error al cargar productos");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleProductoCreado = () => {
    cargarProductos();
  };

  return (
    <main style={{ padding: "2rem 4rem" }}>
      <h1
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          marginBottom: "1.5rem",
        }}
      >
        Gestión de productos – Pastelería
      </h1>

      {/* AQUÍ solo organizamos los DOS componentes que ya existen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(340px, 420px) 1fr",
          gap: "2.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Izquierda: formulario (FormProducto.jsx) */}
        <FormProducto onCreated={handleProductoCreado} />

        {/* Derecha: lista (ListaProductos.jsx) */}
        <section>
          <h3 style={{ marginBottom: "1rem" }}>Productos registrados</h3>
          <ListaProductos productos={productos} onChange={cargarProductos} />
        </section>
      </div>
    </main>
  );
}
