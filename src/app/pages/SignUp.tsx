import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthErrorMessage } from "../../utils/authErrors";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signUp(email, password);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "signup"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="main">
      <div className="auth-card">
        <h1>Sign up</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error">{error}</p>}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </label>
          <button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
