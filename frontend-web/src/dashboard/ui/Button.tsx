import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline" | "danger" | "ghost";
  startIcon?: ReactNode;
  block?: boolean;
};

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
    "ta-btn",
    variant === "primary" && "ta-btn--primary",
    variant === "outline" && "ta-btn--outline",
    variant === "ghost" && "ta-btn--ghost",
    variant === "danger" && "ta-btn--danger",
    size === "sm" && "ta-btn--sm",
    block && "ta-btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {startIcon ? <span className="ta-btn__icon">{startIcon}</span> : null}
      {children}
    </button>
  );
}
