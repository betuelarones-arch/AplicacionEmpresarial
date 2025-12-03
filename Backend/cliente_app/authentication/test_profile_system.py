"""
Script de pruebas para el sistema de perfiles de usuario.
Ejecutar con: python manage.py shell < authentication/test_profile_system.py
"""

from django.contrib.auth.models import User
from authentication.models import UserProfile
from rest_framework.authtoken.models import Token

print("\n" + "=" * 60)
print("PRUEBAS DEL SISTEMA DE PERFILES DE USUARIO")
print("=" * 60 + "\n")

# 1. Verificar que todos los usuarios tienen perfil
print("1. Verificando que todos los usuarios tienen perfil...")
users = User.objects.all()
users_count = users.count()
profiles_count = UserProfile.objects.count()

print(f"   Total de usuarios: {users_count}")
print(f"   Total de perfiles: {profiles_count}")

if users_count == profiles_count:
    print("   ✓ Todos los usuarios tienen perfil")
else:
    print(f"   ✗ FALTA: {users_count - profiles_count} usuarios sin perfil")

# 2. Verificar creación automática de perfil
print("\n2. Verificando creación automática de perfil para nuevos usuarios...")
test_user, created = User.objects.get_or_create(
    username='test_profile_user',
    defaults={
        'email': 'test_profile@ejemplo.com',
        'first_name': 'Test',
        'last_name': 'Profile'
    }
)

if created:
    print("   Usuario de prueba creado")

has_profile = hasattr(test_user, 'profile')
if has_profile:
    print("   ✓ El perfil se creó automáticamente")
else:
    print("   ✗ ERROR: El perfil NO se creó automáticamente")

# 3. Verificar actualización de perfil
print("\n3. Probando actualización de perfil...")
if has_profile:
    test_user.profile.phone = '+1234567890'
    test_user.profile.default_address = 'Calle Test 123'
    test_user.profile.default_city = 'Ciudad Test'
    test_user.profile.default_country = 'MX'
    test_user.profile.postal_code = '12345'
    test_user.profile.save()

    # Refrescar desde la BD
    test_user.refresh_from_db()

    if test_user.profile.phone == '+1234567890':
        print("   ✓ Perfil actualizado correctamente")
    else:
        print("   ✗ ERROR: El perfil NO se actualizó")

# 4. Verificar relación OneToOne
print("\n4. Verificando relación OneToOne entre User y Profile...")
try:
    profile = test_user.profile
    user_from_profile = profile.user
    if user_from_profile.id == test_user.id:
        print("   ✓ Relación OneToOne funciona correctamente")
    else:
        print("   ✗ ERROR: La relación OneToOne no funciona")
except Exception as e:
    print(f"   ✗ ERROR: {str(e)}")

# 5. Verificar campos del perfil
print("\n5. Verificando campos del perfil...")
expected_fields = [
    'phone', 'default_address', 'default_city',
    'default_country', 'postal_code', 'photo', 'birth_date'
]
profile_fields = [f.name for f in UserProfile._meta.get_fields()
                  if not f.name.startswith('_') and f.name not in ['id', 'user', 'created_at', 'updated_at']]

all_fields_present = all(field in profile_fields for field in expected_fields)
if all_fields_present:
    print(f"   ✓ Todos los campos esperados están presentes: {', '.join(expected_fields)}")
else:
    print(f"   ✗ ERROR: Faltan campos en el modelo")

# 6. Verificar que el token existe para usuarios registrados
print("\n6. Verificando tokens de autenticación...")
users_with_tokens = User.objects.filter(auth_token__isnull=False).count()
print(f"   Usuarios con token: {users_with_tokens}/{users_count}")

# 7. Mostrar ejemplo de perfil completo
print("\n7. Ejemplo de perfil completo:")
print("   " + "-" * 56)
example_user = User.objects.first()
if example_user and hasattr(example_user, 'profile'):
    print(f"   Username: {example_user.username}")
    print(f"   Email: {example_user.email}")
    print(f"   Nombre: {example_user.first_name} {example_user.last_name}")
    print(f"   Teléfono: {example_user.profile.phone or '(no configurado)'}")
    print(f"   Dirección: {example_user.profile.default_address or '(no configurado)'}")
    print(f"   Ciudad: {example_user.profile.default_city or '(no configurado)'}")
    print(f"   País: {example_user.profile.default_country}")
    print(f"   Código Postal: {example_user.profile.postal_code or '(no configurado)'}")
    print("   " + "-" * 56)

# 8. Limpiar usuario de prueba
print("\n8. Limpiando usuario de prueba...")
if created:
    test_user.delete()
    print("   ✓ Usuario de prueba eliminado")

print("\n" + "=" * 60)
print("PRUEBAS COMPLETADAS")
print("=" * 60 + "\n")
