import type { ReactNode, MouseEvent } from "react";
import { Link } from "react-router";

type Props = {
  tag?: "a" | "button";
  to?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  className?: string;
  children: ReactNode;
};

export function DropdownItem({
  tag = "button",
  to,
  onClick,
  onItemClick,
  className = "",
  children,
}: Props) {
  function handleClick(event: MouseEvent) {
    if (tag === "button") event.preventDefault();
    onClick?.();
    onItemClick?.();
  }

  if (tag === "a" && to) {
    return (
      <Link to={to} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
