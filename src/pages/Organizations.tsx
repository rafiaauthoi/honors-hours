import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createOrganization,
  deleteOrganization,
  emptyOrganization,
  hasCompleteContact,
  listOrganizations,
  normalizeOrganization,
  sortOrganizations,
  updateOrganization,
} from "../lib/organizations";
import type { Organization, OrganizationInput } from "../lib/organizations";
import { organizationHasSessions } from "../lib/sessions";

export default function Organizations() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState<OrganizationInput>(emptyOrganization);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!user) return;
    listOrganizations(user.uid)
      .then(setOrganizations)
      .catch(() => setError("Could not load your organizations. Refresh to try again."))
      .finally(() => setLoading(false));
  }, [user]);

  function update(key: keyof OrganizationInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyOrganization);
  }

  function startEdit(organization: Organization) {
    setEditingId(organization.id);
    setForm({
      name: organization.name,
      contactName: organization.contactName,
      mailingAddress: organization.mailingAddress,
      contactInfo: organization.contactInfo,
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setError("");
    setNotice("");

    const cleaned = normalizeOrganization(form);
    if (!cleaned.name) {
      setError("Organization name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateOrganization(user.uid, editingId, cleaned);
        const id = editingId;
        setOrganizations((current) =>
          sortOrganizations(
            current.map((organization) =>
              organization.id === id ? { ...cleaned, id } : organization
            )
          )
        );
        setNotice("Organization updated.");
      } else {
        const id = await createOrganization(user.uid, cleaned);
        setOrganizations((current) => sortOrganizations([...current, { ...cleaned, id }]));
        setNotice("Organization added.");
      }
      resetForm();
    } catch {
      setError("Could not save the organization. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(organization: Organization) {
    if (!user) return;
    setError("");
    setNotice("");

    try {
      const hasSessions = await organizationHasSessions(user.uid, organization.id);
      if (hasSessions) {
        setError(
          `${organization.name} has logged hours. Delete those sessions on the Log Hours page first.`
        );
        return;
      }
    } catch {
      setError("Could not check for logged hours. Try again.");
      return;
    }

    const confirmed = window.confirm(`Delete ${organization.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteOrganization(user.uid, organization.id);
      setOrganizations((current) => current.filter((item) => item.id !== organization.id));
      if (editingId === organization.id) resetForm();
      setNotice(`${organization.name} deleted.`);
    } catch {
      setError("Could not delete the organization. Try again.");
    }
  }

  return (
    <section className="page">
      <h1>Organizations</h1>
      <p className="subtitle">
        Save each nonprofit once, then log hours against it. The LHC form asks for a contact
        person at each organization.
      </p>

      <form className="panel" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit organization" : "Add an organization"}</h2>
        <label>
          Organization name
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label>
          Contact person
          <span className="hint">First and last name of the person overseeing your hours</span>
          <input
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            maxLength={120}
            autoComplete="off"
          />
        </label>
        <label>
          Organization mailing address
          <textarea
            value={form.mailingAddress}
            onChange={(e) => update("mailingAddress", e.target.value)}
            maxLength={300}
            rows={2}
          />
        </label>
        <label>
          Contact email or phone
          <input
            value={form.contactInfo}
            onChange={(e) => update("contactInfo", e.target.value)}
            maxLength={150}
            autoComplete="off"
          />
        </label>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <div className="button-row">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Add organization"}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="section-title">Your organizations</h2>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : organizations.length === 0 ? (
        <p className="muted">No organizations yet. Add the first place you volunteer with above.</p>
      ) : (
        <ul className="org-list">
          {organizations.map((organization) => (
            <li key={organization.id} className="org-card">
              <div className="org-card-header">
                <h3>{organization.name}</h3>
                {!hasCompleteContact(organization) && (
                  <span className="badge warning">Contact info needed</span>
                )}
              </div>
              <dl className="org-details">
                <dt>Contact</dt>
                <dd>{organization.contactName || "Not added"}</dd>
                <dt>Address</dt>
                <dd>{organization.mailingAddress || "Not added"}</dd>
                <dt>Email or phone</dt>
                <dd>{organization.contactInfo || "Not added"}</dd>
              </dl>
              <div className="button-row">
                <button
                  type="button"
                  className="secondary small"
                  onClick={() => startEdit(organization)}
                  aria-label={`Edit ${organization.name}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger small"
                  onClick={() => handleDelete(organization)}
                  aria-label={`Delete ${organization.name}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}