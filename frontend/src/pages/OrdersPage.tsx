import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { api } from "../api";
import type { OrderResult } from "../types";
import OrderDetailsModal from "../components/OrderDetailsModal";
import "../style/orders.css";

type OrderFilter =
  | "ALL"
  | "PENDING"
  | "CONTACTED"
  | "CONFIRMED"
  | "CANCELLED";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

export default function OrdersPage() {
  const location = useLocation();

  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] =
    useState<OrderResult | null>(null);

  useEffect(() => {
    api
      .get("/orders/mine/")
      .then((res) => {
        const data = res.data.results || res.data;
        setOrders(data);

        const orderNumber =
          location.state?.selectedOrder;

        if (orderNumber) {
          const found = data.find(
            (order: OrderResult) =>
              order.order_number === orderNumber
          );

          if (found) {
            setSelectedOrder(found);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location.state]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        filter === "ALL" || order.status === filter;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        order.order_number.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  return (
    <div className="orders-page">
      <div className="container orders-container">

        <Link to="/account" className="orders-back">
          <ArrowLeft size={16} />
          Back to account
        </Link>

        <header className="orders-header">
          <div>
            <span className="orders-eyebrow">
              Customer account
            </span>

            <h1>My orders</h1>

            <p>
              View and manage your ValueCare purchase history.
            </p>
          </div>

          <Link to="/products" className="orders-shop-button">
            <ShoppingBag size={17} />
            Browse products
          </Link>
        </header>

        <div className="orders-toolbar">
          <div className="orders-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order number..."
            />
          </div>

          <div className="orders-filters">
            {(
              [
                "ALL",
                "PENDING",
                "CONTACTED",
                "CONFIRMED",
                "CANCELLED",
              ] as OrderFilter[]
            ).map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item === "ALL"
                  ? "All orders"
                  : STATUS_LABELS[item] || item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="orders-loading">
            {[1, 2, 3].map((item) => (
              <div className="orders-skeleton" key={item}>
                <div />
                <div />
                <div />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <Package size={28} />
            </div>

            <h2>
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h2>

            <p>
              {orders.length === 0
                ? "Once you place an order, you'll be able to see its status and details here."
                : "Try changing your search or order filter."}
            </p>

            {orders.length === 0 && (
              <Link
                to="/products"
                className="orders-primary-button"
              >
                Start shopping
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <button
                key={order.order_number}
                className="orders-card"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="orders-card-top">
                  <div className="orders-card-number">
                    <div className="orders-card-icon">
                      <Package size={19} />
                    </div>

                    <div>
                      <strong>{order.order_number}</strong>
                      <span>
                        {new Date(
                          order.created_at
                        ).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`orders-status status-${order.status.toLowerCase()}`}
                  >
                    {STATUS_LABELS[order.status] ||
                      order.status}
                  </span>
                </div>

                <div className="orders-card-content">
                  <div className="orders-products-preview">
                    {order.items
                      .slice(0, 3)
                      .map((item) => (
                        <span key={item.product_id}>
                          {item.product_name} × {item.quantity}
                        </span>
                      ))}

                    {order.items.length > 3 && (
                      <span>
                        +{order.items.length - 3} more item
                        {order.items.length - 3 > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="orders-card-total">
                    <span>Total</span>
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

                <div className="orders-card-footer">
                  <span>
                    {order.items.length}{" "}
                    {order.items.length === 1
                      ? "item"
                      : "items"}
                  </span>

                  <span className="orders-view">
                    View order
                    <ArrowRight size={16} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}