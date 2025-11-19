import { useState } from "react";
import { createCategoria } from "../api/categoriasApi";

export default function FormCategoria({ onCreated }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Armamos el FormData para enviar texto + archivo
  const fd = new FormData();
  fd.append("nombre", formData.nombre);
  fd.append("descripcion", formData.descripcion);
  fd.append("precio", formData.precio);
  fd.append("categoria", formData.categoria);

  if (imagenFile) {
    fd.append("imagen", imagenFile); // 👈 archivo que elegiste desde la PC
  }

  try {
    if (formData.id === null) {
      // Crear
      await createProducto(fd);
    } else {
      // Actualizar
      await updateProducto(formData.id, fd);
    }

    // Limpiar formulario
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "",
      imagen: "",
    });
    setImagenFile(null);

    // Recargar lista
    await cargarProductos();
  } catch (err) {
    console.error(err);
    alert("Error al guardar producto");
  }
};

}