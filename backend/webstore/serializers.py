from decimal import Decimal

from rest_framework import serializers

from catalog.models import Product

from .models import WebContactMessage, WebOrder, WebOrderItem


class WebOrderItemInputSerializer(serializers.Serializer):
    """What the frontend sends per cart line — quantity only.
    Price is never trusted from the client; it's looked up server-side below.
    """

    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )


class WebOrderItemOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebOrderItem
        fields = [
            "product_id",
            "product_name",
            "product_sku",
            "quantity",
            "unit_price",
            "line_total",
        ]


class WebOrderCreateSerializer(serializers.ModelSerializer):
    items = WebOrderItemInputSerializer(many=True, write_only=True)

    class Meta:
        model = WebOrder
        fields = [
            "id",
            "order_number",
            "status",
            "contact_name",
            "business_name",
            "customer_type",
            "email",
            "phone",
            "delivery_address",
            "notes",
            "subtotal",
            "total",
            "created_at",
            "items",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "status",
            "subtotal",
            "total",
            "created_at",
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Your cart is empty.")
        return items

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = self.context["request"]

        product_ids = [item["product_id"] for item in items_data]

        products = {
            p.id: p
            for p in Product.objects.filter(
                id__in=product_ids,
                is_active=True,
            )
        }

        missing = [
            pid
            for pid in product_ids
            if pid not in products
        ]

        if missing:
            raise serializers.ValidationError(
                {
                    "items": (
                        f"These products are no longer available: {missing}"
                    )
                }
            )

        supabase_user = getattr(request, "user", None)

        supabase_user_id = (
            getattr(supabase_user, "id", None)
            if getattr(
                supabase_user,
                "is_authenticated",
                False,
            )
            else None
        )

        order = WebOrder.objects.create(
            supabase_user_id=supabase_user_id,
            **validated_data,
        )

        subtotal = Decimal("0")
        order_items = []

        for item in items_data:
            product = products[item["product_id"]]
            quantity = item["quantity"]

            unit_price = product.selling_price

            line_total = (
                unit_price * quantity
            ).quantize(Decimal("0.01"))

            subtotal += line_total

            order_items.append(
                WebOrderItem(
                    order=order,
                    product_id=product.id,
                    product_name=product.name,
                    product_sku=product.sku,
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )
            )

        WebOrderItem.objects.bulk_create(order_items)

        order.subtotal = subtotal
        order.total = subtotal

        order.save(
            update_fields=[
                "subtotal",
                "total",
            ]
        )

        return order


class WebOrderDetailSerializer(serializers.ModelSerializer):
    items = WebOrderItemOutputSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = WebOrder
        fields = [
            "order_number",
            "status",
            "contact_name",
            "business_name",
            "customer_type",
            "email",
            "phone",
            "delivery_address",
            "notes",
            "subtotal",
            "total",
            "created_at",
            "items",
        ]


class StaffWebOrderSerializer(serializers.ModelSerializer):
    """
    Serializer used by the staff/POS API.

    Staff can view the complete web order and update the
    order status and matched POS customer code.
    """

    items = WebOrderItemOutputSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = WebOrder
        fields = [
            "id",
            "order_number",
            "status",
            "contact_name",
            "business_name",
            "customer_type",
            "email",
            "phone",
            "delivery_address",
            "notes",
            "supabase_user_id",
            "matched_pos_customer_code",
            "subtotal",
            "total",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "supabase_user_id",
            "subtotal",
            "total",
            "created_at",
            "updated_at",
            "items",
        ]


class WebContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebContactMessage
        fields = [
            "name",
            "email",
            "phone",
            "subject",
            "message",
        ]