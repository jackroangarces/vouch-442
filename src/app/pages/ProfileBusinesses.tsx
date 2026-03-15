import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import RestaurantImagesModal from "../../components/RestaurantImagesModal";

export default function ProfileBusinesses() {
  const { user } = useAuth();
  const { isBusiness } = useUserProfile();
  const [showImages, setShowImages] = useState(false);

  function openImages() {
    setShowImages(true);
  }

  function closeImages() {
    setShowImages(false);
  }

  if (!user) {
    return (
      <div className="main">
        <h1>Business Dashboard</h1>
        <p className="auth-error">Please log in.</p>
      </div>
    );
  }

  if (!isBusiness) {
    return (
      <div className="main">
        <h1>Business Dashboard</h1>
        <p className="auth-error">You are not a restaurant owner.</p>
      </div>
    );
  }

  return (
    <div className="main">
      <h1>Business Dashboard</h1>

      <button type="button" className="business-upgrade-btn" onClick={openImages}>
        Add image
      </button>

      {showImages && <RestaurantImagesModal restaurantId={user.uid} onClose={closeImages} />}
    </div>
  );
}