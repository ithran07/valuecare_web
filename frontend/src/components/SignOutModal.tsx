import { AlertTriangle, X } from "lucide-react";
import "../style/signout-modal.css";

interface SignOutModalProps {
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function SignOutModal({
  onCancel,
  onConfirm,
}: SignOutModalProps) {
  return (
    <div
      className="signout-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="signout-modal">
        <button
          className="signout-close"
          onClick={onCancel}
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="signout-icon">
          <AlertTriangle size={25} />
        </div>

        <span className="signout-label">
          Account
        </span>

        <h2>Sign out of ValueCare?</h2>

        <p>
          Are you sure you want to sign out of your account? You'll need to sign
          in again to view your order history.
        </p>

        <div className="signout-actions">
          <button
            className="signout-cancel"
            onClick={onCancel}
          >
            Stay signed in
          </button>

          <button
            className="signout-confirm"
            onClick={onConfirm}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
