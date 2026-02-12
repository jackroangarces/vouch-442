import { Link } from "react-router-dom";
import viteLogo from "/assets/logos/vite.svg";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={viteLogo} alt="Logo" />
      </Link>
      <div className="navbar-right">
        {loading ? (
          <span className="navbar-user">…</span>
        ) : user ? (
          <div className="navbar-user">
            <span>{user.email}</span>
            <button type="button" className="navbar-logout" onClick={() => logout()}>
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
