import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export default function Select({ label, id, className, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="fj-form-group">
      {label ? (
        <label className="fj-label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select id={selectId} className={["fj-select", className].filter(Boolean).join(" ")} {...props}>
        {children}
      </select>
    </div>
  );
}
