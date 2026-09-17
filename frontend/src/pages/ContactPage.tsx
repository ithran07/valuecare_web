import { FormEvent, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";

import { api } from "../api";
import "../style/contact.css";

const CONTACT_DETAILS = [
  {
    icon: MapPin,
    label: "Visit us",
    value:
      "Office #211, Waterside Living Complex Julio Pacana St., Cagayan de Oro City, Misamis Oriental, Philippines",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+63 917 326 4998",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "valuecaremedsupplies@gmail.com",
  },
  {
    icon: Clock3,
    label: "Business hours",
    value: "Sunday–Friday, 9:00 AM – 3:00 PM",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  function update<K extends keyof typeof form>(
    key: K,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      await api.post("/contact/", form);

      setStatus("sent");

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="contact-page">
      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-grid" />

        <div className="container contact-hero-inner">
          <div>
            <span className="contact-eyebrow">
              <span />
              Contact ValueCare
            </span>

            <h1 style={{ color: "white" }}>
              Let's make your next
              <span> order easier.</span>
            </h1>

            <p>
              Questions about a product, bulk pricing, availability, or
              delivery? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-layout">
            {/* FORM */}
            <div className="contact-form-card">
              <div className="contact-form-heading">
                <div className="contact-form-icon">
                  <Send size={19} />
                </div>

                <div>
                  <span>Send us a message</span>
                  <h2>How can we help?</h2>
                </div>
              </div>

              {status === "sent" && (
                <div className="contact-alert contact-success">
                  <CheckCircle2 size={19} />

                  <div>
                    <strong>Message received</strong>
                    <p>
                      Thanks — we've received your message and will
                      get back to you soon.
                    </p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="contact-alert contact-error">
                  <ShieldCheck size={19} />

                  <div>
                    <strong>Something went wrong</strong>
                    <p>
                      We couldn't send your message. Please try again.
                    </p>
                  </div>
                </div>
              )}

              <form
                className="contact-form"
                onSubmit={submit}
              >
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="name">
                      Name <span>*</span>
                    </label>

                    <input
                      id="name"
                      placeholder="Your name"
                      required
                      value={form.name}
                      onChange={(e) =>
                        update("name", e.target.value)
                      }
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="phone">
                      Phone
                    </label>

                    <input
                      id="phone"
                      placeholder="+63 9XX XXX XXXX"
                      value={form.phone}
                      onChange={(e) =>
                        update("phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="email">
                    Email <span>*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={(e) =>
                      update("email", e.target.value)
                    }
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="subject">
                    Subject
                  </label>

                  <input
                    id="subject"
                    placeholder="What can we help you with?"
                    value={form.subject}
                    onChange={(e) =>
                      update("subject", e.target.value)
                    }
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message">
                    Message <span>*</span>
                  </label>

                  <textarea
                    id="message"
                    rows={6}
                    required
                    placeholder="Tell us what you need..."
                    value={form.message}
                    onChange={(e) =>
                      update("message", e.target.value)
                    }
                  />
                </div>

                <div className="contact-form-footer">
                  <div className="contact-form-note">
                    <ShieldCheck size={15} />
                    <span>
                      Your information is kept private and used only
                      to respond to your inquiry.
                    </span>
                  </div>

                  <button
                    className="contact-submit"
                    disabled={status === "sending"}
                    type="submit"
                  >
                    <Send size={16} />

                    {status === "sending"
                      ? "Sending..."
                      : "Send message"}
                  </button>
                </div>
              </form>
            </div>

            {/* CONTACT INFORMATION */}
            <aside className="contact-sidebar">
              <div className="contact-info-header">
                <span>Contact information</span>
                <h2 style={{ color: "white" }}>We're here to help.</h2>
                <p>
                  Reach out directly or visit our office in Cagayan de
                  Oro City.
                </p>
              </div>

              <div className="contact-info-list">
                {CONTACT_DETAILS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="contact-info-item"
                      key={item.label}
                    >
                      <div className="contact-info-icon">
                        <Icon size={18} />
                      </div>

                      <div>
                        <span>{item.label}</span>
                        <p>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="contact-sidebar-note">
                <div>
                  <Clock3 size={17} />
                </div>

                <p>
                  Messages received outside business hours will be
                  reviewed when our team is available.
                </p>
              </div>
            </aside>
          </div>

          {/* MAP */}
          <div className="contact-location">
            <div className="contact-location-content">
              <span className="contact-eyebrow-dark">
                Our location
              </span>

              <h2>Find ValueCare in Cagayan de Oro</h2>

              <p>
                Our office is located at Waterside Living Complex on
                Julio Pacana Street.
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Waterside+Living+Complex+Julio+Pacana+Street+Cagayan+de+Oro"
                target="_blank"
                rel="noreferrer"
                className="contact-map-link"
              >
                <MapPin size={16} />
                Open in Google Maps
              </a>
            </div>

            <div className="contact-map">
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
    </main>
  );
}

