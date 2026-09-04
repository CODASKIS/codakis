import { FormEvent, useEffect, useState } from "react";
import { Building2, Pencil, ShieldCheck, X } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchGerantSchool, updateGerantSchool, type GerantSchool } from "../../../lib/authApi";
import ComponentCard from "../../../dashboard/common/ComponentCard";
import Button from "../../../dashboard/ui/Button";

type FormState = {
  raisonSociale: string;
  adresse: string;
  ville: string;
  quartier: string;
  telephone: string;
  siteWeb: string;
  description: string;
  descriptionLongue: string;
  accessInfo: string;
  nombreMoniteurs: string;
  nombreVehicules: string;
  anneesExperience: string;
};

function fromSchool(data: GerantSchool): FormState {
  return {
    raisonSociale: data.raison_sociale || "",
    adresse: data.adresse || "",
    ville: data.ville || "",
    quartier: data.quartier || "",
    telephone: data.telephone || "",
    siteWeb: data.site_web || "",
    description: data.description || "",
    descriptionLongue: data.description_longue || "",
    accessInfo: data.access_info || "",
    nombreMoniteurs: data.nombre_moniteurs != null ? String(data.nombre_moniteurs) : "",
    nombreVehicules: data.nombre_vehicules != null ? String(data.nombre_vehicules) : "",
    anneesExperience: data.annees_experience != null ? String(data.annees_experience) : "",
  };
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ck-schools-readonly">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export default function GerantParametresPage() {
  const [school, setSchool] = useState<GerantSchool | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchGerantSchool()
      .then((data) => {
        if (cancelled) return;
        setSchool(data);
        setForm(fromSchool(data));
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
  }, []);

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function startEdit() {
    if (!school) return;
    setForm(fromSchool(school));
    setEditing(true);
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    if (school) setForm(fromSchool(school));
    setEditing(false);
    setError("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateGerantSchool({
        raison_sociale: form.raisonSociale,
        adresse: form.adresse,
        city: form.ville || undefined,
        quartier: form.quartier || undefined,
        telephone: form.telephone || undefined,
        description: form.description || undefined,
        description_longue: form.descriptionLongue || undefined,
        access_info: form.accessInfo || undefined,
        site_web: form.siteWeb || undefined,
        nombre_moniteurs: form.nombreMoniteurs ? Number(form.nombreMoniteurs) : undefined,
        nombre_vehicules: form.nombreVehicules ? Number(form.nombreVehicules) : undefined,
        annees_experience: form.anneesExperience ? Number(form.anneesExperience) : undefined,
      });
      setSchool(updated);
      setForm(fromSchool(updated));
      setEditing(false);
      setMessage("Paramètres enregistrés.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader variant="page" />;
  if (!form || !school) {
    return (
      <div className="space-y-6">
        <h2 className="ck-title">École</h2>
        <p className="ck-empty">{error || "École introuvable."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="ck-title">École</h2>
          <p className="ck-subtitle">Profil public et coordonnées de votre établissement.</p>
        </div>
        {!editing ? (
          <Button onClick={startEdit} startIcon={<Pencil size={16} strokeWidth={2.5} />}>
            Modifier
          </Button>
        ) : (
          <Button variant="ghost" onClick={cancelEdit} startIcon={<X size={16} strokeWidth={2.5} />}>
            Annuler
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="ta-kpi">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ta-kpi-label">Agrément</p>
              <p className="ta-kpi-value" style={{ fontSize: "2rem" }}>{school.numero_agrement}</p>
            </div>
            <span
              className="flex items-center justify-center"
              style={{
                width: "4.8rem",
                height: "4.8rem",
                borderRadius: "1.2rem",
                background: "rgba(0, 168, 89, 0.12)",
                color: "#00a859",
              }}
            >
              <Building2 size={22} strokeWidth={2.4} />
            </span>
          </div>
        </article>
        <article className="ta-kpi">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ta-kpi-label">Statut CODAKIS</p>
              <p className="ta-kpi-value" style={{ fontSize: "2rem" }}>
                {school.est_validee ? "Validée" : "En validation"}
              </p>
            </div>
            <span
              className="flex items-center justify-center"
              style={{
                width: "4.8rem",
                height: "4.8rem",
                borderRadius: "1.2rem",
                background: school.est_validee ? "rgba(0, 168, 89, 0.12)" : "rgba(245, 158, 11, 0.14)",
                color: school.est_validee ? "#00a859" : "#d97706",
              }}
            >
              <ShieldCheck size={22} strokeWidth={2.4} />
            </span>
          </div>
        </article>
      </div>

      <ComponentCard
        title="Fiche établissement"
        desc={editing ? "Mode édition — enregistrez vos modifications." : "Informations publiées auprès des candidats."}
        action={<Building2 size={20} color="#00a859" strokeWidth={2.4} aria-hidden />}
      >
        {!editing ? (
          <div className="ck-schools-readonly-grid">
            <FieldRow label="Raison sociale" value={form.raisonSociale} />
            <FieldRow label="Adresse" value={form.adresse} />
            <FieldRow label="Ville" value={form.ville} />
            <FieldRow label="Quartier" value={form.quartier} />
            <FieldRow label="Téléphone" value={form.telephone} />
            <FieldRow label="Site web" value={form.siteWeb} />
            <FieldRow label="Moniteurs" value={form.nombreMoniteurs} />
            <FieldRow label="Véhicules" value={form.nombreVehicules} />
            <FieldRow label="Années d’expérience" value={form.anneesExperience} />
            <FieldRow label="Description" value={form.description} />
            <FieldRow label="Description longue" value={form.descriptionLongue} />
            <FieldRow label="Accès / horaires" value={form.accessInfo} />
          </div>
        ) : (
          <form className="ck-form ck-schools-profile__form" onSubmit={(e) => void onSubmit(e)}>
            <label>
              Raison sociale
              <input value={form.raisonSociale} onChange={(e) => patchForm("raisonSociale", e.target.value)} required />
            </label>
            <label>
              Adresse
              <input value={form.adresse} onChange={(e) => patchForm("adresse", e.target.value)} required />
            </label>
            <div className="ck-schools-profile__grid">
              <label>
                Ville
                <input value={form.ville} onChange={(e) => patchForm("ville", e.target.value)} />
              </label>
              <label>
                Quartier
                <input value={form.quartier} onChange={(e) => patchForm("quartier", e.target.value)} />
              </label>
            </div>
            <label>
              Téléphone
              <input value={form.telephone} onChange={(e) => patchForm("telephone", e.target.value)} />
            </label>
            <label>
              Site web
              <input value={form.siteWeb} onChange={(e) => patchForm("siteWeb", e.target.value)} placeholder="https://" />
            </label>
            <div className="ck-schools-profile__grid">
              <label>
                Nombre de moniteurs
                <input
                  type="number"
                  min={0}
                  value={form.nombreMoniteurs}
                  onChange={(e) => patchForm("nombreMoniteurs", e.target.value)}
                />
              </label>
              <label>
                Nombre de véhicules
                <input
                  type="number"
                  min={0}
                  value={form.nombreVehicules}
                  onChange={(e) => patchForm("nombreVehicules", e.target.value)}
                />
              </label>
              <label>
                Années d’expérience
                <input
                  type="number"
                  min={0}
                  value={form.anneesExperience}
                  onChange={(e) => patchForm("anneesExperience", e.target.value)}
                />
              </label>
            </div>
            <label>
              Description courte
              <textarea value={form.description} onChange={(e) => patchForm("description", e.target.value)} rows={3} />
            </label>
            <label>
              Description longue
              <textarea
                value={form.descriptionLongue}
                onChange={(e) => patchForm("descriptionLongue", e.target.value)}
                rows={4}
              />
            </label>
            <label>
              Infos d’accès
              <textarea value={form.accessInfo} onChange={(e) => patchForm("accessInfo", e.target.value)} rows={3} />
            </label>
            {error ? <p className="ck-empty">{error}</p> : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </form>
        )}

        {!editing && message ? <p className="ck-empty" style={{ color: "var(--ck-green)", marginTop: "1.2rem" }}>{message}</p> : null}
        {!editing && error ? <p className="ck-empty" style={{ marginTop: "1.2rem" }}>{error}</p> : null}
      </ComponentCard>
    </div>
  );
}
