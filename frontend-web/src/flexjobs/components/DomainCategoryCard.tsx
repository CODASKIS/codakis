import { Link } from "react-router";
import { getDomainIcon } from "../utils/domainIcons";

type DomainCategoryCardProps = {
  label: string;
  code?: string;
  to?: string;
};

export default function DomainCategoryCard({ label, code, to }: DomainCategoryCardProps) {
  const Icon = getDomainIcon(label, code);
  const href = to ?? `/auto-ecoles?q=${encodeURIComponent(code ?? label)}`;

  return (
    <Link to={href} className="fj-domain-card">
      <span className="fj-domain-card__icon" aria-hidden>
        <Icon size={32} strokeWidth={1.5} />
      </span>
      <span className="fj-domain-card__label">{label}</span>
    </Link>
  );
}
