import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "green" | "blue" | "orange";
};

export function StatCard({ label, value, hint, accent = "green" }: StatCardProps) {
  return (
    <article className={`codakis-stat codakis-stat--${accent}`}>
      <p className="codakis-stat__label">{label}</p>
      <p className="codakis-stat__value">{value}</p>
      {hint ? <p className="codakis-stat__hint">{hint}</p> : null}
    </article>
  );
}

type DashboardSectionProps = {
  title: string;
  children: ReactNode;
};

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <section className="codakis-dash-section">
      <h2 className="codakis-dash-section__title">{title}</h2>
      {children}
    </section>
  );
}

type PlaceholderPanelProps = {
  title: string;
  description: string;
};

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <div className="codakis-dash-placeholder">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
