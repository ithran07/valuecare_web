import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "../style/profile.css";

export default function ProfilePage() {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container profile-container">

        <Link to="/account" className="profile-back">
          <ArrowLeft size={16} />
          Back to account
        </Link>

        <header className="profile-header">
          <span className="profile-eyebrow">
            Customer account
          </span>

          <h1>Profile</h1>

          <p>
            View your account information and ValueCare
            customer details.
          </p>
        </header>

        <div className="profile-layout">

          <aside className="profile-sidebar">
            <div className="profile-avatar">
              <UserRound size={34} />
            </div>

            <strong>{session.user.email}</strong>

            <span>ValueCare customer</span>

            <div className="profile-sidebar-status">
              <span />
              Active account
            </div>
          </aside>

          <main className="profile-content">

            <section className="profile-card">
              <div className="profile-card-header">
                <div>
                  <span className="profile-section-label">
                    Account information
                  </span>

                  <h2>Personal details</h2>
                </div>

                <UserRound size={21} />
              </div>

              <div className="profile-details">

                <div className="profile-detail">
                  <div className="profile-detail-icon">
                    <Mail size={18} />
                  </div>

                  <div>
                    <span>Email address</span>
                    <strong>{session.user.email}</strong>
                  </div>
                </div>

                <div className="profile-detail">
                  <div className="profile-detail-icon">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <span>Account status</span>
                    <strong>Active</strong>
                  </div>
                </div>

              </div>
            </section>

            <section className="profile-card profile-info-card">
              <div className="profile-info-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h3>Your information is protected</h3>

                <p>
                  Your account is used to securely access your
                  ValueCare order history. You can continue to
                  checkout as a guest whenever you prefer.
                </p>
              </div>
            </section>

            <div className="profile-actions">
              <Link
                to="/account/orders"
                className="profile-primary-button"
              >
                View my orders
              </Link>

              <Link
                to="/products"
                className="profile-secondary-button"
              >
                Browse products
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}