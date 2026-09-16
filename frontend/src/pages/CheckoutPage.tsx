import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { api } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../style/checkout.css";

const CUSTOMER_TYPES = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "CLINIC", label: "Clinic" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "DISTRIBUTOR", label: "Distributor" },
  { value: "OTHER", label: "Other" },
];

export default function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    contact_name: "",
    business_name: "",
    customer_type: "INDIVIDUAL",
    email: session?.user.email || "",
    phone: "",
    delivery_address: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(
    key: K,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function continueToDelivery() {
    setError("");

    if (!form.contact_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function backToCustomer() {
    setError("");
    setStep(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getErrorMessage(error: any) {
    const detail = error?.response?.data;

    if (!detail) {
      return "We couldn't submit your order. Please try again.";
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (typeof detail.detail === "string") {
      return detail.detail;
    }

    if (Array.isArray(detail.items)) {
      const firstError = detail.items[0];

      if (typeof firstError === "string") {
        return firstError;
      }
    }

    const firstField = Object.values(detail)[0];

    if (Array.isArray(firstField) && typeof firstField[0] === "string") {
      return firstField[0];
    }

    if (typeof firstField === "string") {
      return firstField;
    }

    return "We couldn't submit your order. Please check your details and try again.";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    setError("");

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!form.delivery_address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        items: lines.map((line) => ({
          product_id: line.product.id,
          quantity: line.quantity,
        })),
      };

      const response = await api.post("/orders/", payload);

      if (!response?.data) {
        throw new Error("The server did not return an order.");
      }

      clearCart();

      navigate("/order-confirmation", {
        replace: true,
        state: {
          order: response.data,
        },
      });
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="checkout-empty-icon">
          <ClipboardList size={32} />
        </div>

        <h1>Your cart is empty</h1>

        <p>
          Add some medical supplies to your cart before proceeding
          to checkout.
        </p>

        <Link
          to="/products"
          className="checkout-primary-button"
        >
          Browse products
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="checkout-header">
          <Link
            to="/cart"
            className="checkout-back-link"
          >
            <ArrowLeft size={15} />
            Back to cart
          </Link>

          <span className="checkout-eyebrow">
            Secure order submission
          </span>

          <h1>Checkout</h1>

          <p>
            Provide your contact and delivery information. Our team
            will review your order and contact you to confirm the
            details.
          </p>

          {/* =====================================================
              STEP INDICATOR
          ===================================================== */}

          <div className="checkout-progress">

            <div
              className={`checkout-progress-step ${
                step >= 1 ? "active" : ""
              } ${step > 1 ? "completed" : ""}`}
            >
              <div className="checkout-progress-number">
                {step > 1 ? <CheckCircle2 size={15} /> : "01"}
              </div>

              <div>
                <span>Step 01</span>
                <strong>Customer information</strong>
              </div>
            </div>

            <div className="checkout-progress-line" />

            <div
              className={`checkout-progress-step ${
                step === 2 ? "active" : ""
              }`}
            >
              <div className="checkout-progress-number">
                02
              </div>

              <div>
                <span>Step 02</span>
                <strong>Delivery details</strong>
              </div>
            </div>

          </div>
        </header>

        <div className="checkout-layout">

          {/* =====================================================
              FORM
          ===================================================== */}

          <main className="checkout-main">

            {error && (
              <div className="checkout-error">
                <span>{error}</span>
              </div>
            )}

            <form
              className="checkout-form"
              onSubmit={submit}
            >

              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <section className="checkout-card checkout-step-card">

                  <div className="checkout-card-header">
                    <div className="checkout-card-icon">
                      <UserRound size={18} />
                    </div>

                    <div>
                      <span>Step 01</span>
                      <h2>Customer information</h2>
                    </div>
                  </div>

                  <div className="checkout-form-grid">

                    {/* Full name */}

                    <div className="checkout-field">
                      <label htmlFor="contact_name">
                        Full name <span>*</span>
                      </label>

                      <div className="checkout-input-wrap">
                        <UserRound size={16} />

                        <input
                          id="contact_name"
                          type="text"
                          required
                          value={form.contact_name}
                          onChange={(e) =>
                            update(
                              "contact_name",
                              e.target.value
                            )
                          }
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Business */}

                    <div className="checkout-field">
                      <label htmlFor="business_name">
                        Business / facility
                      </label>

                      <div className="checkout-input-wrap">
                        <Building2 size={16} />

                        <input
                          id="business_name"
                          type="text"
                          value={form.business_name}
                          onChange={(e) =>
                            update(
                              "business_name",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Sunrise Clinic"
                        />
                      </div>
                    </div>

                    {/* Customer type */}

                    <div className="checkout-field">
                      <label htmlFor="customer_type">
                        Ordering as
                      </label>

                      <div className="checkout-input-wrap">
                        <ClipboardList size={16} />

                        <select
                          id="customer_type"
                          value={form.customer_type}
                          onChange={(e) =>
                            update(
                              "customer_type",
                              e.target.value
                            )
                          }
                        >
                          {CUSTOMER_TYPES.map((type) => (
                            <option
                              key={type.value}
                              value={type.value}
                            >
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Phone */}

                    <div className="checkout-field">
                      <label htmlFor="phone">
                        Phone number <span>*</span>
                      </label>

                      <div className="checkout-input-wrap">
                        <Phone size={16} />

                        <input
                          id="phone"
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) =>
                            update(
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder="+63 9XX XXX XXXX"
                        />
                      </div>
                    </div>

                    {/* Email */}

                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="email">
                        Email address <span>*</span>
                      </label>

                      <div className="checkout-input-wrap">
                        <Mail size={16} />

                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) =>
                            update(
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Continue */}

                  <div className="checkout-step-actions">
                    <button
                      type="button"
                      className="checkout-next-button"
                      onClick={continueToDelivery}
                    >
                      Continue to delivery
                      <ArrowRight size={17} />
                    </button>
                  </div>

                </section>
              )}

              {/* =================================================
                  STEP 2
              ================================================= */}

              {step === 2 && (
                <section className="checkout-card checkout-step-card">

                  <div className="checkout-card-header">
                    <div className="checkout-card-icon">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <span>Step 02</span>
                      <h2>Delivery details</h2>
                    </div>
                  </div>

                  {/* Delivery address */}

                  <div className="checkout-field">
                    <label htmlFor="delivery_address">
                      Delivery address <span>*</span>
                    </label>

                    <div className="checkout-textarea-wrap">
                      <MapPin size={16} />

                      <textarea
                        id="delivery_address"
                        required
                        rows={4}
                        value={form.delivery_address}
                        onChange={(e) =>
                          update(
                            "delivery_address",
                            e.target.value
                          )
                        }
                        placeholder="Enter your complete delivery address"
                      />
                    </div>
                  </div>

                  {/* Notes */}

                  <div className="checkout-field">
                    <label htmlFor="notes">
                      Order notes
                    </label>

                    <textarea
                      id="notes"
                      rows={3}
                      value={form.notes}
                      onChange={(e) =>
                        update("notes", e.target.value)
                      }
                      placeholder="Preferred delivery time, PO number, special instructions..."
                    />
                  </div>

                  {/* Confirmation */}

                  <div className="checkout-notice">
                    <CheckCircle2 size={18} />

                    <div>
                      <strong>
                        No payment is collected yet
                      </strong>

                      <p>
                        Submitting this form creates your order
                        request. Our team will contact you to
                        confirm availability, delivery, and payment
                        arrangements.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="checkout-step-actions checkout-final-actions">

                    <button
                      type="button"
                      className="checkout-back-step-button"
                      onClick={backToCustomer}
                      disabled={submitting}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>

                    <button
                      className="checkout-submit"
                      disabled={submitting}
                      type="submit"
                    >
                      {submitting ? (
                        <>
                          <span className="checkout-spinner" />
                          Submitting order...
                        </>
                      ) : (
                        <>
                          Submit order
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>

                  </div>

                </section>
              )}

            </form>
          </main>

          {/* =====================================================
              ORDER SUMMARY
          ===================================================== */}

          <aside className="checkout-summary">

            <div className="checkout-summary-header">
              <span>Order summary</span>
              <h2>Your order</h2>
            </div>

            <div className="checkout-summary-items">

              {lines.map(({ product, quantity }) => {
                const lineTotal =
                  Number(product.selling_price) * quantity;

                return (
                  <div
                    className="checkout-summary-item"
                    key={product.id}
                  >

                    <div className="checkout-summary-product-icon">
                      {product.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="checkout-summary-product">
                      <strong>{product.name}</strong>

                      <span>
                        Qty {quantity}
                      </span>
                    </div>

                    <strong>
                      ₱
                      {lineTotal.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>

                  </div>
                );
              })}

            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>Order total</span>

              <strong>
                ₱
                {subtotal.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div className="checkout-summary-info">
              <CheckCircle2 size={15} />

              <span>
                Delivery and payment arrangements will be confirmed
                by our team after submission.
              </span>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}