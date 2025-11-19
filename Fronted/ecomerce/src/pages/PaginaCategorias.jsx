import { useState } from "react";
import ListaCategorias from "../components/ListaCategorias";
import FormCategoria from "../components/FormCategoria";

export default function PaginaCategorias() {
  const [reloadFlag, setReloadFlag] = useState(false);

  const handleCreated = () => {
    setReloadFlag(f => !f);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestión de categorías</h1>
      <FormCategoria onCreated={handleCreated} />
      <ListaCategorias key={reloadFlag} />
    </div>
  );
}
