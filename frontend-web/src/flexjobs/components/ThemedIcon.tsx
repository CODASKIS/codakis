import type { LucideIcon } from "lucide-react";

type ThemedIconProps = {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  variant?: "primary" | "nav" | "light" | "muted";
  className?: string;
};

const VARIANT_CLASS = {
  primary: "fj-icon--primary",
  nav: "fj-icon--nav",
  light: "fj-icon--light",
  muted: "fj-icon--muted",
} as const;

export default function ThemedIcon({
  icon: Icon,
  size = 20,
  strokeWidth = 1.75,
  variant = "primary",
  className = "",
}: ThemedIconProps) {
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={`fj-icon ${VARIANT_CLASS[variant]} ${className}`.trim()}
      aria-hidden
    />
  );
}
