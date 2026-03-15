import { Link, useNavigate, useLocation } from "react-router-dom";
import VouchLogo from "/assets/logos/VouchLogo.png";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import AddBusinessModal from "./AddBusinessModal";
import { useState } from "react";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isBusiness } = useUserProfile();
  const [showAddBusiness, setShowAddBusiness] = useState(false);

  function openAddBusiness() {
    setShowAddBusiness(true);
  }

  function closeAddBusiness() {
    setShowAddBusiness(false);
  }

  function onBusinessCreated() {
    setShowAddBusiness(false);
    navigate("/profile/businesses");
  }

  return (
    <nav className="navbar" role="navigation">
      <Link to="/" className="navbar-logo">
          <img
              src={VouchLogo}
              width="205" 
              height="77"
              alt="Vouch logo"
              decoding="async"/>
      </Link>
      <div className="navbar-center">
        <form className="navbar-search" onSubmit={onSearch}>
          <input
            aria-label="Search restaurants"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <Link to="/how-it-works" className="navbar-how-it-works">
          How it works
        </Link>
      </div>
      <div className="navbar-right">
        {loading ? (
          <span className="navbar-user">…</span>
        ) : user ? (
          <div className="navbar-user">
            <button type="button" className="navbar-profile" onClick={() => navigate("/profile")}>
            {user.displayName || user.email}
            </button>
            {isBusiness === false && (
  <button type="button" className="navbar-add-business" onClick={openAddBusiness}>
    Add A Business
  </button>
)}
            <button type="button" className="navbar-logout" onClick={async () => {
              await logout();
              if (location.pathname === "/profile") navigate("/");
            }}>
              Log out
            </button>
          </div>
        ) : (
          
          <Link to="/login" className="navbar-login">
            Login
          </Link>
        )}
      </div>
      {showAddBusiness && (
        <AddBusinessModal onClose={closeAddBusiness} onSuccess={onBusinessCreated} />
      )}
    </nav>
  );
}
