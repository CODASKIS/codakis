import { useState } from "react";
import type { MoniteurSeance } from "../../../lib/enrollmentsApi";
import { updateMoniteurSeance } from "../../../lib/enrollmentsApi";
import { Modal } from "../../ui/Modal";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { formatDateTime, statusBadgeColor } from "./moniteurUtils";

type Props = {
  seance: MoniteurSeance | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => Promise<void> | void;
  confirmOnly?: boolean;
};

export default function SeanceDetailModal({ seance, open, onClose, onUpdated, confirmOnly = false }: Props) {
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  if (!seance) return null;

  async function markDone() {
    if (!seance) return;
    setSaving(true);
    setError("");
    try {
      await updateMoniteurSeance(seance.id, { statut: "terminee" });
      await onUpdated();
      setConfirming(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  }

  const showConfirm = confirmOnly || confirming;

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-md">
      <div className="p-6 pt-8 sm:p-8">
        {showConfirm ? (
          <>
            <h2 className="ck-title pr-8">Terminer la séance ?</h2>
            <p className="ck-subtitle" style={{ marginBottom: 0 }}>
              Confirmer que la séance avec <strong>{seance.candidat_name}</strong> du{" "}
              {formatDateTime(seance.starts_at)} est terminée.
            </p>
            {error ? <p className="ck-empty">{error}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" disabled={saving} onClick={() => void markDone()}>
                {saving ? "Mise à jour…" : "Confirmer"}
              </Button>
              <Button
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  if (confirmOnly) onClose();
                  else setConfirming(false);
                }}
              >
                Annuler
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="ck-title pr-8">{seance.candidat_name}</h2>
            <p className="ck-subtitle" style={{ marginBottom: "1.2rem" }}>
              {seance.candidat_phone || seance.forfait_label || "Élève"}
              {seance.school_name ? ` · ${seance.school_name}` : ""}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="ta-muted">Date</span>
                <strong className="ta-strong">{formatDateTime(seance.starts_at)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="ta-muted">Fin</span>
                <strong className="ta-strong">{formatDateTime(seance.ends_at)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="ta-muted">Statut</span>
                <Badge color={statusBadgeColor(seance.statut)}>{seance.statut}</Badge>
              </div>
              {seance.lieu ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="ta-muted">Lieu</span>
                  <strong className="ta-strong" style={{ textAlign: "right" }}>
                    {seance.lieu}
                  </strong>
                </div>
              ) : null}
              {seance.notes ? (
                <div>
                  <span className="ta-muted">Notes</span>
                  <p className="ta-strong" style={{ marginTop: "0.35rem", fontWeight: 700 }}>
                    {seance.notes}
                  </p>
                </div>
              ) : null}
            </div>
            {error ? <p className="ck-empty">{error}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {seance.statut !== "terminee" ? (
                <Button variant="primary" onClick={() => setConfirming(true)}>
                  Terminer
                </Button>
              ) : null}
              <Button variant="ghost" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
