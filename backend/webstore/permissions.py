from django.conf import settings
from rest_framework.permissions import BasePermission


class HasStaffApiKey(BasePermission):
    message = "Missing or invalid staff API key."

    def has_permission(self, request, view):
        expected = settings.STAFF_API_KEY
        provided = request.headers.get("X-Staff-Api-Key", "")

        return bool(expected) and provided == expected