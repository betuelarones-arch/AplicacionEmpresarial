# Sistema de Login para Clientes

Este documento explica el sistema completo de autenticación para clientes (usuarios no administradores).

## 📋 Endpoints Disponibles

### 1. Registro de Cliente
**POST** `/api/auth/register`

Registra un nuevo usuario cliente en el sistema.

**Request Body:**
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

**Response (201 Created):**
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

---

### 2. Login de Cliente
**POST** `/api/auth/client/login`

Autentica un cliente existente. Solo permite acceso a usuarios NO administradores.

**Request Body:**
```json
{
    "username": "juan",
    "password": "Segura123"
}
```

O usando email:
```json
{
    "email": "juan@ejemplo.com",
    "password": "Segura123"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Login exitoso",
    "data": {
        "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
        "user": {
            "id": 5,
            "username": "juan",
            "email": "juan@ejemplo.com",
            "first_name": "Juan",
            "last_name": "Pérez",
            "date_joined": "2025-11-29T10:00:00Z",
            "last_login": "2025-11-29T14:30:00Z",
            "profile": {
                "phone": "",
                "default_address": "",
                "default_city": "",
                "default_country": "US",
                "postal_code": "",
                "photo": null,
                "birth_date": null
            }
        }
    }
}
```

**Errores Posibles:**

- Credenciales incorrectas:
```json
{
    "success": false,
    "message": "Error en las credenciales",
    "errors": {
        "non_field_errors": ["Credenciales inválidas"]
    }
}
```

- Usuario es administrador:
```json
{
    "success": false,
    "message": "Error en las credenciales",
    "errors": {
        "non_field_errors": ["Esta cuenta es administrativa. Use el endpoint de admin."]
    }
}
```

---

### 3. Obtener Usuario Actual
**GET** `/api/auth/user`

Obtiene la información del usuario autenticado con su perfil.

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 5,
        "username": "juan",
        "email": "juan@ejemplo.com",
        "first_name": "Juan",
        "last_name": "Pérez",
        "is_staff": false,
        "is_superuser": false,
        "date_joined": "2025-11-29T10:00:00Z",
        "last_login": "2025-11-29T14:30:00Z",
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

---

### 4. Ver/Actualizar Perfil
**GET** `/api/auth/profile/`

Obtiene el perfil completo del usuario.

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response:** (igual que /api/auth/user)

---

**PUT** `/api/auth/profile/`

Actualiza el perfil del usuario.

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
Content-Type: application/json
```

**Request Body:**
```json
{
    "first_name": "Juan Carlos",
    "email": "juancarlos@ejemplo.com",
    "profile": {
        "phone": "+9876543210",
        "default_address": "Nueva Calle 456",
        "default_city": "Nueva Ciudad",
        "postal_code": "54321",
        "birth_date": "1990-01-15"
    }
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Perfil actualizado exitosamente",
    "data": {
        "id": 5,
        "username": "juan",
        "email": "juancarlos@ejemplo.com",
        "first_name": "Juan Carlos",
        "last_name": "Pérez",
        "profile": {
            "phone": "+9876543210",
            "default_address": "Nueva Calle 456",
            "default_city": "Nueva Ciudad",
            "default_country": "US",
            "postal_code": "54321",
            "photo": null,
            "birth_date": "1990-01-15"
        }
    }
}
```

---

### 5. Cambiar Contraseña
**POST** `/api/auth/change-password/`

Cambia la contraseña del usuario. Invalida el token actual y genera uno nuevo.

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
Content-Type: application/json
```

**Request Body:**
```json
{
    "old_password": "Segura123",
    "new_password": "NuevaSegura456",
    "new_password_confirm": "NuevaSegura456"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Contraseña cambiada exitosamente",
    "data": {
        "token": "nuevo_token_generado_aqui"
    }
}
```

---

### 6. Cerrar Sesión
**POST** `/api/auth/logout`

Cierra la sesión del usuario eliminando su token.

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Logout exitoso"
}
```

---

## 🔐 Diferencias entre Login de Admin y Cliente

### Login de Admin (`/api/auth/login`)
- ✅ Solo usuarios con `is_staff=True` o `is_superuser=True`
- ❌ Rechaza usuarios clientes regulares
- 📝 Usa `LoginSerializer`
- 🎯 Para panel administrativo

### Login de Cliente (`/api/auth/client/login`)
- ✅ Solo usuarios con `is_staff=False` y `is_superuser=False`
- ❌ Rechaza usuarios administradores
- 📝 Usa `ClientLoginSerializer`
- 🎯 Para aplicación de clientes
- ➕ Incluye perfil completo en la respuesta

---

## 🧪 Pruebas con cURL

### Registrar un nuevo cliente:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testcliente",
    "email": "test@cliente.com",
    "password": "Test1234",
    "password_confirm": "Test1234",
    "first_name": "Test",
    "last_name": "Cliente"
  }'
```

### Login de cliente:
```bash
curl -X POST http://localhost:8000/api/auth/client/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testcliente",
    "password": "Test1234"
  }'
```

### Obtener perfil (reemplazar TOKEN):
```bash
curl -X GET http://localhost:8000/api/auth/user \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Actualizar perfil (reemplazar TOKEN):
```bash
curl -X PUT http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Nuevo Nombre",
    "profile": {
      "phone": "+1234567890",
      "default_address": "Mi dirección 123"
    }
  }'
```

---

## 📁 Archivos Relacionados

- **Serializers:** `authentication/serializers.py`
  - `ClientLoginSerializer` (líneas 250-318)
  - `ClientUserWithProfileSerializer` (líneas 339-363)

- **Views:** `authentication/views.py`
  - `LoginClientView` (líneas 262-343)
  - `RegisterView` (líneas 177-259)
  - `UpdateProfileView` (líneas 346-413)

- **URLs:** `authentication/urls.py`
  - Endpoint: `client/login` (línea 25)

- **Models:** `authentication/models.py`
  - `UserProfile` (líneas 7-90)

---

## ✅ Validaciones de Seguridad

### Registro:
- Email único en el sistema
- Username único en el sistema
- Contraseña mínimo 8 caracteres
- Debe contener al menos una letra y un número
- Confirmación de contraseña debe coincidir

### Login:
- Usuarios clientes NO pueden usar login de admin
- Usuarios admin NO pueden usar login de cliente
- Cuenta debe estar activa (`is_active=True`)

### Perfil:
- Solo el usuario autenticado puede ver/editar su propio perfil
- Token requerido en todas las operaciones

---

## 🚀 Próximos Pasos

Para usar esto en tu frontend React:
1. Usar `/api/auth/client/login` para login de clientes
2. Guardar el token en localStorage o sessionStorage
3. Incluir el token en todas las peticiones: `Authorization: Token <token>`
4. Usar `/api/auth/user` para obtener datos del usuario
5. Usar `/api/auth/profile/` para ver/actualizar perfil
