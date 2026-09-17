import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "../style/account.css";

type AddressForm = {
  recipient_name: string;
  phone: string;
  house_unit: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  delivery_instructions: string;
};

const EMPTY_FORM: AddressForm = {
  recipient_name: "",
  phone: "",
  house_unit: "",
  street: "",
  barangay: "",
  city: "",
  province: "",
  postal_code: "",
  country: "Philippines",
  delivery_instructions: "",
};

export default function AddressPage() {
  const { session } = useAuth();

  const [form, setForm] =
    useState<AddressForm>(EMPTY_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadAddress() {
      setLoading(true);
      setError("");

      try {
        const response =
          await api.get(
            "/account/profile/"
          );

        if (cancelled) return;

        const data =
          response?.data || {};

        setForm({
          recipient_name:
            data.recipient_name || "",

          phone:
            data.phone || "",

          house_unit:
            data.house_unit || "",

          street:
            data.street || "",

          barangay:
            data.barangay || "",

          city:
            data.city || "",

          province:
            data.province || "",

          postal_code:
            data.postal_code || "",

          country:
            data.country ||
            "Philippines",

          delivery_instructions:
            data.delivery_instructions ||
            "",
        });
      } catch (err) {
        console.error(
          "Failed to load address:",
          err
        );

        if (!cancelled) {
          setError(
            "We couldn't load your saved address."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAddress();

    return () => {
      cancelled = true;
    };
  }, [session]);

  function update(
    key: keyof AddressForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
    setError("");
  }

  function validate() {
    const requiredFields: Array<
      [keyof AddressForm, string]
    > = [
      [
        "recipient_name",
        "recipient name",
      ],
      [
        "phone",
        "phone number",
      ],
      [
        "house_unit",
        "house / unit / building",
      ],
      [
        "street",
        "street",
      ],
      [
        "barangay",
        "barangay",
      ],
      [
        "city",
        "city / municipality",
      ],
      [
        "province",
        "province",
      ],
      [
        "postal_code",
        "postal code",
      ],
      [
        "country",
        "country",
      ],
    ];

    for (const [
      key,
      label,
    ] of requiredFields) {
      if (!form[key].trim()) {
        return `Please enter your ${label}.`;
      }
    }

    return "";
  }

  async function save(
    e: FormEvent
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      await api.patch(
        "/account/profile/",
        {
          recipient_name:
            form.recipient_name.trim(),

          phone:
            form.phone.trim(),

          house_unit:
            form.house_unit.trim(),

          street:
            form.street.trim(),

          barangay:
            form.barangay.trim(),

          city:
            form.city.trim(),

          province:
            form.province.trim(),

          postal_code:
            form.postal_code.trim(),

          country:
            form.country.trim(),

          delivery_instructions:
            form.delivery_instructions.trim(),
        }
      );

      setMessage(
        "Your delivery address has been saved."
      );
    } catch (err: any) {
      console.error(
        "Failed to save address:",
        err
      );

      const detail =
        err?.response?.data;

      if (
        detail &&
        typeof detail === "object"
      ) {
        const firstField =
          Object.values(detail)[0];

        if (
          Array.isArray(firstField) &&
          typeof firstField[0] ===
            "string"
        ) {
          setError(firstField[0]);
        } else {
          setError(
            "We couldn't save your address. Please check your details."
          );
        }
      } else {
        setError(
          "We couldn't save your address. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (!session) {
    return (
      <div className="account-page">
        <div className="container account-container">
          <div className="account-disabled">
            <div className="account-disabled-icon">
              <UserRound size={30} />
            </div>

            <span className="account-eyebrow">
              Account required
            </span>

            <h1>
              Sign in to manage your address
            </h1>

            <p>
              Your saved delivery address is
              available to signed-in customers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="account-page">
        <div className="container account-container">
          <div className="account-loading">
            <div className="account-loading-spinner" />
            <span>
              Loading your address...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="container account-container">

        <div className="account-subpage-header">
          <Link
            to="/account"
            className="account-back-link"
          >
            <ArrowLeft size={16} />
            Back to account
          </Link>

          <span className="account-eyebrow">
            Delivery address
          </span>

          <h1>
            Your saved address
          </h1>

          <p>
            Keep your delivery information
            updated so checkout is faster and
            more convenient.
          </p>
        </div>

        <form
          className="account-form-card"
          onSubmit={save}
        >
          <section className="account-form-section">

            <div className="account-form-section-heading">
              <div className="account-form-section-icon">
                <MapPin size={18} />
              </div>

              <div>
                <h2>
                  Delivery information
                </h2>

                <p>
                  Enter the address where you'd
                  like your orders delivered.
                </p>
              </div>
            </div>

            <div className="account-form-grid">

              <div className="account-field">
                <span>
                  <UserRound size={14} />
                  Recipient name
                </span>

                <input
                  type="text"
                  value={
                    form.recipient_name
                  }
                  onChange={(e) =>
                    update(
                      "recipient_name",
                      e.target.value
                    )
                  }
                  placeholder="Juan Dela Cruz"
                />
              </div>

              <div className="account-field">
                <span>
                  <Phone size={14} />
                  Phone number
                </span>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    update(
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="09XX XXX XXXX"
                />
              </div>

              <div className="account-field">
                <span>
                  <Home size={14} />
                  House / Unit / Building
                </span>

                <input
                  type="text"
                  value={
                    form.house_unit
                  }
                  onChange={(e) =>
                    update(
                      "house_unit",
                      e.target.value
                    )
                  }
                  placeholder="Unit 4B, ABC Building"
                />
              </div>

              <div className="account-field">
                <span>
                  Street
                </span>

                <input
                  type="text"
                  value={form.street}
                  onChange={(e) =>
                    update(
                      "street",
                      e.target.value
                    )
                  }
                  placeholder="J.P. Laurel Avenue"
                />
              </div>

              <div className="account-field">
                <span>
                  Barangay
                </span>

                <input
                  type="text"
                  value={form.barangay}
                  onChange={(e) =>
                    update(
                      "barangay",
                      e.target.value
                    )
                  }
                  placeholder="Bajada"
                />
              </div>

              <div className="account-field">
                <span>
                  City / Municipality
                </span>

                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    update(
                      "city",
                      e.target.value
                    )
                  }
                  placeholder="Davao City"
                />
              </div>

              <div className="account-field">
                <span>
                  Province
                </span>

                <input
                  type="text"
                  value={form.province}
                  onChange={(e) =>
                    update(
                      "province",
                      e.target.value
                    )
                  }
                  placeholder="Davao del Sur"
                />
              </div>

              <div className="account-field">
                <span>
                  Postal code
                </span>

                <input
                  type="text"
                  value={
                    form.postal_code
                  }
                  onChange={(e) =>
                    update(
                      "postal_code",
                      e.target.value
                    )
                  }
                  placeholder="8000"
                />
              </div>

              <div className="account-field account-field-full">
                <span>
                  Country
                </span>

                <input
                  type="text"
                  value={form.country}
                  onChange={(e) =>
                    update(
                      "country",
                      e.target.value
                    )
                  }
                  placeholder="Philippines"
                />
              </div>

            </div>
          </section>

          <div className="account-form-divider" />

          <section className="account-form-section">

            <div className="account-form-section-heading">
              <div className="account-form-section-icon">
                <MapPin size={18} />
              </div>

              <div>
                <h2>
                  Delivery instructions
                </h2>

                <p>
                  Optional information that can
                  help us with your delivery.
                </p>
              </div>
            </div>

            <div className="account-field">
              <span>
                Delivery instructions
              </span>

              <textarea
                value={
                  form.delivery_instructions
                }
                onChange={(e) =>
                  update(
                    "delivery_instructions",
                    e.target.value
                  )
                }
                placeholder="Example: Please call when you arrive. Leave the order with the receptionist."
              />

              <small>
                You can include landmarks,
                preferred contact instructions,
                or other useful delivery details.
              </small>
            </div>
          </section>

          {error && (
            <div className="account-form-message account-form-message-error">
              {error}
            </div>
          )}

          {message && (
            <div className="account-form-message account-form-message-success">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          <div className="account-form-actions">
            <Link
              to="/account"
              className="account-secondary-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="account-primary-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="account-button-spinner"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save address
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}