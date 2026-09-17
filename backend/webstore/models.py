import random
import string
from decimal import Decimal

from django.db import models


def generate_order_number() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"WEB-{suffix}"


class CustomerProfile(models.Model):
    class CustomerType(models.TextChoices):
        CLINIC = "CLINIC", "Clinic"
        HOSPITAL = "HOSPITAL", "Hospital"
        PHARMACY = "PHARMACY", "Pharmacy"
        DISTRIBUTOR = "DISTRIBUTOR", "Distributor"
        INDIVIDUAL = "INDIVIDUAL", "Individual"
        OTHER = "OTHER", "Other"

    supabase_user_id = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
    )

    first_name = models.CharField(
        max_length=80,
        blank=True,
    )

    last_name = models.CharField(
        max_length=80,
        blank=True,
    )

    phone = models.CharField(
        max_length=50,
        blank=True,
    )

    business_name = models.CharField(
        max_length=200,
        blank=True,
    )

    customer_type = models.CharField(
        max_length=20,
        choices=CustomerType.choices,
        default=CustomerType.INDIVIDUAL,
    )

    # =====================================================
    # STRUCTURED DELIVERY ADDRESS
    # =====================================================

    recipient_name = models.CharField(
        max_length=160,
        blank=True,
    )

    house_unit = models.CharField(
        max_length=200,
        blank=True,
    )

    street = models.CharField(
        max_length=200,
        blank=True,
    )

    barangay = models.CharField(
        max_length=120,
        blank=True,
    )

    city = models.CharField(
        max_length=120,
        blank=True,
    )

    province = models.CharField(
        max_length=120,
        blank=True,
    )

    postal_code = models.CharField(
        max_length=20,
        blank=True,
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        default="Philippines",
    )

    delivery_instructions = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "customer_profiles"

    def __str__(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name or self.supabase_user_id


class WebOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending review"
        CONTACTED = "CONTACTED", "Customer contacted"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"

    class CustomerType(models.TextChoices):
        CLINIC = "CLINIC", "Clinic"
        HOSPITAL = "HOSPITAL", "Hospital"
        PHARMACY = "PHARMACY", "Pharmacy"
        DISTRIBUTOR = "DISTRIBUTOR", "Distributor"
        INDIVIDUAL = "INDIVIDUAL", "Individual"
        OTHER = "OTHER", "Other"

    order_number = models.CharField(
        max_length=20,
        unique=True,
        default=generate_order_number,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    contact_name = models.CharField(
        max_length=160,
    )

    business_name = models.CharField(
        max_length=200,
        blank=True,
    )

    customer_type = models.CharField(
        max_length=20,
        choices=CustomerType.choices,
        default=CustomerType.INDIVIDUAL,
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=50,
    )

    # Historical snapshot of the address at checkout.
    delivery_address = models.TextField()

    notes = models.TextField(
        blank=True,
    )

    supabase_user_id = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True,
    )

    matched_pos_customer_code = models.CharField(
        max_length=40,
        blank=True,
    )

    subtotal = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0"),
    )

    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0"),
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "web_orders"
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number


class WebOrderItem(models.Model):
    order = models.ForeignKey(
        WebOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product_id = models.PositiveIntegerField()

    product_name = models.CharField(
        max_length=200,
    )

    product_sku = models.CharField(
        max_length=80,
    )

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    line_total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    class Meta:
        db_table = "web_order_items"

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


class WebContactMessage(models.Model):
    name = models.CharField(
        max_length=160,
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=50,
        blank=True,
    )

    subject = models.CharField(
        max_length=200,
        blank=True,
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    is_read = models.BooleanField(
        default=False,
    )

    class Meta:
        db_table = "web_contact_messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.subject or 'General inquiry'}"