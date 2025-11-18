from django.db import models

# Create your models here.
class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey('categorias.Categoria', on_delete=models.CASCADE, related_name='productos')
    
    def __str__(self):
        return self.nombre