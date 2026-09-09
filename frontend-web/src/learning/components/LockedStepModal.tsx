import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { Lock, Sparkles, X } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onContinue?: () => void;
};

export default function LockedStepModal({ open, title, onClose }: Props) {
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
        <h2 id="ck-locked-title">Étape réservée</h2>
        <p className="ck-locked-modal__lead">
          {title
            ? `« ${title} » fait partie des modules premium.`
            : "Cette étape fait partie des modules premium."}
        </p>
        <p className="ck-locked-modal__hint">
          Débloquez l’accès illimité à tous les cours, quiz et examens blancs en souscrivant une formule CODAKIS Super.
        </p>
        <div className="ck-locked-modal__actions">
          <Link
            to="/tarifs#abonnement"
            className="ck-public-btn ck-public-btn--primary ck-btn--block"
            onClick={onClose}
            style={{ display: "inline-flex", width: "100%", justifyContent: "center", alignItems: "center", gap: "0.6rem" }}
          >
            <Sparkles size={18} />
            <span>Voir les offres & S&apos;abonner</span>
          </Link>
          <button type="button" className="ck-public-btn ck-public-btn--ghost ck-btn--block" onClick={onClose} style={{ width: "100%" }}>
            Plus tard
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
