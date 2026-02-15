import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Restaurant } from "../../types/restaurant";
import Toast from "../../components/Toast";
import PolarChart from "../../components/PolarChart";

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [reviewText, setReviewText] = useState('')
  const [starRating, setStarRating] = useState(0)
  const [userVibe, setUserVibe] = useState<number[]>([0,0,0,0,0,0])

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
                <p style={{margin:0}}>Rating</p>
                <div className="star-rating" role="radiogroup" aria-label="Star rating">
                  {Array.from({length:5}).map((_,i)=>{
                    const v = i+1
                    return (
                      <button
                        key={v}
                        type="button"
                        className={`star ${starRating>=v? 'selected': ''}`}
                        aria-pressed={starRating>=v}
                        onClick={() => setStarRating(v)}
                      >
                        ★
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{display:'flex',gap:12,alignItems:'flex-start',marginTop:12}}>
                <div style={{flex:1}}>
                  <p style={{margin:'0 0 6px 0'}}>Set Vibe (your personal polar chart)</p>
                  <div className="polar-inputs">
                    {['Food','Location','Ambience','Service','Price','Sustainability'].map((label, idx)=> (
                      <label key={label} className="polar-input-row">
                        <span className="polar-input-label">{label}</span>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          step={1}
                          value={userVibe[idx]}
                          onChange={(e) => {
                            const nv = [...userVibe]
                            nv[idx] = Number(e.target.value)
                            setUserVibe(nv)
                          }}
                        />
                        <span className="polar-input-value">{userVibe[idx]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{width:220}}>
                  <p style={{margin:'0 0 6px 0'}}>Preview</p>
                  <PolarChart values={userVibe} size={200} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="auth-submit"
                onClick={() => {
                  setShowToast(true)
                  setShowReviewModal(false)
                }}
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
