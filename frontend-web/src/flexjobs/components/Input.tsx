import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="fj-form-group">
      {label ? (
        <label className="fj-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={["fj-input", className].filter(Boolean).join(" ")} {...props} />
    </div>
  );
}
