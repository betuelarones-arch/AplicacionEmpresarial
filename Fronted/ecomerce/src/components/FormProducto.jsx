// src/components/FormProducto.jsx
import { useState, useEffect } from "react";
import { createProducto } from "../api/productosApi";
import { getCategorias } from "../api/categoriasApi";

export default function FormProducto({ onCreated }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);

  // archivo de imagen desde la PC
  const [imagenFile, setImagenFile] = useState(null);

  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("nombre", nombre);
      fd.append("descripcion", descripcion);
      fd.append("precio", precio);
      fd.append("categoria", categoria);

      if (imagenFile) {
        fd.append("imagen", imagenFile);
      }

      const nuevo = await createProducto(fd);

      onCreated?.(nuevo);

      // limpiar formulario
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setCategoria("");
      setImagenFile(null);
      // si quieres resetear visualmente el input file, puedes usar una ref
    } catch (e) {
      console.error(e);
      alert("Error al crear producto");
    }
  };

  const wrapperStyle = {
    background: "#111",
    borderRadius: "16px",
    padding: "1.5rem",
    maxWidth: "420px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
  };

  const fieldStyle = {
    marginBottom: "0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  };

  const labelStyle = {
    fontSize: "0.9rem",
    fontWeight: 600,
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.7rem",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#1b1b1b",
    color: "#f5f5f5",
    outline: "none",
  };

  const buttonStyle = {
    marginTop: "0.5rem",
    padding: "0.6rem 1.3rem",
    borderRadius: "999px",
    border: "none",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    background:
      "linear-gradient(135deg, #ff4b8b 0%, #ff8b3d 50%, #ffd93d 100%)",
    color: "#000",
  };

  return (
    <form onSubmit={handleSubmit} style={wrapperStyle}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
        Nuevo producto
      </h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>Nombre</label>
        <input
          style={inputStyle}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Torta integral"
          required
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Descripción</label>
        <textarea
          style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Breve descripción del producto"
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Precio (S/)</label>
        <input
          style={inputStyle}
          type="number"
          step="0.01"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej: 15.90"
          required
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Categoría</label>
        <select
          style={inputStyle}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Imagen (desde tu PC)</label>
        <input
          style={{
            ...inputStyle,
            padding: "0.35rem 0.5rem",
          }}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImagenFile(file);
          }}
        />
        {imagenFile && (
          <small style={{ fontSize: "0.75rem", opacity: 0.8 }}>
            Archivo seleccionado: {imagenFile.name}
          </small>
        )}
      </div>

      <button type="submit" style={buttonStyle}>
        Guardar producto
      </button>
    </form>
  );
}
