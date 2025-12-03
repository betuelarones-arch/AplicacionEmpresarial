from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Inline para mostrar items de la orden en el admin."""

    model = OrderItem
    extra = 0
    readonly_fields = ['producto', 'cantidad', 'precio_unitario', 'subtotal']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Administración de órdenes en el panel de Django."""

    list_display = [
        'id',
        'user',
        'status',
        'total_amount',
        'billing_name',
        'billing_email',
        'created_at',
    ]
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = [
        'id',
        'user__username',
        'user__email',
        'billing_name',
        'billing_email',
        'stripe_payment_intent_id',
    ]
    readonly_fields = [
        'id',
        'user',
        'created_at',
        'updated_at',
        'total_amount',
        'stripe_payment_intent_id',
    ]
    fieldsets = [
        ('Información de la Orden', {
            'fields': ['id', 'user', 'status', 'total_amount', 'created_at', 'updated_at']
        }),
        ('Datos de Facturación', {
            'fields': [
                'billing_name',
                'billing_email',
                'billing_phone',
                'billing_address',
                'billing_city',
                'billing_country',
            ]
        }),
        ('Pago con Stripe', {
            'fields': ['stripe_payment_intent_id']
        }),
        ('Notas', {
            'fields': ['notes'],
            'classes': ['collapse']
        }),
    ]
    inlines = [OrderItemInline]

    def has_add_permission(self, request):
        """No permitir crear órdenes desde el admin."""
        return False


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Administración de items de órdenes en el panel de Django."""

    list_display = [
        'id',
        'order',
        'producto',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ]
    list_filter = ['order__status', 'order__created_at']
    search_fields = [
        'order__id',
        'producto__nombre',
        'order__user__username',
    ]
    readonly_fields = [
        'order',
        'producto',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ]

    def has_add_permission(self, request):
        """No permitir crear items desde el admin."""
        return False

    def has_delete_permission(self, request, obj=None):
        """No permitir eliminar items desde el admin."""
        return False
