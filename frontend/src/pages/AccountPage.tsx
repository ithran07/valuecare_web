import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  LogOut,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import type { OrderResult, Product } from "../types";
import ProductCard from "../components/ProductCard";
import SignOutModal from "../components/SignOutModal";
import "../style/account.css";
import ProductDetailModal from "../components/ProductDetailModal";

export default function AccountPage() {
  const {
    session,
    loading,
    accountsEnabled,
    signIn,
    signUp,
    signOut,
  } = useAuth();

  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showSignOut, setShowSignOut] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!session) return;

    api
      .get("/orders/mine/")
      .then((res) => setOrders(res.data.results || res.data))
      .catch(() => {});

    api
      .get("/catalog/products/", {
        params: {
          page: 1,
        },
      })
      .then((res) => {
        setProducts((res.data.results || res.data).slice(0, 4));
      })
      .catch(() => {});
  }, [session]);

  if (loading) {
    return (
      <div className="account-loading">
        <div className="account-loading-spinner" />
        <span>Loading your account...</span>
      </div>
    );
  }

  if (!accountsEnabled) {
    return (
      <div className="account-page">
        <div className="account-disabled container">
          <div className="account-disabled-icon">
            <UserRound size={28} />
          </div>

          <span className="account-eyebrow">Customer account</span>

          <h1>Guest checkout is available</h1>

          <p>
            You don't need an account to order from ValueCare. Add products
            to your cart and checkout as a guest.
          </p>

          <Link to="/products" className="account-primary-button">
            Browse products
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  if (session) {
    const recentOrders = orders.slice(0, 3);

    const totalOrders = orders.length;

    const confirmedOrders = orders.filter(
      (order) =>
        order.status === "CONFIRMED" ||
        order.status === "COMPLETED"
    ).length;

    return (
      <div className="account-page">
        <div className="container account-container">

          {/* Header */}
          <header className="account-topbar">
            <div>
              <span className="account-eyebrow">My account</span>
              <h1>Welcome back</h1>
              <p>{session.user.email}</p>
            </div>

            <button
              className="account-signout-button"
              onClick={() => setShowSignOut(true)}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </header>

          {/* Profile overview */}
          <section className="account-profile-card">
            <div className="account-profile-main">
              <div className="account-avatar">
                <UserRound size={28} />
              </div>

              <div>
                <span className="account-profile-label">
                  Customer account
                </span>
                <h2>{session.user.email}</h2>
                <p>
                  Manage your orders and browse ValueCare medical supplies.
                </p>
              </div>
            </div>

            <Link to="/account/profile" className="account-outline-button">
              View profile
              <ArrowRight size={16} />
            </Link>
          </section>

          {/* Statistics */}
          <section className="account-stat-grid">
            <div className="account-stat-card">
              <div className="account-stat-icon">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span>Total orders</span>
                <strong>{totalOrders}</strong>
              </div>
            </div>

            <div className="account-stat-card">
              <div className="account-stat-icon">
                <Package size={20} />
              </div>
              <div>
                <span>Confirmed orders</span>
                <strong>{confirmedOrders}</strong>
              </div>
            </div>

            <div className="account-stat-card">
              <div className="account-stat-icon">
                <ClipboardList size={20} />
              </div>
              <div>
                <span>Account status</span>
                <strong className="account-active-status">
                  Active
                </strong>
              </div>
            </div>
          </section>

          {/* Recent orders */}
          <section className="account-section">
            <div className="account-section-header">
              <div>
                <span className="account-eyebrow">Order history</span>
                <h2>Recent orders</h2>
              </div>

              {orders.length > 0 && (
                <Link to="/account/orders" className="account-view-all">
                  View all
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <div className="account-empty-card">
                <div className="account-empty-icon">
                  <Package size={25} />
                </div>

                <h3>No orders yet</h3>

                <p>
                  Your orders will appear here after you complete your
                  first purchase.
                </p>

                <Link
                  to="/products"
                  className="account-primary-button"
                >
                  Browse medical supplies
                  <ArrowRight size={17} />
                </Link>
              </div>
            ) : (
              <div className="account-recent-orders">
                {recentOrders.map((order) => (
                  <button
                    key={order.order_number}
                    className="account-order-row"
                    onClick={() =>
                      navigate("/account/orders", {
                        state: {
                          selectedOrder: order.order_number,
                        },
                      })
                    }
                  >
                    <div className="account-order-icon">
                      <Package size={19} />
                    </div>

                    <div className="account-order-info">
                      <strong>{order.order_number}</strong>
                      <span>
                        {new Date(
                          order.created_at
                        ).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <span
                      className={`account-order-status status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>

                    <strong className="account-order-total">
                      ₱
                      {Number(order.total).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>

                    <ArrowRight size={17} className="account-order-arrow" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Products */}
          <section className="account-section account-products-section">
            <div className="account-section-header">
              <div>
                <span className="account-eyebrow">ValueCare store</span>
                <h2>Browse our products</h2>
              </div>

              <Link to="/products" className="account-view-all">
                Browse all
                <ArrowRight size={16} />
              </Link>
            </div>

            {products.length > 0 && (
              <div className="account-product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {showSignOut && (
          <SignOutModal
            onCancel={() => setShowSignOut(false)}
            onConfirm={async () => {
              setShowSignOut(false);
              await signOut();
            }}
          />
        )}
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setInfo("");
    setSubmitting(true);

    const result =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password);

    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
      setInfo(
        "Account created. Check your email to confirm your account, then sign in."
      );
    }

    setSubmitting(false);
  }

  return (
    <div className="account-page">
      <div className="container account-auth-container">
        <div className="account-auth-card">

          <div className="account-auth-brand">
            <div className="account-auth-icon">
              <UserRound size={25} />
            </div>

            <span>ValueCare</span>
          </div>

          <div className="account-auth-heading">
            <span className="account-eyebrow">
              Customer account
            </span>

            <h1>
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h1>

            <p>
              {mode === "login"
                ? "Sign in to view your orders and manage your account."
                : "Create an account to keep your ValueCare orders in one place."}
            </p>
          </div>

          <div className="account-auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setInfo("");
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => {
                setMode("signup");
                setError("");
                setInfo("");
              }}
            >
              Create account
            </button>
          </div>

          {error && (
            <div className="account-alert account-alert-error">
              {error}
            </div>
          )}

          {info && (
            <div className="account-alert account-alert-success">
              {info}
            </div>
          )}

          <form className="account-auth-form" onSubmit={submit}>
            <div className="account-field">
              <label htmlFor="acc-email">Email address</label>
              <input
                id="acc-email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="account-field">
              <label htmlFor="acc-password">Password</label>
              <input
                id="acc-password"
                type="password"
                placeholder="Enter your password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="account-auth-submit"
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          <div className="account-auth-note">
            <span>Guest checkout is always available.</span>
            <Link to="/products">Continue shopping</Link>
          </div>
          {selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}