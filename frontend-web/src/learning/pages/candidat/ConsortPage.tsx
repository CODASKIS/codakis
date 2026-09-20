import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock3, FileUp, Eye } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  fetchConsortDossier,
  submitConsortPiece,
  uploadAuthDocument,
  type ConsortDossier,
  type ConsortPiece,
} from "../../../lib/authApi";

const LABELS: Record<string, string> = {
  id: "Pièce d'identité",
  birth: "Acte de naissance",
  medical: "Certificat médical",
  photos: "Photos d'identité",
  address: "Justificatif de domicile",
  stamps: "Timbres fiscaux",
};

const STATUS_LABEL: Record<string, string> = {
  missing: "Manquante",
  pending: "En attente de validation",
  validated: "Validée",
};

function statusTone(status: string) {
  if (status === "validated") return "is-ok";
  if (status === "pending") return "is-warn";
  return "is-miss";
}

export default function ConsortPage() {
  const [dossier, setDossier] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    const data = await fetchConsortDossier();
    setDossier(data);
  }

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Dossier indisponible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onPick(piece: ConsortPiece, file: File | null) {
    if (!file) return;
    setBusy(piece.key);
    setError("");
    try {
      const uploaded = await uploadAuthDocument(file);
      const updated = await submitConsortPiece(piece.key, {
        file_url: uploaded.secure_url || uploaded.url,
        file_name: file.name,
      });
      setDossier(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setBusy(null);
      const input = inputRefs.current[piece.key];
      if (input) input.value = "";
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Dossier Consort</h1>
      <p className="ck-subtitle">
        Progression {dossier?.progress_percent ?? 0}% · {dossier?.validated_count ?? 0}/
        {dossier?.total_count ?? 0} validées
      </p>
      {error ? <p className="ck-empty">{error}</p> : null}

      <div className="ck-consort-list">
        {(dossier?.pieces ?? []).map((piece) => (
          <div key={piece.key} className={`ck-consort-row ${statusTone(piece.status)}`}>
            <div className="ck-consort-row__main">
              <strong>{LABELS[piece.key] || piece.key}</strong>
              <small>{STATUS_LABEL[piece.status] || piece.status}</small>
              {piece.file_name || piece.file_url ? (
                <span className="ck-consort-row__file">
                  {piece.file_name || "Document joint"}
                  {piece.file_url ? (
                    <a href={piece.file_url} target="_blank" rel="noreferrer">
                      <Eye size={14} aria-hidden /> Voir
                    </a>
                  ) : null}
                </span>
              ) : null}
            </div>

            <div className="ck-consort-row__actions">
              {piece.status === "validated" ? (
                <span className="ck-consort-row__badge">
                  <CheckCircle2 size={16} aria-hidden /> Validée
                </span>
              ) : piece.status === "pending" ? (
                <>
                  <span className="ck-consort-row__badge is-pending">
                    <Clock3 size={16} aria-hidden /> En revue
                  </span>
                  <button
                    type="button"
                    className="ck-btn ck-btn--ghost ck-btn--sm"
                    disabled={busy === piece.key}
                    onClick={() => inputRefs.current[piece.key]?.click()}
                  >
                    Remplacer
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="ck-btn ck-btn--primary ck-btn--sm"
                  disabled={busy === piece.key}
                  onClick={() => inputRefs.current[piece.key]?.click()}
                >
                  <FileUp size={15} aria-hidden />
                  {busy === piece.key ? "Envoi…" : "Joindre"}
                </button>
              )}
              <input
                ref={(el) => {
                  inputRefs.current[piece.key] = el;
                }}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                hidden
                onChange={(e) => void onPick(piece, e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
