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
  const combined =
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold text-gray-700 no-underline transition hover:bg-brand-50 hover:text-brand-700 ${className}`.trim();

  function handleClick(event: MouseEvent) {
    if (tag === "button") event.preventDefault();
    onClick?.();
    onItemClick?.();
  }

  if (tag === "a" && to) {
    return (
      <Link to={to} className={combined} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={combined}>
      {children}
    </button>
  );
}
