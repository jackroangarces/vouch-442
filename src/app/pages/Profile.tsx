import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import AccountSettings from "../../components/AccountSettings";
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
