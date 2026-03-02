import { Link, useNavigate, useLocation } from "react-router-dom";
import VouchLogo from "/assets/logos/VouchLogo.png";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import AddBusinessModal from "./AddBusinessModal";
import { useState, type FormEvent } from "react";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('')
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
  
  function onSearch(e: FormEvent) {
    e.preventDefault()
    
    console.log('search submit', q)
    
  }

  return (
    <nav className="navbar" role="navigation">
      <Link to="/" className="navbar-logo">
          <img src="../../public/assets/logos/VouchLogo.png"
              width="205" 
              height="77"
              alt="Vouch logo"
              fetchpriority="high"
              decoding="async"/>
      </Link>
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
