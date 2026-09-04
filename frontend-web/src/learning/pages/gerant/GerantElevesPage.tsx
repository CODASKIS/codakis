import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock3, FileCheck2, X } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchGerantCandidatConsort,
  validateGerantConsortPiece,
  type ConsortDossier,
} from "../../../lib/authApi";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import {
  fetchGerantInscription,
  fetchGerantInscriptions,
  updateGerantSeance,
  type GerantInscription,
  type GerantInscriptionDetail,
} from "../../../lib/enrollmentsApi";

const PIECE_LABELS: Record<string, string> = {
  id: "Pièce d’identité",
  birth: "Acte de naissance",
  medical: "Certificat médical",
  photos: "Photos d’identité",
  address: "Justificatif de domicile",
  stamps: "Timbres fiscaux",
};

function hoursLabel(item: GerantInscription) {
  if (!item.heures_conduite_total) return "Code / théorie";
  return `${item.heures_conduite_restantes}h / ${item.heures_conduite_total}h`;
}

export default function GerantElevesPage() {
  const [items, setItems] = useState<GerantInscription[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<GerantInscriptionDetail | null>(null);
  const [consort, setConsort] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [validatingKey, setValidatingKey] = useState<string | null>(null);
  const [updatingSeanceId, setUpdatingSeanceId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchGerantInscriptions()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        if (data[0]) setSelectedId(data[0].id);
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

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setConsort(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setActionError("");
    void fetchGerantInscription(selectedId)
      .then(async (data) => {
        if (cancelled) return;
        setDetail(data);
        try {
          const dossier = await fetchGerantCandidatConsort(data.candidat_id);
          if (!cancelled) setConsort(dossier);
        } catch {
          if (!cancelled) setConsort(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setConsort(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const overview = useMemo(() => {
    const total = items.length;
    const withHours = items.filter((i) => i.heures_conduite_total > 0);
    const hoursLeft = items.reduce((sum, i) => sum + (i.heures_conduite_restantes || 0), 0);
    const seances = items.reduce((sum, i) => sum + (i.seances_count || 0), 0);
    return { total, withHours: withHours.length, hoursLeft, seances };
  }, [items]);

  async function onValidatePiece(pieceKey: string) {
    if (!detail) return;
    setValidatingKey(pieceKey);
    setActionError("");
    try {
      const dossier = await validateGerantConsortPiece(detail.candidat_id, pieceKey);
      setConsort(dossier);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Validation impossible");
    } finally {
      setValidatingKey(null);
    }
  }

  async function onUpdateSeanceStatus(seanceId: string, statut: string) {
    setUpdatingSeanceId(seanceId);
    setActionError("");
    try {
      await updateGerantSeance(seanceId, { statut });
      if (selectedId) {
        const refreshed = await fetchGerantInscription(selectedId);
        setDetail(refreshed);
        setItems(await fetchGerantInscriptions());
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Mise à jour séance impossible");
    } finally {
      setUpdatingSeanceId(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-schools-layout">
      <section className="ck-schools-panel">
        <div className="ck-schools-panel__head">
          <h2>{items.length} élèves</h2>
          <p>Suivi des inscriptions, séances et dossiers consort</p>
        </div>
        {error ? <p className="ck-empty">{error}</p> : null}
        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Forfait</th>
                <th>Heures</th>
                <th>Séances</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={selectedId === item.id ? "is-selected" : undefined}
                  onClick={() => setSelectedId(item.id)}
                >
                  <td>
                    <div className="ck-schools-person">
                      <img src={getUserAvatarUrl(item.candidat_name, 36)} alt="" width={36} height={36} />
                      <div>
                        <strong>{item.candidat_name}</strong>
                        <small>{item.candidat_email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{item.forfait_label}</td>
                  <td>{hoursLabel(item)}</td>
                  <td>
                    <span className={`ck-schools-status ${item.seances_count ? "is-progress" : "is-idle"}`}>
                      {item.seances_count ? <Clock3 size={14} /> : <Circle size={14} />}
                      {item.seances_count}/…
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length ? <p className="ck-empty">Aucun élève inscrit pour le moment.</p> : null}
        </div>
      </section>

      <aside className="ck-schools-detail" aria-live="polite">
        {!selectedId ? (
          <p className="ck-empty">Sélectionnez un élève.</p>
        ) : detailLoading ? (
          <Loader />
        ) : detail ? (
          <>
            <button type="button" className="ck-schools-detail__close" onClick={() => setSelectedId(null)} aria-label="Fermer">
              <X size={18} />
            </button>
            <div className="ck-schools-detail__profile">
              <img src={getUserAvatarUrl(detail.candidat_name, 72)} alt="" width={72} height={72} />
              <h3>{detail.candidat_name}</h3>
              <p>{detail.candidat_email}</p>
              {detail.candidat_phone ? <p>{detail.candidat_phone}</p> : null}
            </div>
            {actionError ? <p className="ck-empty">{actionError}</p> : null}
            <div className="ck-schools-metrics">
              <div>
                <strong>{detail.forfait_label}</strong>
                <span>Forfait</span>
              </div>
              <div>
                <strong>{hoursLabel(detail)}</strong>
                <span>Heures</span>
              </div>
            </div>
            <div className="ck-schools-stats-list">
              <div>
                <CheckCircle2 size={18} className="is-ok" />
                <span>{detail.seances.filter((s) => s.statut === "terminee").length} séances terminées</span>
              </div>
              <div>
                <Clock3 size={18} className="is-warn" />
                <span>
                  {detail.seances.filter((s) => s.statut !== "terminee").length} séances à venir / en cours
                </span>
              </div>
            </div>

            <h4 className="ck-schools-detail__section">
              <FileCheck2 size={16} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
              Dossier consort
              {consort ? ` · ${consort.progress_percent}%` : ""}
            </h4>
            {consort ? (
              <ul className="ck-schools-mini-list">
                {consort.pieces.map((piece) => (
                  <li key={piece.key}>
                    <div>
                      <strong>{PIECE_LABELS[piece.key] || piece.key}</strong>
                      <span>
                        {piece.status === "validated"
                          ? "Validée"
                          : piece.status === "pending"
                            ? "En attente"
                            : "Manquante"}
                      </span>
                    </div>
                    {piece.status === "pending" ? (
                      <button
                        type="button"
                        className="ck-btn ck-btn--primary"
                        style={{ minHeight: "3.2rem", padding: "0 0.9rem", fontSize: "1.2rem" }}
                        disabled={validatingKey === piece.key}
                        onClick={() => void onValidatePiece(piece.key)}
                      >
                        {validatingKey === piece.key ? "…" : "Valider"}
                      </button>
                    ) : piece.status === "validated" ? (
                      <CheckCircle2 size={18} className="is-ok" />
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ck-empty">Dossier consort indisponible.</p>
            )}

            <h4 className="ck-schools-detail__section">Séances</h4>
            <ul className="ck-schools-mini-list">
              {detail.seances.map((seance) => (
                <li key={seance.id}>
                  <div>
                    <strong>{new Date(seance.starts_at).toLocaleString("fr-FR")}</strong>
                    <span>
                      {seance.statut}
                      {seance.moniteur_name ? ` · ${seance.moniteur_name}` : ""}
                      {seance.lieu ? ` · ${seance.lieu}` : ""}
                    </span>
                  </div>
                  {seance.statut !== "terminee" ? (
                    <button
                      type="button"
                      className="ck-btn ck-btn--ghost"
                      style={{ minHeight: "3.2rem", padding: "0 0.8rem" }}
                      disabled={updatingSeanceId === seance.id}
                      onClick={() => void onUpdateSeanceStatus(seance.id, "terminee")}
                    >
                      {updatingSeanceId === seance.id ? "…" : "Terminer"}
                    </button>
                  ) : null}
                </li>
              ))}
              {!detail.seances.length ? <li className="ck-empty">Aucune séance.</li> : null}
            </ul>
          </>
        ) : (
          <p className="ck-empty">Détail indisponible.</p>
        )}

        <div className="ck-schools-overview">
          <h4>Aperçu auto-école</h4>
          <ul>
            <li>
              <strong>{overview.total}</strong> élèves
            </li>
            <li>
              <strong>{overview.withHours}</strong> en conduite
            </li>
            <li>
              <strong>{overview.hoursLeft}</strong> h restantes
            </li>
            <li>
              <strong>{overview.seances}</strong> séances planifiées
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
