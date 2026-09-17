import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

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

  const [step, setStep] =
    useState<1 | 2>(1);

  const [form, setForm] =
    useState<CheckoutForm>({
      contact_name: "",
      business_name: "",
      customer_type: "INDIVIDUAL",
      email:
        session?.user.email || "",
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

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!session?.user.email) return;

    setForm((current) => ({
      ...current,
      email:
        current.email.trim() ||
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
        const response =
          await api.get(
            "/account/profile/"
          );

        if (cancelled) return;

        const profile =
          response?.data || {};

        const firstName =
          profile.first_name?.trim() || "";

        const lastName =
          profile.last_name?.trim() || "";

        const fullName =
          `${firstName} ${lastName}`.trim();

        const savedBusiness =
          profile.business_name?.trim() || "";

        const savedPhone =
          profile.phone?.trim() || "";

        const savedRecipient =
          profile.recipient_name?.trim() || "";

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
          (value) =>
            String(value || "").trim()
        );

        const savedType =
          profile.customer_type ||
          "INDIVIDUAL";

        const savedEmail =
          session?.user?.email || ""

        setForm((current) => ({
          ...current,

          contact_name:
            current.contact_name.trim()
              ? current.contact_name
              : fullName,

          business_name:
            current.business_name.trim()
              ? current.business_name
              : savedBusiness,

          customer_type:
            current.customer_type !==
            "INDIVIDUAL"
              ? current.customer_type
              : savedType,

          email:
            current.email.trim()
              ? current.email
              : savedEmail,

          phone:
            current.phone.trim()
              ? current.phone
              : savedPhone,

          recipient_name:
            current.recipient_name.trim()
              ? current.recipient_name
              : savedRecipient,

          house_unit:
            current.house_unit.trim()
              ? current.house_unit
              : profile.house_unit || "",

          street:
            current.street.trim()
              ? current.street
              : profile.street || "",

          barangay:
            current.barangay.trim()
              ? current.barangay
              : profile.barangay || "",

          city:
            current.city.trim()
              ? current.city
              : profile.city || "",

          province:
            current.province.trim()
              ? current.province
              : profile.province || "",

          postal_code:
            current.postal_code.trim()
              ? current.postal_code
              : profile.postal_code || "",

          country:
            current.country.trim() &&
            current.country !==
              "Philippines"
              ? current.country
              : profile.country ||
                "Philippines",

          delivery_instructions:
            current.delivery_instructions.trim()
              ? current.delivery_instructions
              : profile.delivery_instructions ||
                "",
        }));

        setHasSavedProfile(
          Boolean(
            fullName ||
              savedBusiness ||
              savedPhone
          )
        );

        setHasSavedAddress(
          savedAddressFields
        );
      } catch (err) {
        console.error(
          "Failed to load saved customer profile:",
          err
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
    value: string
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
        "Please enter your full name."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (!form.email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

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
    error: any
  ) {
    const detail =
      error?.response?.data;

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

    const firstField =
      Object.values(detail)[0];

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
    } catch (err) {
      console.error(
        "Failed to save default delivery address:",
        err
      );
    }
  }

  async function submit(
    e: FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (lines.length === 0) {
      setError(
        "Your cart is empty."
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

    for (const [
      key,
      label,
    ] of requiredAddressFields) {
      if (!form[key].trim()) {
        setError(
          `Please enter your ${label}.`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      await saveDefaultAddress();

      const payload = {
        contact_name:
          form.contact_name.trim(),

        business_name:
          form.business_name.trim(),

        customer_type:
          form.customer_type,

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

        recipient_name:
          form.recipient_name.trim(),

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

        notes:
          form.notes.trim(),

        items: lines.map(
          (line) => ({
            product_id:
              line.product.id,
            quantity:
              line.quantity,
          })
        ),
      };

      const response =
        await api.post(
          "/orders/",
          payload
        );

      if (!response?.data) {
        throw new Error(
          "The server did not return an order."
        );
      }

      clearCart();

      navigate(
        "/order-confirmation",
        {
          replace: true,
          state: {
            order:
              response.data,
          },
        }
      );
    } catch (err: any) {
      console.error(
        "Order submission failed:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="checkout-empty-icon">
          <ClipboardList size={32} />
        </div>

        <h1>Your cart is empty</h1>

        <p>
          Add some medical supplies to your
          cart before proceeding to checkout.
        </p>

        <Link
          to="/products"
          className="checkout-primary-button"
        >
          Browse products
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-container">

        <div className="checkout-header">
          <Link
            to="/cart"
            className="checkout-back-link"
          >
            <ArrowLeft size={16} />
            Back to cart
          </Link>

          <div>
            <span className="checkout-eyebrow">
              ValueCare checkout
            </span>

            <h1>
              Complete your order
            </h1>

            <p>
              Provide your details so we can
              confirm your order and arrange
              delivery.
            </p>
          </div>
        </div>

        <div className="checkout-progress">

          <div
            className={`checkout-progress-step ${
              step === 1 ||
              step === 2
                ? "active"
                : ""
            }`}
          >
            <div className="checkout-progress-number">
              1
            </div>

            <div>
              <strong>
                Customer information
              </strong>

              <small>
                Contact details
              </small>
            </div>
          </div>

          <div
            className={`checkout-progress-line ${
              step === 2
                ? "active"
                : ""
            }`}
          />

          <div
            className={`checkout-progress-step ${
              step === 2
                ? "active"
                : ""
            }`}
          >
            <div className="checkout-progress-number">
              2
            </div>

            <div>
              <strong>
                Delivery details
              </strong>

              <small>
                Address and notes
              </small>
            </div>
          </div>
        </div>

        <div className="checkout-layout">

          <form
            className="checkout-form"
            onSubmit={submit}
          >

            {step === 1 && (
              <section className="checkout-card">

                <div className="checkout-card-header">
                  <div className="checkout-card-icon">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2>
                      Customer information
                    </h2>

                    <p>
                      Tell us who we should contact
                      about this order.
                    </p>
                  </div>
                </div>

                {session &&
                  loadingSavedProfile && (
                    <div className="checkout-profile-loading">
                      <Loader2
                        size={17}
                        className="checkout-profile-spinner"
                      />

                      <span>
                        Loading your saved
                        information...
                      </span>
                    </div>
                  )}

                {session &&
                  hasSavedProfile &&
                  !loadingSavedProfile && (
                    <div className="checkout-saved-profile-notice">
                      <div className="checkout-saved-profile-icon">
                        <CheckCircle2 size={17} />
                      </div>

                      <div>
                        <strong>
                          Your account information
                          was loaded
                        </strong>

                        <p>
                          We used your saved customer
                          information to make checkout
                          faster. You can edit anything
                          before submitting your order.
                        </p>
                      </div>
                    </div>
                  )}

                <div className="checkout-form-grid">

                  <div className="checkout-field">
                    <label htmlFor="contact-name">
                      Full name
                    </label>

                    <div className="checkout-input-wrap">
                      <UserRound size={16} />

                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Juan Dela Cruz"
                        value={
                          form.contact_name
                        }
                        onChange={(e) =>
                          update(
                            "contact_name",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="business-name">
                      Business / facility
                      <span>
                        {" "}Optional
                      </span>
                    </label>

                    <div className="checkout-input-wrap">
                      <Building2 size={16} />

                      <input
                        id="business-name"
                        type="text"
                        placeholder="ABC Medical Clinic"
                        value={
                          form.business_name
                        }
                        onChange={(e) =>
                          update(
                            "business_name",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="customer-type">
                      Customer type
                    </label>

                    <select
                      id="customer-type"
                      value={
                        form.customer_type
                      }
                      onChange={(e) =>
                        update(
                          "customer_type",
                          e.target.value
                        )
                      }
                    >
                      {CUSTOMER_TYPES.map(
                        (type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="phone">
                      Phone number
                    </label>

                    <div className="checkout-input-wrap">
                      <Phone size={16} />

                      <input
                        id="phone"
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        value={form.phone}
                        onChange={(e) =>
                          update(
                            "phone",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field checkout-field-full">
                    <label htmlFor="email">
                      Email address
                    </label>

                    <div className="checkout-input-wrap">
                      <Mail size={16} />

                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                          update(
                            "email",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="checkout-error">
                    {error}
                  </div>
                )}

                <div className="checkout-step-actions checkout-final-actions">
                  <button
                    type="button"
                    className="checkout-next-button"
                    onClick={
                      continueToDelivery
                    }
                  >
                    Continue to delivery
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="checkout-card">

                <div className="checkout-card-header">
                  <div className="checkout-card-icon">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2>
                      Delivery details
                    </h2>

                    <p>
                      Tell us where you'd like your
                      order delivered.
                    </p>
                  </div>
                </div>

                {session &&
                  hasSavedAddress &&
                  !loadingSavedProfile && (
                    <div className="checkout-saved-address-notice">
                      <div className="checkout-saved-address-icon">
                        <CheckCircle2 size={17} />
                      </div>

                      <div>
                        <strong>
                          Your saved address was
                          loaded
                        </strong>

                        <p>
                          You can edit this address
                          before placing your order.
                        </p>
                      </div>
                    </div>
                  )}

                <div className="checkout-form-grid">

                  <div className="checkout-field">
                    <label htmlFor="recipient-name">
                      Recipient name
                    </label>

                    <div className="checkout-input-wrap">
                      <UserRound size={16} />

                      <input
                        id="recipient-name"
                        type="text"
                        placeholder="Juan Dela Cruz"
                        value={
                          form.recipient_name
                        }
                        onChange={(e) =>
                          update(
                            "recipient_name",
                            e.target.value
                          )
                        }
                        disabled={
                          loadingSavedProfile
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="address-phone">
                      Phone number
                    </label>

                    <div className="checkout-input-wrap">
                      <Phone size={16} />

                      <input
                        id="address-phone"
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        value={form.phone}
                        onChange={(e) =>
                          update(
                            "phone",
                            e.target.value
                          )
                        }
                        disabled={
                          loadingSavedProfile
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="house-unit">
                      House / Unit / Building
                    </label>

                    <div className="checkout-input-wrap">
                      <Home size={16} />

                      <input
                        id="house-unit"
                        type="text"
                        placeholder="Unit 4B, ABC Building"
                        value={
                          form.house_unit
                        }
                        onChange={(e) =>
                          update(
                            "house_unit",
                            e.target.value
                          )
                        }
                        disabled={
                          loadingSavedProfile
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="street">
                      Street
                    </label>

                    <div className="checkout-input-wrap">
                      <MapPin size={16} />

                      <input
                        id="street"
                        type="text"
                        placeholder="J.P. Laurel Avenue"
                        value={form.street}
                        onChange={(e) =>
                          update(
                            "street",
                            e.target.value
                          )
                        }
                        disabled={
                          loadingSavedProfile
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="barangay">
                      Barangay
                    </label>

                    <input
                      id="barangay"
                      type="text"
                      placeholder="Bajada"
                      value={form.barangay}
                      onChange={(e) =>
                        update(
                          "barangay",
                          e.target.value
                        )
                      }
                      disabled={
                        loadingSavedProfile
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="city">
                      City / Municipality
                    </label>

                    <input
                      id="city"
                      type="text"
                      placeholder="Davao City"
                      value={form.city}
                      onChange={(e) =>
                        update(
                          "city",
                          e.target.value
                        )
                      }
                      disabled={
                        loadingSavedProfile
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="province">
                      Province
                    </label>

                    <input
                      id="province"
                      type="text"
                      placeholder="Davao del Sur"
                      value={form.province}
                      onChange={(e) =>
                        update(
                          "province",
                          e.target.value
                        )
                      }
                      disabled={
                        loadingSavedProfile
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="postal-code">
                      Postal code
                    </label>

                    <input
                      id="postal-code"
                      type="text"
                      placeholder="8000"
                      value={
                        form.postal_code
                      }
                      onChange={(e) =>
                        update(
                          "postal_code",
                          e.target.value
                        )
                      }
                      disabled={
                        loadingSavedProfile
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field checkout-field-full">
                    <label htmlFor="country">
                      Country
                    </label>

                    <input
                      id="country"
                      type="text"
                      value={form.country}
                      onChange={(e) =>
                        update(
                          "country",
                          e.target.value
                        )
                      }
                      disabled={
                        loadingSavedProfile
                      }
                      required
                    />
                  </div>
                </div>

                {session && (
                  <label className="checkout-save-address">
                    <input
                      type="checkbox"
                      checked={
                        saveAsDefaultAddress
                      }
                      onChange={(e) =>
                        setSaveAsDefaultAddress(
                          e.target.checked
                        )
                      }
                    />

                    <span className="checkout-save-address-box" />

                    <span className="checkout-save-address-text">
                      <strong>
                        Save this as my default
                        address
                      </strong>

                      <small>
                        We'll use it automatically
                        on your next checkout.
                      </small>
                    </span>
                  </label>
                )}

                <div className="checkout-field">
                  <label htmlFor="delivery-instructions">
                    Delivery instructions
                    <span>
                      {" "}Optional
                    </span>
                  </label>

                  <div className="checkout-textarea-wrap">
                    <MapPin size={16} />

                    <textarea
                      id="delivery-instructions"
                      rows={3}
                      placeholder="Example: Please call when you arrive. Leave the order with the receptionist."
                      value={
                        form.delivery_instructions
                      }
                      onChange={(e) =>
                        update(
                          "delivery_instructions",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="checkout-field">
                  <label htmlFor="notes">
                    Order notes
                    <span>
                      {" "}Optional
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
                        e.target.value
                      )
                    }
                  />
                </div>

                {error && (
                  <div className="checkout-error">
                    {error}
                  </div>
                )}

                <div className="checkout-step-actions checkout-final-actions">

                  <button
                    type="button"
                    className="checkout-back-step-button"
                    onClick={
                      backToCustomer
                    }
                    disabled={submitting}
                  >
                    <ArrowLeft size={17} />
                    Back
                  </button>

                  <button
                    type="submit"
                    className="checkout-submit"
                    disabled={
                      submitting ||
                      loadingSavedProfile
                    }
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={17}
                          className="checkout-submit-spinner"
                        />
                        Submitting order...
                      </>
                    ) : (
                      <>
                        Place order
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}
          </form>

          <aside className="checkout-summary">

            <div className="checkout-summary-header">
              <div>
                <span className="checkout-eyebrow">
                  Your order
                </span>

                <h2>
                  Order summary
                </h2>
              </div>

              <ClipboardList size={20} />
            </div>

            <div className="checkout-summary-items">
              {lines.map((line) => (
                <div
                  key={line.product.id}
                  className="checkout-summary-item"
                >
                  <div className="checkout-summary-product-icon">
                    <ClipboardList size={15} />
                  </div>

                  <div className="checkout-summary-product">
                    <strong>
                      {line.product.name}
                    </strong>

                    <span>
                      Qty. {line.quantity}
                    </span>
                  </div>

                  <strong>
                    ₱
                    {(
                      Number(
                        line.product.selling_price ??
                          0
                      ) *
                      line.quantity
                    ).toLocaleString(
                      "en-PH",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>
                Estimated total
              </span>

              <strong>
                ₱
                {Number(
                  subtotal
                ).toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </strong>
            </div>

            <div className="checkout-summary-info">
              <CheckCircle2 size={16} />

              <span>
                No online payment is required.
                We'll contact you to confirm your
                order, payment, and delivery
                arrangements.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}