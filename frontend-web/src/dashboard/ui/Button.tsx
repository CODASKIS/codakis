import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline" | "danger" | "ghost";
  startIcon?: ReactNode;
  block?: boolean;
};

/** Boutons = classes exactes du site (.ck-btn). */
export default function Button({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  block,
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  const classes = [
    "ck-btn",
    variant === "primary" && "ck-btn--primary",
    (variant === "outline" || variant === "ghost") && "ck-btn--ghost",
    variant === "danger" && "ck-btn--danger",
    size === "sm" && "ck-btn--sm",
    block && "ck-btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {startIcon ? <span className="ta-btn-icon">{startIcon}</span> : null}
      {children}
    </button>
  );
}
