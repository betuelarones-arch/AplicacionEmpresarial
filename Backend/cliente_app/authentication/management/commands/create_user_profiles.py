"""
Management command para crear perfiles para usuarios existentes.
Este comando se ejecuta una sola vez para crear perfiles para usuarios
que fueron creados antes de implementar el sistema de perfiles.

Uso:
    python manage.py create_user_profiles
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from authentication.models import UserProfile


class Command(BaseCommand):
    help = 'Crea perfiles para todos los usuarios que no tienen uno'

    def handle(self, *args, **options):
        """
        Itera sobre todos los usuarios y crea un perfil si no existe.
        """
        users_without_profile = []
        profiles_created = 0

        self.stdout.write('Buscando usuarios sin perfil...')

        # Obtener todos los usuarios
        all_users = User.objects.all()
        total_users = all_users.count()

        self.stdout.write(f'Total de usuarios en el sistema: {total_users}')

        # Revisar cada usuario
        for user in all_users:
            # Intentar obtener o crear el perfil
            profile, created = UserProfile.objects.get_or_create(user=user)

            if created:
                profiles_created += 1
                users_without_profile.append(user.username)
                self.stdout.write(
                    self.style.SUCCESS(f'  - Perfil creado para: {user.username}')
                )

        # Resumen final
        self.stdout.write('')
        self.stdout.write('=' * 50)
        self.stdout.write(
            self.style.SUCCESS(f'Perfiles creados exitosamente: {profiles_created}')
        )
        self.stdout.write(
            f'Usuarios que ya tenían perfil: {total_users - profiles_created}'
        )
        self.stdout.write('=' * 50)

        if profiles_created == 0:
            self.stdout.write(
                self.style.WARNING('No se encontraron usuarios sin perfil.')
            )
        else:
            self.stdout.write('')
            self.stdout.write('Usuarios a los que se les creó perfil:')
            for username in users_without_profile:
                self.stdout.write(f'  - {username}')
