import { useState, type FormEvent } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  onClose: () => void;
  onSuccess?: (restaurantId: string) => void;
};

function isValidRestaurantName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  return /^[A-Za-z0-9][A-Za-z0-9 &'’.-]*$/.test(trimmed);
}

export default function AddBusinessModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();

  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

    await setDoc(
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

    await setDoc(
      userRef,
      {
        isBusiness: true,
        restaurantId,
        restaurantName: name,
      },
      { merge: true },
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    resetError();

    if (!user) {
      setError("Please log in.");
      return;
    }

    const validated = validateInputs();
    if (!validated) return;

    const restaurantId = user.uid;

    setSaving(true);
    try {
      await createOrUpdateBusiness(restaurantId, validated.name, validated.loc, validated.desc);

      onSuccess?.(restaurantId);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
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
              disabled={saving || !restaurantName.trim() || !location.trim()}
            >
              {saving ? "Creating…" : "Create Business"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}