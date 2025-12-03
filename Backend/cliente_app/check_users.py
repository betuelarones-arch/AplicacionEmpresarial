import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cliente_app.settings')
django.setup()

from django.contrib.auth.models import User

users = User.objects.all()
print(f'Total usuarios: {users.count()}')
print('\nUsuarios en la base de datos:')
for u in users:
    print(f'  - {u.username}: is_staff={u.is_staff}, email={u.email}')
