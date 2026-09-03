import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "../i18n/index";

type LanguageSwitcherProps = {
  variant?: "desktop" | "mobile" | "auth";
};

const LANGUAGE_OPTIONS: { code: AppLanguage; labelKey: string }[] = [
  { code: "fr", labelKey: "lang.fr" },
  { code: "en", labelKey: "lang.en" },
];

function FlagCircle({ code }: { code: AppLanguage }) {
  if (code === "en") {
    return (
      <svg className="fj-lang-dd__flag" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="12" fill="#012169" />
        <path fill="#FFF" d="M0 8h24v8H0z" />
        <path fill="#FFF" d="M8 0h8v24H8z" />
        <path fill="#C8102E" d="M0 10h24v4H0z" />
        <path fill="#C8102E" d="M10 0h4v24h-4z" />
        <path fill="#FFF" d="M0 0l10.5 7H8L0 1.7V0zm24 0v1.7L16 7h-2.5L24 0zM0 24l10.5-7H8L0 22.3V24zm24 0v-1.7L16 17h-2.5L24 24z" />
        <path fill="#C8102E" d="M0 0l12 8h-3.2L0 2.1V0zm24 0v2.1L15.2 8H12L24 0zM0 24l12-8h-3.2L0 21.9V24zm24 0v-2.1L15.2 16H12L24 24z" />
        <circle cx="12" cy="12" r="12" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg className="fj-lang-dd__flag" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#ED2939" />
      <path fill="#002395" d="M0 12a12 12 0 0 1 12-12v24A12 12 0 0 1 0 12z" />
      <path fill="#FFF" d="M8 0h8v24H8z" />
      <circle cx="12" cy="12" r="12" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    </svg>
  );
}

export default function LanguageSwitcher({ variant = "desktop" }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current: AppLanguage = i18n.language.startsWith("en") ? "en" : "fr";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function setLanguage(lng: AppLanguage) {
    void i18n.changeLanguage(lng);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={`fj-lang-dd${variant === "mobile" ? " fj-lang-dd--mobile" : ""}${variant === "auth" ? " fj-lang-dd--auth" : ""}`}
    >
      <button
        type="button"
        className="fj-lang-dd__trigger"
        aria-label={t("lang.switch")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <FlagCircle code={current} />
        <svg className="fj-lang-dd__chevron" viewBox="0 0 12 8" aria-hidden>
          <path d="M1.4 0 6 4.6 10.6 0 12 1.4l-6 6-6-6z" fill="currentColor" />
        </svg>
      </button>

      {open ? (
        <ul id={menuId} className="fj-lang-dd__menu" role="listbox" aria-label={t("lang.switch")}>
          {LANGUAGE_OPTIONS.map(({ code, labelKey }) => (
            <li key={code} role="option" aria-selected={current === code}>
              <button
                type="button"
                className={`fj-lang-dd__option${current === code ? " is-active" : ""}`}
                onClick={() => setLanguage(code)}
              >
                <FlagCircle code={code} />
                <span>{t(labelKey)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
