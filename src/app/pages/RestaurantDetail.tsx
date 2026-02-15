import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Restaurant } from "../../types/restaurant";

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No restaurant ID");
      setLoading(false);
      return;
    }

    const restaurantId = id;
    let cancelled = false;

    async function fetchRestaurant() {
      try {
        const ref = doc(db, "restaurants", restaurantId);
        const snap = await getDoc(ref);
        if (cancelled) return;

        if (snap.exists()) {
          setRestaurant({ id: snap.id, ...snap.data() } as Restaurant);
        } else {
          setError("Restaurant not found");
        }
      } catch {
        if (!cancelled) setError("Failed to load restaurant");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRestaurant();
    return () => {
      cancelled = true;
    };
  }, [id ?? ""]);

  if (loading) {
    return (
      <div className="main">
        <p>Loading…</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="main">
        <p className="auth-error">{error ?? "Restaurant not found"}</p>
      </div>
    );
  }

  return (
    <div className="main">
      <h1>{restaurant.restaurantName}</h1>
      <button
        type="button"
        className="restaurant-review-btn"
        onClick={() => setShowReviewModal(true)}
      >
        Write a review
      </button>

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a review</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {/* Add review form content here */}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="auth-submit"
                onClick={() => setShowReviewModal(false)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
