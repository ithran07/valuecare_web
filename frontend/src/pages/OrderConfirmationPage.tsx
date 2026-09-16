import { Link, Navigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  PhoneCall,
  ShoppingBag,
} from "lucide-react";

import type { OrderResult } from "../types";
import "../style/confirmation.css";

export default function OrderConfirmationPage() {
  const location = useLocation();

  const state = location.state as
    | { order?: OrderResult }
    | null;

  const order = state?.order;

  /*
   * If somebody directly visits /order-confirmation
   * without completing an order first, send them home.
   */
  if (!order) {
    return <Navigate to="/" replace />;
  }

  const customerName =
    order.contact_name?.trim()?.split(/\s+/)[0] || "there";

  const items = Array.isArray(order.items) ? order.items : [];

  const total = Number(order.total || 0);

  return (
    <div className="confirmation-page">
      <div className="container confirmation-container">

        {/* Success header */}
        <div className="confirmation-success">
          <div className="confirmation-success-icon">
            <CheckCircle2 size={34} />
          </div>

          <span className="confirmation-eyebrow">
            Order successfully submitted
          </span>

          <h1>Thank you, {customerName}!</h1>

          <p>
            Your order has been received and is now waiting for confirmation
            from our ValueCare team.
          </p>
        </div>

        {/* Order number */}
        <div className="confirmation-order-card">
          <div>
            <span className="confirmation-label">
              Order number
            </span>

            <strong className="confirmation-order-number">
              {order.order_number || "Pending"}
            </strong>
          </div>

          <div className="confirmation-order-status">
            <span>Pending review</span>
          </div>
        </div>

        <div className="confirmation-layout">

          {/* Main content */}
          <main className="confirmation-main">

            {/* Contact notice */}
            <section className="confirmation-panel confirmation-contact-panel">
              <div className="confirmation-panel-icon">
                <PhoneCall size={19} />
              </div>

              <div>
                <h2>What happens next?</h2>

                <p>
                  Our team will contact you at{" "}
                  <strong>
                    {order.phone || order.email || "your provided contact"}
                  </strong>{" "}
                  to confirm your order, delivery details, availability,
                  and payment arrangements.
                </p>

                <span className="confirmation-no-payment">
                  No payment has been charged.
                </span>
              </div>
            </section>

            {/* Products */}
            <section className="confirmation-panel">
              <div className="confirmation-panel-header">
                <div>
                  <span className="confirmation-section-eyebrow">
                    Order contents
                  </span>

                  <h2>Items ordered</h2>
                </div>

                <div className="confirmation-item-count">
                  <ShoppingBag size={15} />
                  {items.length} {items.length === 1 ? "item" : "items"}
                </div>
              </div>

              {items.length > 0 ? (
                <div className="confirmation-items">
                  {items.map((item, index) => {
                    const lineTotal = Number(item.line_total || 0);

                    return (
                      <div
                        className="confirmation-item"
                        key={`${item.product_id}-${index}`}
                      >
                        <div className="confirmation-item-icon">
                          {item.product_name?.charAt(0)?.toUpperCase() || "P"}
                        </div>

                        <div className="confirmation-item-info">
                          <strong>
                            {item.product_name || "Product"}
                          </strong>

                          <span>
                            Quantity: {item.quantity || 0}
                          </span>
                        </div>

                        <strong className="confirmation-item-total">
                          ₱
                          {lineTotal.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="confirmation-no-items">
                  No item details are available for this order.
                </div>
              )}

              <div className="confirmation-total">
                <span>Order total</span>

                <strong>
                  ₱
                  {total.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </div>
            </section>

            {/* Delivery */}
            {order.delivery_address && (
              <section className="confirmation-panel">
                <div className="confirmation-panel-header">
                  <div>
                    <span className="confirmation-section-eyebrow">
                      Delivery
                    </span>

                    <h2>Delivery address</h2>
                  </div>
                </div>

                <div className="confirmation-address">
                  <MapPin size={18} />

                  <span>{order.delivery_address}</span>
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="confirmation-sidebar">

            <div className="confirmation-next-card">
              <span className="confirmation-section-eyebrow">
                Keep your order number
              </span>

              <h2>Track your order anytime</h2>

              <p>
                Use your order number together with the email address you
                provided at checkout to check the latest status.
              </p>

              <Link
                to="/track-order"
                className="confirmation-track-button"
              >
                Track order
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="confirmation-help-card">
              <span>Need assistance?</span>

              <p>
                If you have questions about your order, our team is ready
                to help.
              </p>

              <Link to="/contact">
                Contact ValueCare
                <ArrowRight size={14} />
              </Link>
            </div>

          </aside>
        </div>

        {/* Bottom actions */}
        <div className="confirmation-actions">
          <Link
            to="/products"
            className="confirmation-secondary-button"
          >
            Continue shopping
          </Link>

          <Link
            to="/track-order"
            className="confirmation-primary-button"
          >
            Track my order
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}