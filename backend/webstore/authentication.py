import jwt
from django.conf import settings
from rest_framework import authentication, exceptions


class SupabaseUser:
    is_authenticated = True

    def __init__(self, user_id: str, email: str = ""):
        self.id = user_id
        self.email = email

    def __str__(self):
        return self.email or self.id


def get_jwks_client():
    if not settings.SUPABASE_URL:
        return None

    jwks_url = (
        f"{settings.SUPABASE_URL.rstrip('/')}"
        "/auth/v1/.well-known/jwks.json"
    )

    return jwt.PyJWKClient(jwks_url)


class SupabaseJWTAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()

        if not token:
            return None

        try:
            header = jwt.get_unverified_header(token)
            algorithm = header.get("alg")

            if algorithm == "ES256":
                jwks_client = get_jwks_client()

                if jwks_client is None:
                    raise exceptions.AuthenticationFailed(
                        "Supabase URL is not configured."
                    )

                signing_key = jwks_client.get_signing_key_from_jwt(token)

                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["ES256"],
                    audience="authenticated",
                )

            elif algorithm == "HS256":
                if not settings.SUPABASE_JWT_SECRET:
                    raise exceptions.AuthenticationFailed(
                        "Supabase JWT secret is not configured."
                    )

                payload = jwt.decode(
                    token,
                    settings.SUPABASE_JWT_SECRET,
                    algorithms=["HS256"],
                    audience="authenticated",
                )

            else:
                raise exceptions.AuthenticationFailed(
                    f"Unsupported JWT algorithm: {algorithm}"
                )

        except jwt.PyJWTError as exc:
            raise exceptions.AuthenticationFailed(
                "Invalid or expired session."
            ) from exc

        user_id = payload.get("sub")

        if not user_id:
            raise exceptions.AuthenticationFailed(
                "Invalid session: missing user ID."
            )

        user = SupabaseUser(
            user_id=user_id,
            email=payload.get("email", ""),
        )

        return (user, None)