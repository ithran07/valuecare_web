import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Phone,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "../style/account.css";

interface CustomerProfile {
  first_name: string;
  last_name: string;
  phone: string;
  business_name: string;
  customer_type: string;
  delivery_address: string;
  created_at: string;
  updated_at: string;
}

const CUSTOMER_TYPES = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "CLINIC", label: "Clinic" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "DISTRIBUTOR", label: "Distributor" },
  { value: "OTHER", label: "Other" },
];

const EMPTY_PROFILE: CustomerProfile = {
  first_name: "",
  last_name: "",
  phone: "",
  business_name: "",
  customer_type: "INDIVIDUAL",
  delivery_address: "",
  created_at: "",
  updated_at: "",
};

function normalizeProfile(profile: CustomerProfile) {
  return {
    first_name: profile.first_name.trim(),
    last_name: profile.last_name.trim(),
    phone: profile.phone.trim(),
    business_name: profile.business_name.trim(),
    customer_type: profile.customer_type,
    delivery_address: profile.delivery_address.trim(),
  };
}

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth();

  const [profile, setProfile] =
    useState<CustomerProfile>(EMPTY_PROFILE);

  const [originalProfile, setOriginalProfile] =
    useState<CustomerProfile>(EMPTY_PROFILE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasChanges =
    JSON.stringify(normalizeProfile(profile)) !==
    JSON.stringify(normalizeProfile(originalProfile));

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<CustomerProfile>(
          "/account/profile/"
        );

        if (mounted) {
          setProfile(response.data);
          setOriginalProfile(response.data);
          setEditing(false);
        }
      } catch {
        if (mounted) {
          setError(
            "We couldn't load your profile. Please try again."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [session, authLoading]);

  function updateField(
    field: keyof CustomerProfile,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  }

  function handleEdit() {
    setEditing(true);
    setError("");
    setSuccess("");
  }

  function handleCancel() {
    setProfile(originalProfile);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!session || !hasChanges) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch<CustomerProfile>(
        "/account/profile/",
        {
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          phone: profile.phone.trim(),
          business_name: profile.business_name.trim(),
          customer_type: profile.customer_type,
          delivery_address: profile.delivery_address.trim(),
        }
      );

      setProfile(response.data);
      setOriginalProfile(response.data);
      setEditing(false);
      setSuccess("Your profile has been saved.");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "We couldn't save your profile. Please try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="account-loading">
        <div className="account-loading-spinner" />
        <span>Loading your profile...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="account-page">
        <div className="container account-disabled">
          <div className="account-disabled-icon">
            <UserRound size={28} />
          </div>

          <span className="account-eyebrow">
            Customer account
          </span>

          <h1>Sign in required</h1>

          <p>
            Please sign in to view and manage your profile.
          </p>

          <Link
            to="/account"
            className="account-primary-button"
          >
            Go to account
          </Link>
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
            <ArrowLeft size={17} />
            Back to account
          </Link>

          <span className="account-eyebrow">
            Customer account
          </span>

          <h1>Profile</h1>

          <p>
            Keep your customer information up to date for
            faster ordering and delivery.
          </p>
        </div>

        <form
          className="account-form-card"
          onSubmit={handleSubmit}
        >
          <div className="account-form-section">
            <div className="account-form-section-heading">
              <div className="account-form-section-icon">
                <UserRound size={19} />
              </div>

              <div>
                <h2>Personal information</h2>
                <p>
                  Information used to identify and contact you.
                </p>
              </div>
            </div>

            <div className="account-form-grid">
              <label className="account-field">
                <span>First name</span>

                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(event) =>
                    updateField(
                      "first_name",
                      event.target.value
                    )
                  }
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                  disabled={!editing || saving}
                />
              </label>

              <label className="account-field">
                <span>Last name</span>

                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(event) =>
                    updateField(
                      "last_name",
                      event.target.value
                    )
                  }
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                  disabled={!editing || saving}
                />
              </label>

              <label className="account-field">
                <span>Email address</span>

                <input
                  type="email"
                  value={session.user.email ?? ""}
                  disabled
                />

                <small>
                  Your email is managed by your account
                  authentication provider.
                </small>
              </label>

              <label className="account-field">
                <span>
                  <Phone size={14} />
                  Phone number
                </span>

                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="09XXXXXXXXX"
                  autoComplete="tel"
                  disabled={!editing || saving}
                />
              </label>
            </div>
          </div>

          <div className="account-form-divider" />

          <div className="account-form-section">
            <div className="account-form-section-heading">
              <div className="account-form-section-icon">
                <Building2 size={19} />
              </div>

              <div>
                <h2>Customer details</h2>
                <p>
                  Tell us how you use ValueCare.
                </p>
              </div>
            </div>

            <div className="account-form-grid">
              <label className="account-field account-field-full">
                <span>Business or organization name</span>

                <input
                  type="text"
                  value={profile.business_name}
                  onChange={(event) =>
                    updateField(
                      "business_name",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                  autoComplete="organization"
                  disabled={!editing || saving}
                />
              </label>

              <label className="account-field account-field-full">
                <span>Customer type</span>

                <select
                  value={profile.customer_type}
                  onChange={(event) =>
                    updateField(
                      "customer_type",
                      event.target.value
                    )
                  }
                  disabled={!editing || saving}
                >
                  {CUSTOMER_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="account-form-divider" />

          {error && (
            <div className="account-form-message account-form-message-error">
              <span>{error}</span>
            </div>
          )}

          {success && !editing && (
            <div className="account-form-message account-form-message-success">
              <CheckCircle2 size={17} />
              <span>{success}</span>
            </div>
          )}

          <div className="account-form-actions">
            {!editing ? (
              <>
                <button
                  type="button"
                  className="account-primary-button"
                  onClick={handleEdit}
                >
                  Edit profile
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="account-secondary-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                {hasChanges && (
                  <button
                    type="submit"
                    className="account-primary-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          className="account-button-spinner"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save changes
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}