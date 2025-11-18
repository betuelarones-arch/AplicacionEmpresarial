from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet

router = DefaultRouter()
router.register(r'', CategoriaViewSet)  # '' significa que estará en /api/categorias/

urlpatterns = [
    path('', include(router.urls)),
]
