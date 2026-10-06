import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../lib/profile";
import type { Profile } from "../lib/profile";
import { currentAcademicYear, deadlineYear } from "../lib/academicYear";

export default function Dashboard() {
  const { user } = useAuth();
  const academicYear = currentAcademicYear();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid)
      .then(setProfile)
      .catch(() => setError("Could not load your profile. Refresh to try again."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <section className="page">
      <h1>{profile ? `Hi, ${profile.preferredName}` : "Welcome"}</h1>
      <p className="subtitle">
        Academic year {academicYear}, July 1 to June 30
      </p>
      {error && <p className="error">{error}</p>}
      {!profile && !error && (
        <div className="panel">
          <h2>Finish setting up</h2>
          <p>Add your name and honors college details. They fill in the LHC service log later.</p>
          <Link className="button" to="/profile">
            Set up profile
          </Link>
        </div>
      )}
      {profile && (
        <div className="panel">
          <h2>Your requirement</h2>
          <p>
            <strong>{profile.requirements[academicYear] ?? 20} hours</strong> due by June 30,{" "}
            {deadlineYear(academicYear)}.
          </p>
          <p className="muted">Logging hours is coming soon.</p>
        </div>
      )}
    </section>
  );
}