import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Minus, Plus, ShieldAlert, XCircle } from "lucide-react";

import { api } from "../api";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import "../style/product-detail.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/catalog/products/${id}/`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container product-detail-state">Loading product...</div>;

  if (!product) {
    return (
      <div className="container product-detail-state">
        <p>We couldn't find that product.</p>
        <Link to="/products" className="btn btn-secondary">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="container product-detail">
      <div className="product-detail-media">
        <span>{product.name.charAt(0)}</span>
      </div>

      <div className="product-detail-info">
        {product.category && <span className="product-card-category">{product.category.name}</span>}
        <h1>{product.name}</h1>
        <span className="product-detail-sku">SKU {product.sku} {product.brand && `· ${product.brand}`}</span>

        <div className="product-detail-stock">
          {product.in_stock ? (
            <span className="stock-pill in"><CheckCircle2 size={15} /> In stock</span>
          ) : (
            <span className="stock-pill out"><XCircle size={15} /> Out of stock</span>
          )}
          {product.is_prescription && (
            <span className="stock-pill rx"><ShieldAlert size={15} /> Prescription required</span>
          )}
        </div>

        <p className="product-detail-desc">
          {product.description || "No additional description provided for this product yet."}
        </p>

        <div className="product-detail-price-row">
          <div>
            <span className="price-label">Retail price</span>
            <strong className="price-value">
              ₱{Number(product.selling_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </strong>
          </div>
          {Number(product.wholesale_price) > 0 && (
            <div>
              <span className="price-label">Wholesale price</span>
              <strong className="price-value muted">
                ₱{Number(product.wholesale_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </strong>
            </div>
          )}
        </div>

        <div className="product-detail-actions">
          <div className="quantity-stepper">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              <Minus size={15} />
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
              <Plus size={15} />
            </button>
          </div>

          <button
            className="btn btn-primary"
            disabled={!product.in_stock}
            onClick={() => {
              addToCart(product, quantity);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
          >
            Add to cart
          </button>

          <Link to="/cart" className="btn btn-ghost">View cart</Link>
        </div>

        {added && <p className="added-confirmation">Added {quantity} × {product.name} to your cart.</p>}

        <p className="product-detail-note">
          No payment is collected here — submit your order and our team will
          contact you to confirm details and arrange payment.
        </p>
      </div>
    </div>
  );
}
