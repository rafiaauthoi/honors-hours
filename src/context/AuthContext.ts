import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export type AuthContextValue = {
  user: User | null;
  emailVerified: boolean;
  loading: boolean;
  refreshUser: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}