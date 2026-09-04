import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Building2,
  Car,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchAllSchools,
  rejectSchool,
  validateSchool,
  type AutoEcolePending,
  type SchoolStatus,
} from "../../../lib/authApi";
import PageBack from "../../common/PageBack";
import Button from "../../ui/Button";

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
    const list = await fetchAllSchools();
    setSchool(list.find((s) => s.id === id) ?? null);
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
      setMessage("Auto-école validée.");
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

  return (
    <div className="space-y-6 ta-duo-detail">
      <div>
        <PageBack to="/espace/admin/ecoles" label="Retour aux écoles" />
        <div className="ta-duo-detail__hero">
          <div className="ta-duo-detail__hero-icon" aria-hidden>
            <Building2 size={28} strokeWidth={2.4} />
          </div>
          <div className="ta-duo-detail__hero-text">
            <h2 className="ck-title">{school.raison_sociale}</h2>
            <div className="ta-duo-detail__meta">
              <span className={`ck-schools-pill ${statusClass(school.status)}`}>
                {STATUS_LABEL[school.status]}
              </span>
              <span className="ta-duo-detail__meta-sep">·</span>
              <span>Agrément {school.numero_agrement || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}
      {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}

      <div className="ck-schools-metrics ta-duo-metrics">
        <div>
          <MapPin size={18} strokeWidth={2.4} aria-hidden />
          <strong>{school.ville || "—"}</strong>
          <span>Ville</span>
        </div>
        <div>
          <Phone size={18} strokeWidth={2.4} aria-hidden />
          <strong>{school.telephone || "—"}</strong>
          <span>Téléphone</span>
        </div>
        <div>
          <Users size={18} strokeWidth={2.4} aria-hidden />
          <strong>{school.nombre_moniteurs ?? "—"}</strong>
          <span>Moniteurs</span>
        </div>
        <div>
          <Car size={18} strokeWidth={2.4} aria-hidden />
          <strong>{school.nombre_vehicules ?? "—"}</strong>
          <span>Véhicules</span>
        </div>
      </div>

      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>Coordonnées</h2>
        </div>
        <ul className="ta-duo-facts">
          <li>
            <span>Adresse</span>
            <strong>{school.adresse || "Non renseignée"}</strong>
          </li>
          {school.description ? (
            <li>
              <span>Description</span>
              <strong>{school.description}</strong>
            </li>
          ) : null}
          {school.rccm ? (
            <li>
              <span>RCCM</span>
              <strong>{school.rccm}</strong>
            </li>
          ) : null}
        </ul>
      </section>

      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>Gérant</h2>
        </div>
        <div className="ta-duo-person">
          <div className="ta-duo-person__avatar" aria-hidden>
            <UserRound size={28} strokeWidth={2.4} />
          </div>
          <div>
            <p className="ta-duo-person__name">{school.gerant_name || "—"}</p>
            <ul className="ta-duo-facts ta-duo-facts--compact">
              <li>
                <Mail size={14} aria-hidden />
                <strong>{school.gerant_email || "—"}</strong>
              </li>
              {school.gerant_phone ? (
                <li>
                  <Phone size={14} aria-hidden />
                  <strong>{school.gerant_phone}</strong>
                </li>
              ) : null}
              {school.fonction_gerant ? (
                <li>
                  <span>Fonction</span>
                  <strong>{school.fonction_gerant}</strong>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </section>

      {school.motif_refus ? (
        <section className="ck-schools-panel ta-duo-panel--danger">
          <div className="ck-schools-panel__head">
            <h2>Motif de refus</h2>
          </div>
          <p className="ta-duo-alert">{school.motif_refus}</p>
        </section>
      ) : null}

      {school.status === "pending" ? (
        <section className="ck-schools-panel">
          <div className="ck-schools-panel__head">
            <h2>Modération</h2>
            <p>Valider ou refuser le dossier d’agrément.</p>
          </div>
          {showReject ? (
            <form className="ck-form space-y-3" onSubmit={(e) => void onReject(e)}>
              <label>
                Motif du refus
                <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
              </label>
              <div className="ck-schools-profile__actions">
                <Button type="submit" variant="danger" disabled={busy} startIcon={<XCircle size={16} strokeWidth={2.5} />}>
                  Confirmer le refus
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReject(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <div className="ck-schools-profile__actions">
              <Button disabled={busy} startIcon={<CheckCircle2 size={16} strokeWidth={2.5} />} onClick={() => void onValidate()}>
                Valider
              </Button>
              <Button variant="ghost" startIcon={<XCircle size={16} strokeWidth={2.5} />} onClick={() => setShowReject(true)}>
                Refuser
              </Button>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
