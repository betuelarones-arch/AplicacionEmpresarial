# API Endpoints - Sistema de Autenticación y Perfil

## Resumen de Endpoints Disponibles

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | No | Login de usuario (admin o cliente) |
| POST | `/api/auth/logout` | Sí | Cerrar sesión (elimina token) |
| POST | `/api/auth/register` | No | Registrar nuevo usuario cliente |
| GET | `/api/auth/user` | Sí | Obtener usuario actual con perfil |
| GET | `/api/auth/profile/` | Sí | Ver perfil completo |
| PUT | `/api/auth/profile/` | Sí | Actualizar perfil |
| POST | `/api/auth/change-password/` | Sí | Cambiar contraseña |

## 1. Login (POST /api/auth/login)

Autentica un usuario y retorna un token.

### Request:
```json
{
  "username": "juan",
  "password": "Password123"
}
```

O con email:
```json
{
  "email": "juan@ejemplo.com",
  "password": "Password123"
}
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "user": {
      "id": 1,
      "username": "juan",
      "email": "juan@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "is_staff": false,
      "is_superuser": false,
      "date_joined": "2025-11-29T10:00:00Z",
      "last_login": "2025-12-02T14:30:00Z"
    }
  }
}
```

### Códigos de Error:
- `400` - Credenciales inválidas o usuario no es staff (para admin)

## 2. Logout (POST /api/auth/logout)

Cierra sesión eliminando el token del usuario.

### Headers:
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

## 3. Register (POST /api/auth/register)

Registra un nuevo usuario cliente (NO administrador).

### Request:
```json
{
  "username": "nuevo_usuario",
  "email": "nuevo@ejemplo.com",
  "password": "Password123",
  "password_confirm": "Password123",
  "first_name": "Nombre",
  "last_name": "Apellido"
}
```

### Validaciones:
- Username único
- Email único y válido
- Contraseña mínimo 8 caracteres
- Contraseña debe tener letras y números
- Las contraseñas deben coincidir

### Response (201 Created):
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "abc123def456...",
    "user": {
      "id": 5,
      "username": "nuevo_usuario",
      "email": "nuevo@ejemplo.com",
      "first_name": "Nombre",
      "last_name": "Apellido",
      "is_staff": false
    }
  }
}
```

### Códigos de Error:
- `400` - Errores de validación (email duplicado, contraseñas no coinciden, etc.)

## 4. Usuario Actual (GET /api/auth/user)

Obtiene información del usuario autenticado con su perfil.

### Headers:
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "juan",
    "email": "juan@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "is_staff": false,
    "is_superuser": false,
    "date_joined": "2025-11-29T10:00:00Z",
    "last_login": "2025-12-02T14:30:00Z",
    "profile": {
      "phone": "+1234567890",
      "default_address": "Calle 123",
      "default_city": "Ciudad",
      "default_country": "US",
      "postal_code": "12345",
      "photo": null,
      "birth_date": "1990-01-15"
    }
  }
}
```

## 5. Ver Perfil (GET /api/auth/profile/)

Idéntico a GET /api/auth/user. Retorna el perfil completo del usuario.

### Headers:
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "juan",
    "email": "juan@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "is_staff": false,
    "is_superuser": false,
    "date_joined": "2025-11-29T10:00:00Z",
    "last_login": "2025-12-02T14:30:00Z",
    "profile": {
      "phone": "+1234567890",
      "default_address": "Calle 123",
      "default_city": "Ciudad",
      "default_country": "US",
      "postal_code": "12345",
      "photo": "/media/profiles/juan.jpg",
      "birth_date": "1990-01-15"
    }
  }
}
```

## 6. Actualizar Perfil (PUT /api/auth/profile/)

Actualiza información del usuario y/o su perfil.

### Headers:
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
Content-Type: application/json
```

### Request (todos los campos son opcionales):
```json
{
  "first_name": "Juan Carlos",
  "last_name": "Pérez García",
  "email": "juancarlos@ejemplo.com",
  "profile": {
    "phone": "+9876543210",
    "default_address": "Nueva Calle 456",
    "default_city": "Nueva Ciudad",
    "default_country": "MX",
    "postal_code": "54321",
    "birth_date": "1990-01-15"
  }
}
```

### Actualización parcial (solo algunos campos):
```json
{
  "first_name": "Juan Carlos",
  "profile": {
    "phone": "+9876543210"
  }
}
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": 1,
    "username": "juan",
    "email": "juancarlos@ejemplo.com",
    "first_name": "Juan Carlos",
    "last_name": "Pérez García",
    "is_staff": false,
    "is_superuser": false,
    "date_joined": "2025-11-29T10:00:00Z",
    "last_login": "2025-12-02T14:30:00Z",
    "profile": {
      "phone": "+9876543210",
      "default_address": "Nueva Calle 456",
      "default_city": "Nueva Ciudad",
      "default_country": "MX",
      "postal_code": "54321",
      "photo": null,
      "birth_date": "1990-01-15"
    }
  }
}
```

### Códigos de Error:
- `400` - Datos inválidos

## 7. Cambiar Contraseña (POST /api/auth/change-password/)

Cambia la contraseña del usuario. Invalida el token actual y retorna uno nuevo.

### Headers:
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
Content-Type: application/json
```

### Request:
```json
{
  "old_password": "Password123",
  "new_password": "NewPassword456",
  "new_password_confirm": "NewPassword456"
}
```

### Validaciones:
- Contraseña actual correcta
- Nueva contraseña mínimo 8 caracteres
- Debe contener al menos una letra
- Debe contener al menos un número
- Las contraseñas nuevas deben coincidir

### Response (200 OK):
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente",
  "data": {
    "token": "nuevo_token_xyz789..."
  }
}
```

**IMPORTANTE:** Después de cambiar la contraseña, debes usar el nuevo token.

### Códigos de Error:
- `400` - Contraseña actual incorrecta o validación fallida

## Ejemplos de Uso con JavaScript

### Login:
```javascript
const login = async (username, password) => {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();

  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }

  return data;
};
```

### Logout:
```javascript
const logout = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  const data = await response.json();

  if (data.success) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return data;
};
```

### Register:
```javascript
const register = async (userData) => {
  const response = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  const data = await response.json();

  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }

  return data;
};

// Uso:
register({
  username: 'nuevo_usuario',
  email: 'nuevo@ejemplo.com',
  password: 'Password123',
  password_confirm: 'Password123',
  first_name: 'Nombre',
  last_name: 'Apellido'
});
```

### Obtener Usuario Actual:
```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8000/api/auth/user', {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  const data = await response.json();
  return data.data;
};
```

### Actualizar Perfil:
```javascript
const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8000/api/auth/profile/', {
    method: 'PUT',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  return data;
};

// Uso:
updateProfile({
  first_name: 'Juan',
  last_name: 'Pérez',
  profile: {
    phone: '+1234567890',
    default_address: 'Calle 123',
    default_city: 'Ciudad',
    postal_code: '12345'
  }
});
```

### Cambiar Contraseña:
```javascript
const changePassword = async (oldPassword, newPassword) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8000/api/auth/change-password/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPassword
    })
  });
  const data = await response.json();

  if (data.success) {
    // Actualizar el token
    localStorage.setItem('token', data.data.token);
  }

  return data;
};
```

### Subir Foto de Perfil:
```javascript
const uploadProfilePhoto = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('profile[photo]', file);

  const response = await fetch('http://localhost:8000/api/auth/profile/', {
    method: 'PUT',
    headers: {
      'Authorization': `Token ${token}`
    },
    body: formData
  });
  const data = await response.json();
  return data;
};

// Uso con input file:
const fileInput = document.getElementById('photoInput');
uploadProfilePhoto(fileInput.files[0]);
```

## Notas Importantes

1. **Token de Autenticación:** Debe incluirse en el header `Authorization: Token <token>` para todos los endpoints que requieren autenticación.

2. **Cambio de Contraseña:** Al cambiar contraseña, el token anterior se invalida. El cliente debe actualizar el token con el nuevo recibido.

3. **Auto-completado en Checkout:** Los datos del perfil se usan automáticamente en `POST /api/orders/create_order/` si no se proporcionan billing_details.

4. **Partial Update:** El endpoint PUT /api/auth/profile/ soporta actualizaciones parciales (solo enviar los campos a actualizar).

5. **Formato de Fecha:** Las fechas usan formato ISO 8601: `YYYY-MM-DD` (ej: `1990-01-15`).

6. **Códigos de País:** Se usa el formato ISO 3166-1 alpha-2 (2 letras): US, MX, ES, etc.
