from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Admin here is only for managing WEBSITE data (site orders, contact
    # messages) — it has no knowledge of your POS's employees/sales/etc.
    path("admin/", admin.site.urls),
    path("api/catalog/", include("catalog.urls")),
    path("api/", include("webstore.urls")),
]
