from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    """
    Inline admin para mostrar y editar el perfil del usuario
    directamente desde el panel de administración de usuarios.
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Perfil'
    fields = (
        'phone',
        'default_address',
        'default_city',
        'default_country',
        'postal_code',
        'photo',
        'birth_date'
    )


class UserAdmin(BaseUserAdmin):
    """
    Admin personalizado para User que incluye el perfil inline.
    """
    inlines = (UserProfileInline,)


# Re-registrar UserAdmin con el inline de perfil
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
