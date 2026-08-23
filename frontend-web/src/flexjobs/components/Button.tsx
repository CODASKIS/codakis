import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

type ButtonVariant = "primary" | "outline" | "ghost-light";
type ButtonSize = "md" | "sm";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes(variant: ButtonVariant, size: ButtonSize, block: boolean, extra?: string) {
  return [
    "fj-btn",
    variant === "primary" && "fj-btn--primary",
    variant === "outline" && "fj-btn--outline",
    variant === "ghost-light" && "fj-btn--ghost-light",
    size === "sm" && "fj-btn--sm",
    block && "fj-btn--block",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const cls = classes(variant, size, block, className);

  if ("href" in props && props.href) {
    return (
      <Link to={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
