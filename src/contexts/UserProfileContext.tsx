import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

type UserProfile = {
  isBusiness: boolean;
};

type UserProfileContextValue = {
  isBusiness: boolean;
  profileLoading: boolean;
  upgradeToBusiness: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const uid = user.uid;
    let cancelled = false;

    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (cancelled) return;

        if (snap.exists()) {
          setProfile({ isBusiness: snap.data().isBusiness ?? false });
        } else {
          // Create default profile for new user
          await setDoc(ref, { isBusiness: false });
          setProfile({ isBusiness: false });
        }
      } catch {
        if (!cancelled) setProfile({ isBusiness: false });
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  async function upgradeToBusiness() {
    if (!user) throw new Error("Not signed in");
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { isBusiness: true }, { merge: true });
    setProfile((p) => (p ? { ...p, isBusiness: true } : { isBusiness: true }));
  }

  const value: UserProfileContextValue = {
    isBusiness: profile?.isBusiness ?? false,
    profileLoading,
    upgradeToBusiness,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (ctx == null) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return ctx;
}
