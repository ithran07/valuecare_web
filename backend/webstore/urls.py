from django.urls import path

from .views import (
    ContactMessageView,
    CustomerProfileView,
    MyOrdersView,
    PlaceOrderView,
    StaffOrderDetailView,
    StaffOrderListView,
    TrackOrderView,
)

urlpatterns = [
    path("orders/", PlaceOrderView.as_view(), name="place-order"),
    path("orders/track/", TrackOrderView.as_view(), name="track-order"),
    path("orders/mine/", MyOrdersView.as_view(), name="my-orders"),
    path("contact/", ContactMessageView.as_view(), name="contact-message"),

    path("staff/orders/", StaffOrderListView.as_view(), name="staff-order-list"),
    path("staff/orders/<int:pk>/", StaffOrderDetailView.as_view(), name="staff-order-detail"),
    
    path(
        "account/profile/",
        CustomerProfileView.as_view(),
        name="customer-profile",
    ),
    
    
]