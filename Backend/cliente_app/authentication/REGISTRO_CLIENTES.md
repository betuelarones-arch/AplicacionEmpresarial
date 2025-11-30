# Endpoint de Registro de Usuarios Clientes

## Descripción General
Endpoint para registrar nuevos usuarios clientes en la aplicación de pastelería. Los usuarios registrados aquí son clientes regulares que NO tienen acceso al panel de administración.

---

## Endpoint

**URL:** `POST /api/auth/register`
**Autenticación:** No requerida (público)
**Tipo de Usuario Creado:** Cliente regular (is_staff=False, is_superuser=False)

---

## Formato de Petición

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "username": "juan",
  "email": "juan@ejemplo.com",
  "password": "Segura123",
  "password_confirm": "Segura123",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `username` | string | Sí | Nombre de usuario único (sin espacios) |
| `email` | string | Sí | Email válido y único |
| `password` | string | Sí | Contraseña (mínimo 8 caracteres, debe contener letras y números) |
| `password_confirm` | string | Sí | Confirmación de contraseña (debe coincidir con password) |
| `first_name` | string | No | Nombre del usuario |
| `last_name` | string | No | Apellido del usuario |

---

## Respuestas

### Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "user": {
      "id": 5,
      "username": "juan",
      "email": "juan@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "is_staff": false
    }
  }
}
```

**Nota:** El token devuelto se puede usar inmediatamente para autenticar al usuario (login automático).

---

### Errores de Validación (400 Bad Request)

#### 1. Email ya registrado
```json
{
  "success": false,
  "message": "Error en el registro",
  "errors": {
    "email": ["Este email ya está registrado"]
  }
}
```

#### 2. Username ya existe
```json
{
  "success": false,
  "message": "Error en el registro",
  "errors": {
    "username": ["Este nombre de usuario ya está en uso"]
  }
}
```

#### 3. Contraseñas no coinciden
```json
{
  "success": false,
  "message": "Error en el registro",
  "errors": {
    "password_confirm": ["Las contraseñas no coinciden"]
  }
}
```

#### 4. Contraseña muy corta
```json
{
  "success": false,
  "message": "Error en el registro",
  "errors": {
    "password": ["La contraseña debe tener al menos 8 caracteres"]
  }
}
```

#### 5. Contraseña sin letras o números
```json
{
  "success": false,
  "message": "Error en el registro",
  "errors": {
    "password": ["La contraseña debe contener al menos una letra y un número"]
  }
}
```

#### 6. Email inválido
```json
{
  "success": false,
  "message": "Error en el registro",
  "errors": {
    "email": ["Ingrese un email válido"]
  }
}
```

#### 7. Campos requeridos faltantes
```json
{
  "success": false,
  "message": "Error en el registro",
  "errors": {
    "username": ["El nombre de usuario es obligatorio"],
    "email": ["El email es obligatorio"],
    "password": ["La contraseña es obligatoria"],
    "password_confirm": ["Debe confirmar la contraseña"]
  }
}
```

---

## Validaciones Implementadas

1. **Email único**: No puede haber dos usuarios con el mismo email
2. **Email válido**: Formato de email correcto (ejemplo@dominio.com)
3. **Username único**: No puede haber dos usuarios con el mismo username
4. **Contraseña segura**:
   - Mínimo 8 caracteres
   - Debe contener al menos una letra
   - Debe contener al menos un número
5. **Confirmación de contraseña**: password y password_confirm deben coincidir
6. **Campos obligatorios**: username, email, password, password_confirm

---

## Ejemplos de Uso

### JavaScript/Fetch API

```javascript
// Registro de usuario
async function registerUser(userData) {
  try {
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.passwordConfirm,
        first_name: userData.firstName,
        last_name: userData.lastName
      })
    });

    const data = await response.json();

    if (data.success) {
      // Guardar token en localStorage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      console.log('Usuario registrado:', data.data.user);
      return data;
    } else {
      // Mostrar errores de validación
      console.error('Errores de registro:', data.errors);
      return data;
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
}

// Uso
registerUser({
  username: 'juan',
  email: 'juan@ejemplo.com',
  password: 'Segura123',
  passwordConfirm: 'Segura123',
  firstName: 'Juan',
  lastName: 'Pérez'
});
```

### React + Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// Función de registro
export const register = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.passwordConfirm,
      first_name: formData.firstName,
      last_name: formData.lastName
    });

    if (response.data.success) {
      // Guardar token y datos de usuario
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      // Configurar axios para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Token ${response.data.data.token}`;

      return response.data;
    }
  } catch (error) {
    if (error.response?.data) {
      // Errores de validación del servidor
      return error.response.data;
    }
    throw error;
  }
};

// Componente de formulario de registro
import { useState } from 'react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await register(formData);

      if (result.success) {
        alert('Usuario registrado exitosamente!');
        // Redirigir a la página principal o dashboard
        window.location.href = '/dashboard';
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      alert('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && <span className="error">{errors.username[0]}</span>}
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error">{errors.email[0]}</span>}
      </div>

      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <span className="error">{errors.password[0]}</span>}
      </div>

      <div>
        <label>Confirmar Contraseña:</label>
        <input
          type="password"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
        />
        {errors.password_confirm && <span className="error">{errors.password_confirm[0]}</span>}
      </div>

      <div>
        <label>Nombre:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Apellido:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
```

### cURL (Prueba desde terminal)

```bash
# Registro exitoso
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "email": "juan@ejemplo.com",
    "password": "Segura123",
    "password_confirm": "Segura123",
    "first_name": "Juan",
    "last_name": "Pérez"
  }'

# Probar error de email duplicado
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "pedro",
    "email": "juan@ejemplo.com",
    "password": "Segura123",
    "password_confirm": "Segura123"
  }'

# Probar error de contraseñas no coinciden
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria",
    "email": "maria@ejemplo.com",
    "password": "Segura123",
    "password_confirm": "Diferente123"
  }'
```

---

## Diferencia entre Login de Admin vs Registro de Cliente

### Login de Admin (`POST /api/auth/login`)
- **Propósito**: Autenticar administradores existentes
- **Usuarios permitidos**: Solo usuarios con is_staff=True o is_superuser=True
- **Acceso**: Panel de administración de Django
- **Creación**: Los admins se crean manualmente por superusuarios
- **Endpoint público**: Sí, pero valida que sea admin

### Registro de Cliente (`POST /api/auth/register`)
- **Propósito**: Crear nuevas cuentas de clientes
- **Usuarios creados**: is_staff=False, is_superuser=False
- **Acceso**: Solo frontend de la aplicación (compras)
- **Creación**: Auto-registro público
- **Endpoint público**: Sí, cualquiera puede registrarse
- **Login automático**: Devuelve token al registrarse

---

## Flujo de Uso Recomendado

1. **Registro del Cliente**
   - Usuario llena formulario de registro
   - Se validan los datos
   - Se crea el usuario con is_staff=False
   - Se devuelve token automáticamente
   - Se guarda token en localStorage

2. **Navegación Autenticada**
   - Usar el token en header: `Authorization: Token abc123...`
   - Acceder a endpoints protegidos (carrito, pedidos, etc.)
   - Consultar perfil con `GET /api/auth/user`

3. **Sesiones Futuras**
   - Si hay token guardado, no necesita login
   - Validar token con `GET /api/auth/user`
   - Si token inválido, pedir login nuevamente

---

## Seguridad

1. **Contraseña hasheada**: Se usa `User.objects.create_user()` que hashea automáticamente
2. **Email único**: Validación a nivel de base de datos
3. **CORS configurado**: Solo orígenes permitidos pueden acceder
4. **Token seguro**: Generado por Django REST Framework
5. **Sin acceso admin**: Usuarios creados NO pueden acceder al admin de Django

---

## Testing

### Casos de Prueba

1. Registro exitoso con todos los campos
2. Registro exitoso solo con campos requeridos
3. Email duplicado (debe fallar)
4. Username duplicado (debe fallar)
5. Contraseñas no coinciden (debe fallar)
6. Email inválido (debe fallar)
7. Contraseña muy corta (debe fallar)
8. Contraseña sin números (debe fallar)
9. Campos requeridos faltantes (debe fallar)
10. Usuario creado es cliente, no admin (is_staff=False)

---

## Notas Adicionales

- El token devuelto tiene duración ilimitada por defecto
- Para cerrar sesión, usar `POST /api/auth/logout` con el token
- Los usuarios pueden cambiar su contraseña posteriormente (implementar endpoint separado)
- Para recuperación de contraseña, implementar endpoint de reset (pendiente)
- Los clientes NO pueden acceder a `/admin/` de Django
