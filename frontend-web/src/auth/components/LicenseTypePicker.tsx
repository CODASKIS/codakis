import { Bike, Bus, Car, CarFront, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TypePermis } from "../types";

const LICENSES: { code: TypePermis; icon: LucideIcon; tone: string }[] = [
  { code: "B", icon: Car, tone: "green" },
  { code: "A", icon: Bike, tone: "orange" },
  { code: "A1", icon: Bike, tone: "sky" },
  { code: "C", icon: Truck, tone: "slate" },
  { code: "D", icon: Bus, tone: "violet" },
  { code: "BE", icon: CarFront, tone: "lime" },
];

type LicenseTypePickerProps = {
  value: TypePermis;
  onChange: (value: TypePermis) => void;
};

export default function LicenseTypePicker({ value, onChange }: LicenseTypePickerProps) {
  const { t } = useTranslation();

  return (
    <div className="codakis-license-grid" role="radiogroup" aria-label={t("auth.register.steps.selectLicense")}>
      {LICENSES.map(({ code, icon: Icon, tone }) => {
        const selected = value === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`codakis-license-card is-${tone}${selected ? " is-selected" : ""}`}
            onClick={() => onChange(code)}
          >
            <span className="codakis-license-card__icon" aria-hidden>
              <Icon size={22} strokeWidth={2.4} />
            </span>
            <span className="codakis-license-card__copy">
              <strong>{t(`auth.register.licenses.${code}.label`)}</strong>
              <small>{t(`auth.register.licenses.${code}.hint`)}</small>
            </span>
            <span className="codakis-license-card__badge" aria-hidden>
              {code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
