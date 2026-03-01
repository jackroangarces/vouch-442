import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Restaurant } from "../../types/restaurant";
import Toast from "../../components/Toast";
import PolarChart from "../../components/PolarChart";
import { useAuth } from "../../contexts/AuthContext";

const ZERO_VIBE = [0, 0, 0, 0, 0, 0];

function normalizeVibe(v: unknown): number[] | null {
  if (!Array.isArray(v) || v.length !== 6) return null;
  const out = v.map((x) => {
    const n = Number(x);
    return Number.isFinite(n) ? Math.max(0, Math.min(5, Math.round(n))) : 0;
  });
  return out;
}

function avgVibe(vibes: number[][]): number[] {
  if (vibes.length === 0) return [...ZERO_VIBE];
  const sums = [0, 0, 0, 0, 0, 0];
  for (const v of vibes) for (let i = 0; i < 6; i++) sums[i] += v[i];
  return sums.map((s) => Math.round((s / vibes.length) * 10) / 10);
}

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [userVibe, setUserVibe] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const [hasReviewed, setHasReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [restaurantVibe, setRestaurantVibe] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [restaurantReviewCount, setRestaurantReviewCount] = useState(0);

  async function loadRestaurantAggregate(restaurantId: string) {
    const snap = await getDocs(
      query(collection(db, "reviews"), where("restaurantId", "==", restaurantId)),
    );

    const vibes: number[][] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      const v = normalizeVibe(data.vibe);
      if (v) vibes.push(v);
    });

    setRestaurantReviewCount(vibes.length);
    setRestaurantVibe(avgVibe(vibes));
  }

  useEffect(() => {
    if (!id) {
      setError("No restaurant ID");
      setLoading(false);
      return;
    }

    const restaurantId = id;

    // fallback
    if (restaurantId === "dummy1") {
      setRestaurant({ id: "dummy1", restaurantName: "Dummy Restaurant (for testing)" });
      setLoading(false);
      setError(null);
      return;
    }

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
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const restaurantId = id;
    let cancelled = false;

    async function run() {
      try {
        await loadRestaurantAggregate(restaurantId);
      } catch {
      }
    }

    run();
    return () => {
      cancelled = true;
      void cancelled;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !id) {
      setHasReviewed(false);
      return;
    }

    const restaurantId = id;
    const uid = user.uid;
    let cancelled = false;

    async function checkReview() {
      try {
        const reviewId = `${restaurantId}_${uid}`;
        const snap = await getDoc(doc(db, "reviews", reviewId));
        if (!cancelled) setHasReviewed(snap.exists());
      } catch {
        if (!cancelled) setHasReviewed(false);
      }
    }

    checkReview();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, id]);

  async function handleSubmit() {
    if (!user) {
      setSubmitError("Please log in to submit a review.");
      return;
    }
    if (!id) {
      setSubmitError("Missing restaurant ID.");
      return;
    }

    const restaurantId = id;
    const uid = user.uid;

    const text = reviewText.trim();
    if (starRating < 1) {
      setSubmitError("Please select a star rating.");
      return;
    }
    if (text.length < 3) {
      setSubmitError("Please write a short review.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const reviewId = `${restaurantId}_${uid}`;
      const ref = doc(db, "reviews", reviewId);

      const existing = await getDoc(ref);
      if (existing.exists()) {
        setHasReviewed(true);
        setShowReviewModal(false);
        return;
      }

      await setDoc(ref, {
        userId: uid,
        restaurantId,
        rating: starRating,
        text,
        vibe: userVibe,
        createdAt: serverTimestamp(),
      });

      await loadRestaurantAggregate(restaurantId);

      setHasReviewed(true);
      setShowReviewModal(false);
      setShowToast(true);

      setReviewText("");
      setStarRating(0);
      setUserVibe([0, 0, 0, 0, 0, 0]);
    } catch {
      setSubmitError("Failed to submit review. Check Firestore rules / console.");
    } finally {
      setSubmitting(false);
    }
  }

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

  const canReview = !!user && !hasReviewed;

  return (
    <div className="main">
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1>{restaurant.restaurantName}</h1>

          <button
            type="button"
            className="restaurant-review-btn"
            disabled={!canReview}
            onClick={() => setShowReviewModal(true)}
          >
            {!user ? "Log in to review" : hasReviewed ? "Review submitted" : "Write a review"}
          </button>
        </div>

        <div style={{ width: 320, maxWidth: "100%" }}>
          <h3 style={{ marginTop: 0 }}>Restaurant Vibe</h3>
          <PolarChart values={restaurantVibe} size={260} />
          <p style={{ margin: "8px 0 0", opacity: 0.7, fontSize: 13 }}>
            {restaurantReviewCount === 0
              ? "No reviews yet"
              : `Based on ${restaurantReviewCount} review${restaurantReviewCount === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a review</h2>
              <button type="button" className="modal-close" onClick={() => setShowReviewModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {submitError && <p className="auth-error">{submitError}</p>}

              <label>
                Your review
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write about your experience..."
                  rows={4}
                />
              </label>

              <div>
                <p style={{ margin: 0 }}>Rating</p>
                <div className="star-rating" role="radiogroup" aria-label="Star rating">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const v = i + 1;
                    return (
                      <button
                        key={v}
                        type="button"
                        className={`star ${starRating >= v ? "selected" : ""}`}
                        aria-pressed={starRating >= v}
                        onClick={() => setStarRating(v)}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 6px 0" }}>Set Vibe (your personal polar chart)</p>
                  <div className="polar-inputs">
                    {["Food", "Ambience", "Service", "Price", "Sustainability", "Location"].map(
                      (label, idx) => (
                        <label key={label} className="polar-input-row">
                          <span className="polar-input-label">{label}</span>
                          <input
                            type="range"
                            min={0}
                            max={5}
                            step={1}
                            value={userVibe[idx]}
                            onChange={(e) => {
                              const nv = [...userVibe];
                              nv[idx] = Number(e.target.value);
                              setUserVibe(nv);
                            }}
                          />
                          <span className="polar-input-value">{userVibe[idx]}</span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                <div style={{ width: 220 }}>
                  <p style={{ margin: "0 0 6px 0" }}>Preview</p>
                  <PolarChart values={userVibe} size={200} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="auth-submit"
                disabled={submitting || !user || starRating < 1 || reviewText.trim().length < 3}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message="Review submitted, Thank you!"
        visible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}
