import {
  ArrowRight,
  Building2,
  CheckCircle2,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Truck,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../style/about.css";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Reliability first",
    body: "We carefully manage batches, expiry dates, inventory, and orders so healthcare providers can purchase with confidence.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare-focused",
    body: "Our catalog is built around the everyday needs of clinics, hospitals, pharmacies, and other healthcare facilities.",
  },
  {
    icon: Users2,
    title: "People you can reach",
    body: "Our team is available to answer questions, confirm orders, and help make the purchasing process easier.",
  },
];

const HIGHLIGHTS = [
  {
    value: "Reliable",
    label: "Medical supply partner",
  },
  {
    value: "Local",
    label: "Northern Mindanao based",
  },
  {
    value: "Quality",
    label: "Products handled with care",
  },
  {
    value: "Responsive",
    label: "Support when you need it",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-pattern" />

        <div className="container about-hero-inner">
          <div className="about-hero-content">
            <span className="about-eyebrow">
              <span  />
              About ValueCare
            </span>

            <h1 style={{ color: "white" }}>
              Helping healthcare teams
              <span> stay ready.</span>
            </h1>

            <p>
              ValueCare Medical Supplies provides dependable access to medical
              consumables, pharmaceutical products, PPE, diagnostics, and
              everyday healthcare essentials.
            </p>

            <div className="about-hero-actions">
              <Link to="/products" className="about-primary-button">
                Explore products
                <ArrowRight size={17} />
              </Link>

              <a href="#our-values" className="about-secondary-button">
                What we stand for
              </a>
            </div>
          </div>

          <div className="about-hero-card">
            <div className="about-hero-card-icon">
              <HeartPulse size={28} />
            </div>

            <div>
              <strong>Healthcare starts with preparedness.</strong>
              <p>
                The right supplies, available when they are needed.
              </p>
            </div>

            <div className="about-hero-checks">
              <div>
                <CheckCircle2 size={17} />
                <span>Medical supplies</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Pharmaceutical products</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Reliable local support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="about-intro section">
        <div className="container about-intro-grid">
          <div className="about-intro-label">
            <span className="about-eyebrow dark">
              Who we are
            </span>
            <span className="about-intro-number">01</span>
          </div>

          <div className="about-intro-content">
            <h2>
              A dependable supply partner for the people who care for others.
            </h2>

            <p className="about-intro-lead">
              ValueCare Medical Supplies started with a simple goal: make
              healthcare supplies easier to source, easier to manage, and more
              dependable for the organizations that need them.
            </p>

            <p>
              From everyday consumables to pharmaceutical products, we focus
              on maintaining a practical range of healthcare essentials while
              keeping the purchasing experience straightforward.
            </p>

            <p>
              We believe supplying healthcare is more than moving products.
              It is about consistency, communication, and making sure our
              customers can focus on taking care of their patients.
            </p>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="about-highlights">
        <div className="container">
          <div className="about-highlights-grid">
            {HIGHLIGHTS.map((item) => (
              <div className="about-highlight" key={item.value}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section
        className="about-values section"
        id="our-values"
      >
        <div className="container">
          <div className="about-section-heading">
            <div>
              <span className="about-eyebrow dark">
                Our values
              </span>

              <h2>What we stand for</h2>
            </div>

            <p>
              A few principles guide how we serve healthcare providers and
              manage ValueCare every day.
            </p>
          </div>

          <div className="about-values-grid">
            {VALUES.map((value, index) => {
              const Icon = value.icon;

              return (
                <article className="about-value-card" key={value.title}>
                  <div className="about-value-top">
                    <span className="about-value-number">
                      0{index + 1}
                    </span>

                    <div className="about-value-icon">
                      <Icon size={22} strokeWidth={2} />
                    </div>
                  </div>

                  <h3>{value.title}</h3>

                  <p>{value.body}</p>

                  <div className="about-value-line" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY VALUECARE */}
      <section className="about-purpose section">
        <div className="container about-purpose-grid">
          <div className="about-purpose-visual">
            <div className="about-purpose-main-card">
              <div className="about-purpose-icon">
                <Building2 size={28} />
              </div>

              <span>ValueCare</span>
              <strong>Built around healthcare.</strong>
            </div>

            <div className="about-purpose-small-card">
              <Truck size={19} />
              <span>Supporting local healthcare delivery</span>
            </div>
          </div>

          <div className="about-purpose-content">
            <span className="about-eyebrow dark">
              Why ValueCare
            </span>

            <h2>
              Simple supply solutions for demanding healthcare environments.
            </h2>

            <p>
              Healthcare providers need supplies they can count on. We aim to
              make sourcing those supplies less complicated by combining a
              focused catalog with attentive service.
            </p>

            <div className="about-purpose-list">
              <div>
                <CheckCircle2 size={19} />
                <span>
                  Practical products for everyday healthcare operations
                </span>
              </div>

              <div>
                <CheckCircle2 size={19} />
                <span>
                  Careful attention to stock, batches, and expiry information
                </span>
              </div>

              <div>
                <CheckCircle2 size={19} />
                <span>
                  Local support for customers across Northern Mindanao
                </span>
              </div>

              <div>
                <CheckCircle2 size={19} />
                <span>
                  A straightforward ordering experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="about-location section">
        <div className="container">
          <div className="about-location-card">
            <div className="about-location-content">
              <span className="about-eyebrow dark">
                Visit or reach us
              </span>

              <h2>Cagayan de Oro, Northern Mindanao</h2>

              <p>
                Our warehouse and office serve healthcare customers in Cagayan
                de Oro and across Northern Mindanao. If you would like to
                arrange a pickup or discuss an order, reach out to our team
                ahead of time.
              </p>

              <div className="about-location-detail">
                <div className="about-location-detail-icon">
                  <MapPin size={19} />
                </div>

                <div>
                  <span>Our location</span>
                  <strong>
                    ValueCare Medical Supplies
                  </strong>
                  <p>
                    Office #211, Waterside Living Complex Julio Pacana St., Cagayan de Oro City, Misamis Oriental, Philippines
                  </p>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Waterside+Living+Complex+Julio+Pacana+Street+Cagayan+de+Oro"
                target="_blank"
                rel="noreferrer"
                className="about-map-button"
              >
                Open in Google Maps
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="about-map">
              <iframe
                title="ValueCare location"
                src="https://www.google.com/maps?q=Waterside+Living+Complex+Julio+Pacana+Street+Cagayan+de+Oro+City&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta-inner">
            <div>
              <span className="about-eyebrow">
                Ready when you are
              </span>

              <h2>
                Find the supplies your healthcare team needs.
              </h2>

              <p>
                Browse our catalog or get in touch with ValueCare for your
                next order.
              </p>
            </div>

            <Link to="/products" className="about-cta-button">
              Browse products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}