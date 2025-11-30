# API de Autenticación - Documentación

Sistema de autenticación para administradores de la pastelería.
Utiliza Token Authentication de Django REST Framework.

---

## Endpoints Disponibles

### 1. Login - Autenticar Administrador

**Endpoint:** `POST /api/auth/login`

**Descripción:** Autentica a un usuario administrador y devuelve un token de autenticación.

**Permisos:** Público (sin autenticación requerida)

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

O usando email:
```json
{
  "email": "admin@pasteleria.com",
  "password": "admin123"
}
```

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@pasteleria.com",
      "first_name": "Admin",
      "last_name": "User",
      "is_staff": true,
      "is_superuser": true,
      "date_joined": "2025-11-29T10:00:00Z",
      "last_login": "2025-11-29T14:30:00Z"
    }
  }
}
```

**Response error (400):**
```json
{
  "success": false,
  "message": "Error en las credenciales",
  "errors": {
    "non_field_errors": ["Credenciales inválidas"]
  }
}
```

---

### 2. Logout - Cerrar Sesión

**Endpoint:** `POST /api/auth/logout`

**Descripción:** Cierra la sesión del usuario eliminando su token de autenticación.

**Permisos:** Requiere autenticación (Token)

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Request Body:** No requiere body

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

**Response error (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 3. Obtener Usuario Actual

**Endpoint:** `GET /api/auth/user`

**Descripción:** Obtiene la información del usuario actualmente autenticado.

**Permisos:** Requiere autenticación (Token)

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response exitoso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@pasteleria.com",
    "first_name": "Admin",
    "last_name": "User",
    "is_staff": true,
    "is_superuser": true,
    "date_joined": "2025-11-29T10:00:00Z",
    "last_login": "2025-11-29T14:30:00Z"
  }
}
```

**Response error (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## Restricciones de Seguridad

1. **Solo usuarios staff/admin:** El sistema solo permite autenticación a usuarios con `is_staff=True` o `is_superuser=True`

2. **Cuenta activa:** Los usuarios deben tener `is_active=True`

3. **CORS configurado:** El backend acepta peticiones desde los orígenes configurados en `CORS_ALLOWED_ORIGINS`

---

## Ejemplo de uso desde React/JavaScript

### Login
```javascript
const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      // Guardar token en localStorage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
```

### Logout
```javascript
const logout = async () => {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch('http://localhost:8000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (data.success) {
      // Limpiar token del localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return true;
    }
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};
```

### Obtener Usuario Actual
```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch('http://localhost:8000/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error('No autenticado');
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
};
```

### Hook personalizado de React (opcional)
```javascript
// useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      // Verificar si el token es válido
      getCurrentUser()
        .then(userData => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          // Token inválido
          localStorage.removeItem('authToken');
          setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const data = await loginAPI(username, password);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await logoutAPI();
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, login, logout };
};
```

---

## Crear Usuario Administrador de Prueba

Para crear un usuario administrador desde la terminal:

```bash
# Navegar al directorio del proyecto
cd C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app

# Crear superusuario (método interactivo)
python manage.py createsuperuser

# O crear usuario staff programáticamente en shell de Django
python manage.py shell
```

Dentro del shell de Django:
```python
from django.contrib.auth.models import User

# Crear usuario admin
user = User.objects.create_user(
    username='admin',
    email='admin@pasteleria.com',
    password='admin123',
    first_name='Admin',
    last_name='Pasteleria'
)

# Convertirlo en staff
user.is_staff = True
user.is_superuser = True
user.save()

print(f"Usuario creado: {user.username}")
```

---

## Proteger Endpoints Existentes

Para proteger endpoints que requieran autenticación, agregar a las vistas:

```python
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # Requiere autenticación
    # o
    permission_classes = [IsAdminUser]  # Requiere ser admin
```

---

## Errores Comunes

### 401 Unauthorized
- El token no fue enviado en los headers
- El token es inválido o expiró
- El formato del header es incorrecto (debe ser `Authorization: Token <token>`)

### 400 Bad Request
- Credenciales incorrectas
- Usuario no es staff/admin
- Falta username/email o password

### 403 Forbidden
- Usuario autenticado pero sin permisos suficientes

---

## Testing con curl

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Obtener usuario (reemplazar <TOKEN> con el token obtenido)
curl -X GET http://localhost:8000/api/auth/user \
  -H "Authorization: Token <TOKEN>"

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Token <TOKEN>"
```
