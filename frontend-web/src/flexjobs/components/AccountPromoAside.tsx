import { CircleCheck } from "lucide-react";
import { Link } from "react-router";

type AccountPromoAsideProps = {
  title?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

const DEFAULT_BULLETS = [
  "Auto-écoles agréées et vérifiés par BS",
  "Annuaire géolocalisé au Cameroun",
  "Coordonnées débloquées avec abonnement",
  "Évaluations et historique transparents",
] as const;

export default function AccountPromoAside({
  title = "Accédez à 500+ auto-écoles agréées",
  bullets = [...DEFAULT_BULLETS],
  ctaLabel = "Voir les forfaits",
  ctaHref = "/",
}: AccountPromoAsideProps) {
  return (
    <aside className="fj-account-aside">
      <div className="fj-account-promo">
        <h2>{title}</h2>
        <ul>
          {bullets.map((item) => (
            <li key={item}>
              <CircleCheck size={18} strokeWidth={2.25} className="fj-account-promo__check" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link to={ctaHref} className="ck-public-btn ck-public-btn--primary ck-public-btn--block">
          {ctaLabel}
        </Link>
      </div>
      <div className="fj-account-news">
        <h3>CODAKIS dans l&apos;actualité</h3>
        <p>
          La agrément CODAKIS garantit des professionnels vérifiés pour vos interventions au Cameroun.
        </p>
      </div>
    </aside>
  );
}
