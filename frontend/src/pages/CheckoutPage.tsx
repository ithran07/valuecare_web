import { FormEvent, useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Home,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { api } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../style/checkout.css";

const CUSTOMER_TYPES = [
  {
    value: "INDIVIDUAL",
    label: "Individual",
  },
  {
    value: "CLINIC",
    label: "Clinic",
  },
  {
    value: "HOSPITAL",
    label: "Hospital",
  },
  {
    value: "PHARMACY",
    label: "Pharmacy",
  },
  {
    value: "DISTRIBUTOR",
    label: "Distributor",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

type CheckoutForm = {
  contact_name: string;
  business_name: string;
  customer_type: string;
  email: string;
  phone: string;

  recipient_name: string;
  house_unit: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;

  delivery_instructions: string;
  notes: string;
};

export default function CheckoutPage() {
  const {
    lines,
    subtotal,
    clearCart,
  } = useCart();

  const { session } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState<CheckoutForm>({
    contact_name: "",
    business_name: "",
    customer_type: "INDIVIDUAL",
    email: session?.user.email || "",
    phone: "",

    recipient_name: "",
    house_unit: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Philippines",

    delivery_instructions: "",
    notes: "",
  });

  const [
    loadingSavedProfile,
    setLoadingSavedProfile,
  ] = useState(false);

  const [
    hasSavedProfile,
    setHasSavedProfile,
  ] = useState(false);

  const [
    hasSavedAddress,
    setHasSavedAddress,
  ] = useState(false);

  const [
    saveAsDefaultAddress,
    setSaveAsDefaultAddress,
  ] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [customerTypeOpen, setCustomerTypeOpen] = useState(false);

  const selectedCustomerType = CUSTOMER_TYPES.find(
    (type) => type.value === form.customer_type,
  ) || CUSTOMER_TYPES[0];

  useEffect(() => {
    if (!session?.user.email) return;

    setForm((current) => ({
      ...current,
      email: current.email.trim() ||
        session.user.email ||
        "",
    }));
  }, [session]);

  useEffect(() => {
    if (!session) {
      setLoadingSavedProfile(false);
      setHasSavedProfile(false);
      setHasSavedAddress(false);
      return;
    }

    let cancelled = false;

    async function loadSavedProfile() {
      setLoadingSavedProfile(true);

      try {
        const response = await api.get(
          "/account/profile/",
        );

        if (cancelled) return;

        const profile = response?.data || {};

        const firstName = profile.first_name?.trim() || "";

        const lastName = profile.last_name?.trim() || "";

        const fullName = `${firstName} ${lastName}`.trim();

        const savedBusiness = profile.business_name?.trim() || "";

        const savedPhone = profile.phone?.trim() || "";

        const savedRecipient = profile.recipient_name?.trim() || "";

        const savedAddressFields = [
          savedRecipient,
          profile.house_unit,
          profile.street,
          profile.barangay,
          profile.city,
          profile.province,
          profile.postal_code,
          profile.country,
        ].some(
          (value) => String(value || "").trim(),
        );

        const savedType = profile.customer_type ||
          "INDIVIDUAL";

        const savedEmail = session?.user?.email || "";

        setForm((current) => ({
          ...current,

          contact_name: current.contact_name.trim()
            ? current.contact_name
            : fullName,

          business_name: current.business_name.trim()
            ? current.business_name
            : savedBusiness,

          customer_type: current.customer_type !==
              "INDIVIDUAL"
            ? current.customer_type
            : savedType,

          email: current.email.trim() ? current.email : savedEmail,

          phone: current.phone.trim() ? current.phone : savedPhone,

          recipient_name: current.recipient_name.trim()
            ? current.recipient_name
            : savedRecipient,

          house_unit: current.house_unit.trim()
            ? current.house_unit
            : profile.house_unit || "",

          street: current.street.trim() ? current.street : profile.street || "",

          barangay: current.barangay.trim()
            ? current.barangay
            : profile.barangay || "",

          city: current.city.trim() ? current.city : profile.city || "",

          province: current.province.trim()
            ? current.province
            : profile.province || "",

          postal_code: current.postal_code.trim()
            ? current.postal_code
            : profile.postal_code || "",

          country: current.country.trim() &&
              current.country !==
                "Philippines"
            ? current.country
            : profile.country ||
              "Philippines",

          delivery_instructions: current.delivery_instructions.trim()
            ? current.delivery_instructions
            : profile.delivery_instructions ||
              "",
        }));

        setHasSavedProfile(
          Boolean(
            fullName ||
              savedBusiness ||
              savedPhone,
          ),
        );

        setHasSavedAddress(
          savedAddressFields,
        );
      } catch (err) {
        console.error(
          "Failed to load saved customer profile:",
          err,
        );

        if (!cancelled) {
          setHasSavedProfile(false);
          setHasSavedAddress(false);
        }
      } finally {
        if (!cancelled) {
          setLoadingSavedProfile(false);
        }
      }
    }

    loadSavedProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  function update<K extends keyof CheckoutForm>(
    key: K,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
  }

  function continueToDelivery() {
    setError("");

    if (!form.contact_name.trim()) {
      setError(
        "Please enter your full name.",
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Please enter your phone number.",
      );
      return;
    }

    if (!form.email.trim()) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    /*
     * Convenience:
     * If no recipient has been entered yet,
     * use the customer/contact person's name.
     *
     * The field remains editable because the
     * recipient may be a different person.
     */
    setForm((current) => ({
      ...current,
      recipient_name: current.recipient_name.trim() ||
        current.contact_name.trim(),
    }));

    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function backToCustomer() {
    setError("");

    setStep(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getErrorMessage(
    error: any,
  ) {
    const detail = error?.response?.data;

    if (!detail) {
      return (
        "We couldn't submit your order. Please try again."
      );
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (
      typeof detail.detail ===
        "string"
    ) {
      return detail.detail;
    }

    const firstField = Object.values(detail)[0];

    if (
      Array.isArray(firstField) &&
      typeof firstField[0] ===
        "string"
    ) {
      return firstField[0];
    }

    if (
      typeof firstField ===
        "string"
    ) {
      return firstField;
    }

    return (
      "We couldn't submit your order. Please check your details and try again."
    );
  }

  async function saveDefaultAddress() {
    if (
      !session ||
      !saveAsDefaultAddress
    ) {
      return;
    }

    try {
      await api.patch(
        "/account/profile/",
        {
          recipient_name: form.recipient_name.trim(),

          phone: form.phone.trim(),

          house_unit: form.house_unit.trim(),

          street: form.street.trim(),

          barangay: form.barangay.trim(),

          city: form.city.trim(),

          province: form.province.trim(),

          postal_code: form.postal_code.trim(),

          country: form.country.trim(),

          delivery_instructions: form.delivery_instructions.trim(),
        },
      );
    } catch (err) {
      console.error(
        "Failed to save default delivery address:",
        err,
      );
    }
  }

  async function submit(
    e: FormEvent,
  ) {
    e.preventDefault();

    setError("");

    if (lines.length === 0) {
      setError(
        "Your cart is empty.",
      );
      return;
    }

    const requiredAddressFields: Array<
      [keyof CheckoutForm, string]
    > = [
      [
        "recipient_name",
        "recipient name",
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

    for (
      const [
        key,
        label,
      ] of requiredAddressFields
    ) {
      if (!form[key].trim()) {
        setError(
          `Please enter your ${label}.`,
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      await saveDefaultAddress();

      const payload = {
        contact_name: form.contact_name.trim(),

        business_name: form.business_name.trim(),

        customer_type: form.customer_type,

        email: form.email.trim(),

        phone: form.phone.trim(),

        recipient_name: form.recipient_name.trim(),

        house_unit: form.house_unit.trim(),

        street: form.street.trim(),

        barangay: form.barangay.trim(),

        city: form.city.trim(),

        province: form.province.trim(),

        postal_code: form.postal_code.trim(),

        country: form.country.trim(),

        delivery_instructions: form.delivery_instructions.trim(),

        notes: form.notes.trim(),

        items: lines.map(
          (line) => ({
            product_id: line.product.id,
            quantity: line.quantity,
          }),
        ),
      };

      const response = await api.post(
        "/orders/",
        payload,
      );

      if (!response?.data) {
        throw new Error(
          "The server did not return an order.",
        );
      }

      clearCart();

      navigate(
        "/order-confirmation",
        {
          replace: true,
          state: {
            order: response.data,
          },
        },
      );
    } catch (err: any) {
      console.error(
        "Order submission failed:",
        err,
      );

      setError(
        getErrorMessage(err),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const itemCount = lines.reduce(
    (total, line) => total + Number(line.quantity),
    0,
  );

  if (lines.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="checkout-empty-card">
          <div className="checkout-empty-icon">
            <ClipboardList size={28} />
          </div>

          <span className="checkout-empty-label">
            Your cart
          </span>

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add medical supplies to your cart before continuing to checkout.
          </p>

          <Link
            to="/products"
            className="checkout-empty-button"
          >
            Browse products
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {
          /* =====================================================
            HEADER
        ===================================================== */
        }

        <header className="checkout-header">
          <Link
            to="/cart"
            className="checkout-back-link"
          >
            <ArrowLeft size={15} />
            Back to cart
          </Link>

          <div className="checkout-heading">
            <div>
              <span className="checkout-eyebrow">
                ValueCare
              </span>

              <h1>
                Complete your order
              </h1>

              <p>
                Review your information and provide the delivery details for
                your order.
              </p>
            </div>

            <div className="checkout-secure-badge">
              <ShieldCheck size={16} />

              <span>
                Secure checkout
              </span>
            </div>
          </div>
        </header>

        {
          /* =====================================================
            PROGRESS
        ===================================================== */
        }

        <div className="checkout-progress">
          <button
            type="button"
            className={`checkout-progress-step ${
              step === 1 ? "is-active" : "is-complete"
            }`}
            onClick={() => {
              if (step === 2) {
                backToCustomer();
              }
            }}
          >
            <span className="checkout-progress-circle">
              {step === 2 ? <Check size={14} /> : (
                "1"
              )}
            </span>

            <span className="checkout-progress-copy">
              <strong>
                Customer information
              </strong>

              <small>
                Contact details
              </small>
            </span>
          </button>

          <div
            className={`checkout-progress-connector ${
              step === 2 ? "is-active" : ""
            }`}
          />

          <div
            className={`checkout-progress-step ${
              step === 2 ? "is-active" : ""
            }`}
          >
            <span className="checkout-progress-circle">
              2
            </span>

            <span className="checkout-progress-copy">
              <strong>
                Delivery details
              </strong>

              <small>
                Address & delivery
              </small>
            </span>
          </div>
        </div>

        {
          /* =====================================================
            MAIN
        ===================================================== */
        }

        <div className="checkout-layout">
          <form
            className="checkout-form"
            onSubmit={submit}
          >
            {
              /* =================================================
                STEP 1
            ================================================= */
            }

            {step === 1 && (
              <section className="checkout-card">
                <div className="checkout-section-top">
                  <div className="checkout-section-icon">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <span className="checkout-section-label">
                      Step 01
                    </span>

                    <h2>
                      Customer information
                    </h2>

                    <p>
                      Tell us who we should contact about this order.
                    </p>
                  </div>
                </div>

                {session &&
                  loadingSavedProfile && (
                  <div className="checkout-loading-notice">
                    <div className="checkout-loading-icon">
                      <Loader2
                        size={16}
                        className="checkout-spin"
                      />
                    </div>

                    <div>
                      <strong>
                        Loading saved information
                      </strong>

                      <span>
                        Retrieving your customer profile...
                      </span>
                    </div>
                  </div>
                )}

                {session &&
                  hasSavedProfile &&
                  !loadingSavedProfile && (
                  <div className="checkout-success-notice">
                    <div className="checkout-notice-icon">
                      <CheckCircle2 size={17} />
                    </div>

                    <div>
                      <strong>
                        Saved information loaded
                      </strong>

                      <span>
                        Your account details have been filled in automatically.
                        You can edit them before continuing.
                      </span>
                    </div>
                  </div>
                )}

                <div className="checkout-fields">
                  <div className="checkout-field">
                    <label htmlFor="contact-name">
                      Full name
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="checkout-control">
                      <UserRound size={16} />

                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Juan Dela Cruz"
                        value={form.contact_name}
                        onChange={(e) =>
                          update(
                            "contact_name",
                            e.target.value,
                          )}
                        required
                      />
                    </div>

                    <small className="checkout-field-hint">
                      Customer or contact person
                    </small>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="business-name">
                      Business / facility
                      <span className="optional">
                        Optional
                      </span>
                    </label>

                    <div className="checkout-control">
                      <Building2 size={16} />

                      <input
                        id="business-name"
                        type="text"
                        placeholder="ABC Medical Clinic"
                        value={form.business_name}
                        onChange={(e) =>
                          update(
                            "business_name",
                            e.target.value,
                          )}
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="customer-type">
                      Customer type
                      <span className="required">*</span>
                    </label>

                    <div className="checkout-react-dropdown">
                      <button
                        type="button"
                        id="customer-type"
                        className={`checkout-dropdown-trigger ${
                          customerTypeOpen ? "is-open" : ""
                        }`}
                        onClick={() =>
                          setCustomerTypeOpen(
                            (current) => !current,
                          )}
                        aria-haspopup="listbox"
                        aria-expanded={customerTypeOpen}
                      >
                        <Building2 size={19} />

                        <span>
                          {selectedCustomerType.label}
                        </span>

                        <ChevronDown
                          size={18}
                          className="checkout-dropdown-chevron"
                        />
                      </button>

                      {customerTypeOpen && (
                        <div
                          className="checkout-dropdown-menu"
                          role="listbox"
                        >
                          {CUSTOMER_TYPES.map((type) => (
                            <button
                              type="button"
                              key={type.value}
                              className={`checkout-dropdown-option ${
                                form.customer_type ===
                                    type.value
                                  ? "is-selected"
                                  : ""
                              }`}
                              onClick={() => {
                                update(
                                  "customer_type",
                                  type.value,
                                );

                                setCustomerTypeOpen(false);
                              }}
                              role="option"
                              aria-selected={form.customer_type ===
                                type.value}
                            >
                              <span>
                                {type.label}
                              </span>

                              {form.customer_type ===
                                  type.value && <Check size={18} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="phone">
                      Phone number
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="checkout-control">
                      <Phone size={16} />

                      <input
                        id="phone"
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        value={form.phone}
                        onChange={(e) =>
                          update(
                            "phone",
                            e.target.value,
                          )}
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field checkout-field-full">
                    <label htmlFor="email">
                      Email address
                      <span className="required">
                        *
                      </span>
                    </label>

                    <div className="checkout-control">
                      <Mail size={16} />

                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                          update(
                            "email",
                            e.target.value,
                          )}
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="checkout-error">
                    <span className="checkout-error-mark">
                      !
                    </span>

                    <span>
                      {error}
                    </span>
                  </div>
                )}

                <div className="checkout-actions">
                  <div className="checkout-action-note">
                    <ShieldCheck size={15} />

                    <span>
                      Your information is used only to process your order.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="checkout-primary-button"
                    onClick={continueToDelivery}
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                </div>
              </section>
            )}

            {
              /* =================================================
                STEP 2
            ================================================= */
            }

            {step === 2 && (
              <section className="checkout-card">
                <div className="checkout-section-top">
                  <div className="checkout-section-icon">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <span className="checkout-section-label">
                      Step 02
                    </span>

                    <h2>
                      Delivery details
                    </h2>

                    <p>
                      Provide the recipient and complete delivery address.
                    </p>
                  </div>
                </div>

                {session &&
                  hasSavedAddress &&
                  !loadingSavedProfile && (
                  <div className="checkout-success-notice">
                    <div className="checkout-notice-icon">
                      <CheckCircle2 size={17} />
                    </div>

                    <div>
                      <strong>
                        Saved address loaded
                      </strong>

                      <span>
                        Your default delivery address has been filled in. You
                        can update it for this order.
                      </span>
                    </div>
                  </div>
                )}

                {
                  /* =============================================
                    RECIPIENT
                ============================================= */
                }

                <div className="checkout-subsection">
                  <div className="checkout-subsection-heading">
                    <div className="checkout-subsection-number">
                      01
                    </div>

                    <div>
                      <h3>
                        Recipient
                      </h3>

                      <p>
                        Who should receive the order?
                      </p>
                    </div>
                  </div>

                  <div className="checkout-fields">
                    <div className="checkout-field">
                      <label htmlFor="recipient-name">
                        Recipient name
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="checkout-control">
                        <UserRound size={16} />

                        <input
                          id="recipient-name"
                          type="text"
                          placeholder="Juan Dela Cruz"
                          value={form.recipient_name}
                          onChange={(e) =>
                            update(
                              "recipient_name",
                              e.target.value,
                            )}
                          disabled={loadingSavedProfile}
                          required
                        />
                      </div>

                      <small className="checkout-field-hint">
                        This can be different from the customer/contact person.
                      </small>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="address-phone">
                        Delivery phone
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="checkout-control">
                        <Phone size={16} />

                        <input
                          id="address-phone"
                          type="tel"
                          placeholder="09XX XXX XXXX"
                          value={form.phone}
                          onChange={(e) =>
                            update(
                              "phone",
                              e.target.value,
                            )}
                          disabled={loadingSavedProfile}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {
                  /* =============================================
                    ADDRESS
                ============================================= */
                }

                <div className="checkout-subsection">
                  <div className="checkout-subsection-heading">
                    <div className="checkout-subsection-number">
                      02
                    </div>

                    <div>
                      <h3>
                        Delivery address
                      </h3>

                      <p>
                        Enter the complete delivery location.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-fields">
                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="house-unit">
                        House / Unit / Building
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="checkout-control">
                        <Home size={16} />

                        <input
                          id="house-unit"
                          type="text"
                          placeholder="Unit 4B, ABC Building"
                          value={form.house_unit}
                          onChange={(e) =>
                            update(
                              "house_unit",
                              e.target.value,
                            )}
                          disabled={loadingSavedProfile}
                          required
                        />
                      </div>
                    </div>

                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="street">
                        Street
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="checkout-control">
                        <MapPin size={16} />

                        <input
                          id="street"
                          type="text"
                          placeholder="J.P. Laurel Avenue"
                          value={form.street}
                          onChange={(e) =>
                            update(
                              "street",
                              e.target.value,
                            )}
                          disabled={loadingSavedProfile}
                          required
                        />
                      </div>
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="barangay">
                        Barangay
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        id="barangay"
                        type="text"
                        placeholder="Bajada"
                        value={form.barangay}
                        onChange={(e) =>
                          update(
                            "barangay",
                            e.target.value,
                          )}
                        disabled={loadingSavedProfile}
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="city">
                        City / Municipality
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        id="city"
                        type="text"
                        placeholder="Davao City"
                        value={form.city}
                        onChange={(e) =>
                          update(
                            "city",
                            e.target.value,
                          )}
                        disabled={loadingSavedProfile}
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="province">
                        Province
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        id="province"
                        type="text"
                        placeholder="Davao del Sur"
                        value={form.province}
                        onChange={(e) =>
                          update(
                            "province",
                            e.target.value,
                          )}
                        disabled={loadingSavedProfile}
                        required
                      />
                    </div>

                    <div className="checkout-field">
                      <label htmlFor="postal-code">
                        Postal code
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        id="postal-code"
                        type="text"
                        placeholder="8000"
                        value={form.postal_code}
                        onChange={(e) =>
                          update(
                            "postal_code",
                            e.target.value,
                          )}
                        disabled={loadingSavedProfile}
                        required
                      />
                    </div>

                    <div className="checkout-field checkout-field-full">
                      <label htmlFor="country">
                        Country
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        id="country"
                        type="text"
                        value={form.country}
                        onChange={(e) =>
                          update(
                            "country",
                            e.target.value,
                          )}
                        disabled={loadingSavedProfile}
                        required
                      />
                    </div>
                  </div>
                </div>

                {
                  /* =============================================
                    SAVE ADDRESS
                ============================================= */
                }

                {session && (
                  <label className="checkout-save-address">
                    <input
                      type="checkbox"
                      checked={saveAsDefaultAddress}
                      onChange={(e) =>
                        setSaveAsDefaultAddress(
                          e.target.checked,
                        )}
                    />

                    <span className="checkout-custom-checkbox">
                      <Check size={12} />
                    </span>

                    <span className="checkout-save-copy">
                      <strong>
                        Save as my default address
                      </strong>

                      <small>
                        Use this address automatically during your next
                        checkout.
                      </small>
                    </span>
                  </label>
                )}

                {
                  /* =============================================
                    EXTRA NOTES
                ============================================= */
                }

                <div className="checkout-subsection checkout-subsection-last">
                  <div className="checkout-subsection-heading">
                    <div className="checkout-subsection-number">
                      03
                    </div>

                    <div>
                      <h3>
                        Additional information
                      </h3>

                      <p>
                        Optional instructions for your order.
                      </p>
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="delivery-instructions">
                      Delivery instructions
                      <span className="optional">
                        Optional
                      </span>
                    </label>

                    <div className="checkout-textarea-control">
                      <MapPin size={16} />

                      <textarea
                        id="delivery-instructions"
                        rows={3}
                        placeholder="Example: Please call when you arrive. Leave the order with the receptionist."
                        value={form.delivery_instructions}
                        onChange={(e) =>
                          update(
                            "delivery_instructions",
                            e.target.value,
                          )}
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="notes">
                      Order notes
                      <span className="optional">
                        Optional
                      </span>
                    </label>

                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Add anything else you'd like us to know about this order."
                      value={form.notes}
                      onChange={(e) =>
                        update(
                          "notes",
                          e.target.value,
                        )}
                    />
                  </div>
                </div>

                {error && (
                  <div className="checkout-error">
                    <span className="checkout-error-mark">
                      !
                    </span>

                    <span>
                      {error}
                    </span>
                  </div>
                )}

                <div className="checkout-actions checkout-actions-final">
                  <button
                    type="button"
                    className="checkout-secondary-button"
                    onClick={backToCustomer}
                    disabled={submitting}
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>

                  <button
                    type="submit"
                    className="checkout-primary-button checkout-place-button"
                    disabled={submitting ||
                      loadingSavedProfile}
                  >
                    {submitting
                      ? (
                        <>
                          <Loader2
                            size={16}
                            className="checkout-spin"
                          />
                          Submitting order...
                        </>
                      )
                      : (
                        <>
                          Place order
                          <ArrowRight size={16} />
                        </>
                      )}
                  </button>
                </div>
              </section>
            )}
          </form>

          {
            /* ===================================================
              ORDER SUMMARY
          =================================================== */
          }

          <aside className="checkout-summary">
            <div className="checkout-summary-top">
              <div>
                <span className="checkout-summary-label">
                  Order
                </span>

                <h2>
                  Summary
                </h2>
              </div>

              <div className="checkout-summary-count">
                <Package size={15} />
                <span>
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            <div className="checkout-summary-items">
              {lines.map((line) => {
                const quantity = Number(line.quantity);

                const unitPrice = Number(
                  line.product
                    .selling_price ?? 0,
                );

                const lineTotal = unitPrice * quantity;

                return (
                  <div
                    key={line.product.id}
                    className="checkout-summary-item"
                  >
                    <div className="checkout-product-icon">
                      <Package size={16} />
                    </div>

                    <div className="checkout-product-details">
                      <strong>
                        {line.product.name}
                      </strong>

                      <span>
                        Qty. {quantity}
                      </span>
                    </div>

                    <strong className="checkout-product-price">
                      ₱
                      {lineTotal.toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>
                Items
              </span>

              <strong>
                {itemCount}
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₱
                {Number(
                  subtotal,
                ).toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits: 2,
                  },
                )}
              </strong>
            </div>

            <div className="checkout-summary-total">
              <span>
                Estimated total
              </span>

              <strong>
                ₱
                {Number(
                  subtotal,
                ).toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits: 2,
                  },
                )}
              </strong>
            </div>

            <div className="checkout-payment-note">
              <div className="checkout-payment-icon">
                <CheckCircle2 size={16} />
              </div>

              <div>
                <strong>
                  No online payment required
                </strong>

                <span>
                  We'll contact you to confirm your order, payment, and delivery
                  arrangements.
                </span>
              </div>
            </div>

            <div className="checkout-summary-footer">
              <div>
                <ShieldCheck size={15} />

                <span>
                  Secure order processing
                </span>
              </div>

              <ChevronRight size={14} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
