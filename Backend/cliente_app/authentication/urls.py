"""
URLs para el sistema de autenticación de administradores.
Define los endpoints de login, logout y obtención de usuario actual.
"""

from django.urls import path
from .views import LoginView, LogoutView, CurrentUserView, RegisterView

app_name = 'authentication'

urlpatterns = [
    # POST /api/auth/login - Autenticar administrador
    path('login', LoginView.as_view(), name='login'),

    # POST /api/auth/logout - Cerrar sesión
    path('logout', LogoutView.as_view(), name='logout'),

    # GET /api/auth/user - Obtener usuario actual
    path('user', CurrentUserView.as_view(), name='current-user'),

    # POST /api/auth/register - Registrar nuevo usuario cliente
    path('register', RegisterView.as_view(), name='register'),
]
