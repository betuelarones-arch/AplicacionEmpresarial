from django.db import models
from django.contrib.auth.models import User
from productos.models import Producto


class Order(models.Model):
    """
    Modelo que representa una orden de compra.

    Almacena información de la orden, datos de facturación,
    estado del pago y referencia a Stripe.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        help_text='Usuario que realizó la orden'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Información de pago
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Monto total de la orden'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Estado actual de la orden'
    )
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='ID del PaymentIntent de Stripe'
    )

    # Datos de facturación
    billing_name = models.CharField(max_length=255)
    billing_email = models.EmailField()
    billing_phone = models.CharField(max_length=20)
    billing_address = models.CharField(max_length=255)
    billing_city = models.CharField(max_length=100)
    billing_country = models.CharField(max_length=2, default='US')

    # Notas opcionales
    notes = models.TextField(blank=True, help_text='Notas adicionales del cliente')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"

    def calculate_total(self):
        """Calcula el total de la orden basado en los items."""
        return sum(item.subtotal for item in self.items.all())


class OrderItem(models.Model):
    """
    Modelo que representa un item dentro de una orden.

    Almacena el producto, cantidad y precio al momento de la compra
    para mantener un historial preciso incluso si los precios cambian.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        help_text='Orden a la que pertenece este item'
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name='order_items',
        help_text='Producto ordenado'
    )
    cantidad = models.PositiveIntegerField(
        help_text='Cantidad de productos ordenados'
    )
    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Precio del producto al momento de la compra'
    )
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Subtotal del item (precio_unitario * cantidad)'
    )

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} - Order #{self.order.id}"

    def save(self, *args, **kwargs):
        """
        Calcula automáticamente el subtotal antes de guardar.
        Si no se proporciona precio_unitario, usa el precio actual del producto.
        """
        if not self.precio_unitario:
            self.precio_unitario = self.producto.precio
        self.subtotal = self.precio_unitario * self.cantidad
        super().save(*args, **kwargs)
