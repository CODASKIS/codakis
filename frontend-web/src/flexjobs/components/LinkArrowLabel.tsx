import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type LinkArrowLabelProps = {
  children: ReactNode;
  className?: string;
};

/** Libellé de lien avec flèche Lucide (remplace le caractère « → »). */
export default function LinkArrowLabel({ children, className = "" }: LinkArrowLabelProps) {
  return (
    <span className={`fj-link-arrow${className ? ` ${className}` : ""}`}>
      {children}
      <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
    </span>
  );
}
