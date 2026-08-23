import type { ReactNode } from "react";

type MetricCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
  trend?: ReactNode;
};

export default function MetricCard({ icon, value, label, trend }: MetricCardProps) {
  return (
    <div className="fj-metric-card">
      <div className="fj-metric-card__icon">{icon}</div>
      <div className="fj-metric-card__value">{value}</div>
      <div className="fj-metric-card__label">{label}</div>
      {trend ? <div className="fj-metric-card__action">{trend}</div> : null}
    </div>
  );
}
