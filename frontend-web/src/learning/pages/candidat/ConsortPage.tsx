import { useEffect, useState } from "react";
import Loader from "../../../components/common/Loader";
import { fetchConsortDossier, submitConsortPiece, type ConsortDossier } from "../../../lib/authApi";

const LABELS: Record<string, string> = {
  cni: "Carte d'identité",
  photo: "Photo d'identité",
  certificat_medical: "Certificat médical",
  timbre: "Timbre fiscal",
  extrait_naissance: "Extrait de naissance",
};

export default function ConsortPage() {
  const [dossier, setDossier] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  async function submit(key: string) {
    setBusy(key);
    try {
      const updated = await submitConsortPiece(key);
      setDossier(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-card">
      <h1 className="ck-title">Dossier Consort</h1>
      <p className="ck-subtitle">
        Progression {dossier?.progress_percent ?? 0}% · {dossier?.validated_count ?? 0}/{dossier?.total_count ?? 0}{" "}
        validées
      </p>
      {error ? <p className="ck-empty">{error}</p> : null}
      <div className="ck-list">
        {(dossier?.pieces ?? []).map((piece) => (
          <div key={piece.key} className="ck-list__row">
            <span style={{ flex: 1 }}>
              <strong>{LABELS[piece.key] || piece.key}</strong>
              <small>Statut : {piece.status}</small>
            </span>
            {piece.status === "missing" ? (
              <button type="button" className="ck-btn ck-btn--primary" style={{ minHeight: "3.6rem" }} disabled={busy === piece.key} onClick={() => void submit(piece.key)}>
                {busy === piece.key ? "…" : "Soumettre"}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
