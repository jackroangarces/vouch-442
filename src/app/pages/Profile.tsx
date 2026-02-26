import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import AccountSettings from "../../components/AccountSettings";
import PolarChart from "../../components/PolarChart";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

interface FavoriteRestaurant {
  restaurantId: string;
  restaurantName: string;
  rating: number;
}

// Profile Page
export default function Profile() {
  const { user } = useAuth();
  const { isBusiness } = useUserProfile();
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [profileVibe, setProfileVibe] = useState<number[] | null>(null);
  const [profileReviewCount, setProfileReviewCount] = useState(0);
  const [loadingProfileVibe, setLoadingProfileVibe] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!user?.uid) {
        setLoadingFavorites(false);
        return;
      }

      try {
        // Query reviews with rating > 3, sorted by rating desc, then createdAt desc
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid),
          where("rating", ">", 3),
          orderBy("rating", "desc"),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);
        const favoritesList: FavoriteRestaurant[] = [];

        // Fetch restaurant names for each review
        for (const reviewDoc of reviewsSnapshot.docs) {
          const reviewData = reviewDoc.data();
          const restaurantId = reviewData.restaurantId;
          const rating = reviewData.rating;

          if (restaurantId) {
            try {
              const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
              if (restaurantDoc.exists()) {
                const restaurantData = restaurantDoc.data();
                favoritesList.push({
                  restaurantId,
                  restaurantName: restaurantData.restaurantName || "Unknown Restaurant",
                  rating,
                });
              }
            } catch (error) {
              console.error(`Failed to fetch restaurant ${restaurantId}:`, error);
            }
          }
        }

        setFavorites(favoritesList);
      } catch (error) {
        console.error("Failed to load favorites:", error);
        setFavorites([]);
      } finally {
        setLoadingFavorites(false);
      }
    }

    loadFavorites();
  }, [user?.uid]);

  useEffect(() => {
    async function loadProfileVibe() {
      setLoadingProfileVibe(true);

      if (!user?.uid) {
        setProfileVibe(null);
        setProfileReviewCount(0);
        setLoadingProfileVibe(false);
        return;
      }

      try {
        const snap = await getDocs(
          query(collection(db, "reviews"), where("userId", "==", user.uid))
        );

        const reviews: { rating: number; vibe: number[] }[] = [];

        snap.forEach((d) => {
          const data = d.data() as any;
          const rating = Number(data.rating);
          const vibeRaw = data.vibe;

          if (!Array.isArray(vibeRaw) || !Number.isFinite(rating)) return;

          const vibe = vibeRaw.map((x: unknown) => {
            const n = Number(x);
            if (!Number.isFinite(n)) return 0;
            return Math.max(0, Math.min(5, n));
          });

          if (vibe.length === 0) return;

          reviews.push({ rating, vibe });
        });

        if (reviews.length === 0) {
          setProfileVibe(null);
          setProfileReviewCount(0);
          return;
        }

        // Determine number of vibe axes from data (length agnostic)
        let maxLen = 0;
        for (const r of reviews) {
          if (Array.isArray(r.vibe)) {
            maxLen = Math.max(maxLen, r.vibe.length);
          }
        }

        if (maxLen === 0) {
          setProfileVibe(null);
          setProfileReviewCount(0);
          return;
        }

        const sums = new Array(maxLen).fill(0);
        let den = 0;

        for (const r of reviews) {
          const w = Math.max(0, r.rating - 3); // weightFn aggregate logic to give more weight to higher ratings
          if (w <= 0) continue;

          den += w;
          for (let j = 0; j < maxLen; j++) {
            const v = Number(r.vibe[j] ?? 0);
            if (!Number.isFinite(v)) continue;
            const clamped = Math.max(0, Math.min(5, v));
            sums[j] += clamped * w;
          }
        }

        if (den === 0) {
          // Fallback neutral: mid-point (3) on each axis
          setProfileVibe(new Array(maxLen).fill(3));
          setProfileReviewCount(reviews.length);
          return;
        }

        const avg = sums.map((s) => Math.round(((s / den) * 10)) / 10);
        setProfileVibe(avg);
        setProfileReviewCount(reviews.length);
      } catch (error) {
        console.error("Failed to load profile vibe:", error);
        setProfileVibe(null);
        setProfileReviewCount(0);
      } finally {
        setLoadingProfileVibe(false);
      }
    }

    loadProfileVibe();
  }, [user?.uid]);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img
          src="/assets/placeholder.png"
          alt="Profile"
          className="profile-avatar"
        />
        <button
          className="profile-settings-btn"
          onClick={() => setShowSettings(true)}
        >
          Account Settings
        </button>
        {isBusiness && (
          <Link to="/profile/businesses" className="profile-business-dashboard-btn">
            Business Dashboard
          </Link>
        )}
        <p className="profile-username">{user?.displayName ?? user?.email ?? "User"}</p>
        <p className="profile-email">{user?.email ?? "No email"}</p>
      </div>

      <div className="profile-vibe-wrapper">
        <p className="profile-vibe-title">Your Vibe</p>
        {loadingProfileVibe ? (
          <p className="profile-vibe-meta">Loading vibe…</p>
        ) : profileVibe == null ? (
          <p className="profile-vibe-meta">No reviews yet</p>
        ) : (
          <>
            <div className="profile-vibe-chart">
              <PolarChart values={profileVibe} size={260} />
            </div>
            <p className="profile-vibe-meta">
              Based on {profileReviewCount} review{profileReviewCount === 1 ? "" : "s"}
            </p>
          </>
        )}
      </div>

      <div className="profile-favorites-wrapper">
        <p className="profile-favorites-title">Top Restaurants</p>
        {loadingFavorites ? (
          <p className="profile-favorites-loading">Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <p className="profile-favorites-empty">This user has no favorites</p>
        ) : (
          <div className="profile-favorites-grid">
            {favorites.map((favorite) => (
              <div key={favorite.restaurantId} className="profile-favorite-card">
                <Link to={`/restaurant/${favorite.restaurantId}`}>
                  <h3 className="profile-favorite-name">{favorite.restaurantName}</h3>
                </Link>
                <p className="profile-favorite-rating">Rating: {favorite.rating}/5</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSettings && <AccountSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
