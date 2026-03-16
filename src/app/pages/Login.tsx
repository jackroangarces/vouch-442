import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../services/firebase";
import { getAuthErrorMessage } from "../../utils/authErrors";

// Login Page
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "login"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(e: { preventDefault(): void }) {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccess("If an account exists for this email, you'll receive a password reset link. Check your inbox and spam folder.");
      setResetEmail("");
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;
      if (code === "auth/invalid-email") {
        setResetError("Please enter a valid email address.");
      } else {
        setResetError("Something went wrong. Please try again.");
      }
    } finally {
      setResetSubmitting(false);
    }
  }

  return (
    <div className="main">
      <div className="auth-card">
        <h1>Log in</h1>
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
              autoComplete="current-password"
            />
          </label>
          <p className="auth-forgot">
            <button
              type="button"
              className="auth-forgot-btn"
              onClick={() => {
                setShowForgotPassword(!showForgotPassword);
                setResetSuccess("");
                setResetError("");
              }}
            >
              Forgot password?
            </button>
          </p>
          <button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? "Signing in…" : "Log in"}
          </button>
        </form>

        {showForgotPassword && (
          <form onSubmit={handleForgotPassword} className="auth-form auth-forgot-form">
            <h2 className="auth-forgot-title">Reset password</h2>
            <p className="auth-forgot-hint">Enter your email and we'll send you a link to reset your password.</p>
            {resetSuccess && <p className="auth-success">{resetSuccess}</p>}
            {resetError && <p className="auth-error">{resetError}</p>}
            <label>
              Email
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </label>
            <button type="submit" disabled={resetSubmitting} className="auth-submit">
              {resetSubmitting ? "Sending…" : "Send reset email"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
