"""
Configuración de la aplicación de autenticación.
"""

from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    """
    Configuración de la app authentication para el sistema de
    autenticación de administradores mediante tokens.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
    verbose_name = 'Autenticación de Administradores'
