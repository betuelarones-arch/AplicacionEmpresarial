"""
Vistas para el sistema de autenticación de administradores.
Implementa endpoints para login, logout y obtención de usuario actual.
Utiliza Token Authentication de Django REST Framework.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

from .serializers import (
    LoginSerializer,
    UserSerializer,
    AuthResponseSerializer,
    RegisterSerializer,
    ClientUserSerializer,
    ClientLoginSerializer,
    ClientUserWithProfileSerializer,
    UserWithProfileSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer
)


class LoginView(APIView):
    """
    API endpoint para autenticar administradores.

    POST /api/auth/login
    Request body:
        {
            "username": "admin" o "email": "admin@example.com",
            "password": "password"
        }

    Response (200):
        {
            "success": true,
            "message": "Login exitoso",
            "data": {
                "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
                "user": {
                    "id": 1,
                    "username": "admin",
                    "email": "admin@example.com",
                    ...
                }
            }
        }
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        """
        Autentica al usuario y devuelve un token de autenticación.
        Solo permite login a usuarios staff/admin.
        """
        serializer = LoginSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            user = serializer.validated_data['user']

            # Obtener o crear token para el usuario
            token, created = Token.objects.get_or_create(user=user)

            # Serializar datos del usuario
            user_serializer = UserSerializer(user)

            # Preparar respuesta
            response_data = {
                'token': token.key,
                'user': user_serializer.data
            }

            return Response({
                'success': True,
                'message': 'Login exitoso',
                'data': response_data
            }, status=status.HTTP_200_OK)

        # Si hay errores de validación
        return Response({
            'success': False,
            'message': 'Error en las credenciales',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    API endpoint para cerrar sesión de administradores.
    Requiere autenticación.

    POST /api/auth/logout
    Headers:
        Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

    Response (200):
        {
            "success": true,
            "message": "Logout exitoso"
        }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Elimina el token del usuario para cerrar sesión.
        """
        try:
            # Obtener y eliminar el token del usuario
            request.user.auth_token.delete()

            return Response({
                'success': True,
                'message': 'Logout exitoso'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': 'Error al cerrar sesión',
                'errors': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(APIView):
    """
    API endpoint para obtener información del usuario autenticado con su perfil.
    Requiere autenticación.

    GET /api/auth/user
    Headers:
        Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

    Response (200):
        {
            "success": true,
            "data": {
                "id": 1,
                "username": "admin",
                "email": "admin@example.com",
                "first_name": "Admin",
                "last_name": "User",
                "is_staff": true,
                "is_superuser": true,
                "date_joined": "2025-11-29T10:00:00Z",
                "last_login": "2025-11-29T14:30:00Z",
                "profile": {
                    "phone": "+1234567890",
                    "default_address": "Calle 123",
                    "default_city": "Ciudad",
                    "default_country": "US",
                    "postal_code": "12345",
                    "photo": null,
                    "birth_date": null
                }
            }
        }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Devuelve la información del usuario actualmente autenticado con su perfil completo.
        """
        serializer = UserWithProfileSerializer(request.user)

        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """
    API endpoint para registrar nuevos usuarios clientes.
    Los usuarios registrados aquí son clientes regulares (NO administradores).

    POST /api/auth/register
    Request body:
        {
            "username": "juan",
            "email": "juan@ejemplo.com",
            "password": "Segura123",
            "password_confirm": "Segura123",
            "first_name": "Juan",  (opcional)
            "last_name": "Pérez"   (opcional)
        }

    Response (201):
        {
            "success": true,
            "message": "Usuario registrado exitosamente",
            "data": {
                "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
                "user": {
                    "id": 5,
                    "username": "juan",
                    "email": "juan@ejemplo.com",
                    "first_name": "Juan",
                    "last_name": "Pérez",
                    "is_staff": false
                }
            }
        }

    Response (400) - Errores de validación:
        {
            "success": false,
            "message": "Error en el registro",
            "errors": {
                "email": ["Este email ya está registrado"],
                "password_confirm": ["Las contraseñas no coinciden"]
            }
        }
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        """
        Registra un nuevo usuario cliente y devuelve un token de autenticación.
        El usuario creado es un cliente regular (is_staff=False).
        """
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            # Crear el usuario
            user = serializer.save()

            # Generar token de autenticación automáticamente
            token, created = Token.objects.get_or_create(user=user)

            # Serializar datos del usuario (versión cliente)
            user_serializer = ClientUserSerializer(user)

            # Preparar respuesta
            response_data = {
                'token': token.key,
                'user': user_serializer.data
            }

            return Response({
                'success': True,
                'message': 'Usuario registrado exitosamente',
                'data': response_data
            }, status=status.HTTP_201_CREATED)

        # Si hay errores de validación
        return Response({
            'success': False,
            'message': 'Error en el registro',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginClientView(APIView):
    """
    API endpoint para autenticar CLIENTES (usuarios NO administradores).

    POST /api/auth/client/login
    Request body:
        {
            "username": "juan" o "email": "juan@ejemplo.com",
            "password": "password"
        }

    Response (200):
        {
            "success": true,
            "message": "Login exitoso",
            "data": {
                "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
                "user": {
                    "id": 5,
                    "username": "juan",
                    "email": "juan@ejemplo.com",
                    "first_name": "Juan",
                    "last_name": "Pérez",
                    "date_joined": "2025-11-29T10:00:00Z",
                    "last_login": "2025-11-29T14:30:00Z",
                    "profile": {
                        "phone": "+1234567890",
                        "default_address": "Calle 123",
                        "default_city": "Ciudad",
                        "default_country": "US",
                        "postal_code": "12345",
                        "photo": null,
                        "birth_date": null
                    }
                }
            }
        }

    Response (400):
        {
            "success": false,
            "message": "Error en las credenciales",
            "errors": {...}
        }
    """
    permission_classes = [AllowAny]
    serializer_class = ClientLoginSerializer

    def post(self, request):
        """
        Autentica al usuario cliente y devuelve un token de autenticación con perfil.
        Solo permite login a usuarios NO staff (clientes regulares).
        """
        serializer = ClientLoginSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            user = serializer.validated_data['user']

            # Obtener o crear token para el usuario
            token, created = Token.objects.get_or_create(user=user)

            # Serializar datos del usuario cliente con perfil
            user_serializer = ClientUserWithProfileSerializer(user)

            # Preparar respuesta
            response_data = {
                'token': token.key,
                'user': user_serializer.data
            }

            return Response({
                'success': True,
                'message': 'Login exitoso',
                'data': response_data
            }, status=status.HTTP_200_OK)

        # Si hay errores de validación
        return Response({
            'success': False,
            'message': 'Error en las credenciales',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UpdateProfileView(APIView):
    """
    API endpoint para ver y actualizar el perfil completo del usuario.
    Requiere autenticación.

    GET /api/auth/profile/
    Headers:
        Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

    Response (200):
        {
            "success": true,
            "data": {
                "id": 1,
                "username": "juan",
                "email": "juan@ejemplo.com",
                "first_name": "Juan",
                "last_name": "Pérez",
                "profile": {
                    "phone": "+1234567890",
                    "default_address": "Calle 123",
                    "default_city": "Ciudad",
                    "default_country": "US",
                    "postal_code": "12345",
                    "photo": "/media/profiles/juan.jpg",
                    "birth_date": "1990-01-15"
                }
            }
        }

    PUT /api/auth/profile/
    Request body:
        {
            "first_name": "Juan Carlos",
            "email": "juancarlos@ejemplo.com",
            "profile": {
                "phone": "+9876543210",
                "default_address": "Nueva Calle 456",
                "default_city": "Nueva Ciudad",
                "postal_code": "54321"
            }
        }

    Response (200):
        {
            "success": true,
            "message": "Perfil actualizado exitosamente",
            "data": { ... }
        }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener perfil completo del usuario autenticado.
        """
        serializer = UserWithProfileSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request):
        """
        Actualizar perfil del usuario autenticado.
        """
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            # Retornar usuario actualizado con perfil
            user_serializer = UserWithProfileSerializer(request.user)
            return Response({
                'success': True,
                'message': 'Perfil actualizado exitosamente',
                'data': user_serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            'success': False,
            'message': 'Error al actualizar perfil',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    API endpoint para cambiar la contraseña del usuario.
    Requiere autenticación.

    POST /api/auth/change-password/
    Headers:
        Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b

    Request body:
        {
            "old_password": "Password123",
            "new_password": "NewPassword456",
            "new_password_confirm": "NewPassword456"
        }

    Response (200):
        {
            "success": true,
            "message": "Contraseña cambiada exitosamente",
            "data": {
                "token": "nuevo_token_generado_aqui"
            }
        }

    Response (400):
        {
            "success": false,
            "message": "La contraseña actual es incorrecta"
        }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Cambiar contraseña del usuario autenticado.
        Invalida el token actual y genera uno nuevo.
        """
        serializer = ChangePasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Datos inválidos',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar contraseña actual
        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response({
                'success': False,
                'message': 'La contraseña actual es incorrecta'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Cambiar contraseña
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        # Invalidar token actual y crear uno nuevo
        request.user.auth_token.delete()
        new_token = Token.objects.create(user=request.user)

        return Response({
            'success': True,
            'message': 'Contraseña cambiada exitosamente',
            'data': {
                'token': new_token.key
            }
        }, status=status.HTTP_200_OK)
