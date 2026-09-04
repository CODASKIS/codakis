import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Pencil, Save, Trash2, UserX, UserCheck } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { getSession } from "../../../auth/authStore";
import type { UserRole } from "../../../auth/types";
import {
  deleteAdminUser,
  fetchAdminUser,
  fetchAdminUserConsort,
  updateAdminUser,
  type ApiUser,
  type ConsortDossier,
} from "../../../lib/authApi";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import PageBack from "../../common/PageBack";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const ROLES: UserRole[] = ["admin", "candidat", "moniteur", "gerant"];
const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  candidat: "Candidat",
  gerant: "Gérant",
  moniteur: "Moniteur",
};

type EditForm = {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone: string;
  password: string;
};

function fullName(user: ApiUser) {
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

export default function AdminUserDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const currentUserId = getSession()?.id;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [consort, setConsort] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchAdminUser(id)
      .then((data) => {
        if (cancelled) return;
        setUser(data);
        setForm({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          role: data.role,
          phone: data.phone ?? "",
          password: "",
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "candidat") {
      setConsort(null);
      return;
    }
    let cancelled = false;
    void fetchAdminUserConsort(user.id)
      .then((d) => {
        if (!cancelled) setConsort(d);
      })
      .catch(() => {
        if (!cancelled) setConsort(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!user || !form) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateAdminUser(user.id, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: form.role,
        password: form.password.trim() || undefined,
      });
      setUser(updated);
      setForm({ ...form, password: "" });
      setEditing(false);
      setMessage("Profil mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive() {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active });
      setUser(updated);
      setMessage(updated.is_active ? "Compte activé." : "Compte désactivé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!user) return;
    if (user.id === currentUserId) {
      setError("Impossible de supprimer votre propre compte.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await deleteAdminUser(user.id);
      navigate("/espace/admin/utilisateurs", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
      setBusy(false);
    }
  }

  if (loading) return <Loader variant="page" />;
  if (!user || !form) {
    return (
      <div className="space-y-4">
        <PageBack to="/espace/admin/utilisateurs" />
        <p className="ck-empty">{error || "Utilisateur introuvable."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <PageBack to="/espace/admin/utilisateurs" label="Retour aux utilisateurs" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="ck-schools-person">
            <img src={getUserAvatarUrl(fullName(user), 64, user.avatar_url)} alt="" width={64} height={64} />
            <div>
              <h2 className="ck-title" style={{ margin: 0 }}>
                {fullName(user)}
              </h2>
              <p className="ck-subtitle" style={{ margin: "0.3rem 0 0" }}>
                {user.email} · {ROLE_LABEL[user.role]}
              </p>
            </div>
          </div>
          {!editing ? (
            <Button startIcon={<Pencil size={16} strokeWidth={2.5} />} onClick={() => setEditing(true)}>
              Modifier
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}
      {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}

      {!editing ? (
        <>
          <div className="ck-schools-metrics ta-duo-metrics">
            <div>
              <strong>{user.phone || "—"}</strong>
              <span>Téléphone</span>
            </div>
            <div>
              <strong>
                <span className={`ck-schools-pill${user.is_active ? " is-on" : " is-off"}`}>
                  {user.is_active ? "Actif" : "Inactif"}
                </span>
              </strong>
              <span>Statut</span>
            </div>
            <div>
              <strong>{user.school_name || "—"}</strong>
              <span>École</span>
            </div>
            <div>
              <strong>{user.city || user.country_code || "—"}</strong>
              <span>Localisation</span>
            </div>
          </div>

          {consort ? (
            <section className="ck-schools-panel">
              <div className="ck-schools-panel__head">
                <h2>Dossier consort · {consort.progress_percent}%</h2>
              </div>
              <ul className="ck-schools-mini-list">
                {consort.pieces.map((p) => (
                  <li key={p.key}>
                    <div>
                      <strong>{p.key}</strong>
                      <span>
                        {p.status === "validated" ? "Validée" : p.status === "pending" ? "En attente" : "Manquante"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="ck-schools-panel">
            <div className="ck-schools-panel__head">
              <h2>Actions</h2>
            </div>
            <div className="ck-schools-profile__actions flex-wrap">
              <Button
                variant="outline"
                disabled={busy}
                startIcon={
                  user.is_active ? <UserX size={16} strokeWidth={2.5} /> : <UserCheck size={16} strokeWidth={2.5} />
                }
                onClick={() => void onToggleActive()}
              >
                {user.is_active ? "Désactiver" : "Activer"}
              </Button>
              {user.id !== currentUserId ? (
                <Button
                  variant="danger"
                  startIcon={<Trash2 size={16} strokeWidth={2.5} />}
                  onClick={() => setConfirmDelete(true)}
                >
                  Supprimer
                </Button>
              ) : null}
            </div>
            {confirmDelete ? (
              <div className="ta-duo-alert" style={{ marginTop: "1.4rem" }}>
                <p>Confirmer la suppression de {fullName(user)} ?</p>
                <div className="ck-schools-profile__actions" style={{ marginTop: "1rem" }}>
                  <Button variant="danger" disabled={busy} onClick={() => void onDelete()}>
                    Confirmer
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <ComponentCard title="Modifier le profil">
          <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSave(e)}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label>
                Prénom
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </label>
              <label>
                Nom
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </label>
            </div>
            <label>
              E-mail
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label>
                Rôle
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Téléphone
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
            </div>
            <label>
              Nouveau mot de passe
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <div className="ck-schools-profile__actions">
              <Button type="submit" disabled={saving} startIcon={<Save size={16} strokeWidth={2.5} />}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </ComponentCard>
      )}
    </div>
  );
}
