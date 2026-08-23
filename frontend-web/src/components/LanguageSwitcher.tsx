import { useTranslation } from "react-i18next";
import type { AppLanguage } from "../i18n/index";

type LanguageSwitcherProps = {
  variant?: "desktop" | "mobile";
};

const LANGUAGE_OPTIONS: { code: AppLanguage; flag: string }[] = [
  { code: "fr", flag: "🇫🇷" },
  { code: "en", flag: "🇬🇧" },
];

export default function LanguageSwitcher({ variant = "desktop" }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = i18n.language.startsWith("en") ? "en" : "fr";

  function setLanguage(lng: AppLanguage) {
    void i18n.changeLanguage(lng);
  }

  return (
    <div
      className={`fj-lang-switch${variant === "mobile" ? " fj-lang-switch--mobile" : ""}`}
      role="group"
      aria-label={t("lang.switch")}
    >
      {LANGUAGE_OPTIONS.map(({ code, flag }) => (
        <button
          key={code}
          type="button"
          className={`fj-lang-switch__btn${current === code ? " is-active" : ""}`}
          aria-pressed={current === code}
          aria-label={t(`lang.${code}`)}
          onClick={() => setLanguage(code)}
        >
          <span className="fj-lang-switch__flag" aria-hidden>
            {flag}
          </span>
          <span>{t(`lang.${code}`)}</span>
        </button>
      ))}
    </div>
  );
}
