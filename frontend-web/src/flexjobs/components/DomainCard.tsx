import { Link } from "react-router";
import Card from "./Card";

type DomainCardProps = {
  label: string;
  technicianCount: number;
};

export default function DomainCard({ label, technicianCount }: DomainCardProps) {
  return (
    <Card sticker={label}>
      <h3 className="text-[2rem] mb-2">{label}</h3>
      <p className="text-[1.4rem] text-[#667085] mb-3">
        Techniciens référencés : {technicianCount > 0 ? `${technicianCount}+` : "—"}
      </p>
      <Link to="/auto-ecoles" className="fj-btn fj-btn--outline fj-btn--sm">
        Voir l&apos;annuaire
      </Link>
    </Card>
  );
}

type PlanCardProps = {
  sticker: string;
  title: string;
  location: string;
  priceLabel: string;
  highlight?: string | null;
  description?: string | null;
  ctaLabel: string;
  ctaHref: string;
};

export function PlanCard({
  sticker,
  title,
  location,
  priceLabel,
  highlight,
  description,
  ctaLabel,
  ctaHref,
}: PlanCardProps) {
  const isExternal = ctaHref.startsWith("http");

  return (
    <Card sticker={sticker}>
      <h3 className="text-[2rem] mb-1">{title}</h3>
      <p className="text-[1.4rem] text-[#667085] mb-2">{location}</p>
      {highlight ? <p className="text-[1.4rem] font-medium text-[var(--fj-link)] mb-2">{highlight}</p> : null}
      <p className="mb-1 text-[1.6rem]">
        <span className="text-[#667085]">Tarif : </span>
        <strong>{priceLabel}</strong>
      </p>
      {description ? <p className="text-[1.4rem] text-[#667085] mb-4">{description}</p> : null}
      {isExternal ? (
        <a href={ctaHref} className="fj-btn fj-btn--primary">
          {ctaLabel}
        </a>
      ) : (
        <Link to={ctaHref} className="fj-btn fj-btn--primary">
          {ctaLabel}
        </Link>
      )}
    </Card>
  );
}
