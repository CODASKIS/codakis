import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Award,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchSchool,
  rejectSchool,
  validateSchool,
  type AutoEcolePending,
  type SchoolStatus,
} from "../../../lib/authApi";
import PageBack from "../../common/PageBack";
import Button from "../../ui/Button";

/* ── labels & helpers ─────────────────────────────────── */

const STATUS_LABEL: Record<SchoolStatus, string> = {
  pending: "En attente",
  validated: "Validée",
  rejected: "Refusée",
};

function statusClass(status: SchoolStatus) {
  if (status === "validated") return "is-on";
  if (status === "rejected") return "is-off";
  return "is-wait";
}

function fmt(v: string | null | undefined): string {
  return v?.trim() || "—";
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/* ── section colour tokens ────────────────────────────── */
type SectionVariant = "identity" | "location" | "manager" | "activity" | "danger" | "moderation" | "timeline";

const SECTION_COLORS: Record<SectionVariant, { border: string; header: string; icon: string }> = {
  identity:   { border: "#6366f1", header: "rgba(99,102,241,0.08)",  icon: "#6366f1" },
  location:   { border: "#0ea5e9", header: "rgba(14,165,233,0.08)",  icon: "#0ea5e9" },
  manager:    { border: "#f59e0b", header: "rgba(245,158,11,0.08)",  icon: "#d97706" },
  activity:   { border: "#00a859", header: "rgba(0,168,89,0.08)",    icon: "#00a859" },
  danger:     { border: "#ef4444", header: "rgba(239,68,68,0.08)",   icon: "#dc2626" },
  moderation: { border: "#8b5cf6", header: "rgba(139,92,246,0.08)",  icon: "#7c3aed" },
  timeline:   { border: "#64748b", header: "rgba(100,116,139,0.08)", icon: "#475569" },
};

function SectionCard({
  variant,
  title,
  icon: Icon,
  children,
}: {
  variant: SectionVariant;
  title: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  children: React.ReactNode;
}) {
  const c = SECTION_COLORS[variant];
  return (
    <section
      className="ck-schools-panel ta-admin-section"
      style={{ borderColor: c.border }}
    >
      <div
        className="ck-schools-panel__head ta-admin-section__head"
        style={{ background: c.header, borderBottom: `0.1rem solid ${c.border}22` }}
      >
        <Icon size={18} strokeWidth={2.4} color={c.icon} aria-hidden />
        <h2 style={{ color: c.border }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ── fact row ─────────────────────────────────────────── */
function FactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="ta-admin-fact">
      <span className="ta-admin-fact__label">{label}</span>
      <strong className="ta-admin-fact__value">{value}</strong>
    </li>
  );
}

/* ── component ───────────────────────────────────────── */
export default function AdminSchoolDetail() {
  const { id = "" } = useParams();
  const [school, setSchool] = useState<AutoEcolePending | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const data = await fetchSchool(id);
    setSchool(data);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void load()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onValidate() {
    if (!school) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await validateSchool(school.id);
      await load();
      setMessage("Auto-école validée avec succès.");
      setShowReject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation impossible");
    } finally {
      setBusy(false);
    }
  }

  async function onReject(e: FormEvent) {
    e.preventDefault();
    if (!school) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await rejectSchool(school.id, rejectReason || "Dossier incomplet");
      await load();
      setMessage("Auto-école refusée.");
      setShowReject(false);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refus impossible");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loader variant="page" />;
  if (!school) {
    return (
      <div className="space-y-4">
        <PageBack to="/espace/admin/ecoles" />
        <p className="ck-empty">{error || "École introuvable."}</p>
      </div>
    );
  }

  const moniteurs = school.moniteur_count ?? school.nombre_moniteurs ?? null;

  return (
    <div className="space-y-6 ta-duo-detail">

      {/* ── En-tête hero ── */}
      <div>
        <PageBack to="/espace/admin/ecoles" label="Retour aux écoles" />
        <div className="ta-duo-detail__hero">
          {school.logo_url ? (
            <img
              src={school.logo_url}
              alt={`Logo ${school.raison_sociale}`}
              className="ta-admin-logo"
            />
          ) : (
            <div className="ta-duo-detail__hero-icon" aria-hidden>
              <Building2 size={28} strokeWidth={2.4} />
            </div>
          )}
          <div className="ta-duo-detail__hero-text">
            <h2 className="ck-title">{school.raison_sociale}</h2>
            {school.raison_sociale_legale ? (
              <p className="ta-admin-legal-name">{school.raison_sociale_legale}</p>
            ) : null}
            <div className="ta-duo-detail__meta">
              <span className={`ck-schools-pill ${statusClass(school.status)}`}>
                {STATUS_LABEL[school.status]}
              </span>
              <span className="ta-duo-detail__meta-sep">·</span>
              <span>Agrément {fmt(school.numero_agrement)}</span>
              {school.rccm ? (
                <>
                  <span className="ta-duo-detail__meta-sep">·</span>
                  <span>RCCM {school.rccm}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="ck-empty ta-admin-msg ta-admin-msg--error">{error}</p> : null}
      {message ? <p className="ck-empty ta-admin-msg ta-admin-msg--ok">{message}</p> : null}

      {/* ── KPI metrics ── */}
      <div className="ck-schools-metrics ta-duo-metrics ta-admin-metrics">
        <div style={{ "--metric-color": SECTION_COLORS.location.border } as React.CSSProperties}>
          <MapPin size={18} strokeWidth={2.4} aria-hidden />
          <strong>{fmt(school.ville)}</strong>
          <span>Ville</span>
        </div>
        <div style={{ "--metric-color": SECTION_COLORS.location.border } as React.CSSProperties}>
          <Phone size={18} strokeWidth={2.4} aria-hidden />
          <strong>{fmt(school.telephone)}</strong>
          <span>Téléphone</span>
        </div>
        <div style={{ "--metric-color": SECTION_COLORS.activity.border } as React.CSSProperties}>
          <Users size={18} strokeWidth={2.4} aria-hidden />
          <strong>{moniteurs ?? "—"}</strong>
          <span>Moniteurs</span>
        </div>
        <div style={{ "--metric-color": SECTION_COLORS.activity.border } as React.CSSProperties}>
          <Car size={18} strokeWidth={2.4} aria-hidden />
          <strong>{school.nombre_vehicules ?? "—"}</strong>
          <span>Véhicules</span>
        </div>
        <div style={{ "--metric-color": SECTION_COLORS.identity.border } as React.CSSProperties}>
          <Award size={18} strokeWidth={2.4} aria-hidden />
          <strong>{school.annees_experience != null ? `${school.annees_experience} ans` : "—"}</strong>
          <span>Expérience</span>
        </div>
        <div style={{ "--metric-color": SECTION_COLORS.manager.border } as React.CSSProperties}>
          <Shield size={18} strokeWidth={2.4} aria-hidden />
          <strong>{school.country_code}</strong>
          <span>Pays</span>
        </div>
      </div>

      {/* ── Identité & légal ── */}
      <SectionCard variant="identity" title="Identité & informations légales" icon={Building2}>
        <ul className="ta-admin-facts">
          <FactRow label="Raison sociale" value={fmt(school.raison_sociale)} />
          {school.raison_sociale_legale ? (
            <FactRow label="Raison sociale légale" value={school.raison_sociale_legale} />
          ) : null}
          <FactRow label="N° agrément MINT" value={fmt(school.numero_agrement)} />
          {school.rccm ? <FactRow label="RCCM" value={school.rccm} /> : null}
          {school.description ? (
            <FactRow label="Description" value={<span className="ta-admin-desc">{school.description}</span>} />
          ) : null}
          {school.site_web ? (
            <FactRow
              label="Site web"
              value={
                <a
                  href={school.site_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ta-admin-link"
                >
                  {school.site_web}
                  <ExternalLink size={12} strokeWidth={2.5} aria-hidden />
                </a>
              }
            />
          ) : null}
          {school.logo_url ? (
            <FactRow
              label="Logo"
              value={
                <a href={school.logo_url} target="_blank" rel="noopener noreferrer" className="ta-admin-link">
                  <ImageIcon size={14} strokeWidth={2} aria-hidden /> Voir le logo
                </a>
              }
            />
          ) : null}
        </ul>
      </SectionCard>

      {/* ── Localisation ── */}
      <SectionCard variant="location" title="Localisation & contact" icon={MapPin}>
        <ul className="ta-admin-facts">
          <FactRow label="Adresse" value={fmt(school.adresse)} />
          <FactRow label="Ville" value={fmt(school.ville)} />
          <FactRow label="Pays" value={school.country_code} />
          {school.telephone ? <FactRow label="Téléphone" value={school.telephone} /> : null}
        </ul>
      </SectionCard>

      {/* ── Gérant ── */}
      <SectionCard variant="manager" title="Gérant / responsable" icon={Mail}>
        <ul className="ta-admin-facts">
          <FactRow label="Nom" value={fmt(school.gerant_name)} />
          <FactRow label="E-mail" value={fmt(school.gerant_email)} />
          {school.gerant_phone ? <FactRow label="Téléphone" value={school.gerant_phone} /> : null}
          {school.fonction_gerant ? <FactRow label="Fonction" value={school.fonction_gerant} /> : null}
          {school.gerant_id ? (
            <FactRow
              label="ID gérant"
              value={<code className="ta-admin-code">{school.gerant_id}</code>}
            />
          ) : null}
        </ul>
      </SectionCard>

      {/* ── Activité & capacité ── */}
      <SectionCard variant="activity" title="Activité & capacité" icon={Car}>
        <ul className="ta-admin-facts">
          <FactRow
            label="Moniteurs déclarés"
            value={school.nombre_moniteurs != null ? String(school.nombre_moniteurs) : "—"}
          />
          <FactRow
            label="Moniteurs (inscriptions actives)"
            value={school.moniteur_count != null ? String(school.moniteur_count) : "—"}
          />
          <FactRow
            label="Véhicules"
            value={school.nombre_vehicules != null ? String(school.nombre_vehicules) : "—"}
          />
          <FactRow
            label="Années d'expérience"
            value={school.annees_experience != null ? `${school.annees_experience} ans` : "—"}
          />
        </ul>
      </SectionCard>

      {/* ── Motif de refus ── */}
      {school.motif_refus ? (
        <SectionCard variant="danger" title="Motif de refus" icon={XCircle}>
          <p className="ta-admin-alert">{school.motif_refus}</p>
          {school.refusee_le ? (
            <p className="ta-admin-timestamp">
              <Clock size={13} strokeWidth={2.5} aria-hidden />
              Refusée le {fmtDate(school.refusee_le)}
            </p>
          ) : null}
        </SectionCard>
      ) : null}

      {/* ── Timeline ── */}
      <SectionCard variant="timeline" title="Historique" icon={Calendar}>
        <ul className="ta-admin-facts">
          <FactRow label="Inscrite le" value={fmtDate(school.created_at)} />
          <FactRow label="Dernière mise à jour" value={fmtDate(school.updated_at)} />
          {school.validee_le ? (
            <FactRow label="Validée le" value={fmtDate(school.validee_le)} />
          ) : null}
          {school.refusee_le ? (
            <FactRow label="Refusée le" value={fmtDate(school.refusee_le)} />
          ) : null}
        </ul>
      </SectionCard>

      {/* ── Modération ── */}
      {school.status === "pending" ? (
        <SectionCard variant="moderation" title="Modération" icon={Globe}>
          <p className="ta-admin-section__hint">
            Validez ou refusez le dossier d'agrément de cet établissement.
          </p>
          {showReject ? (
            <form className="ck-form space-y-3" onSubmit={(e) => void onReject(e)}>
              <label className="ta-admin-label">
                Motif du refus
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Dossier incomplet, pièces manquantes…"
                  required
                />
              </label>
              <div className="ck-schools-profile__actions">
                <Button
                  type="submit"
                  variant="danger"
                  disabled={busy}
                  startIcon={<XCircle size={16} strokeWidth={2.5} />}
                >
                  Confirmer le refus
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReject(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <div className="ck-schools-profile__actions">
              <Button
                disabled={busy}
                startIcon={<CheckCircle2 size={16} strokeWidth={2.5} />}
                onClick={() => void onValidate()}
              >
                Valider l'auto-école
              </Button>
              <Button
                variant="ghost"
                startIcon={<XCircle size={16} strokeWidth={2.5} />}
                onClick={() => setShowReject(true)}
              >
                Refuser
              </Button>
            </div>
          )}
        </SectionCard>
      ) : null}

    </div>
  );
}
