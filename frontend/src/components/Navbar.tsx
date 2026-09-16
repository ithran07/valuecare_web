import { useState, type FormEvent } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  ArrowRight,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../style/navbar.css";
import ValueCareLogo from "../assets/ValueCareLogoNoBG.png";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/track-order", label: "Track order" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { itemCount } = useCart();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  function submitSearch(e: FormEvent) {
    e.preventDefault();

    const value = query.trim();

    navigate(
      value
        ? `/products?search=${encodeURIComponent(value)}`
        : "/products"
    );

    setOpen(false);
  }

  return (
    <header className="site-navbar">

      <div className="container site-navbar-inner">

        {/* BRAND */}

        <Link
          to="/"
          className="site-navbar-brand"
          onClick={() => setOpen(false)}
        >

          <div className="site-navbar-logo">
            <img
              src={ValueCareLogo}
              alt="ValueCare Medical Supplies"
            />
          </div>

          <div className="site-navbar-brand-text">
            <strong>
              Value<span>Care</span>
            </strong>

            <small>
              Medical Supplies
            </small>
          </div>

        </Link>


        {/* DESKTOP NAV */}

        <nav
          className={`site-navbar-links ${
            open ? "is-open" : ""
          }`}
        >

          <div className="site-navbar-main-links">

            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `site-navbar-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

          </div>


          {/* SEARCH */}

          <form
            className="site-navbar-search"
            onSubmit={submitSearch}
          >

            <Search size={16} />

            <input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

          </form>

        </nav>


        {/* ACTIONS */}

        <div className="site-navbar-actions">

          <Link
            to="/account"
            className="site-navbar-action"
            aria-label="My account"
          >
            <User size={19} />
          </Link>

          <Link
            to="/cart"
            className="site-navbar-action site-navbar-cart"
            aria-label="Shopping cart"
          >

            <ShoppingCart size={19} />

            {itemCount > 0 && (
              <span className="site-navbar-badge">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}

          </Link>


          <button
            type="button"
            className="site-navbar-menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

        </div>

      </div>


      {/* MOBILE MENU */}

      {open && (
        <div className="site-navbar-mobile">

          <div className="site-navbar-mobile-links">

            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `site-navbar-mobile-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <span>{link.label}</span>
                <ArrowRight size={16} />
              </NavLink>
            ))}

          </div>


          <form
            className="site-navbar-mobile-search"
            onSubmit={submitSearch}
          >

            <Search size={17} />

            <input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

          </form>

        </div>
      )}

    </header>
  );
}