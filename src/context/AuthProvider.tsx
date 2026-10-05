import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setEmailVerified(firebaseUser?.emailVerified ?? false);
      setLoading(false);
    });
  }, []);

  async function refreshUser() {
    const current = auth.currentUser;
    if (!current) return false;
    await current.reload();
    if (current.emailVerified) {
      await current.getIdToken(true);
    }
    setEmailVerified(current.emailVerified);
    return current.emailVerified;
  }

  return (
    <AuthContext.Provider value={{ user, emailVerified, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}