"""
URLs para el sistema de autenticación de administradores.
Define los endpoints de login, logout, obtención de usuario actual,
gestión de perfil y cambio de contraseña.
"""

from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    RegisterView,
    LoginClientView,
    UpdateProfileView,
    ChangePasswordView
)

app_name = 'authentication'

urlpatterns = [
    # POST /api/auth/login - Autenticar administrador
    path('login', LoginView.as_view(), name='login'),

    # POST /api/auth/client/login - Autenticar cliente
    path('client/login', LoginClientView.as_view(), name='client-login'),

    # POST /api/auth/logout - Cerrar sesión
    path('logout', LogoutView.as_view(), name='logout'),

    # GET /api/auth/user - Obtener usuario actual
    path('user', CurrentUserView.as_view(), name='current-user'),

    # POST /api/auth/register - Registrar nuevo usuario cliente
    path('register', RegisterView.as_view(), name='register'),

    # GET /api/auth/profile/ - Ver perfil completo
    # PUT /api/auth/profile/ - Actualizar perfil
    path('profile/', UpdateProfileView.as_view(), name='profile'),

    # POST /api/auth/change-password/ - Cambiar contraseña
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
