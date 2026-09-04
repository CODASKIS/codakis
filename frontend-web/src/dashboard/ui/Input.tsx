import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
  full?: boolean;
};

export default function Input({ label, hint, full, className = "", id, ...rest }: Props) {
  const inputId = id || (label ? `ta-input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <label className={`ta-field ${full ? "ta-field--full" : ""}`}>
      {label ? <span className="ta-field__label">{label}</span> : null}
      <input id={inputId} className={`ta-input ${className}`.trim()} {...rest} />
      {hint ? <span className="ta-field__hint">{hint}</span> : null}
    </label>
  );
}
