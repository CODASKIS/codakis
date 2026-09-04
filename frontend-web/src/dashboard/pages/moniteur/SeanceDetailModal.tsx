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
            <h2 className="pr-8 text-xl font-bold text-gray-800">Terminer la séance ?</h2>
            <p className="mt-2 text-sm text-gray-500">
              Confirmer que la séance avec <strong>{seance.candidat_name}</strong> du{" "}
              {formatDateTime(seance.starts_at)} est terminée.
            </p>
            {error ? <p className="mt-3 text-sm text-error-500">{error}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" disabled={saving} onClick={() => void markDone()}>
                {saving ? "Mise à jour…" : "Confirmer"}
              </Button>
              <Button
                variant="outline"
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
            <h2 className="pr-8 text-xl font-bold text-gray-800">{seance.candidat_name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {seance.candidat_phone || seance.forfait_label || "Élève"}
              {seance.school_name ? ` · ${seance.school_name}` : ""}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Date</span>
                <strong className="text-gray-800">{formatDateTime(seance.starts_at)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Fin</span>
                <strong className="text-gray-800">{formatDateTime(seance.ends_at)}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Statut</span>
                <Badge color={statusBadgeColor(seance.statut)}>{seance.statut}</Badge>
              </div>
              {seance.lieu ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Lieu</span>
                  <strong className="text-right text-gray-800">{seance.lieu}</strong>
                </div>
              ) : null}
              {seance.notes ? (
                <div>
                  <span className="text-gray-500">Notes</span>
                  <p className="mt-1 text-gray-800">{seance.notes}</p>
                </div>
              ) : null}
            </div>
            {error ? <p className="mt-3 text-sm text-error-500">{error}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {seance.statut !== "terminee" ? (
                <Button variant="primary" onClick={() => setConfirming(true)}>
                  Terminer
                </Button>
              ) : null}
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
