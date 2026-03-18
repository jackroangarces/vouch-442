import { useState, type FormEvent } from "react";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../contexts/UserProfileContext";

type Props = {
  onClose: () => void;
  onSuccess?: (restaurantId: string) => void;
};

function isValidRestaurantName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  return /^[A-Za-z0-9][A-Za-z0-9 &'.-\u2019]*$/.test(trimmed);
}

export default function AddBusinessModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const { isBusiness, profileLoading } = useUserProfile();

  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { isBusiness, upgradeToBusiness } = useUserProfile();
  function resetError() {
    setError("");
  }

  function validateInputs() {
    const name = restaurantName.trim();
    const loc = location.trim();

    if (!isValidRestaurantName(name)) {
      alert("Invalid Restaurant Name");
      setError("Invalid Restaurant Name");
      return null;
    }

    if (!loc) {
      setError("Location is required");
      return null;
    }

    return {
      name,
      loc,
      desc: description.trim(),
    };
  }

  async function createOrUpdateBusiness(restaurantId: string, name: string, loc: string, desc: string) {
    if (!user) throw new Error("Not logged in");
  
    const restaurantRef = doc(db, "restaurants", restaurantId);
    const userRef = doc(db, "users", user.uid);
  
    const batch = writeBatch(db);
  
    batch.set(
      userRef,
      { isBusiness: true },
      { merge: true },
    );
  
    batch.set(
      restaurantRef,
      {
        restaurantName: name,
        location: loc,
        description: desc,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  
    await batch.commit();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    resetError();

    if (!user) {
      setError("Please log in.");
      return;
    }

    if (profileLoading) {
      setError("Checking account permissions...");
      return;
    }

    if (!isBusiness) {
      setError("Only business accounts can create restaurants. Switch your account type in settings first.");
      return;
    }

    const validated = validateInputs();
    if (!validated) return;

    const restaurantId = isBusiness ? `${user.uid}_${Date.now()}` : user.uid;
    setSaving(true);
    try {
      await createOrUpdateBusiness(restaurantId, validated.name, validated.loc, validated.desc);
      
      await upgradeToBusiness();
      onSuccess?.(restaurantId);
      onClose();

      onSuccess?.(restaurantId);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add A Business</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>}
          {!profileLoading && !isBusiness && (
            <p className="auth-error">
              Only business accounts can create restaurants. Switch your account type in settings first.
            </p>
          )}

          <label>
            Restaurant Name
            <input
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Ex: Vouch Cafe"
              onFocus={resetError}
            />
          </label>

          <label>
            Location
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Seattle, WA"
              onFocus={resetError}
            />
          </label>

          <label>
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              rows={3}
              onFocus={resetError}
            />
          </label>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="auth-submit"
              disabled={
                saving ||
                profileLoading ||
                !isBusiness ||
                !restaurantName.trim() ||
                !location.trim()
              }
            >
              {saving ? "Creating..." : "Create Business"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
