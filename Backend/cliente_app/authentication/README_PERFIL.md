# Sistema de Perfil de Usuario - Guía Rápida

## Inicio Rápido

### 1. Verificar que el sistema esté funcionando
```bash
cd Backend/cliente_app
python manage.py check
```

### 2. Crear perfiles para usuarios existentes (si es necesario)
```bash
python manage.py create_user_profiles
```

### 3. Probar los endpoints

#### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "password": "Password123"}'
```

#### Obtener perfil:
```bash
curl -X GET http://localhost:8000/api/auth/user \
  -H "Authorization: Token TU_TOKEN_AQUI"
```

#### Actualizar perfil:
```bash
curl -X PUT http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Token TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "profile": {
      "phone": "+1234567890",
      "default_address": "Calle 123",
      "default_city": "Ciudad"
    }
  }'
```

#### Cambiar contraseña:
```bash
curl -X POST http://localhost:8000/api/auth/change-password/ \
  -H "Authorization: Token TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "Password123",
    "new_password": "NewPassword456",
    "new_password_confirm": "NewPassword456"
  }'
```

## Endpoints Disponibles

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Sí | Logout |
| POST | `/api/auth/register` | No | Registro |
| GET | `/api/auth/user` | Sí | Usuario con perfil |
| GET | `/api/auth/profile/` | Sí | Ver perfil |
| PUT | `/api/auth/profile/` | Sí | Actualizar perfil |
| POST | `/api/auth/change-password/` | Sí | Cambiar contraseña |

## Estructura del Perfil

```json
{
  "id": 1,
  "username": "juan",
  "email": "juan@ejemplo.com",
  "first_name": "Juan",
  "last_name": "Pérez",
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
```

## Documentación Completa

- **Sistema completo:** `SISTEMA_PERFIL.md`
- **API Reference:** `API_ENDPOINTS_RESUMEN.md`
- **Implementación:** `../../../IMPLEMENTACION_PERFIL_USUARIO.md`

## Comandos Útiles

### Crear superusuario:
```bash
python manage.py createsuperuser
```

### Acceder al shell de Django:
```bash
python manage.py shell
```

### Ver todos los usuarios y perfiles:
```python
from django.contrib.auth.models import User
from authentication.models import UserProfile

for user in User.objects.all():
    print(f"{user.username}: {user.profile.phone or '(sin teléfono)'}")
```

### Actualizar perfil desde el shell:
```python
user = User.objects.get(username='juan')
user.profile.phone = '+1234567890'
user.profile.default_address = 'Calle 123'
user.profile.save()
```

## Panel de Administración

Accede a `/admin` para gestionar usuarios y perfiles visualmente.

Los perfiles aparecen integrados en la edición de usuarios.

## Soporte

Para más información, consulta la documentación completa en los archivos mencionados arriba.
