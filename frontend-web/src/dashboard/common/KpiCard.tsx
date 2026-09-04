import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "green" | "blue" | "amber" | "slate";
};

const TONES: Record<NonNullable<Props["tone"]>, { bg: string; fg: string }> = {
  green: { bg: "rgba(0, 168, 89, 0.12)", fg: "#00a859" },
  blue: { bg: "rgba(14, 165, 233, 0.12)", fg: "#0284c7" },
  amber: { bg: "rgba(245, 158, 11, 0.14)", fg: "#d97706" },
  slate: { bg: "#f2f4f7", fg: "#475467" },
};

/**
 * KPI style TailAdmin EcommerceMetrics :
 * icône en haut → label → grande valeur.
 */
export default function KpiCard({ label, value, icon: Icon, hint, tone = "green" }: Props) {
  const colors = TONES[tone];
  return (
    <article className="ta-kpi ta-kpi--stack">
      <span className="ta-kpi__icon" style={{ background: colors.bg, color: colors.fg }} aria-hidden>
        <Icon size={22} strokeWidth={2.25} />
      </span>
      <div className="ta-kpi__body">
        <p className="ta-kpi-label">{label}</p>
        <p className="ta-kpi-value">{value}</p>
        {hint ? <p className="ta-kpi-hint">{hint}</p> : null}
      </div>
    </article>
  );
}
