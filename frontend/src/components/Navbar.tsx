import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  User,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SignOutModal from "../components/SignOutModal";
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
  const { session, signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const accountRef = useRef<HTMLDivElement>(null);

  function openSignOutModal() {
    setAccountOpen(false);
    setOpen(false);
    setShowSignOut(true);
  }

  async function handleSignOut() {
    if (signingOut) return;

    try {
      setSigningOut(true);

      await signOut();

      setShowSignOut(false);
      navigate("/products", { replace: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setSigningOut(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target as Node,
        )
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /*
   * Close account dropdown with Escape.
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  function submitSearch(e: FormEvent) {
    e.preventDefault();

    const value = query.trim();

    navigate(
      value ? `/products?search=${encodeURIComponent(value)}` : "/products",
    );

    setOpen(false);
    setAccountOpen(false);
  }

  function navigateAccount(path: string) {
    setAccountOpen(false);
    setOpen(false);

    navigate(path);
  }

  function closeSignOutModal() {
    setShowSignOut(false);
  }

  async function confirmSignOut() {
    setShowSignOut(false);
    setAccountOpen(false);
    setOpen(false);

    await signOut();

    navigate("/products", {
      replace: true,
    });
  }

  return (
    <header className="site-navbar">
      <div className="container site-navbar-inner">
        {/* BRAND */}

        <Link
          to="/"
          className="site-navbar-brand"
          onClick={() => {
            setOpen(false);
            setAccountOpen(false);
          }}
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
          className={`site-navbar-links ${open ? "is-open" : ""}`}
        >
          <div className="site-navbar-main-links">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `site-navbar-link ${isActive ? "active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  setAccountOpen(false);
                }}
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
          {/* ACCOUNT */}

          {session
            ? (
              <div
                className="site-navbar-account"
                ref={accountRef}
              >
                <button
                  type="button"
                  className={`site-navbar-action site-navbar-account-trigger ${
                    accountOpen ? "is-open" : ""
                  }`}
                  aria-label="My account"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => {
                    setAccountOpen(
                      (value) => !value,
                    );

                    setOpen(false);
                  }}
                >
                  <User size={19} />

                  <ChevronDown
                    size={13}
                    className="site-navbar-account-chevron"
                  />
                </button>

                {/* ACCOUNT DROPDOWN */}

                {accountOpen && (
                  <div
                    className="site-navbar-account-dropdown"
                    role="menu"
                  >
                    {/* ACCOUNT HEADER */}

                    <div className="site-navbar-account-header">
                      <div className="site-navbar-account-avatar">
                        <UserRound size={18} />
                      </div>

                      <div className="site-navbar-account-header-text">
                        <strong>
                          My Account
                        </strong>

                        <span>
                          {session.user.email}
                        </span>
                      </div>
                    </div>

                    <div className="site-navbar-account-divider" />

                    {/* ORDERS */}

                    <button
                      type="button"
                      className="site-navbar-account-item"
                      role="menuitem"
                      onClick={() =>
                        navigateAccount(
                          "/account/orders",
                        )}
                    >
                      <span className="site-navbar-account-item-icon">
                        <ClipboardList size={17} />
                      </span>

                      <span className="site-navbar-account-item-content">
                        <strong>
                          Orders
                        </strong>

                        <small>
                          View your orders
                        </small>
                      </span>

                      <ArrowRight
                        size={15}
                        className="site-navbar-account-item-arrow"
                      />
                    </button>

                    {/* PROFILE */}

                    <button
                      type="button"
                      className="site-navbar-account-item"
                      role="menuitem"
                      onClick={() =>
                        navigateAccount(
                          "/account/profile",
                        )}
                    >
                      <span className="site-navbar-account-item-icon">
                        <UserRound size={17} />
                      </span>

                      <span className="site-navbar-account-item-content">
                        <strong>
                          Profile
                        </strong>

                        <small>
                          Personal information
                        </small>
                      </span>

                      <ArrowRight
                        size={15}
                        className="site-navbar-account-item-arrow"
                      />
                    </button>

                    {/* CHANGE PASSWORD */}

                    <button
                      type="button"
                      className="site-navbar-account-item"
                      role="menuitem"
                      onClick={() =>
                        navigateAccount(
                          "/account/security",
                        )}
                    >
                      <span className="site-navbar-account-item-icon">
                        <LockKeyhole size={17} />
                      </span>

                      <span className="site-navbar-account-item-content">
                        <strong>
                          Change password
                        </strong>

                        <small>
                          Manage account security
                        </small>
                      </span>

                      <ArrowRight
                        size={15}
                        className="site-navbar-account-item-arrow"
                      />
                    </button>

                    {/* SAVED ADDRESS */}

                    <button
                      type="button"
                      className="site-navbar-account-item"
                      role="menuitem"
                      onClick={() =>
                        navigateAccount(
                          "/account/address",
                        )}
                    >
                      <span className="site-navbar-account-item-icon">
                        <MapPin size={17} />
                      </span>

                      <span className="site-navbar-account-item-content">
                        <strong>
                          Saved address
                        </strong>

                        <small>
                          Manage delivery address
                        </small>
                      </span>

                      <ArrowRight
                        size={15}
                        className="site-navbar-account-item-arrow"
                      />
                    </button>

                    <div className="site-navbar-account-divider" />

                    {/* LOGOUT */}

                    <button
                      type="button"
                      className="site-navbar-account-item site-navbar-account-logout"
                      role="menuitem"
                      onClick={openSignOutModal}
                    >
                      <span className="site-navbar-account-item-icon">
                        <LogOut size={17} />
                      </span>

                      <span className="site-navbar-account-item-content">
                        <strong>
                          Logout
                        </strong>

                        <small>
                          Sign out of your account
                        </small>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )
            : (
              <Link
                to="/account"
                className="site-navbar-action"
                aria-label="Sign in"
                onClick={() => {
                  setOpen(false);
                  setAccountOpen(false);
                }}
              >
                <User size={19} />
              </Link>
            )}

          {/* CART */}

          <Link
            to="/cart"
            className="site-navbar-action site-navbar-cart"
            aria-label="Shopping cart"
            onClick={() => {
              setOpen(false);
              setAccountOpen(false);
            }}
          >
            <ShoppingCart size={19} />

            {itemCount > 0 && (
              <span className="site-navbar-badge">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* MOBILE MENU */}

          <button
            type="button"
            className="site-navbar-menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => {
              setOpen((value) => !value);
              setAccountOpen(false);
            }}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
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
                  `site-navbar-mobile-link ${isActive ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span>
                  {link.label}
                </span>

                <ArrowRight size={16} />
              </NavLink>
            ))}
          </div>

          {/* MOBILE SEARCH */}

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

          {/* MOBILE ACCOUNT */}

          {session && (
            <div className="site-navbar-mobile-account">
              <div className="site-navbar-mobile-account-title">
                <UserRound size={17} />

                <span>
                  My Account
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigateAccount(
                    "/account/orders",
                  )}
              >
                <span>
                  <ClipboardList size={16} />
                  Orders
                </span>

                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateAccount(
                    "/account/profile",
                  )}
              >
                <span>
                  <UserRound size={16} />
                  Profile
                </span>

                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateAccount(
                    "/account/security",
                  )}
              >
                <span>
                  <LockKeyhole size={16} />
                  Change password
                </span>

                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateAccount(
                    "/account/address",
                  )}
              >
                <span>
                  <MapPin size={16} />
                  Saved address
                </span>

                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="site-navbar-mobile-logout"
                onClick={openSignOutModal}
              >
                <span>
                  <LogOut size={16} />
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SIGN OUT MODAL */}

      {showSignOut && (
        <SignOutModal
          onCancel={() => {
            if (!signingOut) {
              setShowSignOut(false);
            }
          }}
          onConfirm={handleSignOut}
          loading={signingOut}
        />
      )}
    </header>
  );
}
