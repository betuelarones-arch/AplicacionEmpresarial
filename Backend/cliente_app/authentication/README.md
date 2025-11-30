# Sistema de Autenticación para Administradores

Sistema de autenticación basado en tokens para la API REST de la pastelería.
Permite que solo usuarios administradores (staff) puedan autenticarse y acceder a funcionalidades protegidas.

---

## Características

- Autenticación mediante Token (Django REST Framework)
- Solo permite login a usuarios staff/admin
- Endpoints RESTful para login, logout y obtención de usuario actual
- Respuestas JSON consistentes con el resto de la API
- Validación por username o email
- Integración lista para consumir desde React/JavaScript
- CORS configurado para desarrollo frontend

---

## Estructura de la App

```
authentication/
├── __init__.py
├── apps.py              # Configuración de la app
├── serializers.py       # LoginSerializer, UserSerializer, AuthResponseSerializer
├── views.py            # LoginView, LogoutView, CurrentUserView
├── urls.py             # Rutas de autenticación
├── API_AUTHENTICATION.md  # Documentación completa de la API
└── README.md           # Este archivo
```

---

## Endpoints

| Método | Endpoint | Descripción | Auth requerida |
|--------|----------|-------------|----------------|
| POST | `/api/auth/login` | Autenticar admin | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/user` | Obtener usuario actual | Sí |

---

## Instalación y Configuración

### 1. Archivos Modificados

- `C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app\cliente_app\settings.py`
  - Agregado `rest_framework.authtoken` y `authentication` a `INSTALLED_APPS`
  - Configurado `REST_FRAMEWORK` con `TokenAuthentication`

- `C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app\cliente_app\urls.py`
  - Agregada ruta `path('api/auth/', include('authentication.urls'))`

### 2. Ejecutar Migraciones

Las migraciones ya fueron ejecutadas durante la instalación:
```bash
python manage.py migrate
```

### 3. Crear Usuario Administrador

#### Opción A: Comando interactivo
```bash
cd C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app
python manage.py createsuperuser
```

Seguir las instrucciones para ingresar:
- Username
- Email
- Password

#### Opción B: Programáticamente
```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User

user = User.objects.create_user(
    username='admin',
    email='admin@pasteleria.com',
    password='admin123',  # Cambiar en producción
    first_name='Admin',
    last_name='Pasteleria'
)
user.is_staff = True
user.is_superuser = True
user.save()

print(f"Usuario creado: {user.username}")
exit()
```

---

## Uso desde React/JavaScript

### Ejemplo básico

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Guardar token
localStorage.setItem('authToken', token);

// Usar token en peticiones protegidas
const userResponse = await fetch('http://localhost:8000/api/auth/user', {
  headers: { 'Authorization': `Token ${token}` }
});

const userData = await userResponse.json();
console.log(userData.data);

// Logout
await fetch('http://localhost:8000/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Token ${token}` }
});

localStorage.removeItem('authToken');
```

Ver `API_AUTHENTICATION.md` para ejemplos más completos.

---

## Seguridad

### Validaciones Implementadas

1. Solo usuarios con `is_staff=True` o `is_superuser=True` pueden autenticarse
2. Verificación de cuenta activa (`is_active=True`)
3. Contraseñas hasheadas con validadores de Django
4. Tokens únicos por usuario
5. CORS configurado para orígenes permitidos

### Recomendaciones para Producción

1. Cambiar `SECRET_KEY` en settings.py
2. Configurar `DEBUG = False`
3. Usar HTTPS en producción
4. Configurar `ALLOWED_HOSTS` correctamente
5. Usar contraseñas fuertes para usuarios admin
6. Implementar rate limiting para endpoints de login
7. Considerar expiración de tokens (usar `django-rest-framework-simplejwt` para JWT)

---

## Testing

### Probar con curl

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"admin\", \"password\": \"admin123\"}"

# Guardar el token de la respuesta y usarlo:
TOKEN="<tu_token_aqui>"

# Obtener usuario
curl -X GET http://localhost:8000/api/auth/user \
  -H "Authorization: Token $TOKEN"

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Token $TOKEN"
```

### Probar con Browsable API de DRF

1. Abrir navegador en `http://localhost:8000/api/auth/login`
2. Usar la interfaz HTML de DRF para hacer POST
3. Copiar el token de la respuesta
4. Navegar a otros endpoints y agregar header manualmente

---

## Proteger Otros Endpoints

Para proteger endpoints existentes (productos, categorías, etc.):

```python
# En views.py de la app correspondiente
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class ProductoViewSet(viewsets.ModelViewSet):
    # Solo usuarios autenticados
    permission_classes = [IsAuthenticated]

    # O solo administradores
    # permission_classes = [IsAdminUser]
```

---

## Próximos Pasos (Opcional)

1. Implementar refresh tokens con JWT
2. Agregar endpoint de cambio de contraseña
3. Implementar recuperación de contraseña por email
4. Agregar sistema de permisos granular
5. Logging de intentos de login
6. Rate limiting para prevenir brute force

---

## Soporte

Para más información, consultar:
- `API_AUTHENTICATION.md` - Documentación completa de endpoints
- [Django REST Framework - Authentication](https://www.django-rest-framework.org/api-guide/authentication/)
- [Django Authentication](https://docs.djangoproject.com/en/5.1/topics/auth/)
