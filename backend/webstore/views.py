from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WebOrder
from .notifications import (
    notify_staff_new_message,
    notify_staff_new_order,
)
from .permissions import HasStaffApiKey
from .serializers import (
    StaffWebOrderSerializer,
    WebContactMessageSerializer,
    WebOrderCreateSerializer,
    WebOrderDetailSerializer,
)


class PlaceOrderView(generics.CreateAPIView):
    """
    POST /api/orders/ — guest checkout.

    No payment is collected here; the order is saved as PENDING
    and your admin follows up to arrange payment, per your
    business process.
    """

    serializer_class = WebOrderCreateSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        order = serializer.save()

        # Notify staff when a new web order is created.
        notify_staff_new_order(order)


class TrackOrderView(APIView):
    """
    GET /api/orders/track/?order_number=WEB-123456&email=jane@clinic.com

    Lets a guest who doesn't want an account still check their
    order status, without exposing every order to anyone who
    just guesses a number.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        order_number = request.query_params.get(
            "order_number",
            "",
        ).strip()

        email = request.query_params.get(
            "email",
            "",
        ).strip()

        if not order_number or not email:
            return Response(
                {
                    "detail": (
                        "order_number and email are both required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = WebOrder.objects.get(
                order_number__iexact=order_number,
                email__iexact=email,
            )
        except WebOrder.DoesNotExist:
            return Response(
                {"detail": "No matching order found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            WebOrderDetailSerializer(order).data
        )


class MyOrdersView(generics.ListAPIView):
    """
    GET /api/orders/mine/ — only returns something if the shopper
    is signed in via Supabase Auth
    (see webstore/authentication.py).
    """

    serializer_class = WebOrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WebOrder.objects.filter(
            supabase_user_id=self.request.user.id
        )


class ContactMessageView(generics.CreateAPIView):
    """
    POST /api/contact/ — the "Contact us" form on the
    About/Contact page.
    """

    serializer_class = WebContactMessageSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        message = serializer.save()

        # Notify staff when a new contact message is submitted.
        notify_staff_new_message(message)


class StaffOrderListView(generics.ListAPIView):
    """
    GET /api/staff/orders/

    Staff-only endpoint for retrieving web orders.

    Optional:
        ?status=ALL
        ?status=PENDING
        ?status=PENDING,CONFIRMED
    """

    serializer_class = StaffWebOrderSerializer
    permission_classes = [HasStaffApiKey]
    pagination_class = None

    def get_queryset(self):
        status_param = self.request.query_params.get("status")

        # Return all orders when no status is provided or
        # when ?status=ALL is used.
        if not status_param or status_param.upper() == "ALL":
            return WebOrder.objects.all()

        statuses = [
            s.strip().upper()
            for s in status_param.split(",")
            if s.strip()
        ]

        return WebOrder.objects.filter(
            status__in=statuses
        )


class StaffOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH /api/staff/orders/<id>/

    Staff-only endpoint for viewing and updating a web order.
    """

    queryset = WebOrder.objects.all()
    serializer_class = StaffWebOrderSerializer
    permission_classes = [HasStaffApiKey]

    def patch(self, request, *args, **kwargs):
        order = self.get_object()

        new_status = request.data.get("status")
        matched_code = request.data.get(
            "matched_pos_customer_code"
        )

        # Update order status if supplied.
        if new_status:
            valid_statuses = dict(
                WebOrder.Status.choices
            )

            if new_status not in valid_statuses:
                return Response(
                    {"detail": "Invalid status."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order.status = new_status

        # Update the matched POS customer code if supplied.
        if matched_code is not None:
            order.matched_pos_customer_code = matched_code

        order.save()

        return Response(
            StaffWebOrderSerializer(order).data
        )
