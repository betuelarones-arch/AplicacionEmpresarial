// src/pages/CrearProductosYCategorias.jsx
import FormProducto from "../components/FormProducto";
// si todavía no usas el de categoría, lo dejamos comentado
// import FormCategoria from "../components/FormCategoria";

export default function CrearProductosYCategorias() {
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
            fontSize: "2.4rem",
            fontWeight: 800,
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          Administración – Crear productos y categorías
        </h1>

        {/* Un solo formulario, centrado */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <section style={{ width: "100%", maxWidth: "520px" }}>
            <FormProducto />
          </section>
        </div>

        {/* Más adelante, cuando el FormCategoria esté listo, 
           podemos volver a hacer un layout en 2 columnas */}
        {/*
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "minmax(340px, 420px) minmax(320px, 380px)",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          <section>
            <FormProducto />
          </section>
          <section>
            <FormCategoria />
          </section>
        </div>
        */}
      </div>
    </main>
  );
}
