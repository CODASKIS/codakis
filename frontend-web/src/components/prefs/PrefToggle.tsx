type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id: string;
  disabled?: boolean;
  hint?: string;
};

/** Switch style Duo (pill + knob blanc). */
export default function PrefToggle({ checked, onChange, label, id, disabled, hint }: Props) {
  return (
    <div className={`ck-prefs__row${disabled ? " is-disabled" : ""}`}>
      <div className="ck-prefs__label-wrap">
        <span className="ck-prefs__label" id={`${id}-label`}>
          {label}
        </span>
        {hint ? <span className="ck-prefs__hint">{hint}</span> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        className={`ck-prefs__switch${checked ? " is-on" : ""}${disabled ? " is-disabled" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (disabled) return;
          onChange(!checked);
        }}
      >
        <span className="ck-prefs__switch-knob" aria-hidden />
      </button>
    </div>
  );
}
