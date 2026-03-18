import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import RestaurantImagesModal from "../../components/RestaurantImagesModal";
import AddBusinessModal from "../../components/AddBusinessModal";
import type { Restaurant } from "../../types/restaurant";

export default function ProfileBusinesses() {
  const { user } = useAuth();
  const { isBusiness, profileLoading } = useUserProfile();

  const [businesses, setBusinesses] = useState<Restaurant[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [showAddBusiness, setShowAddBusiness] = useState(false);

  async function loadBusinesses() {
    if (!user) return;
    setLoadingBusinesses(true);
    try {
      const snap = await getDocs(
        query(collection(db, "restaurants"), where("ownerId", "==", user.uid)),
      );
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Restaurant[];
      setBusinesses(rows);
    } finally {
      setLoadingBusinesses(false);
    }
  }

  function openImages(restaurantId: string) {
    setActiveRestaurantId(restaurantId);
  }

  async function closeImages() {
    setActiveRestaurantId(null);
    await loadBusinesses();
  }

  function openAddBusiness() {
    setShowAddBusiness(true);
  }

  async function closeAddBusiness() {
    setShowAddBusiness(false);
    await loadBusinesses();
  }

  function onBusinessCreated() {
    setShowAddBusiness(false);
    void loadBusinesses();
  }

  useEffect(() => {
    void loadBusinesses();
  }, [user?.uid]);

  if (!user) {
    return (
      <div className="main">
        <h1>Business Dashboard</h1>
        <p className="auth-error">Please log in.</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="main">
        <h1>Business Dashboard</h1>
        <p>Loading…</p>
      </div>
    );
  }

  const effectiveBusiness = isBusiness || businesses.length > 0;

  if (!effectiveBusiness) {
    return (
      <div className="main">
        <h1>Business Dashboard</h1>
        <p className="auth-error">You are not a restaurant owner.</p>
        <button type="button" className="auth-submit" onClick={openAddBusiness}>
          Add A Business
        </button>

        {showAddBusiness && (
          <AddBusinessModal onClose={closeAddBusiness} onSuccess={onBusinessCreated} />
        )}
      </div>
    );
  }

  return (
    <div className="main">
      <h1>Business Dashboard</h1>

      <button type="button" className="auth-submit" onClick={openAddBusiness}>
        Add Another Business
      </button>

      {loadingBusinesses ? (
        <p style={{ opacity: 0.7 }}>Loading businesses…</p>
      ) : businesses.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No businesses yet</p>
      ) : (
        <div className="business-grid">
          {businesses.map((b) => {
            const cover = b.images?.[0]?.url || "/assets/placeholder.png";
            return (
              <div key={b.id} className="business-card">
                <img className="business-card-img" src={cover} alt={b.restaurantName} />
                <div className="business-card-body">
                  <div className="business-card-title">{b.restaurantName}</div>
                  <div className="business-card-sub">{b.location || ""}</div>

                  <div className="business-card-actions">
                    <button type="button" className="business-upgrade-btn" onClick={() => openImages(b.id)}>
                      Manage images
                    </button>
                    <Link to={`/restaurant/${b.id}`} className="business-link">
                      View page
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddBusiness && (
        <AddBusinessModal onClose={closeAddBusiness} onSuccess={onBusinessCreated} />
      )}

      {activeRestaurantId && (
        <RestaurantImagesModal restaurantId={activeRestaurantId} onClose={() => void closeImages()} />
      )}
    </div>
  );
}