import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }: { children: ReactNode }) {
  const { user, emailVerified, loading } = useAuth();

  if (loading) return <div className="center">Loading...</div>;
  if (user && emailVerified) return <Navigate to="/" replace />;
  if (user) return <Navigate to="/verify" replace />;
  return <>{children}</>;
}