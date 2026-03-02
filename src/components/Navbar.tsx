import { Link, useNavigate, useLocation } from "react-router-dom";
import VouchLogo from "/assets/logos/VouchLogo.png";
import { useAuth } from "../contexts/AuthContext";
import { useState } from 'react';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('')
  
  function onSearch(e: React.FormEvent) {
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
      <form className="navbar-search" onSubmit={onSearch}>
        <label htmlFor="search-input" className="visually-hidden">
          Search restaurants
        </label>

        <input
          id="search-input"
          type="search"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>
      <div className="navbar-right">
        {loading ? (
          <span className="navbar-user">…</span>
        ) : user ? (
          <div className="navbar-user">
            <button type="button" className="navbar-profile" onClick={() => navigate("/profile")}>
              {user.displayName}
            </button>
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
    </nav>
  );
}
