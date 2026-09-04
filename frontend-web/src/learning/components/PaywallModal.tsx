import { Link } from "react-router";
import { Lock, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PaywallModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="ck-paywall" role="dialog" aria-modal="true" aria-labelledby="ck-paywall-title">
      <div className="ck-paywall__card">
        <button type="button" className="ck-paywall__close" onClick={onClose} aria-label="Fermer">
          <X size={20} />
        </button>
        <div className="ck-paywall__lock" aria-hidden>
          <Lock size={28} />
        </div>
        <h2 id="ck-paywall-title" style={{ fontWeight: 800, fontSize: "2rem" }}>
          Contenu Premium CODAKIS
        </h2>
        <p className="ck-subtitle" style={{ marginBottom: "1.6rem" }}>
          Ce chapitre est réservé aux candidats avec un forfait. Choisissez une auto-école pour continuer.
        </p>
        <Link to="/auto-ecoles" className="ck-btn ck-btn--primary ck-btn--block" onClick={onClose}>
          Voir les forfaits
        </Link>
      </div>
    </div>
  );
}
