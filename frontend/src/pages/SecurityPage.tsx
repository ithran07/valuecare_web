import {
  FormEvent,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "../style/account.css";

export default function SecurityPage() {
  const {
    session,
    loading: authLoading,
    verifyPassword,
    changePassword,
  } = useAuth();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [verified, setVerified] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function validateNewPassword() {
    if (!newPassword) {
      return "Please enter a new password.";
    }

    if (newPassword.length < 8) {
      return "Your new password must be at least 8 characters.";
    }

    if (newPassword === currentPassword) {
      return "Your new password must be different from your current password.";
    }

    if (!confirmPassword) {
      return "Please confirm your new password.";
    }

    if (newPassword !== confirmPassword) {
      return "The new passwords do not match.";
    }

    return "";
  }

  async function handleVerifyPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!session || !currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    setError("");
    setSuccess("");
    setVerifying(true);

    try {
      const result =
        await verifyPassword(currentPassword);

      if (result.error) {
        setError(result.error);
        return;
      }

      setVerified(true);
      setError("");
    } catch {
      setError(
        "We couldn't verify your password. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!session || !verified) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError =
      validateNewPassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const result =
        await changePassword(
          currentPassword,
          newPassword
        );

      if (result.error) {
        setError(result.error);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      setVerified(false);

      setSuccess(
        "Your password has been changed successfully."
      );
    } catch {
      setError(
        "We couldn't change your password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleBackToVerification() {
    if (saving || verifying) {
      return;
    }

    setVerified(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
    setError("");
    setSuccess("");
  }

  if (authLoading) {
    return (
      <div className="account-loading">
        <div className="account-loading-spinner" />

        <span>
          Loading your security settings...
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="account-page">
        <div className="container account-disabled">
          <div className="account-disabled-icon">
            <LockKeyhole size={28} />
          </div>

          <span className="account-eyebrow">
            Customer account
          </span>

          <h1>Sign in required</h1>

          <p>
            Please sign in to manage your account
            security.
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

          <h1>Security</h1>

          <p>
            Keep your ValueCare account secure by
            regularly reviewing your password.
          </p>
        </div>

        <div className="account-security-layout">
          <div className="account-security-info">
            <div className="account-security-info-icon">
              <ShieldCheck size={24} />
            </div>

            <h2>Your account security</h2>

            <p>
              Your password is securely managed by
              ValueCare's authentication provider. It
              is never stored in the ValueCare
              application database.
            </p>

            <div className="account-security-email">
              <span>Account email</span>

              <strong>
                {session.user.email}
              </strong>
            </div>
          </div>

          <form
            className="account-form-card account-security-card"
            onSubmit={
              verified
                ? handleSubmit
                : handleVerifyPassword
            }
          >
            <div className="account-form-section">
              <div className="account-form-section-heading">
                <div className="account-form-section-icon">
                  {verified ? (
                    <KeyRound size={19} />
                  ) : (
                    <LockKeyhole size={19} />
                  )}
                </div>

                <div>
                  <h2>
                    {verified
                      ? "Create a new password"
                      : "Verify your password"}
                  </h2>

                  <p>
                    {verified
                      ? "Choose a new password for your ValueCare account."
                      : "Enter your current password to continue."}
                  </p>
                </div>
              </div>

              {!verified ? (
                <div className="account-security-fields">
                  <label className="account-field">
                    <span>
                      Current password
                    </span>

                    <div className="account-password-input">
                      <input
                        type={
                          showCurrent
                            ? "text"
                            : "password"
                        }
                        value={currentPassword}
                        onChange={(event) => {
                          setCurrentPassword(
                            event.target.value
                          );
                          setError("");
                          setSuccess("");
                        }}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        autoFocus
                        disabled={verifying}
                      />

                      <button
                        type="button"
                        className="account-password-toggle"
                        onClick={() =>
                          setShowCurrent(
                            (current) => !current
                          )
                        }
                        aria-label={
                          showCurrent
                            ? "Hide current password"
                            : "Show current password"
                        }
                        disabled={verifying}
                      >
                        {showCurrent ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="account-security-fields">
                  <div className="account-password-verified">
                    <CheckCircle2 size={18} />

                    <div>
                      <strong>
                        Password verified
                      </strong>

                      <span>
                        You can now create a new password.
                      </span>
                    </div>
                  </div>

                  <label className="account-field">
                    <span>
                      New password
                    </span>

                    <div className="account-password-input">
                      <input
                        type={
                          showNew
                            ? "text"
                            : "password"
                        }
                        value={newPassword}
                        onChange={(event) => {
                          setNewPassword(
                            event.target.value
                          );
                          setError("");
                          setSuccess("");
                        }}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        autoFocus
                        disabled={saving}
                      />

                      <button
                        type="button"
                        className="account-password-toggle"
                        onClick={() =>
                          setShowNew(
                            (current) => !current
                          )
                        }
                        aria-label={
                          showNew
                            ? "Hide new password"
                            : "Show new password"
                        }
                        disabled={saving}
                      >
                        {showNew ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <small>
                      Use at least 8 characters.
                    </small>
                  </label>

                  <label className="account-field">
                    <span>
                      Confirm new password
                    </span>

                    <div className="account-password-input">
                      <input
                        type={
                          showConfirm
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(
                            event.target.value
                          );
                          setError("");
                          setSuccess("");
                        }}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        disabled={saving}
                      />

                      <button
                        type="button"
                        className="account-password-toggle"
                        onClick={() =>
                          setShowConfirm(
                            (current) => !current
                          )
                        }
                        aria-label={
                          showConfirm
                            ? "Hide password confirmation"
                            : "Show password confirmation"
                        }
                        disabled={saving}
                      >
                        {showConfirm ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {(error || success) && (
              <div
                className={
                  error
                    ? "account-form-message account-form-message-error"
                    : "account-form-message account-form-message-success"
                }
              >
                {error ? (
                  <span>{error}</span>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    <span>{success}</span>
                  </>
                )}
              </div>
            )}

            <div className="account-form-actions">
              <Link
                to="/account"
                className="account-secondary-button"
              >
                Cancel
              </Link>

              {!verified ? (
                <button
                  type="submit"
                  className="account-primary-button"
                  disabled={
                    verifying ||
                    !currentPassword
                  }
                >
                  {verifying ? (
                    <>
                      <Loader2
                        size={17}
                        className="account-button-spinner"
                      />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />
                      Verify password
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="account-secondary-button"
                    onClick={
                      handleBackToVerification
                    }
                    disabled={saving}
                  >
                    Back
                  </button>

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
                        Updating...
                      </>
                    ) : (
                      <>
                        <LockKeyhole size={17} />
                        Change password
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}