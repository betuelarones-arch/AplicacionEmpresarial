"""
Script para crear un usuario administrador de prueba.

Uso:
    python manage.py shell < authentication/create_admin.py

O ejecutar directamente las líneas en el shell de Django:
    python manage.py shell
"""

from django.contrib.auth.models import User

# Configuración del usuario admin
USERNAME = 'admin'
EMAIL = 'admin@pasteleria.com'
PASSWORD = 'admin123'
FIRST_NAME = 'Admin'
LAST_NAME = 'Pasteleria'

print("\n" + "="*60)
print("CREACIÓN DE USUARIO ADMINISTRADOR")
print("="*60 + "\n")

# Verificar si el usuario ya existe
if User.objects.filter(username=USERNAME).exists():
    print(f"⚠ El usuario '{USERNAME}' ya existe.")
    print("\nOpciones:")
    print("1. Eliminar usuario existente y crear uno nuevo")
    print("2. Actualizar contraseña del usuario existente")
    print("3. Salir sin hacer cambios")

    choice = input("\nSelecciona una opción (1/2/3): ")

    if choice == '1':
        User.objects.filter(username=USERNAME).delete()
        print(f"✓ Usuario '{USERNAME}' eliminado.")
    elif choice == '2':
        user = User.objects.get(username=USERNAME)
        user.set_password(PASSWORD)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"✓ Contraseña actualizada para '{USERNAME}'")
        print(f"✓ Permisos de staff/superuser actualizados")
        print("\nDatos del usuario:")
        print(f"  - Username: {user.username}")
        print(f"  - Email: {user.email}")
        print(f"  - Is Staff: {user.is_staff}")
        print(f"  - Is Superuser: {user.is_superuser}")
        exit(0)
    else:
        print("Saliendo sin hacer cambios.")
        exit(0)

# Crear nuevo usuario
try:
    user = User.objects.create_user(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
        first_name=FIRST_NAME,
        last_name=LAST_NAME
    )

    # Convertirlo en staff y superusuario
    user.is_staff = True
    user.is_superuser = True
    user.save()

    print("✓ Usuario administrador creado exitosamente!\n")
    print("Datos del usuario:")
    print(f"  - Username: {user.username}")
    print(f"  - Email: {user.email}")
    print(f"  - Password: {PASSWORD}")
    print(f"  - First Name: {user.first_name}")
    print(f"  - Last Name: {user.last_name}")
    print(f"  - Is Staff: {user.is_staff}")
    print(f"  - Is Superuser: {user.is_superuser}")
    print("\n" + "="*60)
    print("Puedes usar estas credenciales para:")
    print(f"  - Login API: POST /api/auth/login")
    print(f"  - Admin Django: http://localhost:8000/admin/")
    print("="*60 + "\n")

except Exception as e:
    print(f"✗ Error al crear usuario: {str(e)}")
