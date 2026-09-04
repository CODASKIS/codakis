type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id: string;
};

/** Switch style Duo (pill + knob blanc). */
export default function PrefToggle({ checked, onChange, label, id }: Props) {
  return (
    <div className="ck-prefs__row">
      <span className="ck-prefs__label" id={`${id}-label`}>
        {label}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        className={`ck-prefs__switch${checked ? " is-on" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(!checked);
        }}
      >
        <span className="ck-prefs__switch-knob" aria-hidden />
      </button>
    </div>
  );
}
