from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Modelo extendido para almacenar información adicional del usuario.
    Se crea automáticamente cuando se registra un nuevo usuario.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='Usuario'
    )

    # Información de contacto
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Teléfono'
    )

    # Dirección predeterminada
    default_address = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Dirección'
    )
    default_city = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Ciudad'
    )
    default_country = models.CharField(
        max_length=2,
        default='US',
        verbose_name='País'
    )
    postal_code = models.CharField(
        max_length=10,
        blank=True,
        verbose_name='Código Postal'
    )

    # Información adicional
    photo = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True,
        verbose_name='Foto de Perfil'
    )
    birth_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Fecha de Nacimiento'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'

    def __str__(self):
        return f'Perfil de {self.user.username}'


# Signals para crear y guardar el perfil automáticamente
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Crea automáticamente un perfil cuando se crea un nuevo usuario.
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Guarda el perfil cuando se guarda el usuario.
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
