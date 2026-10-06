import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../lib/profile";
import type { Profile } from "../lib/profile";
import { listOrganizations } from "../lib/organizations";
import type { Organization } from "../lib/organizations";
import {
  flaggedHours,
  formatHours,
  listSessionsForYear,
  roundHours,
  totalHours,
} from "../lib/sessions";
import type { Session } from "../lib/sessions";
import { currentAcademicYear, daysUntilDeadline, deadlineYear } from "../lib/academicYear";
import OrgTotals from "../components/OrgTotals";

export default function Dashboard() {
  const { user } = useAuth();
  const academicYear = currentAcademicYear();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getProfile(user.uid),
      listOrganizations(user.uid),
      listSessionsForYear(user.uid, academicYear),
    ])
      .then(([profileResult, organizationResult, sessionResult]) => {
        setProfile(profileResult);
        setOrganizations(organizationResult);
        setSessions(sessionResult);
      })
      .catch(() => setError("Could not load your dashboard. Refresh to try again."))
      .finally(() => setLoading(false));
  }, [user, academicYear]);

  if (loading) return <p className="muted">Loading...</p>;

  const required = profile?.requirements[academicYear] ?? 20;
  const completed = totalHours(sessions);
  const toReview = flaggedHours(sessions);
  const met = completed >= required;
  const percent = Math.min(100, Math.round((completed / required) * 100));
  const remaining = Math.max(0, required - completed);
  const daysLeft = daysUntilDeadline(academicYear);
  const deadline = `June 30, ${deadlineYear(academicYear)}`;

  return (
    <section className="page">
      <h1>{profile ? `Hi, ${profile.preferredName}` : "Welcome"}</h1>
      <p className="subtitle">Academic year {academicYear}, July 1 to June 30</p>
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

      <div className="panel">
        <div className="progress-header">
          <h2>Progress</h2>
          <span className="progress-count">
            <strong>{roundHours(completed)}</strong> of {required} hours
          </span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Service hours completed"
          aria-valuemin={0}
          aria-valuemax={required}
          aria-valuenow={roundHours(completed)}
        >
          <div className={`progress-bar${met ? " complete" : ""}`} style={{ width: `${percent}%` }} />
        </div>
        <p className="muted">
          {met
            ? `Requirement met. Submit your LHC service log before ${deadline}.`
            : `${formatHours(remaining)} to go. ${daysLeft} ${daysLeft === 1 ? "day" : "days"} until ${deadline}.`}
        </p>
        {toReview > 0 && (
          <p className="warning-box">
            {formatHours(toReview)} marked for review. They count toward your total, but look them
            over before you submit.
          </p>
        )}
        <Link className="button" to="/log">
          Log hours
        </Link>
      </div>

      <div className="panel">
        <h2>By organization</h2>
        <OrgTotals sessions={sessions} organizations={organizations} />
      </div>
    </section>
  );
}