import { FormEvent, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";

import { api } from "../api";
import type { OrderResult } from "../types";
import "../style/track-order.css";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  CONTACTED: "You've been contacted",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  PENDING: "Your order has been received and is waiting for review.",
  CONTACTED: "Our team has contacted you regarding your order.",
  CONFIRMED: "Your order has been confirmed and is being prepared.",
  CANCELLED: "This order has been cancelled.",
};

const STATUS_STEPS = [
  {
    key: "PENDING",
    label: "Order received",
    icon: Clock3,
  },
  {
    key: "CONTACTED",
    label: "Contacted",
    icon: Mail,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    icon: PackageCheck,
  },
];

function getStatusIndex(status: string) {
  const index = STATUS_STEPS.findIndex((step) => step.key === status);

  if (index >= 0) {
    return index;
  }

  return -1;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reference to the result/status section
  const resultRef = useRef<HTMLElement | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const res = await api.get("/orders/track/", {
        params: {
          order_number: orderNumber.trim(),
          email: email.trim(),
        },
      });

      setOrder(res.data);

      // Wait until React renders the order result,
      // then smoothly scroll down to it.
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch {
      setError(
        "We couldn't find an order matching that number and email."
      );

      // Also bring the user to the error message.
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } finally {
      setLoading(false);
    }
  }

  const currentStep = order
    ? getStatusIndex(order.status)
    : -1;

  return (
    <main className="track-page">
      {/* HERO */}
      <section className="track-hero">
        <div className="track-hero-grid" />

        <div className="container track-hero-inner">
          <div className="track-hero-content">
            <span className="track-eyebrow">
              <span />
              Order tracking
            </span>

            <h1 style={{ color: "white" }}>
              Know where your
              <span> order stands.</span>
            </h1>

            <p>
              Enter your order number and the email address used during
              checkout to see the latest status of your order.
            </p>

            <div className="track-trust">
              <div>
                <ShieldCheck size={17} />
                <span>Secure lookup</span>
              </div>

              <div>
                <PackageCheck size={17} />
                <span>Live order status</span>
              </div>
            </div>
          </div>

          <div className="track-search-card">
            <div className="track-search-header">
              <div className="track-search-icon">
                <Search size={21}  />
              </div>

              <div>
                <h2 style={{ color: "white" }}>Find your order</h2>
                <p>Enter your order details below.</p>
              </div>
            </div>

            <form onSubmit={submit} className="track-form">
              <div className="track-field">
                <label htmlFor="order_number">
                  Order number
                </label>

                <input
                  id="order_number"
                  placeholder="WEB-123456"
                  required
                  value={orderNumber}
                  onChange={(e) =>
                    setOrderNumber(e.target.value)
                  }
                />
              </div>

              <div className="track-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <button
                className="track-submit"
                disabled={loading}
                type="submit"
              >
                <Search size={17} />
                {loading ? "Searching..." : "Track order"}
              </button>
            </form>

            <div className="track-search-note">
              <ShieldCheck size={15} />
              <span>
                Your order information is only used to locate your
                order.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RESULT */}
      <section
        className="track-content"
        ref={resultRef}
      >
        <div className="container">
          {error && (
            <div className="track-error">
              <div className="track-error-icon">
                <XCircle size={21} />
              </div>

              <div>
                <strong>Order not found</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {order && (
            <div className="track-result">
              {/* ORDER HEADER */}
              <div className="track-result-top">
                <div>
                  <span className="track-result-label">
                    Order number
                  </span>

                  <h2>{order.order_number}</h2>

                  <p>
                    {STATUS_DESCRIPTIONS[order.status] ||
                      "Here is the current status of your order."}
                  </p>
                </div>

                <div
                  className={`track-status-badge status-${order.status.toLowerCase()}`}
                >
                  {order.status === "CANCELLED" ? (
                    <XCircle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}

                  <span>
                    {STATUS_LABELS[order.status] ||
                      order.status}
                  </span>
                </div>
              </div>

              {/* STATUS TIMELINE */}
              {order.status !== "CANCELLED" && (
                <div className="track-timeline">
                  {STATUS_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const completed = index <= currentStep;
                    const active = index === currentStep;

                    return (
                      <div
                        className={`track-step ${
                          completed ? "completed" : ""
                        } ${active ? "active" : ""}`}
                        key={step.key}
                      >
                        <div className="track-step-marker">
                          {completed ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <Icon size={17} />
                          )}
                        </div>

                        <div className="track-step-content">
                          <strong>{step.label}</strong>

                          <span>
                            {active
                              ? "Current status"
                              : completed
                                ? "Completed"
                                : "Upcoming"}
                          </span>
                        </div>

                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`track-step-line ${
                              index < currentStep
                                ? "completed"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CANCELLED STATUS */}
              {order.status === "CANCELLED" && (
                <div className="track-cancelled">
                  <XCircle size={20} />

                  <div>
                    <strong>Order cancelled</strong>

                    <p>
                      This order is no longer being processed. Please
                      contact our team if you need assistance.
                    </p>
                  </div>
                </div>
              )}

              {/* DETAILS */}
              <div className="track-details-grid">
                {/* ITEMS */}
                <div className="track-items-card">
                  <div className="track-card-heading">
                    <div>
                      <span>Order details</span>
                      <h3>Items in your order</h3>
                    </div>

                    <PackageCheck size={20} />
                  </div>

                  <div className="track-items">
                    {order.items.map((item) => (
                      <div
                        className="track-item"
                        key={item.product_id}
                      >
                        <div className="track-item-product">
                          <div className="track-item-icon">
                            <PackageCheck size={17} />
                          </div>

                          <div>
                            <strong>
                              {item.product_name}
                            </strong>

                            <span>
                              Quantity: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <strong className="track-item-price">
                          ₱
                          {Number(
                            item.line_total
                          ).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="track-total">
                    <span>Order total</span>

                    <strong>
                      ₱
                      {Number(order.total).toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </strong>
                  </div>
                </div>

                {/* DELIVERY */}
                <div className="track-delivery-card">
                  <div className="track-card-heading">
                    <div>
                      <span>Delivery information</span>
                      <h3>Where we're delivering</h3>
                    </div>

                    <Truck size={20} />
                  </div>

                  <div className="track-address">
                    <div className="track-address-icon">
                      <MapPin size={19} />
                    </div>

                    <div>
                      <span>Delivery address</span>
                      <p>{order.delivery_address}</p>
                    </div>
                  </div>

                  <div className="track-delivery-note">
                    <ShieldCheck size={17} />

                    <p>
                      Our team will contact you if we need to confirm
                      any delivery details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!order && !error && (
            <div className="track-empty">
              <div className="track-empty-icon">
                <PackageCheck size={30} />
              </div>

              <h2>Ready to check your order?</h2>

              <p>
                Enter your order number and checkout email above to
                see your latest order information.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
