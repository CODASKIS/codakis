import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
  full?: boolean;
};

/** Label + input — styles via parent `.ck-schools-profile__form` (site). */
export default function Input({ label, hint, full, className = "", id, ...rest }: Props) {
  const inputId = id || (label ? `ta-input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <label htmlFor={inputId} className={full ? "ck-schools-profile__full" : undefined}>
      {label}
      <input id={inputId} className={className} {...rest} />
      {hint}
    </label>
  );
}
