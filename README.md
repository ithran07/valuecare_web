# ValueCare Medical Supplies — public website

A separate storefront (own repo/folder, own Django project) that reads and
writes to the **same database** as your POS system, without exposing any
POS internals.

```
valuecare-web/
├── backend/     Django REST API (its own project — see below)
└── frontend/    React + Vite storefront
```

## How this connects to your POS

- **Same database.** `backend/valuecare_web/settings.py` points at the
  exact same Postgres/Supabase connection your POS Django project uses.
- **Zero POS routes exposed.** This Django project never imports your
  POS's `users`, `sales`, `purchasing`, `customers`, or `employees` apps.
  It only knows about two things:
  - `catalog` — **read-only** models mirroring your POS's `products` /
    `inventory` tables (`Meta.managed = False`, so this project can never
    create/alter/drop those tables — it only ever `SELECT`s from them).
  - `webstore` — brand-new tables this project owns outright:
    `web_orders`, `web_order_items`, `web_contact_messages`.
- **Orders stay separate from in-store sales**, per your instruction —
  they land in `web_orders`, not your POS `sales_sale` table. Your admin
  can review them from `/admin/` on this project, or you can later build a
  small "Web Orders" page inside your POS admin panel that just queries
  `web_orders` directly (it's in the same database).

⚠️ **Double-check the table names** in `backend/catalog/models.py`
(`db_table = "products_product"`, etc.). These assume your POS app labels
are exactly `products` and `inventory`, matching the `"products.Product"` /
`"inventory.ProductBatch"` strings in the models you shared. If your POS
project ever renames those apps, update `db_table` here to match.

## Guest checkout vs. accounts

Per your setup: **customers can order as guests** (no account needed) —
that's the primary flow, matching your "no payment handled online, admin
follows up" process. An **optional** account (via Supabase Auth) is also
wired up so returning customers can see their order history at `/account`.
If you never configure `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, the
account feature quietly disables itself and the site works purely as a
guest storefront — nothing else breaks.

## Backend setup

```bash
cd backend
python -m venv venv && source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env    # fill in your real DB credentials (same as your POS project)
python manage.py migrate   # only creates webstore's new tables — catalog is read-only
python manage.py createsuperuser
python manage.py runserver
```

This runs the API at `http://localhost:8000/api/`.

Key endpoints:
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/catalog/categories/` | List active categories |
| GET | `/api/catalog/products/` | List active products (search, category, ordering, pagination) |
| GET | `/api/catalog/products/<id>/` | Product detail |
| POST | `/api/orders/` | Place a guest/logged-in order (server computes prices — never trusts client-sent prices) |
| GET | `/api/orders/track/?order_number=&email=` | Guest order lookup |
| GET | `/api/orders/mine/` | Signed-in customer's own orders (requires Supabase auth token) |
| POST | `/api/contact/` | Contact form submission |

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # point VITE_API_BASE_URL at your Django API
npm run dev
```

Runs at `http://localhost:5173`.

## Deploying

- Keep `backend` and `frontend` as separate deployments (e.g. `backend` on
  Render/Railway/a VPS, `frontend` on Vercel/Netlify) — exactly like you
  described, in separate repos/folders.
- Set `CORS_ALLOWED_ORIGINS` in the backend's `.env` to your deployed
  frontend URL so the browser is allowed to call the API.
- Set `DJANGO_DEBUG=False` and a real `DJANGO_SECRET_KEY` in production.

## What's intentionally NOT included

- **No online payment.** Prices and totals are shown throughout (catalog,
  cart, checkout, confirmation, tracking), but nothing charges a card —
  orders are saved as `PENDING` for your team to follow up on, exactly as
  you asked.
- **No POS admin features** — no employee logins, no inventory receiving,
  no purchase orders. Those stay entirely inside your existing POS app.
