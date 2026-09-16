class CatalogRouter:
    """
    Routes the read-only `catalog` app (Product/Category/Unit/ProductBatch —
    the POS mirror) to the `pos_db` connection.

    Everything else this project owns (Django admin/auth/sessions, and the
    `webstore` app's own orders/contact tables) uses `default`, which is a
    completely separate database. This keeps this project's own bookkeeping
    tables (django_migrations, auth_user, sessions, ...) from colliding with
    your POS project's bookkeeping tables in the shared database — that
    collision is what caused the "relation auth_user does not exist" error.
    """

    catalog_app = "catalog"

    def db_for_read(self, model, **hints):
        if model._meta.app_label == self.catalog_app:
            return "pos_db"
        return "default"

    def db_for_write(self, model, **hints):
        if model._meta.app_label == self.catalog_app:
            return None
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == self.catalog_app:
            return False
        return db == "default"