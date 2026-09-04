import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import type { UserRole } from "../../../auth/types";
import { createAdminUser } from "../../../lib/authApi";
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

type Form = {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone: string;
  password: string;
};

const EMPTY: Form = {
  first_name: "",
  last_name: "",
  email: "",
  role: "candidat",
  phone: "",
  password: "",
};

export default function AdminUserCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createAdminUser({
        email: form.email.trim(),
        role: form.role,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || undefined,
        country_code: "CM",
        langue: "fr",
        password: form.password.trim() || undefined,
      });
      navigate(`/espace/admin/utilisateurs/${created.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <PageBack to="/espace/admin/utilisateurs" label="Retour aux utilisateurs" />
        <h2 className="ck-title">Nouveau compte</h2>
        <p className="ck-subtitle">Créer un utilisateur plateforme.</p>
      </div>

      <ComponentCard title="Identité">
        <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSubmit(e)}>
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
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
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
            Mot de passe (optionnel)
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error ? <p className="ck-empty">{error}</p> : null}
          <div className="ck-schools-profile__actions">
            <Button type="submit" disabled={saving} startIcon={!saving ? <Plus size={16} strokeWidth={2.5} /> : undefined}>
              {saving ? "Création…" : "Créer le compte"}
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={() => navigate("/espace/admin/utilisateurs")}>
              Annuler
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
