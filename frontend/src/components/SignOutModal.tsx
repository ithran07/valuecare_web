import { AlertTriangle, Loader2, X } from "lucide-react";
import "../style/signout-modal.css";

interface SignOutModalProps {
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export default function SignOutModal({
  onCancel,
  onConfirm,
  loading = false,
}: SignOutModalProps) {
  return (
    <div
      className="signout-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        className="signout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-title"
        aria-describedby="signout-description"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="signout-close"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="signout-icon">
          {loading ? (
            <Loader2
              size={25}
              className="signout-loading-spinner"
            />
          ) : (
            <AlertTriangle size={25} />
          )}
        </div>

        <span className="signout-label">
          Account
        </span>

        <h2 id="signout-title">
          {loading ? "Signing you out..." : "Sign out of ValueCare?"}
        </h2>

        <p id="signout-description">
          {loading
            ? "Please wait while we securely sign you out."
            : "Are you sure you want to sign out of your account? You'll need to sign in again to view your order history."}
        </p>

        <div className="signout-actions">
          <button
            type="button"
            className="signout-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Stay signed in
          </button>

          <button
            type="button"
            className="signout-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="signout-loading-spinner"
                />
                Signing out...
              </>
            ) : (
              "Sign out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}