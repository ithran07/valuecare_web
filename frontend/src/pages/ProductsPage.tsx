import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { api } from "../api";
import type { Category, Product } from "../types";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import "../style/products.css";

interface ProductsResponse {
  results: Product[];
  next: string | null;
  previous: string | null;
  count: number;
}

const SORT_OPTIONS = [
  {
    value: "name",
    label: "Name (A–Z)",
  },
  {
    value: "-name",
    label: "Name (Z–A)",
  },
  {
    value: "selling_price",
    label: "Price: Low to high",
  },
  {
    value: "-selling_price",
    label: "Price: High to low",
  },
];

function CustomDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected =
    options.find((option) => option.value === value) ||
    options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      className={`products-dropdown ${
        open ? "open" : ""
      }`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="products-dropdown-trigger"
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          <small>Sort by</small>
          {selected.label}
        </span>

        <ChevronDown
          size={17}
          className="products-dropdown-chevron"
        />
      </button>

      {open && (
        <div className="products-dropdown-menu">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`products-dropdown-option ${
                value === option.value ? "selected" : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>

              {value === option.value && (
                <span className="dropdown-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const search = searchParams.get("search") || "";
  const categoryId =
    searchParams.get("category") || "";
  const ordering =
    searchParams.get("ordering") || "name";

  useEffect(() => {
    api
      .get("/catalog/categories/")
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    api
      .get<ProductsResponse>("/catalog/products/", {
        params: {
          search,
          category: categoryId || undefined,
          ordering,
          page,
        },
      })
      .then((res) => {
        setProducts(res.data.results);
        setCount(res.data.count);
      })
      .catch(() => {
        setProducts([]);
        setCount(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, categoryId, ordering, page]);

  function updateParam(
    key: string,
    value: string
  ) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next);
    setPage(1);
  }

  function clearFilters() {
    const next = new URLSearchParams();

    if (search) {
      next.set("search", search);
    }

    setSearchParams(next);
    setPage(1);
  }

  const selectedCategory = categories.find(
    (category) =>
      String(category.id) === categoryId
  );

  const hasFilters =
    Boolean(categoryId) || ordering !== "name";

  return (
    <>
      <main className="products-page">
        {/* ================================================
            PAGE HEADER
        ================================================= */}

        <section className="products-header">
          <div className="container">
            <div className="products-header-content">
              <div>
                <span className="products-eyebrow">
                  VALUECARE CATALOG
                </span>

                <h1>
                  Medical supplies
                  <br />
                  you can count on.
                </h1>

                <p>
                  Browse our selection of trusted medical
                  supplies, equipment, and clinic essentials.
                </p>
              </div>

              <div className="products-header-icon">
                <PackageSearch size={44} />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            MAIN CONTENT
        ================================================= */}

        <section className="products-content container">
          {/* Search summary */}

          <div className="products-top-row">
            <div className="products-results">
              <h2>
                {search
                  ? `Results for "${search}"`
                  : "All products"}
              </h2>

              <p>
                {loading
                  ? "Finding products..."
                  : `${count} product${
                      count === 1 ? "" : "s"
                    } available`}
              </p>
            </div>

            <button
              type="button"
              className="mobile-filter-button"
              onClick={() =>
                setMobileFilters(true)
              }
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>

          {/* ==============================================
              FILTER BAR
          =============================================== */}

          <div className="products-filter-bar">
            <div className="products-filter-left">
              <div className="filter-label">
                <Filter size={15} />
                Categories
              </div>

              <div className="products-category-list">
                <button
                  type="button"
                  className={`category-filter ${
                    !categoryId ? "active" : ""
                  }`}
                  onClick={() =>
                    updateParam("category", "")
                  }
                >
                  All products
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    className={`category-filter ${
                      categoryId ===
                      String(category.id)
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      updateParam(
                        "category",
                        String(category.id)
                      )
                    }
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <CustomDropdown
              value={ordering}
              options={SORT_OPTIONS}
              onChange={(value) =>
                updateParam("ordering", value)
              }
            />
          </div>

          {/* ==============================================
              ACTIVE FILTERS
          =============================================== */}

          {hasFilters && (
            <div className="active-filters">
              <span>Active filters:</span>

              {selectedCategory && (
                <button
                  type="button"
                  onClick={() =>
                    updateParam("category", "")
                  }
                >
                  {selectedCategory.name}
                  <X size={13} />
                </button>
              )}

              {ordering !== "name" && (
                <button
                  type="button"
                  onClick={() =>
                    updateParam("ordering", "name")
                  }
                >
                  {
                    SORT_OPTIONS.find(
                      (option) =>
                        option.value === ordering
                    )?.label
                  }
                  <X size={13} />
                </button>
              )}

              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {/* ==============================================
              PRODUCTS
          =============================================== */}

          {!loading && products.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon">
                <Search size={30} />
              </div>

              <h3>No products found</h3>

              <p>
                We couldn't find any products matching
                your current search or filters.
              </p>

              {(search || categoryId) && (
                <button
                  type="button"
                  onClick={() => {
                    const next =
                      new URLSearchParams();
                    setSearchParams(next);
                    setPage(1);
                  }}
                >
                  Clear search and filters
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {loading
                ? Array.from({ length: 8 }).map(
                    (_, index) => (
                      <div
                        className="product-card-skeleton"
                        key={index}
                      >
                        <div className="skeleton-media" />

                        <div className="skeleton-body">
                          <div className="skeleton-line tiny" />
                          <div className="skeleton-line" />
                          <div className="skeleton-line short" />

                          <div className="skeleton-footer">
                            <div className="skeleton-price" />
                            <div className="skeleton-circle" />
                          </div>
                        </div>
                      </div>
                    )
                  )
                : products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={() =>
                        setSelectedProduct(product)
                      }
                    />
                  ))}
            </div>
          )}

          {/* ==============================================
              PAGINATION
          =============================================== */}

          {!loading && count > 0 && (
            <div className="products-pagination">
              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
              >
                Previous
              </button>

              <div className="pagination-current">
                <span>Page</span>
                <strong>{page}</strong>
              </div>

              <button
                type="button"
                disabled={page * 24 >= count}
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ================================================
          MOBILE FILTER DRAWER
      ================================================= */}

      {mobileFilters && (
        <div
          className="mobile-filter-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setMobileFilters(false);
            }
          }}
        >
          <div className="mobile-filter-drawer">
            <div className="mobile-filter-header">
              <div>
                <span>FILTER PRODUCTS</span>
                <h3>Browse by category</h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="mobile-filter-options">
              <button
                type="button"
                className={`mobile-category-option ${
                  !categoryId ? "active" : ""
                }`}
                onClick={() => {
                  updateParam("category", "");
                  setMobileFilters(false);
                }}
              >
                <span>All products</span>

                {!categoryId && (
                  <span>✓</span>
                )}
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`mobile-category-option ${
                    categoryId ===
                    String(category.id)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    updateParam(
                      "category",
                      String(category.id)
                    );
                    setMobileFilters(false);
                  }}
                >
                  <span>{category.name}</span>

                  {categoryId ===
                    String(category.id) && (
                    <span>✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mobile-filter-sort">
              <span>Sort products</span>

              <CustomDropdown
                value={ordering}
                options={SORT_OPTIONS}
                onChange={(value) =>
                  updateParam("ordering", value)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================
          PRODUCT MODAL
      ================================================= */}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() =>
            setSelectedProduct(null)
          }
        />
      )}
    </>
  );
}