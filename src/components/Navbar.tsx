import { Link, useNavigate, useLocation } from "react-router-dom";
import VouchLogo from "/assets/logos/VouchLogo.png";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
          <img src={VouchLogo} alt="Logo"/>
      </Link>
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
