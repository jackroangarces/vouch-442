import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  deleteUser,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "../services/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (newName: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string) {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    const defaultUsername = email.split("@")[0];
    await updateProfile(newUser, { displayName: defaultUsername });
  }

  async function logout() {
    await firebaseSignOut(auth);
  }

  async function updateUsername(newName: string) {
    if (!auth.currentUser) throw new Error("Not signed in");
    await updateProfile(auth.currentUser, { displayName: newName });
    // Force react state refresh so UI updates immediately
    setUser({ ...auth.currentUser } as User);
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error("Not signed in");
    if (oldPassword === newPassword) {
      throw new Error("New password must be different from old password");
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }

  async function deleteAccount(password: string) {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error("Not signed in");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await deleteUser(auth.currentUser);
  }

  const value: AuthContextValue = { user, loading, login, signUp, logout, updateUsername, changePassword, deleteAccount };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
