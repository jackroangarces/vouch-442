import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  onClose: () => void;
};

export default function AccountSettings({ onClose }: Props) {
  const { user, updateUsername, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.displayName ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete-account confirmation sub-popup
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleApply() {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const nameChanged = username !== (user?.displayName ?? "");
      if (nameChanged) {
        await updateUsername(username);
      }

      if (oldPassword || newPassword) {
        if (!oldPassword || !newPassword) {
          throw new Error("Both old and new password are required");
        }
        await changePassword(oldPassword, newPassword);
      }

      if (!nameChanged && !oldPassword && !newPassword) {
        setError("No changes to apply");
        setSaving(false);
        return;
      }

      setSuccess("Changes saved!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("auth/wrong-password") || err.message.includes("auth/invalid-credential")) {
          setError("Old password is incorrect");
        } else if (err.message.includes("auth/weak-password")) {
          setError("New password is too weak (min 6 characters)");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError("");
    setDeleting(true);

    try {
      await deleteAccount(deletePassword);
      // Account gone — redirect to home
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("auth/wrong-password") || err.message.includes("auth/invalid-credential")) {
          setDeleteError("Password is incorrect");
        } else {
          setDeleteError(err.message);
        }
      } else {
        setDeleteError("Something went wrong");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Account Settings</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="modal-success">{success}</p>}

          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <hr className="modal-divider" />

          <label>
            Old Password
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Required to change password"
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </label>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="delete-account-btn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
          <button
            type="button"
            className="auth-submit"
            onClick={handleApply}
            disabled={saving}
          >
            {saving ? "Saving…" : "Apply Changes"}
          </button>
        </div>
      </div>

      {/* Delete-account confirmation sub-popup */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-card modal-card-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button type="button" className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {deleteError && <p className="auth-error">{deleteError}</p>}
              <label>
                Enter password to confirm
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                />
              </label>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="delete-account-btn"
                onClick={handleDelete}
                disabled={deleting || !deletePassword}
              >
                {deleting ? "Deleting…" : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
