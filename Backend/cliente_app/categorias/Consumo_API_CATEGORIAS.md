| Método | Endpoint                | Descripción                       | Body (JSON) ejemplo                                                                                   |
| ------ | ----------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GET    | `/api/categorias/`      | Listar todas las categorías       | -                                                                                                     |
| GET    | `/api/categorias/{id}/` | Obtener categoría por ID          | -                                                                                                     |
| POST   | `/api/categorias/`      | Crear nueva categoría             | `json { "nombre": "Pasteles", "descripcion": "Categoría de pasteles variados y deliciosos" } `        |
| PUT    | `/api/categorias/{id}/` | Actualizar categoría completa     | `json { "nombre": "Pasteles y Tartas", "descripcion": "Categoría de pasteles y tartas deliciosas" } ` |
| PATCH  | `/api/categorias/{id}/` | Actualizar categoría parcialmente | `json { "descripcion": "Descripción actualizada" } `                                                  |
| DELETE | `/api/categorias/{id}/` | Eliminar categoría                | -                                                                                                     |
