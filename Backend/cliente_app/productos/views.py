from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Producto
from .serializers import ProductoSerializer
from .ai_recommendation import recomendar  # usa la función que definimos antes

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.filter()  # si tienes stock, agrega stock__gt=0
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['categoria', 'precio']
    search_fields = ['nombre', 'descripcion']

    @action(detail=True, methods=['get'])
    def recommend(self, request, pk=None):
        """
        Endpoint: /api/productos/{id}/recommend/
        Retorna productos recomendados usando AI
        """
        producto = self.get_object()
        # Filtramos productos que tengan embedding
        todos_productos = Producto.objects.exclude(pk=producto.pk).filter(embedding__isnull=False)
        recomendados = recomendar(producto, list(todos_productos))
        serializer = self.get_serializer(recomendados, many=True)
        return Response(serializer.data)
