import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Info,
  Minus,
  Package,
  Plus,
  ShieldAlert,
  ShoppingCart,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import "../style/product-detail.css";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const formatNumber = (
  value: number | string | null | undefined
) => {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
  }).format(number);
};

const formatPrice = (
  value: number | string | null | undefined
) => {
  return `₱${formatNumber(value)}`;
};

const getOrderUnit = (product: Product) => {
  return (
    product.unit?.name ||
    product.unit?.abbreviation ||
    "unit"
  ).toLowerCase();
};

const getPackUnit = (product: Product) => {
  return (
    product.pack_unit ||
    "units"
  ).trim().toLowerCase();
};

export default function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasPackaging =
    product.pack_size !== null &&
    product.pack_size !== undefined &&
    Number(product.pack_size) > 0;

  const hasCaseQuantity =
    product.units_per_case !== null &&
    product.units_per_case !== undefined &&
    Number(product.units_per_case) > 0;

  const orderUnit = getOrderUnit(product);
  const packUnit = getPackUnit(product);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  useEffect(() => {
    if (!added) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAdded(false);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [added]);

  // Reset image state when another product is opened.
  useEffect(() => {
    setImageError(false);
    setQuantity(1);
    setAdded(false);
  }, [product.id]);

  const handleAddToCart = () => {
    if (!product.in_stock) return;

    addToCart(product, quantity);
    setAdded(true);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* CLOSE */}
        <button
          type="button"
          className="product-modal-close"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X
            size={21}
            strokeWidth={2}
          />
        </button>

        {/* ============================================================
            LEFT — PRODUCT GALLERY
        ============================================================ */}
        <section className="product-modal-gallery">
          <div className="gallery-topbar">
            <div className="gallery-brand">
              <span className="gallery-brand-mark">
                V
              </span>

              <div>
                <strong>VALUECARE</strong>
                <span>
                  Medical Supplies
                </span>
              </div>
            </div>

            {product.is_prescription && (
              <div className="gallery-rx-badge">
                <ShieldAlert size={14} />
                Prescription
              </div>
            )}
          </div>

          <div className="product-gallery-main">
            <div className="gallery-image-background" />

            <div className="gallery-main-image-wrap">
              {!imageError &&
              product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="gallery-main-image"
                  loading="eager"
                  decoding="async"
                  onError={() =>
                    setImageError(true)
                  }
                />
              ) : (
                <div className="gallery-image-fallback">
                  <Package size={58} />

                  <span>
                    {product.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="gallery-counter">
              <span>1</span>
              <span>/</span>
              <span>1</span>
            </div>
          </div>

          {/* Single product image thumbnail */}
          <div className="gallery-thumbnails">
            {!imageError &&
            product.image ? (
              <div className="gallery-thumbnail gallery-thumbnail-active">
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="gallery-thumbnail gallery-thumbnail-active gallery-thumbnail-fallback">
                <Package size={18} />
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
            RIGHT — PRODUCT INFORMATION
        ============================================================ */}
        <section className="product-modal-content">
          <div className="product-content-scroll">

            {/* HEADER */}
            <div className="product-detail-header">
              <div className="product-category">
                <span />
                {product.category?.name ||
                  "Medical Supplies"}
              </div>

              <div
                className={`product-stock ${
                  product.in_stock
                    ? "product-stock-available"
                    : "product-stock-unavailable"
                }`}
              >
                {product.in_stock ? (
                  <>
                    <CheckCircle2 size={15} />
                    In stock
                  </>
                ) : (
                  <>
                    <XCircle size={15} />
                    Out of stock
                  </>
                )}
              </div>
            </div>

            {/* PRODUCT NAME */}
            <h1
              id="product-modal-title"
              className="product-modal-title"
            >
              {product.name}
            </h1>

            {/* BRAND */}
            {product.brand && (
              <div className="product-identifiers">
                <span className="product-brand">
                  {product.brand}
                </span>
              </div>
            )}

            {/* DESCRIPTION */}
            {product.description && (
              <div className="product-description">
                <p>
                  {product.description}
                </p>
              </div>
            )}

            {/* PRODUCT DETAILS */}
            <section className="product-info-section product-details-section">
              <div className="section-heading compact-section-heading">
                <div className="section-heading-icon">
                  <Package size={15} />
                </div>

                <div>
                  <div className="product-details-title">
                    Product details
                  </div>

                  <div className="product-details-description">
                    Packaging and current pricing
                  </div>
                </div>
              </div>

              <div className="product-details-grid">
                {/* PACKAGING */}
                {hasPackaging && (
                  <div className="product-detail-item packaging-detail">
                    <span className="product-detail-label">
                      Packaging
                    </span>

                    <strong>
                      {formatNumber(
                        product.pack_size
                      )}{" "}
                      {packUnit}
                    </strong>

                    <small>
                      per {orderUnit}
                    </small>

                    {hasCaseQuantity && (
                      <small className="case-detail">
                        {formatNumber(
                          product.units_per_case
                        )}{" "}
                        / case
                      </small>
                    )}
                  </div>
                )}

                {/* RETAIL PRICE */}
                <div className="product-detail-item">
                  <span className="product-detail-label">
                    Retail price
                  </span>

                  <strong>
                    {formatPrice(
                      product.selling_price
                    )}
                  </strong>

                  <small>
                    per {orderUnit}
                  </small>
                </div>

                {/* WHOLESALE PRICE */}
                {Number(
                  product.wholesale_price
                ) > 0 && (
                  <div className="product-detail-item">
                    <span className="product-detail-label">
                      Wholesale
                    </span>

                    <strong className="wholesale-detail-price">
                      {formatPrice(
                        product.wholesale_price
                      )}
                    </strong>

                    <small>
                      per {orderUnit}
                    </small>
                  </div>
                )}
              </div>

              {hasPackaging && (
                <div className="product-details-summary">
                  <Package size={14} />

                  <span>
                    {formatNumber(
                      product.pack_size
                    )}{" "}
                    {packUnit} / {orderUnit}

                    {hasCaseQuantity && (
                      <>
                        {" • "}
                        {formatNumber(
                          product.units_per_case
                        )}{" "}
                        / case
                      </>
                    )}
                  </span>
                </div>
              )}
            </section>

            {/* ORDER */}
            <section className="order-section">
              <div className="order-header">
                <div>
                  <h2>
                    Order quantity
                  </h2>

                  <p>
                    {hasPackaging
                      ? `1 = ${formatNumber(
                          product.pack_size
                        )} ${packUnit} / ${orderUnit}`
                      : `1 = 1 ${orderUnit}`}
                  </p>
                </div>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>

                  <span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* TOTAL */}
              <div className="order-total-row">
                <div>
                  <span>
                    Estimated total
                  </span>

                  <strong>
                    {formatPrice(
                      Number(
                        product.selling_price
                      ) * quantity
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="add-to-cart-button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    !product.in_stock
                  }
                >
                  <ShoppingCart size={18} />

                  <span>
                    {product.in_stock
                      ? "Add to cart"
                      : "Out of stock"}
                  </span>
                </button>
              </div>

              {/* ADDED MESSAGE */}
              {added && (
                <div className="product-added-message">
                  <CheckCircle2 size={17} />

                  <div>
                    <strong>
                      Added to cart
                    </strong>

                    <span>
                      {quantity}{" "}
                      {quantity === 1
                        ? "order unit"
                        : "order units"}{" "}
                      added successfully.
                    </span>
                  </div>
                </div>
              )}

              {/* VIEW CART */}
              <button
                type="button"
                className="view-cart-button"
                onClick={() => {
                  onClose();
                  window.location.href =
                    "/cart";
                }}
              >
                View cart
                <ChevronRight size={16} />
              </button>
            </section>

            {/* ORDERING INFORMATION */}
            <div className="ordering-note">
              <div className="ordering-note-icon">
                <Truck size={17} />
              </div>

              <div>
                <strong>
                  Ordering information
                </strong>

                <p>
                  Submit your order online and
                  our team will contact you to
                  confirm availability, delivery
                  details, and payment
                  arrangements.
                </p>
              </div>

              <Info
                size={16}
                className="ordering-note-info"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}