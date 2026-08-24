import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type ModuleSegment = {
  id: string;
  label: string;
  meta?: ReactNode;
};

type ModuleSegmentNavProps = {
  segments: ModuleSegment[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
  ariaLabel?: string;
};

export default function ModuleSegmentNav({
  segments,
  activeId,
  onSelect,
  className = "",
  ariaLabel,
}: ModuleSegmentNavProps) {
  if (segments.length <= 1) return null;

  return (
    <nav className={`codakis-module-nav ${className}`.trim()} aria-label={ariaLabel}>
      <ul className="codakis-module-nav__list">
        {segments.map((segment) => {
          const isActive = segment.id === activeId;
          return (
            <li key={segment.id}>
              <button
                type="button"
                className={`codakis-module-nav__btn${isActive ? " is-active" : ""}`}
                onClick={() => onSelect(segment.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <span>{segment.label}</span>
                {segment.meta ? <small>{segment.meta}</small> : null}
                {isActive ? (
                  <motion.span
                    layoutId="codakis-module-nav-indicator"
                    className="codakis-module-nav__indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
