# Sistema de Perfil de Usuario - Documentación Completa

## Descripción General

El sistema de perfil de usuario extiende el modelo User estándar de Django para almacenar información adicional como teléfono, dirección predeterminada, foto de perfil y fecha de nacimiento.

## Características Implementadas

### 1. Modelo UserProfile
- **Ubicación:** `authentication/models.py`
- **Campos disponibles:**
  - `phone`: Teléfono del usuario
  - `default_address`: Dirección predeterminada
  - `default_city`: Ciudad
  - `default_country`: País (por defecto 'US')
  - `postal_code`: Código postal
  - `photo`: Foto de perfil (ImageField)
  - `birth_date`: Fecha de nacimiento

### 2. Creación Automática de Perfiles
- Los perfiles se crean automáticamente cuando se registra un nuevo usuario mediante signals
- Para usuarios existentes, se ejecutó el comando `python manage.py create_user_profiles`

## Endpoints Disponibles

### GET /api/auth/user
Obtiene información del usuario autenticado incluyendo su perfil.

**Headers:**
```
Authorization: Token <tu_token>
```

**Respuesta (200 OK):**
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

### GET /api/auth/profile/
Obtiene el perfil completo del usuario (igual que GET /api/auth/user).

**Headers:**
```
Authorization: Token <tu_token>
```

**Respuesta:** Igual que GET /api/auth/user

### PUT /api/auth/profile/
Actualiza el perfil del usuario.

**Headers:**
```
Authorization: Token <tu_token>
Content-Type: application/json
```

**Request Body (todos los campos son opcionales):**
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

**Respuesta (200 OK):**
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

**Respuesta de Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Error al actualizar perfil",
  "errors": {
    "email": ["Este email ya está registrado"]
  }
}
```

### POST /api/auth/change-password/
Cambia la contraseña del usuario. Genera un nuevo token y invalida el anterior.

**Headers:**
```
Authorization: Token <tu_token_actual>
Content-Type: application/json
```

**Request Body:**
```json
{
  "old_password": "Password123",
  "new_password": "NewPassword456",
  "new_password_confirm": "NewPassword456"
}
```

**Validaciones de contraseña:**
- Mínimo 8 caracteres
- Debe contener al menos una letra
- Debe contener al menos un número

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente",
  "data": {
    "token": "nuevo_token_generado_aqui"
  }
}
```

**IMPORTANTE:** Después de cambiar la contraseña, debes usar el nuevo token para futuras peticiones.

**Respuesta de Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta"
}
```

o

```json
{
  "success": false,
  "message": "Datos inválidos",
  "errors": {
    "new_password": ["La contraseña debe contener al menos un número"]
  }
}
```

## Auto-completado en Checkout

Cuando se crea una orden (POST /api/orders/create_order/), el sistema auto-completa automáticamente los datos de facturación con la información del perfil del usuario si no se proporcionan:

**Campos auto-completados:**
- `name`: Se usa `first_name + last_name` del User, o `username` si están vacíos
- `email`: Se usa el email del User
- `phone`: Se usa el teléfono del perfil si existe
- `address`: Se usa la dirección predeterminada del perfil si existe
- `city`: Se usa la ciudad del perfil si existe
- `country`: Se usa el país del perfil si existe (por defecto 'US')

**Ejemplo de request mínimo para create_order:**
```json
{
  "items": [
    {"producto_id": 1, "cantidad": 2}
  ]
}
```

El sistema completará automáticamente los `billing_details` con la información del perfil.

## Subir Foto de Perfil

Para subir una foto de perfil, usa multipart/form-data:

```bash
curl -X PUT http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Token <tu_token>" \
  -F "profile[photo]=@/ruta/a/tu/foto.jpg" \
  -F "first_name=Juan"
```

**Desde JavaScript (Frontend):**
```javascript
const formData = new FormData();
formData.append('profile[photo]', fileInput.files[0]);
formData.append('first_name', 'Juan');
formData.append('profile[phone]', '+1234567890');

fetch('http://localhost:8000/api/auth/profile/', {
  method: 'PUT',
  headers: {
    'Authorization': `Token ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## Panel de Administración

En el panel de administración de Django (`/admin`), ahora los perfiles de usuario aparecen integrados en la edición de usuarios mediante un inline.

**Para acceder:**
1. Ir a `/admin`
2. Navegar a Usuarios (Users)
3. Seleccionar un usuario
4. Verás una sección "Perfil" donde puedes editar todos los campos del perfil

## Management Commands

### create_user_profiles
Crea perfiles para usuarios existentes que no tienen uno.

```bash
python manage.py create_user_profiles
```

Este comando:
- Busca todos los usuarios en el sistema
- Crea un perfil para cada usuario que no tenga uno
- Muestra un resumen de los perfiles creados

**Salida esperada:**
```
Buscando usuarios sin perfil...
Total de usuarios en el sistema: 5
  - Perfil creado para: alumno
  - Perfil creado para: admin
==================================================
Perfiles creados exitosamente: 2
Usuarios que ya tenían perfil: 3
==================================================
```

## Archivos Modificados/Creados

### Creados:
- `authentication/models.py` - Modelo UserProfile
- `authentication/management/commands/create_user_profiles.py` - Command para crear perfiles
- `authentication/migrations/0001_initial.py` - Migración del modelo UserProfile

### Modificados:
- `authentication/serializers.py` - Agregados serializers: UserProfileSerializer, UserWithProfileSerializer, UpdateProfileSerializer, ChangePasswordSerializer
- `authentication/views.py` - Agregadas vistas: UpdateProfileView, ChangePasswordView; actualizada CurrentUserView
- `authentication/urls.py` - Agregados endpoints: profile/, change-password/
- `authentication/admin.py` - Integración del perfil en el admin de usuarios
- `orders/views.py` - Auto-completado de billing_details con datos del perfil

## Validaciones y Seguridad

### Validaciones de Perfil:
- Todos los campos son opcionales (blank=True)
- El campo `photo` usa ImageField (requiere Pillow instalado)
- El país por defecto es 'US'

### Validaciones de Cambio de Contraseña:
- Verifica que la contraseña actual sea correcta
- Nueva contraseña mínimo 8 caracteres
- Debe contener al menos una letra
- Debe contener al menos un número
- Las contraseñas nuevas deben coincidir

### Seguridad:
- Todos los endpoints de perfil requieren autenticación (IsAuthenticated)
- Al cambiar contraseña, se invalida el token anterior
- Los usuarios solo pueden ver/modificar su propio perfil
- Las contraseñas se almacenan hasheadas

## Ejemplos de Uso

### Frontend - Obtener perfil del usuario:
```javascript
const getUserProfile = async () => {
  const response = await fetch('http://localhost:8000/api/auth/user', {
    headers: {
      'Authorization': `Token ${localStorage.getItem('token')}`
    }
  });
  const data = await response.json();
  return data.data;
};
```

### Frontend - Actualizar perfil:
```javascript
const updateProfile = async (profileData) => {
  const response = await fetch('http://localhost:8000/api/auth/profile/', {
    method: 'PUT',
    headers: {
      'Authorization': `Token ${localStorage.getItem('token')}`,
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
    default_address: 'Calle 123'
  }
});
```

### Frontend - Cambiar contraseña:
```javascript
const changePassword = async (oldPassword, newPassword) => {
  const response = await fetch('http://localhost:8000/api/auth/change-password/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${localStorage.getItem('token')}`,
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

## Notas Importantes

1. **Pillow requerido:** Para usar el campo `photo`, asegúrate de tener Pillow instalado:
   ```bash
   pip install Pillow
   ```

2. **MEDIA_URL y MEDIA_ROOT:** Configura en `settings.py`:
   ```python
   MEDIA_URL = '/media/'
   MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
   ```

3. **URLs de medios en desarrollo:** Agrega en `urls.py` principal:
   ```python
   from django.conf import settings
   from django.conf.urls.static import static

   if settings.DEBUG:
       urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
   ```

4. **Perfiles existentes:** Ya se ejecutó el comando para crear perfiles de los 5 usuarios existentes en el sistema.

5. **Signals:** Los perfiles se crean automáticamente para nuevos usuarios mediante signals Django.

## Próximos Pasos (Opcionales)

- Implementar validación de formato de teléfono
- Agregar más campos al perfil según necesidades del negocio
- Implementar historial de direcciones de envío
- Agregar validación de edad mínima basada en birth_date
- Implementar compresión de imágenes para fotos de perfil
