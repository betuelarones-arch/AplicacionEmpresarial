from django.db import models
from categorias.models import Categoria

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)  
    stock = models.PositiveIntegerField(default=0)
    embedding = models.JSONField(null=True, blank=True)

    
    def __str__(self):
        return self.nombre
    

    def generar_embedding(self):
        """Genera y guarda el embedding usando OpenAI"""
        texto = f"{self.nombre} {self.descripcion}"
        response = openai.Embedding.create(
            input=texto,
            model="text-embedding-3-small"
        )
        self.embedding = response['data'][0]['embedding']
        self.save()
