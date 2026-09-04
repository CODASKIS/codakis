import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Lock, X } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onContinue?: () => void;
};

export default function LockedStepModal({ open, title, onClose, onContinue }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="ck-locked-modal" role="dialog" aria-modal="true" aria-labelledby="ck-locked-title" onClick={onClose}>
      <div className="ck-locked-modal__card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ck-locked-modal__close" onClick={onClose} aria-label="Fermer">
          <X size={20} />
        </button>
        <div className="ck-locked-modal__badge" aria-hidden>
          <Lock size={28} strokeWidth={2.5} />
        </div>
        <h2 id="ck-locked-title">Étape bloquée</h2>
        <p className="ck-locked-modal__lead">
          {title
            ? `« ${title} » n’est pas encore accessible.`
            : "Cette étape n’est pas encore accessible."}
        </p>
        <p className="ck-locked-modal__hint">
          Terminez d’abord l’étape en cours (étoile verte), puis réussissez le quiz pour débloquer la suite.
        </p>
        <div className="ck-locked-modal__actions">
          {onContinue ? (
            <button type="button" className="ck-btn ck-btn--primary ck-btn--block" onClick={onContinue}>
              Aller à l’étape en cours
            </button>
          ) : null}
          <button type="button" className="ck-btn ck-btn--ghost ck-btn--block" onClick={onClose}>
            Compris
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
