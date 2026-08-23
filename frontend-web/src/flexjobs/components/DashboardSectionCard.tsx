import type { ReactNode } from "react";

type DashboardSectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export default function DashboardSectionCard({ title, description, children }: DashboardSectionCardProps) {
  return (
    <section className="fj-section-card">
      {title || description ? (
        <header className="fj-section-card__header">
          {title ? <h2 className="fj-section-card__title">{title}</h2> : null}
          {description ? <p className="fj-section-card__desc">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
