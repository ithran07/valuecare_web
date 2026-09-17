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
import SignOutModal from "../components/SignOutModal";
import "../style/account.css";

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

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  useEffect(() => {
    if (!session) return;

    api
      .get("/orders/mine/")
      .then((res) => {
        setOrders(res.data.results || res.data);
      })
      .catch(() => {});

    api
      .get("/catalog/products/", {
        params: {
          page: 1,
        },
      })
      .then((res) => {
        setProducts(
          (res.data.results || res.data).slice(0, 4)
        );
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

          <span className="account-eyebrow">
            Customer account
          </span>

          <h1>Guest checkout is available</h1>

          <p>
            You don't need an account to order from ValueCare.
            Add products to your cart and checkout as a guest.
          </p>

          <Link
            to="/products"
            className="account-primary-button"
          >
            Browse products
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  /*
   * If the customer is already authenticated and somehow
   * visits /account directly, send them to the products page.
   *
   * The Navbar is now the main account navigation.
   */
  if (session) {
    navigate("/products", { replace: true });
    return null;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setInfo("");
    setSubmitting(true);

    const cleanEmail = email.trim();

    const result =
      mode === "login"
        ? await signIn(cleanEmail, password)
        : await signUp(cleanEmail, password);

    if (result.error) {
      setError(result.error);
    } else if (mode === "login") {
      /*
       * Successful login:
       * immediately take the customer to the product catalog.
       */
      navigate("/products", {
        replace: true,
      });
    } else {
      setInfo(
        "Account created. Check your email to confirm your account, then sign in."
      );

      setPassword("");
    }

    setSubmitting(false);
  }

  return (
    <div className="account-page">
      <div className="container account-auth-container">
        <div className="account-auth-card">

          {/* Brand */}
          <div className="account-auth-brand">
            <div className="account-auth-icon">
              <UserRound size={25} />
            </div>

            <span>ValueCare</span>
          </div>

          {/* Heading */}
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

          {/* Tabs */}
          <div className="account-auth-tabs">
            <button
              type="button"
              className={
                mode === "login" ? "active" : ""
              }
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
              className={
                mode === "signup" ? "active" : ""
              }
              onClick={() => {
                setMode("signup");
                setError("");
                setInfo("");
              }}
            >
              Create account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="account-alert account-alert-error">
              {error}
            </div>
          )}

          {/* Success */}
          {info && (
            <div className="account-alert account-alert-success">
              {info}
            </div>
          )}

          {/* Form */}
          <form
            className="account-auth-form"
            onSubmit={submit}
          >
            <div className="account-field">
              <label htmlFor="acc-email">
                Email address
              </label>

              <input
                id="acc-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div className="account-field">
              <label htmlFor="acc-password">
                Password
              </label>

              <input
                id="acc-password"
                type="password"
                placeholder="Enter your password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
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

          {/* Footer */}
          <div className="account-auth-note">
            <span>
              Guest checkout is always available.
            </span>

            <Link to="/products">
              Continue shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}