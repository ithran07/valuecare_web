from django.contrib import admin

from .models import WebContactMessage, WebOrder, WebOrderItem


class WebOrderItemInline(admin.TabularInline):
    model = WebOrderItem
    extra = 0
    readonly_fields = ["product_id", "product_name", "product_sku", "quantity", "unit_price", "line_total"]
    can_delete = False


@admin.register(WebOrder)
class WebOrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "contact_name", "business_name", "status", "total", "created_at"]
    list_filter = ["status", "customer_type"]
    search_fields = ["order_number", "contact_name", "business_name", "email", "phone"]
    inlines = [WebOrderItemInline]
    readonly_fields = ["order_number", "subtotal", "total", "created_at", "updated_at", "supabase_user_id"]


@admin.register(WebContactMessage)
class WebContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "is_read", "created_at"]
    list_filter = ["is_read"]
    search_fields = ["name", "email", "subject", "message"]
