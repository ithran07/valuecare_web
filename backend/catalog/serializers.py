from rest_framework import serializers

from .models import Category, Product, Unit


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "abbreviation"]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    unit = UnitSerializer(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    # Static image stored in frontend/public/products/
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "brand",
            "manufacturer",
            "description",
            "category",
            "unit",
            "selling_price",
            "wholesale_price",

            # Packaging
            "pack_size",
            "pack_unit",
            "units_per_case",

            "is_prescription",
            "in_stock",
            "image",
        ]

    def get_image(self, obj):
        return f"/products/{obj.id}.webp"


class ProductDetailSerializer(ProductListSerializer):
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields