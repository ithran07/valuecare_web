from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True).order_by("name")
    serializer_class = CategorySerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/catalog/products/                       -> list (active only)
    GET /api/catalog/products/?category=3             -> filter by category id
    GET /api/catalog/products/?search=paracetamol     -> search name/sku/brand
    GET /api/catalog/products/?ordering=selling_price -> sort
    GET /api/catalog/products/<id>/                   -> detail
    """

    queryset = (
        Product.objects
        .filter(is_active=True)
        .select_related("category", "unit")
    )

    permission_classes = [permissions.AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = ["category", "is_prescription"]

    search_fields = [
        "name",
        "sku",
        "brand",
        "manufacturer",
    ]

    ordering_fields = [
        "name",
        "selling_price",
        "created_at",
    ]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer

        return ProductListSerializer