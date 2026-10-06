import type { Organization } from "../lib/organizations";
import type { Session } from "../lib/sessions";
import { formatHours, totalsByOrganization } from "../lib/sessions";

type OrgTotalsProps = {
  sessions: Session[];
  organizations: Organization[];
};

export default function OrgTotals({ sessions, organizations }: OrgTotalsProps) {
  const names = new Map(organizations.map((organization) => [organization.id, organization.name]));
  const totals = totalsByOrganization(sessions);

  if (totals.length === 0) {
    return <p className="muted">No hours logged this year yet.</p>;
  }

  return (
    <ul className="totals-list">
      {totals.map((total) => (
        <li key={total.orgId}>
          <span>{names.get(total.orgId) ?? "Deleted organization"}</span>
          <span className="totals-value">
            {formatHours(total.total)}
            {total.flagged > 0 && (
              <span className="badge warning">{formatHours(total.flagged)} to review</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}