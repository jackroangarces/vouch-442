/**
 * Map Firebase Auth error codes to user-friendly messages.
 */
export function getAuthErrorMessage(err: unknown, context: "login" | "signup"): string {
  const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;

  if (context === "login") {
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      return "Wrong email or password. Please try again.";
    }
    if (code === "auth/user-not-found") {
      return "No account found with this email.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
  }

  if (context === "signup") {
    if (code === "auth/email-already-in-use") {
      return "This email is already in use. Try logging in instead.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/weak-password") {
      return "Password should be at least 6 characters.";
    }
  }

  return err instanceof Error ? err.message : context === "login" ? "Failed to log in." : "Failed to create account.";
}
