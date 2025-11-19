import { useEffect, useState } from "react";
import { getCategorias, deleteCategoria } from "../api/categoriasApi";

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategorias()
      .then(data => setCategorias(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await deleteCategoria(id);
      setCategorias(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error al eliminar categoría");
    }
  };

  if (loading) return <p>Cargando categorías...</p>;

  return (
    <div>
      <h2>Categorías de productos</h2>
      <ul>
        {categorias.map(cat => (
          <li key={cat.id}>
            <strong>{cat.nombre}</strong> – {cat.descripcion}{" "}
            <button onClick={() => handleDelete(cat.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}