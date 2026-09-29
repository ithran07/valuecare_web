import { ArrowUpRight, Package, Plus } from "lucide-react";

import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import "../style/product-card.css";

interface ProductCardProps {
  product: Product;
  onOpen: () => void;
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "";

  return Number(value).toLocaleString("en-PH", {
    maximumFractionDigits: 2,
  });
}

export default function ProductCard({
  product,
  onOpen,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const hasPackaging =
    product.pack_size !== null &&
    product.pack_size !== undefined &&
    Boolean(product.pack_unit);

  const unitName =
    product.unit?.name?.toLowerCase() || "unit";

  function handleAddToCart(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.stopPropagation();

    if (!product.in_stock) return;

    addToCart(product, 1);
  }

  return (
    <article
      className="product-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      {/* PRODUCT VISUAL */}
      <div className="product-card-media">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <>
            <div className="product-card-pattern" />

            <div className="product-card-initial">
              {product.name.charAt(0).toUpperCase()}
            </div>
          </>
        )}

        <div className="product-card-top">
          {product.category && (
            <span className="product-card-category">
              {product.category.name}
            </span>
          )}

          {product.is_prescription && (
            <span className="product-card-rx">
              Rx
            </span>
          )}
        </div>

        {!product.in_stock && (
          <div className="product-card-stock-overlay">
            Out of stock
          </div>
        )}

        <button
          type="button"
          className="product-card-view"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          aria-label={`View ${product.name}`}
        >
          <ArrowUpRight size={16} />
        </button>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="product-card-body">
        <div className="product-card-heading">
          <button
            type="button"
            className="product-card-name"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            {product.name}
          </button>

          {product.brand && (
            <span className="product-card-brand">
              {product.brand}
            </span>
          )}
        </div>

        {/* PACKAGING */}
        {hasPackaging && (
          <div className="product-card-packaging">
            <div className="packaging-icon">
              <Package size={15} />
            </div>

            <div className="packaging-copy">
              <strong>
                {formatNumber(product.pack_size)}{" "}
                {product.pack_unit}
              </strong>

              <span>
                per {unitName}
              </span>
            </div>

            {product.units_per_case !== null &&
              product.units_per_case !== undefined && (
                <>
                  <div className="packaging-separator" />

                  <div className="packaging-copy">
                    <strong>
                      {formatNumber(
                        product.units_per_case
                      )}
                    </strong>

                    <span>
                      {unitName}
                      {Number(
                        product.units_per_case
                      ) !== 1
                        ? "s"
                        : ""}{" "}
                      / case
                    </span>
                  </div>
                </>
              )}
          </div>
        )}

        {/* FOOTER */}
        <div className="product-card-footer">
          <div className="product-card-price-wrap">
            <span className="product-card-price-label">
              Price / {unitName}
            </span>

            <strong className="product-card-price">
              ₱
              {Number(
                product.selling_price
              ).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>

          <button
            type="button"
            className="product-card-add"
            disabled={!product.in_stock}
            onClick={handleAddToCart}
          >
            <span>
              {product.in_stock
                ? "Add"
                : "Unavailable"}
            </span>

            {product.in_stock && (
              <Plus size={15} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}