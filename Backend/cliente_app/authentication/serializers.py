"""
Serializers para el sistema de autenticación de administradores y clientes.
Maneja la validación y serialización de datos de usuario y credenciales.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile


class LoginSerializer(serializers.Serializer):
    """
    Serializer para validar credenciales de login de ADMIN.
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
    Serializer para mostrar información del usuario autenticado (admin).
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
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_staff=False,       # NO es administrador
            is_superuser=False,   # NO es superusuario
            is_active=True        # Activo por defecto
        )
        return user


class ClientLoginSerializer(serializers.Serializer):
    """
    Serializer para validar credenciales de login de CLIENTES.
    Acepta username o email junto con password.
    Solo permite autenticación de usuarios NO staff (clientes regulares).
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
        Valida las credenciales y verifica que sea un usuario cliente (NO admin).
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

        # Verificar que NO sea staff (esto es para clientes)
        if user.is_staff or user.is_superuser:
            raise serializers.ValidationError(
                'Esta cuenta es administrativa. Use el endpoint de admin.',
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


# 👇 LO IMPORTANTE: definir UserProfileSerializer ANTES de usarlo

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil de usuario.
    Maneja todos los campos adicionales del usuario.
    """
    class Meta:
        model = UserProfile
        fields = [
            'phone',
            'default_address',
            'default_city',
            'default_country',
            'postal_code',
            'photo',
            'birth_date'
        ]


class ClientUserWithProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar usuario cliente con su perfil completo.
    Combina datos del modelo User con UserProfile para clientes.
    """
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'date_joined',
            'last_login',
            'profile'
        ]
        read_only_fields = [
            'id',
            'username',
            'date_joined',
            'last_login'
        ]


class UserWithProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar usuario con su perfil completo (admin o cliente).
    Combina datos del modelo User con UserProfile.
    """
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'date_joined',
            'last_login',
            'profile'
        ]
        read_only_fields = [
            'id',
            'username',
            'is_staff',
            'is_superuser',
            'date_joined',
            'last_login'
        ]


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar el perfil del usuario.
    Permite actualizar tanto datos del User como del UserProfile.
    """
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'profile']

    def update(self, instance, validated_data):
        """
        Actualiza tanto el modelo User como el UserProfile.
        """
        profile_data = validated_data.pop('profile', None)

        # Actualizar campos del User
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # Actualizar campos del Profile
        if profile_data:
            # asume OneToOneField UserProfile con related_name='profile'
            profile = instance.profile
            for key, value in profile_data.items():
                setattr(profile, key, value)
            profile.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambiar la contraseña del usuario.
    Valida la contraseña actual y la nueva contraseña.
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, data):
        """
        Valida que las contraseñas coincidan y cumplan requisitos de seguridad.
        """
        # Verificar que las contraseñas nuevas coincidan
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Las contraseñas no coinciden'
            })

        # Validar que tenga al menos un número
        if not any(char.isdigit() for char in data['new_password']):
            raise serializers.ValidationError({
                'new_password': 'La contraseña debe contener al menos un número'
            })

        # Validar que tenga al menos una letra
        if not any(char.isalpha() for char in data['new_password']):
            raise serializers.ValidationError({
                'new_password': 'La contraseña debe contener al menos una letra'
            })

        return data
