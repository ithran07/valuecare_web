import { Plus } from "lucide-react";

import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import "../style/product-card.css";

interface ProductCardProps {
  product: Product;
  onOpen: () => void;
}

export default function ProductCard({
  product,
  onOpen,
}: ProductCardProps) {
  const { addToCart } = useCart();

  function handleAddToCart(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.stopPropagation();

    if (!product.in_stock) return;

    addToCart(product, 1);
  }

  return (
    <div
      className="product-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="product-card-media">
        <div className="product-card-initial">
          {product.name.charAt(0)}
        </div>

        {!product.in_stock && (
          <span className="product-card-tag out">
            Out of stock
          </span>
        )}

        {product.is_prescription && (
          <span className="product-card-tag rx">
            Rx
          </span>
        )}
      </div>

      <div className="product-card-body">
        {product.category && (
          <span className="product-card-category">
            {product.category.name}
          </span>
        )}

        <button
          type="button"
          className="product-card-name"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          {product.name}
        </button>

        <span className="product-card-sku">
          SKU {product.sku}
        </span>

        <div className="product-card-footer">
          <strong className="product-card-price">
            ₱
            {Number(product.selling_price).toLocaleString(
              "en-PH",
              {
                minimumFractionDigits: 2,
              }
            )}
          </strong>

          <button
            type="button"
            className="product-card-add"
            disabled={!product.in_stock}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}