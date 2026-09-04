import type { MouseEvent, ReactNode } from "react";
import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";

export type TableAction = {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  variant?: "ghost" | "danger" | "primary";
  disabled?: boolean;
  external?: boolean;
};

type Props = {
  actions: TableAction[];
  children?: ReactNode;
};

function stop(e: MouseEvent) {
  e.stopPropagation();
}

/** Boutons d’action compacts pour colonnes de tableaux. */
export default function TableActions({ actions, children }: Props) {
  return (
    <div className="ta-row-actions" onClick={stop} onKeyDown={(e) => e.stopPropagation()}>
      {actions.map((action) => {
        const Icon = action.icon;
        const cls = [
          "ta-row-actions__btn",
          action.variant === "danger" && "is-danger",
          action.variant === "primary" && "is-primary",
        ]
          .filter(Boolean)
          .join(" ");

        if (action.to && !action.disabled) {
          return (
            <Link
              key={action.label}
              to={action.to}
              className={cls}
              title={action.label}
              aria-label={action.label}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noreferrer" : undefined}
            >
              <Icon size={16} strokeWidth={2.4} />
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            type="button"
            className={cls}
            title={action.label}
            aria-label={action.label}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            <Icon size={16} strokeWidth={2.4} />
          </button>
        );
      })}
      {children}
    </div>
  );
}
