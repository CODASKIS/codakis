import { FormEvent, useEffect, useState } from "react";
import { CalendarPlus, KeyRound, Package, Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";
import Loader from "../../../components/common/Loader";
import ComponentCard from "../../../dashboard/common/ComponentCard";
import {
  createGerantMoniteur,
  fetchGerantMoniteurs,
  resetGerantMoniteurPassword,
  type GerantMoniteur,
} from "../../../lib/authApi";
import {
  createGerantForfait,
  createGerantSeance,
  deleteGerantForfait,
  fetchGerantForfaits,
  fetchGerantInscriptions,
  updateGerantForfait,
  type GerantForfait,
  type GerantInscription,
  type SchoolForfaitType,
} from "../../../lib/enrollmentsApi";

const FORFAIT_TYPES: { value: SchoolForfaitType; label: string }[] = [
  { value: "code_seul", label: "Code seul" },
  { value: "conduite_seule", label: "Conduite seule" },
  { value: "complet", label: "Complet" },
];

type ForfaitDraft = {
  type: SchoolForfaitType;
  label_fr: string;
  label_en: string;
  prix: string;
  heures_conduite: string;
  description_fr: string;
  est_actif: boolean;
};

const emptyDraft = (): ForfaitDraft => ({
  type: "complet",
  label_fr: "",
  label_en: "",
  prix: "",
  heures_conduite: "",
  description_fr: "",
  est_actif: true,
});

export default function GerantAssignerPage() {
  const [forfaits, setForfaits] = useState<GerantForfait[]>([]);
  const [inscriptions, setInscriptions] = useState<GerantInscription[]>([]);
  const [moniteurs, setMoniteurs] = useState<GerantMoniteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [inscriptionId, setInscriptionId] = useState("");
  const [moniteurId, setMoniteurId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [lieu, setLieu] = useState("");
  const [savingSeance, setSavingSeance] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirst, setInviteFirst] = useState("");
  const [inviteLast, setInviteLast] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [savingInvite, setSavingInvite] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [resettingId, setResettingId] = useState<string | null>(null);

  const [showForfaitForm, setShowForfaitForm] = useState(false);
  const [editingForfaitId, setEditingForfaitId] = useState<string | null>(null);
  const [forfaitDraft, setForfaitDraft] = useState<ForfaitDraft>(emptyDraft);
  const [savingForfait, setSavingForfait] = useState(false);

  async function reload() {
    const [f, i, m] = await Promise.all([
      fetchGerantForfaits(),
      fetchGerantInscriptions(),
      fetchGerantMoniteurs(),
    ]);
    setForfaits(f);
    setInscriptions(i);
    setMoniteurs(m);
    setInscriptionId((prev) => prev || i[0]?.id || "");
    setMoniteurId((prev) => prev || m[0]?.id || "");
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreateForfait() {
    setEditingForfaitId(null);
    setForfaitDraft(emptyDraft());
    setShowForfaitForm(true);
    setMessage("");
    setError("");
  }

  function openEditForfait(item: GerantForfait) {
    setEditingForfaitId(item.id);
    setForfaitDraft({
      type: item.type,
      label_fr: item.label_fr,
      label_en: item.label_en,
      prix: String(item.prix),
      heures_conduite: item.heures_conduite != null ? String(item.heures_conduite) : "",
      description_fr: item.description_fr || "",
      est_actif: item.est_actif,
    });
    setShowForfaitForm(true);
    setMessage("");
    setError("");
  }

  async function onSaveForfait(event: FormEvent) {
    event.preventDefault();
    setSavingForfait(true);
    setMessage("");
    setError("");
    const payload = {
      type: forfaitDraft.type,
      label_fr: forfaitDraft.label_fr,
      label_en: forfaitDraft.label_en || forfaitDraft.label_fr,
      prix: Number(forfaitDraft.prix),
      heures_conduite: forfaitDraft.heures_conduite ? Number(forfaitDraft.heures_conduite) : null,
      description_fr: forfaitDraft.description_fr || undefined,
      est_actif: forfaitDraft.est_actif,
    };
    try {
      if (editingForfaitId) {
        await updateGerantForfait(editingForfaitId, payload);
        setMessage("Forfait mis à jour.");
      } else {
        await createGerantForfait(payload);
        setMessage("Forfait créé.");
      }
      setShowForfaitForm(false);
      setEditingForfaitId(null);
      setForfaitDraft(emptyDraft());
      setForfaits(await fetchGerantForfaits());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement forfait impossible");
    } finally {
      setSavingForfait(false);
    }
  }

  async function toggleForfait(item: GerantForfait) {
    setError("");
    try {
      await updateGerantForfait(item.id, { est_actif: !item.est_actif });
      setForfaits(await fetchGerantForfaits());
      setMessage(item.est_actif ? "Forfait désactivé." : "Forfait activé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible");
    }
  }

  async function removeForfait(id: string) {
    if (!window.confirm("Supprimer ce forfait ?")) return;
    setError("");
    try {
      await deleteGerantForfait(id);
      setForfaits(await fetchGerantForfaits());
      setMessage("Forfait supprimé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  async function onCreateSeance(event: FormEvent) {
    event.preventDefault();
    setSavingSeance(true);
    setMessage("");
    setError("");
    try {
      await createGerantSeance({
        inscription_id: inscriptionId,
        moniteur_id: moniteurId || null,
        starts_at: new Date(startsAt).toISOString(),
        duration_minutes: 60,
        lieu: lieu || undefined,
      });
      setMessage("Séance assignée.");
      setStartsAt("");
      setLieu("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setSavingSeance(false);
    }
  }

  async function onInviteMoniteur(event: FormEvent) {
    event.preventDefault();
    setSavingInvite(true);
    setMessage("");
    setError("");
    setTempPassword("");
    try {
      const created = await createGerantMoniteur({
        email: inviteEmail,
        first_name: inviteFirst,
        last_name: inviteLast,
        phone: invitePhone || undefined,
      });
      setTempPassword(created.temp_password || "");
      setMessage("Moniteur invité.");
      setInviteEmail("");
      setInviteFirst("");
      setInviteLast("");
      setInvitePhone("");
      setMoniteurs(await fetchGerantMoniteurs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invitation impossible");
    } finally {
      setSavingInvite(false);
    }
  }

  async function onResetPassword(id: string) {
    setResettingId(id);
    setError("");
    setMessage("");
    setTempPassword("");
    try {
      const res = await resetGerantMoniteurPassword(id);
      setTempPassword(res.temp_password || "");
      setMessage("Mot de passe moniteur réinitialisé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réinitialisation impossible");
    } finally {
      setResettingId(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="ck-title">Assigner</h2>
          <p className="ck-subtitle">Forfaits, séances pratiques et équipe moniteurs.</p>
        </div>
        <button type="button" className="ck-btn ck-btn--primary" onClick={openCreateForfait}>
          <Plus size={16} strokeWidth={2.5} />
          Nouveau forfait
        </button>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}
      {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}
      {tempPassword ? (
        <p className="ck-empty" style={{ color: "var(--ck-orange)" }}>
          Mot de passe temporaire moniteur : <strong>{tempPassword}</strong>
        </p>
      ) : null}

      <ComponentCard
        title="Forfaits publiés"
        desc="Offres visibles par les candidats"
        action={<Package size={20} color="#00a859" strokeWidth={2.4} aria-hidden />}
      >
        {showForfaitForm ? (
          <form className="ck-form ck-schools-inline-form" onSubmit={(e) => void onSaveForfait(e)} style={{ marginBottom: "2rem" }}>
            <h3 className="ck-schools-subtitle">
              {editingForfaitId ? "Modifier le forfait" : "Créer un forfait"}
            </h3>
            <label>
              Type
              <select
                value={forfaitDraft.type}
                onChange={(e) =>
                  setForfaitDraft((d) => ({ ...d, type: e.target.value as SchoolForfaitType }))
                }
              >
                {FORFAIT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Libellé (FR)
              <input
                value={forfaitDraft.label_fr}
                onChange={(e) => setForfaitDraft((d) => ({ ...d, label_fr: e.target.value }))}
                required
              />
            </label>
            <label>
              Libellé (EN)
              <input
                value={forfaitDraft.label_en}
                onChange={(e) => setForfaitDraft((d) => ({ ...d, label_en: e.target.value }))}
                placeholder="Optionnel — reprend le FR"
              />
            </label>
            <div className="ck-schools-profile__grid">
              <label>
                Prix (FCFA)
                <input
                  type="number"
                  min={0}
                  value={forfaitDraft.prix}
                  onChange={(e) => setForfaitDraft((d) => ({ ...d, prix: e.target.value }))}
                  required
                />
              </label>
              <label>
                Heures de conduite
                <input
                  type="number"
                  min={0}
                  value={forfaitDraft.heures_conduite}
                  onChange={(e) => setForfaitDraft((d) => ({ ...d, heures_conduite: e.target.value }))}
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                value={forfaitDraft.description_fr}
                onChange={(e) => setForfaitDraft((d) => ({ ...d, description_fr: e.target.value }))}
                rows={2}
              />
            </label>
            <label className="ck-schools-check">
              <input
                type="checkbox"
                checked={forfaitDraft.est_actif}
                onChange={(e) => setForfaitDraft((d) => ({ ...d, est_actif: e.target.checked }))}
              />
              Forfait actif (visible aux candidats)
            </label>
            <div className="ck-schools-profile__actions">
              <button type="submit" className="ck-btn ck-btn--primary" disabled={savingForfait}>
                {savingForfait ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                className="ck-btn ck-btn--ghost"
                onClick={() => {
                  setShowForfaitForm(false);
                  setEditingForfaitId(null);
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : null}

        <div className="ta-package-grid">
          {forfaits.map((item) => (
            <article key={item.id} className="ta-package-card">
              <div className="ta-package-card__top">
                <span className="ta-package-card__icon">
                  <Package size={20} strokeWidth={2.3} />
                </span>
                <span className={`ck-schools-pill${item.est_actif ? " is-on" : ""}`}>
                  {item.est_actif ? "Actif" : "Inactif"}
                </span>
              </div>
              <div>
                <strong style={{ fontSize: "1.7rem", display: "block" }}>{item.label_fr}</strong>
                <p className="ta-package-card__price">{item.prix.toLocaleString("fr-FR")} FCFA</p>
                <p className="ta-package-card__meta">
                  {FORFAIT_TYPES.find((t) => t.value === item.type)?.label || item.type}
                  {item.heures_conduite ? ` · ${item.heures_conduite}h conduite` : ""}
                </p>
              </div>
              <div className="ta-package-card__actions">
                <button type="button" className="ck-btn ck-btn--ghost ck-btn--sm" onClick={() => openEditForfait(item)}>
                  <Pencil size={14} /> Modifier
                </button>
                <button type="button" className="ck-btn ck-btn--ghost ck-btn--sm" onClick={() => void toggleForfait(item)}>
                  {item.est_actif ? "Désactiver" : "Activer"}
                </button>
                <button type="button" className="ck-btn ck-btn--danger ck-btn--sm" onClick={() => void removeForfait(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
          {!forfaits.length ? <p className="ck-empty">Aucun forfait — créez-en un pour publier vos offres.</p> : null}
        </div>
      </ComponentCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ComponentCard
          title="Assigner une séance"
          desc="Planifier une séance pratique pour un élève"
          action={<CalendarPlus size={20} color="#0ea5e9" strokeWidth={2.4} aria-hidden />}
        >
          <form className="ck-form" onSubmit={(e) => void onCreateSeance(e)}>
            <label>
              Élève
              <select value={inscriptionId} onChange={(e) => setInscriptionId(e.target.value)} required>
                {inscriptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.candidat_name} — {item.forfait_label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Moniteur
              <select value={moniteurId} onChange={(e) => setMoniteurId(e.target.value)}>
                <option value="">Non assigné</option>
                {moniteurs.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Début
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
            </label>
            <label>
              Lieu
              <input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Parking, circuit…" />
            </label>
            <button type="submit" className="ck-btn ck-btn--primary ck-btn--block" disabled={savingSeance || !inscriptions.length}>
              <CalendarPlus size={16} strokeWidth={2.5} />
              {savingSeance ? "Création…" : "Assigner la séance"}
            </button>
          </form>
        </ComponentCard>

        <ComponentCard
          title="Équipe moniteurs"
          desc="Inviter et gérer les accès"
          action={<Users size={20} color="#00a859" strokeWidth={2.4} aria-hidden />}
        >
          <form className="ck-form" onSubmit={(e) => void onInviteMoniteur(e)} style={{ marginBottom: "2rem" }}>
            <p className="ck-schools-subtitle" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <UserPlus size={16} /> Inviter un moniteur
            </p>
            <label>
              Prénom
              <input value={inviteFirst} onChange={(e) => setInviteFirst(e.target.value)} required />
            </label>
            <label>
              Nom
              <input value={inviteLast} onChange={(e) => setInviteLast(e.target.value)} required />
            </label>
            <label>
              E-mail
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
            </label>
            <label>
              Téléphone
              <input value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} />
            </label>
            <button type="submit" className="ck-btn ck-btn--primary ck-btn--block" disabled={savingInvite}>
              <UserPlus size={16} strokeWidth={2.5} />
              {savingInvite ? "Invitation…" : "Inviter"}
            </button>
          </form>

          <h4 className="ck-schools-detail__section">Équipe ({moniteurs.length})</h4>
          <ul className="ck-schools-mini-list">
            {moniteurs.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>
                    {m.first_name} {m.last_name}
                  </strong>
                  <span>{m.email}</span>
                </div>
                <button
                  type="button"
                  className="ck-btn ck-btn--ghost"
                  style={{ minHeight: "3.2rem", padding: "0 0.8rem" }}
                  disabled={resettingId === m.id}
                  onClick={() => void onResetPassword(m.id)}
                  title="Réinitialiser le mot de passe"
                >
                  <KeyRound size={14} />
                  {resettingId === m.id ? "…" : "Reset"}
                </button>
              </li>
            ))}
            {!moniteurs.length ? <li className="ck-empty">Aucun moniteur.</li> : null}
          </ul>
        </ComponentCard>
      </div>
    </div>
  );
}
