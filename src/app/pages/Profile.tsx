import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import AccountSettings from "../../components/AccountSettings";

// Profile Page
export default function Profile() {
  const { user } = useAuth();
  const { isBusiness } = useUserProfile();
  const [showSettings, setShowSettings] = useState(false);

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

      {showSettings && <AccountSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
