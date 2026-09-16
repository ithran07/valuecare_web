import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../style/cart.css";

export default function CartPage() {
  const {
    lines,
    updateQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  const navigate = useNavigate();

  if (lines.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingBag size={34} />
            </div>

            <span className="cart-eyebrow">Your shopping bag</span>

            <h1>Your cart is empty</h1>

            <p>
              You haven't added any medical supplies yet. Browse our catalog
              and find the products you need.
            </p>

            <Link to="/products" className="cart-primary-button">
              Browse products
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container cart-container">

        {/* Page header */}
        <header className="cart-header">
          <div>
            <span className="cart-eyebrow">Shopping bag</span>
            <h1>Your cart</h1>
            <p>
              Review your selected medical supplies before proceeding to
              checkout.
            </p>
          </div>

          <div className="cart-item-count">
            <ShoppingBag size={17} />
            <span>
              {lines.length} {lines.length === 1 ? "item" : "items"}
            </span>
          </div>
        </header>

        <div className="cart-layout">

          {/* LEFT — CART ITEMS */}
          <main className="cart-content">

            <div className="cart-section-heading">
              <div>
                <span>Selected products</span>
                <h2>Items in your cart</h2>
              </div>

              <Link to="/products" className="cart-add-more">
                Add more products
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="cart-items">
              {lines.map(({ product, quantity }) => {
                const unitPrice = Number(product.selling_price);
                const lineTotal = unitPrice * quantity;

                return (
                  <article className="cart-item" key={product.id}>

                    {/* Product visual */}
                    <Link
                      to={`/products/${product.id}`}
                      className="cart-product-media"
                      aria-label={`View ${product.name}`}
                    >
                      <span>
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    </Link>

                    {/* Product information */}
                    <div className="cart-product-info">
                      <Link
                        to={`/products/${product.id}`}
                        className="cart-product-name"
                      >
                        {product.name}
                      </Link>

                      <div className="cart-product-meta">
                        <span>SKU</span>
                        <strong>{product.sku}</strong>
                      </div>

                      <div className="cart-product-price">
                        ₱
                        {unitPrice.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                        <span> / unit</span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="cart-quantity-area">
                      <span className="cart-control-label">
                        Quantity
                      </span>

                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${product.name}`}
                          disabled={quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="cart-item-total">
                      <span>Total</span>

                      <strong>
                        ₱
                        {lineTotal.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeFromCart(product.id)}
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                );
              })}
            </div>

            {/* Cart assurance */}
            <div className="cart-assurance">
              <div className="cart-assurance-item">
                <div className="cart-assurance-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <strong>Order reviewed by our team</strong>
                  <span>
                    Your order details are checked before fulfillment.
                  </span>
                </div>
              </div>

              <div className="cart-assurance-item">
                <div className="cart-assurance-icon">
                  <Truck size={18} />
                </div>

                <div>
                  <strong>Delivery confirmed after checkout</strong>
                  <span>
                    Our team will coordinate your delivery arrangements.
                  </span>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT — SUMMARY */}
          <aside className="cart-summary-card">

            <div className="cart-summary-top">
              <span className="cart-summary-eyebrow">
                Order overview
              </span>

              <h2>Order summary</h2>
            </div>

            <div className="cart-summary-lines">
              <div className="cart-summary-row">
                <span>
                  Items
                  <small>{lines.length} products</small>
                </span>

                <strong>
                  ₱
                  {subtotal.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong className="cart-summary-pending">
                  To be confirmed
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Payment</span>
                <strong className="cart-summary-pending">
                  To be arranged
                </strong>
              </div>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-total-row">
              <div>
                <span>Estimated total</span>
                <small>Before delivery charges</small>
              </div>

              <strong>
                ₱
                {subtotal.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to checkout
              <ArrowRight size={18} />
            </button>

            <Link
              to="/products"
              className="cart-continue-button"
            >
              Continue browsing
            </Link>

            <div className="cart-summary-note">
              <CheckCircle2 size={16} />

              <p>
                No payment is charged on this page. Delivery and payment
                arrangements will be confirmed with you by our team.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
