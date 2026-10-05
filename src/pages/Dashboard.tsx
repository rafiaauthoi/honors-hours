import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="center">
      <div className="card">
        <h1>Dashboard</h1>
        <p className="subtitle">Signed in as {user?.email}</p>
        <button type="button" className="secondary" onClick={() => signOut(auth)}>
          Sign out
        </button>
      </div>
    </div>
  );
}