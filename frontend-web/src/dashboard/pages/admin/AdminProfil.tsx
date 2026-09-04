import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Pencil, X } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { clearSession, setSession } from "../../../auth/authStore";
import { fetchMe, updateProfile, userToSession } from "../../../lib/authApi";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

export default function AdminProfil() {
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
    <div className="space-y-6">
      <div>
        <h2 className="ck-title">Profil</h2>
        <p className="ck-subtitle">Espace admin · {email}</p>
      </div>

      <ComponentCard
        title="Compte"
        action={
          !editing ? (
            <Button size="sm" variant="outline" startIcon={<Pencil size={16} strokeWidth={2.5} />} onClick={startEdit}>
              Modifier
            </Button>
          ) : (
            <Button size="sm" variant="outline" startIcon={<X size={16} strokeWidth={2.5} />} onClick={cancelEdit}>
              Annuler
            </Button>
          )
        }
      >
        <div className="mb-6 flex items-center gap-4">
          <img
            src={getUserAvatarUrl(fullName, 72, avatarUrl)}
            alt=""
            width={72}
            height={72}
            className="rounded-full object-cover"
            style={{ border: "0.25rem solid color-mix(in srgb, var(--ck-green) 35%, white)" }}
          />
          <div>
            <p className="ta-strong">{fullName}</p>
            <p className="ta-muted">{email}</p>
          </div>
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["Prénom", firstName],
              ["Nom", lastName],
              ["Téléphone", phone],
              ["E-mail", email],
            ].map(([label, value]) => (
              <div key={label} className="ck-schools-readonly">
                <span>{label}</span>
                <strong>{value || "—"}</strong>
              </div>
            ))}
          </div>
        ) : (
          <form className="ck-schools-profile__form space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <div className="ck-schools-profile__grid">
              <Input
                label="Prénom"
                value={draft.firstName}
                onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                required
              />
              <Input
                label="Nom"
                value={draft.lastName}
                onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                required
              />
              <Input
                label="Téléphone"
                full
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              />
              <Input label="E-mail" full value={email} disabled readOnly />
            </div>
            {error ? <p className="ck-empty">{error}</p> : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        )}

        {!editing && message ? (
          <p className="ck-empty" style={{ color: "var(--ck-green)" }}>
            {message}
          </p>
        ) : null}
        {!editing && error ? <p className="ck-empty">{error}</p> : null}
      </ComponentCard>

      <div className="ck-schools-profile__actions" style={{ marginTop: 0 }}>
        <Button variant="ghost" onClick={() => navigate("/espace/admin")}>
          Retour
        </Button>
        <Button variant="ghost" startIcon={<LogOut size={16} strokeWidth={2.5} />} onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
