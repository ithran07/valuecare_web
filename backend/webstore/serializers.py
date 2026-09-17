from decimal import Decimal

from rest_framework import serializers

from catalog.models import Product

from .models import (
    CustomerProfile,
    WebContactMessage,
    WebOrder,
    WebOrderItem,
)

def build_delivery_address(data):
    parts = []

    recipient_name = str(
        data.get("recipient_name", "")
    ).strip()

    house_unit = str(
        data.get("house_unit", "")
    ).strip()

    street = str(
        data.get("street", "")
    ).strip()

    barangay = str(
        data.get("barangay", "")
    ).strip()

    city = str(
        data.get("city", "")
    ).strip()

    province = str(
        data.get("province", "")
    ).strip()

    postal_code = str(
        data.get("postal_code", "")
    ).strip()

    country = str(
        data.get("country", "")
    ).strip()

    if recipient_name:
        parts.append(recipient_name)

    if house_unit:
        parts.append(house_unit)

    if street:
        parts.append(street)

    if barangay:
        parts.append(barangay)

    city_line = city

    if province:
        if city_line:
            city_line += f", {province}"
        else:
            city_line = province

    if postal_code:
        if city_line:
            city_line += f" {postal_code}"
        else:
            city_line = postal_code

    if city_line:
        parts.append(city_line)

    if country:
        parts.append(country)

    return "\n".join(parts)

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            "first_name",
            "last_name",
            "phone",
            "business_name",
            "customer_type",

            "recipient_name",
            "house_unit",
            "street",
            "barangay",
            "city",
            "province",
            "postal_code",
            "country",
            "delivery_instructions",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",
        ]
        
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
    items = WebOrderItemInputSerializer(
        many=True,
        write_only=True,
    )

    recipient_name = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    house_unit = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    street = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    barangay = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    city = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    province = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    postal_code = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    country = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
    )

    delivery_instructions = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
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

            "recipient_name",
            "house_unit",
            "street",
            "barangay",
            "city",
            "province",
            "postal_code",
            "country",
            "delivery_instructions",

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
            "delivery_address",
            "subtotal",
            "total",
            "created_at",
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError(
                "Your cart is empty."
            )

        return items

    def validate(self, attrs):
        address_fields = [
            "recipient_name",
            "house_unit",
            "street",
            "barangay",
            "city",
            "province",
            "postal_code",
            "country",
        ]

        for field in address_fields:
            value = str(
                attrs.get(field, "")
            ).strip()

            if not value:
                raise serializers.ValidationError(
                    {
                        field: (
                            "This address field is required."
                        )
                    }
                )

            attrs[field] = value

        attrs["delivery_instructions"] = str(
            attrs.get(
                "delivery_instructions",
                "",
            )
        ).strip()

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop("items")

        request = self.context["request"]

        recipient_name = validated_data.pop(
            "recipient_name"
        )

        house_unit = validated_data.pop(
            "house_unit"
        )

        street = validated_data.pop(
            "street"
        )

        barangay = validated_data.pop(
            "barangay"
        )

        city = validated_data.pop(
            "city"
        )

        province = validated_data.pop(
            "province"
        )

        postal_code = validated_data.pop(
            "postal_code"
        )

        country = validated_data.pop(
            "country"
        )

        delivery_instructions = validated_data.pop(
            "delivery_instructions",
            "",
        )

        address_data = {
            "recipient_name": recipient_name,
            "house_unit": house_unit,
            "street": street,
            "barangay": barangay,
            "city": city,
            "province": province,
            "postal_code": postal_code,
            "country": country,
        }

        delivery_address = build_delivery_address(
            address_data
        )

        if delivery_instructions:
            delivery_address += (
                "\n\nDelivery instructions:\n"
                f"{delivery_instructions}"
            )

        product_ids = [
            item["product_id"]
            for item in items_data
        ]

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
                        "These products are no longer "
                        f"available: {missing}"
                    )
                }
            )

        supabase_user = getattr(
            request,
            "user",
            None,
        )

        supabase_user_id = (
            getattr(
                supabase_user,
                "id",
                None,
            )
            if getattr(
                supabase_user,
                "is_authenticated",
                False,
            )
            else None
        )

        order = WebOrder.objects.create(
            supabase_user_id=supabase_user_id,
            delivery_address=delivery_address,
            **validated_data,
        )

        subtotal = Decimal("0")

        order_items = []

        for item in items_data:
            product = products[
                item["product_id"]
            ]

            quantity = item["quantity"]

            unit_price = product.selling_price

            line_total = (
                unit_price * quantity
            ).quantize(
                Decimal("0.01")
            )

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

        WebOrderItem.objects.bulk_create(
            order_items
        )

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