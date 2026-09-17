import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeNavigation() {
    setOpen(false);
    setAccountOpen(false);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();

    const value = query.trim();

    navigate(
      value
        ? `/products?search=${encodeURIComponent(value)}`
        : "/products",
    );

    closeNavigation();
  }

  function navigateAccount(path: string) {
    closeNavigation();
    navigate(path);
  }

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

      navigate("/products", {
        replace: true,
      });
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <header className="site-navbar">
        <div className="site-navbar-container">
          {/* =====================================================
              BRAND
          ====================================================== */}

          <Link
            to="/"
            className="site-navbar-brand"
            onClick={closeNavigation}
          >
            <div className="site-navbar-brand-logo">
              <img
                src={ValueCareLogo}
                alt="ValueCare Medical Supplies"
              />
            </div>

            <div className="site-navbar-brand-copy">
              <strong>
                Value<span>Care</span>
              </strong>

              <small>Medical Supplies</small>
            </div>
          </Link>

          {/* =====================================================
              DESKTOP NAVIGATION
          ====================================================== */}

          <nav className="site-navbar-navigation">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `site-navbar-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={closeNavigation}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* =====================================================
              DESKTOP SEARCH
          ====================================================== */}

          <form
            className="site-navbar-search"
            onSubmit={submitSearch}
          >
            <Search size={18} />

            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <button
              type="submit"
              aria-label="Search"
              className="site-navbar-search-submit"
            >
              <ArrowRight size={16} />
            </button>
          </form>

          {/* =====================================================
              ACTIONS
          ====================================================== */}

          <div className="site-navbar-actions">
            {/* ACCOUNT */}

            <div
              className="site-navbar-account"
              ref={accountRef}
            >
              {session ? (
                <>
                  <button
                    type="button"
                    className={`site-navbar-profile-button ${
                      accountOpen ? "is-open" : ""
                    }`}
                    aria-label="Open account menu"
                    aria-haspopup="menu"
                    aria-expanded={accountOpen}
                    onClick={() => {
                      setAccountOpen((value) => !value);
                      setOpen(false);
                    }}
                  >
                    <span className="site-navbar-profile-icon">
                      <UserRound size={19} />
                    </span>

                    <span className="site-navbar-profile-label">
                      Account
                    </span>
                  </button>

                  {accountOpen && (
                    <div
                      className="site-navbar-account-panel"
                      role="menu"
                    >
                      {/* HEADER */}

                      <div className="site-navbar-account-top">
                        <div className="site-navbar-account-avatar">
                          <UserRound size={21} />
                        </div>

                        <div className="site-navbar-account-user">
                          <strong>My Account</strong>

                          <span>
                            {session.user.email}
                          </span>
                        </div>
                      </div>

                      {/* MENU */}

                      <div className="site-navbar-account-menu">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            navigateAccount(
                              "/account/orders",
                            )
                          }
                        >
                          <span className="account-menu-icon">
                            <ClipboardList size={18} />
                          </span>

                          <span className="account-menu-copy">
                            <strong>Orders</strong>
                            <small>
                              View your orders
                            </small>
                          </span>

                          <ArrowRight
                            size={16}
                            className="account-menu-arrow"
                          />
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            navigateAccount(
                              "/account/profile",
                            )
                          }
                        >
                          <span className="account-menu-icon">
                            <UserRound size={18} />
                          </span>

                          <span className="account-menu-copy">
                            <strong>Profile</strong>
                            <small>
                              Personal information
                            </small>
                          </span>

                          <ArrowRight
                            size={16}
                            className="account-menu-arrow"
                          />
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            navigateAccount(
                              "/account/security",
                            )
                          }
                        >
                          <span className="account-menu-icon">
                            <LockKeyhole size={18} />
                          </span>

                          <span className="account-menu-copy">
                            <strong>Change password</strong>
                            <small>
                              Manage account security
                            </small>
                          </span>

                          <ArrowRight
                            size={16}
                            className="account-menu-arrow"
                          />
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            navigateAccount(
                              "/account/address",
                            )
                          }
                        >
                          <span className="account-menu-icon">
                            <MapPin size={18} />
                          </span>

                          <span className="account-menu-copy">
                            <strong>Saved address</strong>
                            <small>
                              Manage delivery address
                            </small>
                          </span>

                          <ArrowRight
                            size={16}
                            className="account-menu-arrow"
                          />
                        </button>
                      </div>

                      {/* LOGOUT */}

                      <div className="site-navbar-account-footer">
                        <button
                          type="button"
                          className="account-logout-button"
                          role="menuitem"
                          onClick={openSignOutModal}
                        >
                          <span>
                            <LogOut size={18} />
                          </span>

                          <strong>Logout</strong>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/account"
                  className="site-navbar-signin"
                  onClick={closeNavigation}
                >
                  <span className="site-navbar-profile-icon">
                    <UserRound size={19} />
                  </span>

                  <span>Sign in</span>
                </Link>
              )}
            </div>

            {/* CART */}

            <Link
              to="/cart"
              className="site-navbar-cart-button"
              aria-label={`Shopping cart${
                itemCount > 0
                  ? `, ${itemCount} items`
                  : ""
              }`}
              onClick={closeNavigation}
            >
              <ShoppingCart size={20} />

              <span className="site-navbar-cart-label">
                Cart
              </span>

              {itemCount > 0 && (
                <span className="site-navbar-cart-count">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* MOBILE MENU */}

            <button
              type="button"
              className="site-navbar-mobile-toggle"
              aria-label={
                open
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={open}
              onClick={() => {
                setOpen((value) => !value);
                setAccountOpen(false);
              }}
            >
              {open ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}

        {open && (
          <div className="site-navbar-mobile">
            <div className="site-navbar-mobile-inner">
              {/* MOBILE SEARCH */}

              <form
                className="site-navbar-mobile-search"
                onSubmit={submitSearch}
              >
                <Search size={19} />

                <input
                  type="search"
                  aria-label="Search products"
                  placeholder="Search products"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                />

                <button type="submit">
                  Search
                </button>
              </form>

              {/* NAV LINKS */}

              <nav className="site-navbar-mobile-navigation">
                <div className="mobile-navigation-label">
                  Explore
                </div>

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

                    <ArrowRight size={18} />
                  </NavLink>
                ))}
              </nav>

              {/* MOBILE ACCOUNT */}

              {session && (
                <div className="site-navbar-mobile-account">
                  <div className="mobile-navigation-label">
                    My Account
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigateAccount(
                        "/account/orders",
                      )
                    }
                  >
                    <span>
                      <ClipboardList size={18} />
                      Orders
                    </span>

                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigateAccount(
                        "/account/profile",
                      )
                    }
                  >
                    <span>
                      <UserRound size={18} />
                      Profile
                    </span>

                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigateAccount(
                        "/account/security",
                      )
                    }
                  >
                    <span>
                      <LockKeyhole size={18} />
                      Change password
                    </span>

                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigateAccount(
                        "/account/address",
                      )
                    }
                  >
                    <span>
                      <MapPin size={18} />
                      Saved address
                    </span>

                    <ArrowRight size={17} />
                  </button>
                </div>
              )}

              {/* MOBILE CART */}

              <Link
                to="/cart"
                className="site-navbar-mobile-cart"
                onClick={closeNavigation}
              >
                <span>
                  <ShoppingCart size={19} />
                  Shopping cart
                </span>

                <span className="mobile-cart-right">
                  {itemCount > 0 && (
                    <strong>
                      {itemCount}
                    </strong>
                  )}

                  <ArrowRight size={17} />
                </span>
              </Link>

              {/* MOBILE LOGOUT */}

              {session && (
                <button
                  type="button"
                  className="site-navbar-mobile-logout"
                  onClick={openSignOutModal}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =======================================================
          SIGN OUT MODAL
      ======================================================== */}

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
    </>
  );
}