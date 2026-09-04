import { Link, useNavigate } from "react-router";
import { Check, Minus, Sparkles, X } from "lucide-react";

const FREE_FEATURES = [
  { label: "3 premiers chapitres (Signalisation, Priorités, Circulation)", free: true, super: true },
  { label: "Quiz des modules gratuits", free: true, super: true },
  { label: "10 thèmes CEMAC complets", free: false, super: true },
  { label: "Examens blancs illimités", free: false, super: true },
  { label: "Cahier d’erreurs & stats avancées", free: false, super: true },
  { label: "Mode hors-ligne & révision ciblée", free: false, super: true },
] as const;

type Props = {
  embedded?: boolean;
};

export default function SuperUpgradePage({ embedded }: Props) {
  const navigate = useNavigate();

  return (
    <div className={`ck-super${embedded ? " is-embedded" : ""}`}>
      <section className="ck-super__hero">
        {!embedded ? (
          <button type="button" className="ck-super__close" onClick={() => navigate(-1)} aria-label="Fermer">
            <X size={22} />
          </button>
        ) : null}
        <div className="ck-super__badge" aria-hidden>
          <Sparkles size={18} /> SUPER
        </div>
        <h1>
          Tu as <span>4×</span> plus de chances de réussir ton code au Cameroun !
        </h1>
        <p>Passe à CODAKIS Super pour débloquer tous les chapitres, les examens blancs et le suivi premium.</p>
        <div className="ck-super__mascot" aria-hidden>
          <Sparkles size={56} strokeWidth={1.5} />
        </div>
        <div className="ck-super__wave" aria-hidden />
      </section>

      <section className="ck-super__compare">
        <div className="ck-super__compare-head">
          <span />
          <strong>Gratuit</strong>
          <strong className="is-super">Super</strong>
        </div>
        <ul className="ck-super__rows">
          {FREE_FEATURES.map((row) => (
            <li key={row.label}>
              <span className="ck-super__feature">{row.label}</span>
              <span className="ck-super__cell" aria-label={row.free ? "Inclus" : "Non inclus"}>
                {row.free ? <Check size={20} className="is-ok" /> : <Minus size={18} className="is-no" />}
              </span>
              <span className="ck-super__cell is-highlight" aria-label="Inclus Super">
                <Check size={20} className="is-super-check" />
              </span>
            </li>
          ))}
        </ul>
        <p className="ck-super__price">
          À partir de <strong>2 500 FCFA / mois</strong> — Orange Money & MTN MoMo
        </p>
        <Link to="/tarifs#abonnement" className="ck-btn ck-btn--primary ck-btn--block ck-super__cta">
          Passer à Super
        </Link>
        <button type="button" className="ck-super__skip" onClick={() => navigate("/espace/candidat")}>
          Non merci
        </button>
      </section>
    </div>
  );
}
