from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

# Crear router para el ViewSet
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
