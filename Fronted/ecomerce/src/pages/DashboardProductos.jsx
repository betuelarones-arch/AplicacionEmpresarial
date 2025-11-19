// src/pages/DashboardProductos.jsx
import ListaProductos from "../components/ListaProductos";

export default function DashboardProductos({ onAddToCart }) {
  return (
    <main style={{ padding: "2rem 0" }}>
      {/* Contenedor centrado */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2.6rem",
            fontWeight: 800,
            marginBottom: "1.5rem",
          }}
        >
          Dashboard de productos
        </h1>

        <section>
          <h3 style={{ marginBottom: "1rem" }}>Productos registrados</h3>
          <ListaProductos onAddToCart={onAddToCart} />
        </section>
      </div>
    </main>
  );
}
