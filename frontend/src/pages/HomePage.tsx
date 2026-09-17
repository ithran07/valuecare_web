import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  PackageCheck,
  PhoneCall,
  Pill,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Syringe,
  Truck,
} from "lucide-react";

import { api } from "../api";
import type { Category } from "../types";
import "../style/home.css";

import HeroImage from "../assets/office.png";

const HOW_IT_WORKS = [
  {
    number: "01",
    icon: ShoppingBag,
    title: "Browse what you need",
    body:
      "Explore our catalog, compare products, check pricing, and see available stock before placing your request.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Submit your order",
    body:
      "Add your required supplies to the cart and provide your delivery and contact information.",
  },
  {
    number: "03",
    icon: PhoneCall,
    title: "We confirm with you",
    body:
      "Our team reviews your request and contacts you to confirm quantities, availability, payment, and delivery.",
  },
];

const CATEGORY_ICONS = [
  Syringe,
  Stethoscope,
  Pill,
  Boxes,
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Quality-focused",
    text: "Carefully sourced healthcare supplies",
  },
  {
    icon: PackageCheck,
    title: "Stock visibility",
    text: "Know what's available before ordering",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    text: "Delivery coordinated after confirmation",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get("/catalog/categories/")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  return (
    <main className="home-page">
      {
        /* =========================================================
          HERO
      ========================================================= */
      }

      <section
        className={`home-hero ${HeroImage ? "has-image" : ""}`}
        style={HeroImage
          ? {
            backgroundImage: `url(${HeroImage})`,
          }
          : undefined}
      >
        <div className="home-hero-overlay" />

        <div className="container home-hero-inner">
          <div className="home-hero-content">
            <div className="home-eyebrow">
              <span/>
              Medical & healthcare supplies
            </div>

            <h1>
              Supplies your clinic can count on,
              <span> every single order.</span>
            </h1>

            <p className="home-hero-description">
              ValueCare provides dependable medical supplies, equipment, and
              healthcare products for clinics, hospitals, pharmacies, and
              healthcare professionals.
            </p>

            <div className="home-hero-actions">
              <Link
                to="/products"
                className="home-btn home-btn-primary"
              >
                Browse products
              </Link>

              <Link
                to="/contact"
                className="home-btn home-btn-outline"
              >
                Talk to our team
              </Link>
            </div>

            <div className="home-hero-meta">
              <div className="home-hero-meta-item">
                <CheckCircle2 size={17} />
                <span>Transparent pricing</span>
              </div>

              <div className="home-hero-meta-item">
                <CheckCircle2 size={17} />
                <span>Stock visibility</span>
              </div>

              <div className="home-hero-meta-item">
                <CheckCircle2 size={17} />
                <span>Personal confirmation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container home-trust-wrapper">
          <div className="home-trust-bar">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="home-trust-item"
                  key={item.title}
                >
                  <div className="home-trust-icon">
                    <Icon size={19} />
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {
        /* =========================================================
          CATEGORIES
      ========================================================= */
      }

      {categories.length > 0 && (
        <section className="home-section home-categories">
          <div className="container">
            <div className="home-section-heading">
              <div>
                <span className="home-section-label">
                  Explore our catalog
                </span>

                <h2>
                  Everything you need,
                  <br />
                  in one place.
                </h2>
              </div>

              <div className="home-section-heading-side">
                <p>
                  Browse our growing range of medical and healthcare supplies
                  for everyday clinical needs.
                </p>

                <Link
                  to="/products"
                  className="home-text-link"
                >
                  View all products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="home-category-grid">
              {categories.slice(0, 8).map((category, index) => {
                const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length];

                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="home-category-card"
                  >
                    <div className="home-category-icon">
                      <Icon size={23} />
                    </div>

                    <div className="home-category-content">
                      <span>{category.name}</span>

                      <small>
                        Explore products
                        <ArrowRight size={14} />
                      </small>
                    </div>

                    <ArrowRight
                      className="home-category-arrow"
                      size={18}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {
        /* =========================================================
          WHY VALUECARE
      ========================================================= */
      }

      <section className="home-section home-why">
        <div className="container">
          <div className="home-why-grid">
            <div className="home-why-intro">
              <span className="home-section-label">
                Why ValueCare
              </span>

              <h2>
                Healthcare supply should be
                <span> simple and dependable.</span>
              </h2>

              <p>
                We designed ValueCare around the everyday needs of healthcare
                businesses — from finding the right product to confirming
                availability and arranging delivery.
              </p>

              <Link
                to="/about"
                className="home-text-link"
              >
                Learn more about ValueCare
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="home-benefits">
              <div className="home-benefit-card">
                <div className="home-benefit-number">
                  01
                </div>

                <div>
                  <h3>Know before you order</h3>
                  <p>
                    See product information, pricing, and available stock while
                    browsing our catalog.
                  </p>
                </div>
              </div>

              <div className="home-benefit-card">
                <div className="home-benefit-number">
                  02
                </div>

                <div>
                  <h3>A real person confirms your order</h3>
                  <p>
                    We review your request and personally confirm important
                    details before fulfillment.
                  </p>
                </div>
              </div>

              <div className="home-benefit-card">
                <div className="home-benefit-number">
                  03
                </div>

                <div>
                  <h3>Built for repeat purchasing</h3>
                  <p>
                    Easily return to products your clinic, pharmacy, or
                    organization regularly needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {
        /* =========================================================
          HOW IT WORKS
      ========================================================= */
      }

      <section className="home-section home-process">
        <div className="container">
          <div className="home-section-heading centered">
            <span className="home-section-label">
              Simple ordering process
            </span>

            <h2>
              From catalog to confirmed order.
            </h2>

            <p>
              No complicated checkout process. Find your supplies, submit your
              request, and let our team handle the confirmation.
            </p>
          </div>

          <div className="home-process-grid">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  className="home-process-card"
                  key={step.number}
                >
                  <div className="home-process-top">
                    <span className="home-process-number">
                      {step.number}
                    </span>

                    <div className="home-process-icon">
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.body}</p>

                  <div className="home-process-line" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {
        /* =========================================================
          SERVICE STRIP
      ========================================================= */
      }

      <section className="home-service-strip">
        <div className="container home-service-inner">
          <div className="home-service-icon">
            <Clock3 size={23} />
          </div>

          <div className="home-service-content">
            <strong>Need help with a supply request?</strong>
            <span>
              Our team is available to help with product availability,
              quantities, and delivery arrangements.
            </span>
          </div>

          <Link
            to="/contact"
            className="home-service-link"
          >
            Contact our team
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {
        /* =========================================================
          FINAL CTA
      ========================================================= */
      }

      <section className="home-final-cta">
        <div className="container">
          <div className="home-final-card">
            <div className="home-final-content">
              <span className="home-section-label light">
                Get started today
              </span>

              <h2>
                Ready to find the supplies your team needs?
              </h2>

              <p>
                Browse our catalog or speak with our team about your next
                healthcare supply order.
              </p>
            </div>

            <div className="home-final-actions">
              <Link
                to="/products"
                className="home-btn home-btn-primary"
              >
                Browse products
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                className="home-btn home-btn-light-outline"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
