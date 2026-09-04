import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "light";
  size?: "sm" | "md";
};

const colors = {
  primary: "bg-brand-50 text-brand-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error: "bg-error-50 text-error-600",
  light: "bg-gray-100 text-gray-700",
};

export default function Badge({ children, color = "light", size = "sm" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-extrabold uppercase tracking-wide ${colors[color]} ${
        size === "sm" ? "px-2.5 py-1 text-[1.1rem]" : "px-3 py-1.5 text-[1.25rem]"
      }`}
    >
      {children}
    </span>
  );
}
