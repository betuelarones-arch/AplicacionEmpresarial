from django.db import models

# Create your models here.
class Promocion(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    descuento = models.DecimalField(max_digits=5, decimal_places=2)  # porcentaje, ej. 20%
    activo = models.BooleanField(default=True)