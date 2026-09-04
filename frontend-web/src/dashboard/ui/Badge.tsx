import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "light";
};

const colors = {
  primary: "is-progress",
  success: "is-done",
  warning: "is-progress",
  error: "is-idle",
  light: "is-idle",
};

/** Badge = même famille que .ck-schools-status du site. */
export default function Badge({ children, color = "light" }: Props) {
  return <span className={`ck-schools-status ${colors[color]}`}>{children}</span>;
}
