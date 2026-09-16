"""
These models point at tables that ALREADY EXIST in your POS database
(created by your POS Django project's `products` and `inventory` apps).

`Meta.managed = False` tells Django: never create, alter, or drop these
tables from this project. We only ever SELECT from them here.

Field lists are intentionally trimmed to what the public site needs
(e.g. cost_price is deliberately left out — that's internal POS data).

If your POS app labels/table names differ from the defaults assumed here
(`products_category`, `products_unit`, `products_product`,
`inventory_productbatch`), update the `db_table` values below to match.
"""

from decimal import Decimal
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = "products_category"

    def __str__(self):
        return self.name


class Unit(models.Model):
    name = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=20, blank=True)

    class Meta:
        managed = False
        db_table = "products_unit"

    def __str__(self):
        return self.name


class Product(models.Model):
    sku = models.CharField(max_length=80)
    barcode = models.CharField(max_length=80, null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="products"
    )
    unit = models.ForeignKey(
        Unit, null=True, blank=True, on_delete=models.DO_NOTHING, related_name="products"
    )
    brand = models.CharField(max_length=120, blank=True)
    manufacturer = models.CharField(max_length=160, blank=True)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    wholesale_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    is_prescription = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "products_product"
        ordering = ["name"]

    @property
    def current_stock(self) -> Decimal:
        total = self.batches.filter(is_active=True).aggregate(
            total=models.Sum("quantity")
        )["total"]
        return total or Decimal("0")

    @property
    def in_stock(self) -> bool:
        return self.current_stock > 0

    def __str__(self):
        return f"{self.sku} - {self.name}"


class ProductBatch(models.Model):
    """Only used here to sum up available quantity per product."""

    product = models.ForeignKey(Product, on_delete=models.DO_NOTHING, related_name="batches")
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    expiration_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = "inventory_productbatch"
