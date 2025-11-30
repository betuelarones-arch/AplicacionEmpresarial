"""
Serializers para el sistema de autenticación de administradores.
Maneja la validación y serialización de datos de usuario y credenciales.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User


class LoginSerializer(serializers.Serializer):
    """
    Serializer para validar credenciales de login.
    Acepta username o email junto con password.
    Solo permite autenticación de usuarios staff/admin.
    """
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        """
        Valida las credenciales y verifica que sea usuario staff/admin.
        """
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')

        # Validar que se proporcione username o email
        if not username and not email:
            raise serializers.ValidationError(
                'Debe proporcionar username o email',
                code='authorization'
            )

        # Si se proporciona email, buscar el username correspondiente
        if email and not username:
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    'Credenciales inválidas',
                    code='authorization'
                )

        # Autenticar usuario
        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                'Credenciales inválidas',
                code='authorization'
            )

        # Verificar que sea staff o superusuario
        if not user.is_staff and not user.is_superuser:
            raise serializers.ValidationError(
                'No tiene permisos de administrador',
                code='authorization'
            )

        # Verificar que la cuenta esté activa
        if not user.is_active:
            raise serializers.ValidationError(
                'La cuenta está desactivada',
                code='authorization'
            )

        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información del usuario autenticado.
    Incluye datos básicos y permisos.
    """
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'date_joined',
            'last_login'
        )
        read_only_fields = fields


class AuthResponseSerializer(serializers.Serializer):
    """
    Serializer para la respuesta de autenticación exitosa.
    Incluye el token y los datos del usuario.
    """
    token = serializers.CharField()
    user = UserSerializer()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de nuevos usuarios clientes (no administradores).
    Valida los datos de registro y crea usuarios regulares con is_staff=False.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={'input_type': 'password'},
        trim_whitespace=False,
        error_messages={
            'required': 'La contraseña es obligatoria',
            'min_length': 'La contraseña debe tener al menos 8 caracteres',
            'blank': 'La contraseña no puede estar vacía'
        }
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False,
        error_messages={
            'required': 'Debe confirmar la contraseña',
            'blank': 'La confirmación de contraseña no puede estar vacía'
        }
    )
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'El email es obligatorio',
            'invalid': 'Ingrese un email válido',
            'blank': 'El email no puede estar vacío'
        }
    )

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name'
        )
        extra_kwargs = {
            'username': {
                'required': True,
                'error_messages': {
                    'required': 'El nombre de usuario es obligatorio',
                    'blank': 'El nombre de usuario no puede estar vacío'
                }
            },
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True}
        }

    def validate_email(self, value):
        """
        Valida que el email no esté ya registrado en el sistema.
        """
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError(
                'Este email ya está registrado',
                code='unique'
            )
        return value.lower()

    def validate_username(self, value):
        """
        Valida que el username no esté ya registrado en el sistema.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'Este nombre de usuario ya está en uso',
                code='unique'
            )
        return value

    def validate_password(self, value):
        """
        Valida que la contraseña cumpla con requisitos mínimos de seguridad.
        """
        if len(value) < 8:
            raise serializers.ValidationError(
                'La contraseña debe tener al menos 8 caracteres'
            )

        # Verificar que contenga al menos una letra y un número
        tiene_letra = any(c.isalpha() for c in value)
        tiene_numero = any(c.isdigit() for c in value)

        if not tiene_letra or not tiene_numero:
            raise serializers.ValidationError(
                'La contraseña debe contener al menos una letra y un número'
            )

        return value

    def validate(self, attrs):
        """
        Valida que las contraseñas coincidan.
        """
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')

        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden'
            })

        # Eliminar password_confirm ya que no es un campo del modelo
        attrs.pop('password_confirm')

        return attrs

    def create(self, validated_data):
        """
        Crea un nuevo usuario cliente con la contraseña hasheada.
        Los usuarios creados aquí son regulares (is_staff=False, is_superuser=False).
        """
        # Crear usuario con contraseña hasheada
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_staff=False,  # NO es administrador
            is_superuser=False,  # NO es superusuario
            is_active=True  # Activo por defecto
        )

        return user


class ClientUserSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información de usuarios clientes.
    Excluye campos administrativos como is_superuser.
    """
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff'
        )
        read_only_fields = fields
