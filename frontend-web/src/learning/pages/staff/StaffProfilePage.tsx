import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Pencil, X } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { clearSession, setSession } from "../../../auth/authStore";
import { fetchMe, updateProfile, userToSession } from "../../../lib/authApi";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";

type Props = {
  homeLabel: string;
  homeTo: string;
};

export default function StaffProfilePage({ homeLabel, homeTo }: Props) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [draft, setDraft] = useState({ firstName: "", lastName: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMe()
      .then((user) => {
        if (cancelled) return;
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setPhone(user.phone ?? "");
        setDraft({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          phone: user.phone ?? "",
        });
        setEmail(user.email || "");
        setAvatarUrl(user.avatar_url ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Profil indisponible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || email;

  function startEdit() {
    setDraft({ firstName, lastName, phone });
    setEditing(true);
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    setDraft({ firstName, lastName, phone });
    setEditing(false);
    setError("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const user = await updateProfile({
        first_name: draft.firstName,
        last_name: draft.lastName,
        phone: draft.phone || undefined,
      });
      setSession(userToSession(user));
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone ?? "");
      setEditing(false);
      setMessage("Profil mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearSession();
    navigate("/connexion");
  }

  if (loading) return <Loader variant="page" />;

  return (
    <section className="ck-schools-profile">
      <div className="ck-schools-profile__hero">
        <img src={getUserAvatarUrl(fullName, 88, avatarUrl)} alt="" width={88} height={88} />
        <div style={{ flex: 1 }}>
          <h2>Préférences</h2>
          <p>
            {homeLabel} · {email}
          </p>
        </div>
        {!editing ? (
          <button type="button" className="ck-btn ck-btn--primary ck-schools-edit-btn" onClick={startEdit}>
            <Pencil size={16} />
            Modifier
          </button>
        ) : (
          <button type="button" className="ck-btn ck-btn--ghost ck-schools-edit-btn" onClick={cancelEdit}>
            <X size={16} />
            Annuler
          </button>
        )}
      </div>

      <h3 className="ck-pro__section-title">Compte</h3>

      {!editing ? (
        <div className="ck-schools-readonly-grid" style={{ marginBottom: "1.6rem" }}>
          <div className="ck-schools-readonly">
            <span>Prénom</span>
            <strong>{firstName || "—"}</strong>
          </div>
          <div className="ck-schools-readonly">
            <span>Nom</span>
            <strong>{lastName || "—"}</strong>
          </div>
          <div className="ck-schools-readonly">
            <span>Téléphone</span>
            <strong>{phone || "—"}</strong>
          </div>
          <div className="ck-schools-readonly">
            <span>E-mail</span>
            <strong>{email || "—"}</strong>
          </div>
        </div>
      ) : (
        <form className="ck-schools-profile__form" onSubmit={(e) => void onSubmit(e)}>
          <div className="ck-schools-profile__grid">
            <label>
              Prénom
              <input
                value={draft.firstName}
                onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                required
              />
            </label>
            <label>
              Nom
              <input
                value={draft.lastName}
                onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                required
              />
            </label>
            <label className="ck-schools-profile__full">
              Téléphone
              <input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            </label>
            <label className="ck-schools-profile__full">
              E-mail
              <input value={email} disabled readOnly />
            </label>
          </div>
          {error ? <p className="ck-empty">{error}</p> : null}
          <button type="submit" className="ck-btn ck-btn--primary" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      )}

      {!editing && message ? <p className="ck-empty" style={{ color: "var(--ck-green, #00a859)" }}>{message}</p> : null}
      {!editing && error ? <p className="ck-empty">{error}</p> : null}

      <div className="ck-schools-profile__actions" style={{ marginTop: "1.6rem" }}>
        <button type="button" className="ck-btn ck-btn--ghost" onClick={() => navigate(homeTo)}>
          Retour
        </button>
        <button type="button" className="ck-pro__logout" onClick={logout}>
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </section>
  );
}
