import { useState, type FormEvent } from "react";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
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
  const { isBusiness, profileLoading, upgradeToBusiness } = useUserProfile();

  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function resetError() {
    setError("");
  }

  function validateInputs() {
    const name = restaurantName.trim();
    const addr = address.trim();
    const latNum = Number.parseFloat(lat);
    const lngNum = Number.parseFloat(lng);

    if (!isValidRestaurantName(name)) {
      setError("Invalid Restaurant Name");
      return null;
    }

    if (!addr) {
      setError("Address is required");
      return null;
    }

    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      setError("Latitude must be a number between -90 and 90");
      return null;
    }

    if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      setError("Longitude must be a number between -180 and 180");
      return null;
    }

    return {
      name,
      address: addr,
      lat: latNum,
      lng: lngNum,
      desc: description.trim(),
    };
  }

  async function createOrUpdateBusiness(
    restaurantId: string,
    name: string,
    addressValue: string,
    latValue: number,
    lngValue: number,
    desc: string,
  ) {
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
        address: addressValue,
        lat: latValue,
        lng: lngValue,
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
      await createOrUpdateBusiness(
        restaurantId,
        validated.name,
        validated.address,
        validated.lat,
        validated.lng,
        validated.desc,
      );
      
      await upgradeToBusiness();
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
            Address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: 123 Main St, Seattle, WA"
              onFocus={resetError}
            />
          </label>

          <label>
            Latitude
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Ex: 47.6062"
              onFocus={resetError}
            />
          </label>

          <label>
            Longitude
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Ex: -122.3321"
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
                !address.trim() ||
                !lat.trim() ||
                !lng.trim()
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
