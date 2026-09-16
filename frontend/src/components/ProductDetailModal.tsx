import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import "../style/product-detail.css";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  function handleAddToCart() {
    if (!product.in_stock) return;

    addToCart(product, quantity);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  function handleBackdropClick(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="product-modal"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="product-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="product-modal-image">
          <div className="product-modal-image-circle">
            {product.name.charAt(0)}
          </div>

          {product.is_prescription && (
            <div className="product-modal-rx">
              <ShieldAlert size={15} />
              Prescription item
            </div>
          )}
        </div>

        <div className="product-modal-content">
          {product.category && (
            <span className="product-modal-category">
              {product.category.name}
            </span>
          )}

          <h2>{product.name}</h2>

          <p className="product-modal-sku">
            SKU {product.sku}
            {product.brand && ` · ${product.brand}`}
          </p>

          <div className="product-modal-status">
            {product.in_stock ? (
              <span className="modal-stock in">
                <CheckCircle2 size={15} />
                In stock
              </span>
            ) : (
              <span className="modal-stock out">
                <XCircle size={15} />
                Out of stock
              </span>
            )}
          </div>

          <div className="product-modal-divider" />

          <p className="product-modal-description">
            {product.description ||
              "No additional description provided for this product yet."}
          </p>

          <div className="product-modal-prices">
            <div className="modal-price">
              <span>Retail price</span>

              <strong>
                ₱
                {Number(
                  product.selling_price
                ).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            {Number(product.wholesale_price) > 0 && (
              <div className="modal-price secondary">
                <span>Wholesale price</span>

                <strong>
                  ₱
                  {Number(
                    product.wholesale_price
                  ).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </div>
            )}
          </div>

          <div className="product-modal-actions">
            <div className="modal-quantity">
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => q + 1)
                }
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              className="modal-add-button"
              disabled={!product.in_stock}
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
          </div>

          {added && (
            <div className="modal-added-message">
              <CheckCircle2 size={16} />
              Added {quantity} × {product.name} to your cart.
            </div>
          )}

          <Link
            to="/cart"
            className="modal-view-cart"
            onClick={onClose}
          >
            View cart
          </Link>

          <p className="product-modal-note">
            No payment is collected here. Submit your order
            and our team will contact you to confirm the
            details and arrange payment.
          </p>
        </div>
      </div>
    </div>
  );
}