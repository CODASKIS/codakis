import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookOpen, Shield, Trophy } from "lucide-react";
import { CODAKIS_LOGO } from "../../flexjobs/components/BrandLogo";
import LanguageSwitcher from "../../components/LanguageSwitcher";

type AuthSplitLayoutProps = {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Conservé pour compatibilité des pages auth (login / register). */
  mood?: "hero" | "login" | "register";
};

const HIGHLIGHTS = [
  { icon: BookOpen, key: "lessons" as const },
  { icon: Shield, key: "exams" as const },
  { icon: Trophy, key: "progress" as const },
] as const;

export default function AuthSplitLayout({
  children,
  backHref = "/",
  backLabel,
  mood = "login",
}: AuthSplitLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className={`codakis-auth codakis-auth--${mood}`}>
      <header className="codakis-auth__top">
        <Link to="/" className="codakis-auth__logo-link" aria-label="CODAKIS">
          <img src={CODAKIS_LOGO} alt="CODAKIS" className="codakis-auth__logo" />
        </Link>
        <div className="codakis-auth__top-actions">
          <LanguageSwitcher variant="auth" />
          {backLabel ? (
            <Link to={backHref} className="codakis-auth__back">
              <ArrowLeft size={16} aria-hidden />
              <span>{backLabel}</span>
            </Link>
          ) : null}
        </div>
      </header>

      <div className="codakis-auth__body">
        <aside className="codakis-auth__brand" aria-label="CODAKIS">
          <div className="codakis-auth__brand-copy">
            <p className="codakis-auth__eyebrow">{t("auth.brand.eyebrow", { defaultValue: "Espace permis" })}</p>
            <h2 className="codakis-auth__brand-title">
              {mood === "register"
                ? t("auth.brand.registerTitle", { defaultValue: "Rejoins CODAKIS et lance ton parcours" })
                : t("auth.brand.title", { defaultValue: "Apprenez comme dans votre feuille de route" })}
            </h2>
            <p className="codakis-auth__brand-text">
              {mood === "register"
                ? t("auth.brand.registerText", {
                    defaultValue: "Inscription rapide — cours, quiz et suivi dès la première connexion.",
                  })
                : t("auth.brand.text", {
                    defaultValue: "Cours, quiz et suivi de progression — le même style que votre espace candidat.",
                  })}
            </p>
            <ul className="codakis-auth__highlights">
              {HIGHLIGHTS.map(({ icon: Icon, key }) => (
                <li key={key}>
                  <span className="codakis-auth__highlight-icon" aria-hidden>
                    <Icon size={18} strokeWidth={2.4} />
                  </span>
                  <span>
                    {t(`auth.brand.highlights.${key}`, {
                      defaultValue:
                        key === "lessons"
                          ? "Modules guidés"
                          : key === "exams"
                            ? "Examens blancs"
                            : "Progression claire",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="codakis-auth__brand-visual" aria-hidden>
            <img
              src="/images/auth/cartoon-red-car.png"
              alt=""
              className="codakis-auth__brand-car"
              width={563}
              height={426}
              decoding="async"
            />
          </div>
        </aside>

        <main className="codakis-auth__main">
          <div className="codakis-auth__card">{children}</div>
        </main>
      </div>
    </div>
  );
}
