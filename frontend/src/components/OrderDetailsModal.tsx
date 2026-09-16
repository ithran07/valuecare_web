import { CheckCircle2, MapPin, Package, X } from "lucide-react";
import type { OrderResult } from "../types";
import "../style/order-details-modal.css";

interface Props {
  order: OrderResult;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  CONTACTED: "You've been contacted",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

export default function OrderDetailsModal({
  order,
  onClose,
}: Props) {
  return (
    <div
      className="order-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="order-modal">
        <header className="order-modal-header">
          <div>
            <span className="order-modal-label">
              Order details
            </span>

            <h2>{order.order_number}</h2>

            <p>
              {new Date(order.created_at).toLocaleDateString(
                "en-PH",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </p>
          </div>

          <button
            className="order-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="order-modal-status-row">
          <span
            className={`order-modal-status status-${order.status.toLowerCase()}`}
          >
            <CheckCircle2 size={15} />
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        <div className="order-modal-body">
          <section className="order-modal-section">
            <div className="order-modal-section-title">
              <Package size={18} />
              <h3>Items ordered</h3>
            </div>

            <div className="order-modal-items">
              {order.items.map((item) => (
                <div
                  className="order-modal-item"
                  key={item.product_id}
                >
                  <div className="order-modal-item-image">
                    {item.product_name.charAt(0)}
                  </div>

                  <div className="order-modal-item-info">
                    <strong>{item.product_name}</strong>
                    <span>
                      Quantity: {item.quantity}
                    </span>
                  </div>

                  <strong>
                    ₱
                    {Number(
                      item.line_total,
                    ).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="order-modal-section">
            <div className="order-modal-section-title">
              <MapPin size={18} />
              <h3>Delivery address</h3>
            </div>

            <div className="order-modal-address">
              {order.delivery_address}
            </div>
          </section>

          <section className="order-modal-total">
            <span>Total order amount</span>

            <strong>
              ₱
              {Number(order.total).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </section>
        </div>

        <footer className="order-modal-footer">
          <button onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}
