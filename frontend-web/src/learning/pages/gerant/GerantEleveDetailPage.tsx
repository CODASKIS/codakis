import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { CheckCircle2, Clock3, FileCheck2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchGerantCandidatConsort,
  validateGerantConsortPiece,
  type ConsortDossier,
} from "../../../lib/authApi";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import {
  fetchGerantInscription,
  updateGerantSeance,
  type GerantInscriptionDetail,
} from "../../../lib/enrollmentsApi";
import PageBack from "../../../dashboard/common/PageBack";
import ComponentCard from "../../../dashboard/common/ComponentCard";
import Button from "../../../dashboard/ui/Button";

const PIECE_LABELS: Record<string, string> = {
  id: "Pièce d’identité",
  birth: "Acte de naissance",
  medical: "Certificat médical",
  photos: "Photos d’identité",
  address: "Justificatif de domicile",
  stamps: "Timbres fiscaux",
};

function hoursLabel(item: GerantInscriptionDetail) {
  if (!item.heures_conduite_total) return "Code / théorie";
  return `${item.heures_conduite_restantes}h / ${item.heures_conduite_total}h`;
}

export default function GerantEleveDetailPage() {
  const { id = "" } = useParams();
  const [detail, setDetail] = useState<GerantInscriptionDetail | null>(null);
  const [consort, setConsort] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [validatingKey, setValidatingKey] = useState<string | null>(null);
  const [updatingSeanceId, setUpdatingSeanceId] = useState<string | null>(null);

  async function load() {
    const data = await fetchGerantInscription(id);
    setDetail(data);
    try {
      setConsort(await fetchGerantCandidatConsort(data.candidat_id));
    } catch {
      setConsort(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void load()
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onValidatePiece(pieceKey: string) {
    if (!detail) return;
    setValidatingKey(pieceKey);
    setActionError("");
    try {
      setConsort(await validateGerantConsortPiece(detail.candidat_id, pieceKey));
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
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Mise à jour séance impossible");
    } finally {
      setUpdatingSeanceId(null);
    }
  }

  if (loading) return <Loader variant="page" />;
  if (!detail) {
    return (
      <div className="space-y-4">
        <PageBack to="/espace/gerant/eleves" />
        <p className="ck-empty">Élève introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <PageBack to="/espace/gerant/eleves" label="Retour aux élèves" />
        <div className="flex items-start gap-4">
          <img
            src={getUserAvatarUrl(detail.candidat_name, 72)}
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: "1.4rem", border: "0.1rem solid #e4e7ec" }}
          />
          <div>
            <h2 className="ck-title" style={{ margin: 0 }}>
              {detail.candidat_name}
            </h2>
            <p className="ck-subtitle" style={{ margin: "0.4rem 0 0" }}>
              {detail.candidat_email}
              {detail.candidat_phone ? ` · ${detail.candidat_phone}` : ""}
            </p>
          </div>
        </div>
      </div>

      {actionError ? <p className="ck-empty">{actionError}</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ComponentCard title="Forfait">
          <p className="ta-strong">{detail.forfait_label}</p>
        </ComponentCard>
        <ComponentCard title="Heures">
          <p className="ta-strong">{hoursLabel(detail)}</p>
        </ComponentCard>
      </div>

      <ComponentCard title="Suivi séances">
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
      </ComponentCard>

      <ComponentCard
        title={`Dossier consort${consort ? ` · ${consort.progress_percent}%` : ""}`}
        desc="Valider les pièces en attente"
      >
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
                  <Button size="sm" disabled={validatingKey === piece.key} onClick={() => void onValidatePiece(piece.key)}>
                    {validatingKey === piece.key ? "…" : "Valider"}
                  </Button>
                ) : piece.status === "validated" ? (
                  <CheckCircle2 size={18} className="is-ok" />
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="ck-empty">Dossier consort indisponible.</p>
        )}
      </ComponentCard>

      <ComponentCard title="Séances" action={<FileCheck2 size={20} color="#00a859" strokeWidth={2.4} aria-hidden />}>
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
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={updatingSeanceId === seance.id}
                  onClick={() => void onUpdateSeanceStatus(seance.id, "terminee")}
                >
                  {updatingSeanceId === seance.id ? "…" : "Terminer"}
                </Button>
              ) : null}
            </li>
          ))}
          {!detail.seances.length ? <li className="ck-empty">Aucune séance.</li> : null}
        </ul>
      </ComponentCard>
    </div>
  );
}
