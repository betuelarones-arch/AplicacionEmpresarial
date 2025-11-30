# Sistema de Autenticación - Instalación Completa

Este documento resume la implementación del sistema de autenticación para administradores en tu API de pastelería.

---

## RESUMEN DE IMPLEMENTACIÓN

Sistema de autenticación basado en **Token Authentication** de Django REST Framework que permite:
- Login de administradores (solo usuarios staff)
- Logout invalidando token
- Obtención de datos del usuario autenticado
- Integración lista para consumir desde React

---

## ARCHIVOS CREADOS

### 1. Nueva App: `authentication/`

```
authentication/
├── __init__.py
├── apps.py                      # Configuración de la app
├── views.py                     # LoginView, LogoutView, CurrentUserView
├── serializers.py               # LoginSerializer, UserSerializer
├── urls.py                      # Rutas de autenticación
├── models.py                    # (vacío, usa User de Django)
├── admin.py                     # (vacío)
├── tests.py                     # (vacío)
├── README.md                    # Documentación de la app
├── API_AUTHENTICATION.md        # Documentación completa de endpoints
├── auth_service.js              # Servicio JavaScript reutilizable
├── LoginExample.jsx             # Componente React de ejemplo
├── test_auth.py                 # Script de pruebas
└── create_admin.py              # Script para crear admin
```

### 2. Archivos Modificados

**C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app\cliente_app\settings.py**
- Agregado `rest_framework.authtoken` a INSTALLED_APPS
- Agregado `authentication` a INSTALLED_APPS
- Configurado REST_FRAMEWORK con TokenAuthentication

**C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app\cliente_app\urls.py**
- Agregada ruta: `path('api/auth/', include('authentication.urls'))`

---

## ENDPOINTS DISPONIBLES

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Autenticar administrador | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/user` | Obtener usuario actual | Sí |

---

## CONFIGURACIÓN APLICADA

### settings.py

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework.authtoken',  # ← AGREGADO
    'corsheaders',
    'django_filters',
    'productos',
    'categorias',
    'promocion',
    'authentication',  # ← AGREGADO
]

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_AUTHENTICATION_CLASSES': [  # ← AGREGADO
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [  # ← AGREGADO
        'rest_framework.permissions.AllowAny',
    ],
}
```

### urls.py

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),  # ← AGREGADO
    path('api/', include('categorias.urls')),
    path('api/', include('productos.urls')),
]
```

---

## MIGRACIONES EJECUTADAS

```bash
python manage.py migrate
```

Migraciones aplicadas:
- authtoken.0001_initial
- authtoken.0002_auto_20160226_1747
- authtoken.0003_tokenproxy
- authtoken.0004_alter_tokenproxy_options

---

## USUARIO ADMINISTRADOR CREADO

Ya se creó un usuario administrador de prueba con las siguientes credenciales:

```
Username: admin
Email: admin@pasteleria.com
Password: admin123
Is Staff: True
Is Superuser: True
```

---

## CÓMO PROBAR LA API

### 1. Iniciar el servidor

```bash
cd C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app
python manage.py runserver
```

### 2. Probar con curl

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"admin\", \"password\": \"admin123\"}"

# Obtendrás una respuesta con el token:
# {"success": true, "message": "Login exitoso", "data": {"token": "...", "user": {...}}}

# Guardar el token y usarlo:
set TOKEN=<tu_token_aqui>

# Obtener usuario
curl -X GET http://localhost:8000/api/auth/user ^
  -H "Authorization: Token %TOKEN%"

# Logout
curl -X POST http://localhost:8000/api/auth/logout ^
  -H "Authorization: Token %TOKEN%"
```

### 3. Probar con el script Python

```bash
# Instalar requests si no está instalado
pip install requests

# Ejecutar pruebas
cd C:\Users\DAVID\Desktop\Pasteleria\AplicacionEmpresarial\Backend\cliente_app
python authentication/test_auth.py
```

### 4. Probar en navegador

Abrir: http://localhost:8000/api/auth/login

Django REST Framework mostrará la interfaz browsable donde puedes hacer POST con:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## CÓMO CONSUMIR DESDE REACT

### Opción 1: Copiar el servicio JavaScript

Copiar el archivo `authentication/auth_service.js` a tu proyecto React:

```javascript
import AuthService from './auth_service';

// Login
const data = await AuthService.login('admin', 'admin123');
console.log('Token:', data.token);
console.log('User:', data.user);

// Obtener usuario actual
const user = await AuthService.getCurrentUser();
console.log('Usuario:', user);

// Logout
await AuthService.logout();
```

### Opción 2: Usar fetch directamente

```javascript
// Login
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});

const data = await response.json();
const token = data.data.token;

// Guardar token
localStorage.setItem('authToken', token);

// Usar en peticiones autenticadas
const userResponse = await fetch('http://localhost:8000/api/auth/user', {
  headers: { 'Authorization': `Token ${token}` }
});

const userData = await userResponse.json();
```

### Opción 3: Componente React completo

Ver archivo `authentication/LoginExample.jsx` para un componente completo con:
- Formulario de login
- Manejo de errores
- Estado de carga
- Estilos incluidos
- Hook personalizado `useAuth()`

---

## CREAR MÁS USUARIOS ADMINISTRADORES

### Método 1: Admin de Django

1. Ir a: http://localhost:8000/admin/
2. Login con: admin / admin123
3. Ir a "Users" > "Add user"
4. Crear usuario y marcarlo como "Staff status"

### Método 2: Shell de Django

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User

user = User.objects.create_user(
    username='usuario',
    email='usuario@ejemplo.com',
    password='password123',
    first_name='Nombre',
    last_name='Apellido'
)
user.is_staff = True  # Necesario para autenticarse
user.save()
```

### Método 3: Script incluido

```bash
python manage.py shell < authentication/create_admin.py
```

---

## PROTEGER OTROS ENDPOINTS

Para proteger endpoints existentes (productos, categorías, etc.):

```python
# En views.py de la app correspondiente
from rest_framework.permissions import IsAuthenticated

class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # ← Agregar esto
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
```

Ahora ese endpoint requerirá el header:
```
Authorization: Token <token>
```

---

## SEGURIDAD

### Implementado
- Solo usuarios staff/admin pueden autenticarse
- Contraseñas hasheadas con PBKDF2
- Verificación de cuenta activa
- CORS configurado para orígenes específicos
- Tokens únicos por usuario

### Recomendaciones para Producción
- [ ] Cambiar SECRET_KEY en settings.py
- [ ] Configurar DEBUG = False
- [ ] Usar HTTPS en producción
- [ ] Configurar ALLOWED_HOSTS correctamente
- [ ] Implementar rate limiting para login
- [ ] Considerar JWT en lugar de tokens simples
- [ ] Implementar expiración de tokens
- [ ] Agregar logging de intentos de login

---

## ESTRUCTURA DE RESPUESTAS

Todas las respuestas siguen el formato:

### Éxito
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": { ... }
}
```

---

## ARCHIVOS DE REFERENCIA

1. **authentication/README.md** - Documentación general de la app
2. **authentication/API_AUTHENTICATION.md** - Documentación completa de endpoints
3. **authentication/auth_service.js** - Servicio JavaScript reutilizable
4. **authentication/LoginExample.jsx** - Componente React de ejemplo
5. **authentication/test_auth.py** - Script de pruebas
6. **authentication/create_admin.py** - Script para crear admins

---

## PRÓXIMOS PASOS (OPCIONAL)

1. Implementar refresh tokens con JWT
2. Agregar endpoint de cambio de contraseña
3. Implementar recuperación de contraseña por email
4. Agregar sistema de permisos granular
5. Implementar logging de actividad
6. Rate limiting para prevenir brute force
7. Tests unitarios con Django TestCase

---

## SOPORTE

Si tienes problemas:

1. Verificar que el servidor esté ejecutándose
2. Verificar que exista un usuario staff/admin
3. Verificar la consola del navegador para errores CORS
4. Verificar que el token se esté enviando correctamente en headers
5. Consultar los archivos de documentación incluidos

---

## RESUMEN DE COMANDOS ÚTILES

```bash
# Iniciar servidor
python manage.py runserver

# Crear superusuario
python manage.py createsuperuser

# Abrir shell de Django
python manage.py shell

# Ejecutar pruebas
python authentication/test_auth.py

# Ver todas las URLs
python manage.py show_urls  # (requiere django-extensions)

# Verificar configuración
python manage.py check
```

---

Implementado el: 2025-11-29
Django Version: 5.1.3
DRF Version: 3.15.2
