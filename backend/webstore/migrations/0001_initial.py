import webstore.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="WebOrder",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order_number", models.CharField(default=webstore.models.generate_order_number, max_length=20, unique=True)),
                ("status", models.CharField(choices=[("PENDING", "Pending review"), ("CONTACTED", "Customer contacted"), ("CONFIRMED", "Confirmed"), ("CANCELLED", "Cancelled")], default="PENDING", max_length=20)),
                ("contact_name", models.CharField(max_length=160)),
                ("business_name", models.CharField(blank=True, max_length=200)),
                ("customer_type", models.CharField(choices=[("CLINIC", "Clinic"), ("HOSPITAL", "Hospital"), ("PHARMACY", "Pharmacy"), ("DISTRIBUTOR", "Distributor"), ("INDIVIDUAL", "Individual"), ("OTHER", "Other")], default="INDIVIDUAL", max_length=20)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(max_length=50)),
                ("delivery_address", models.TextField()),
                ("notes", models.TextField(blank=True)),
                ("supabase_user_id", models.CharField(blank=True, db_index=True, max_length=64, null=True)),
                ("matched_pos_customer_code", models.CharField(blank=True, max_length=40)),
                ("subtotal", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("total", models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "web_orders",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="WebOrderItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("product_id", models.PositiveIntegerField()),
                ("product_name", models.CharField(max_length=200)),
                ("product_sku", models.CharField(max_length=80)),
                ("quantity", models.DecimalField(decimal_places=2, max_digits=12)),
                ("unit_price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("line_total", models.DecimalField(decimal_places=2, max_digits=14)),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="webstore.weborder")),
            ],
            options={
                "db_table": "web_order_items",
            },
        ),
        migrations.CreateModel(
            name="WebContactMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=50)),
                ("subject", models.CharField(blank=True, max_length=200)),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("is_read", models.BooleanField(default=False)),
            ],
            options={
                "db_table": "web_contact_messages",
                "ordering": ["-created_at"],
            },
        ),
    ]
