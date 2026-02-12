import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AccountSettings from "../../components/AccountSettings";

export default function Profile() {
  const { user } = useAuth();
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
        <p className="profile-username">{user?.displayName ?? user?.email ?? "User"}</p>
        <p className="profile-email">{user?.email ?? "No email"}</p>
      </div>

      {showSettings && <AccountSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
