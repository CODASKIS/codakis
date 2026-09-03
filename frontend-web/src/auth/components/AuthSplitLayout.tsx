import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_BRAND_BACKGROUND, AUTH_VOLANT_ICON } from "../assets/authImages";
import { CODAKIS_LOGO } from "../../flexjobs/components/BrandLogo";
import LanguageSwitcher from "../../components/LanguageSwitcher";

type AuthSplitLayoutProps = {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
};

const VOLANT_POSITIONS = ["1", "2", "3", "4", "5"] as const;

export default function AuthSplitLayout({ children, backHref = "/", backLabel }: AuthSplitLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="codakis-auth">
      <aside className="codakis-auth__brand" aria-hidden={false}>
        <Link to="/" className="codakis-auth__logo-link">
          <img src={CODAKIS_LOGO} alt="CODAKIS" className="codakis-auth__logo" />
        </Link>
        <div className="codakis-auth__decor" aria-hidden="true">
          <div
            className="codakis-auth__bg"
            style={{ backgroundImage: `url(${AUTH_BRAND_BACKGROUND})` }}
          />
          {VOLANT_POSITIONS.map((position) => (
            <img
              key={position}
              src={AUTH_VOLANT_ICON}
              alt=""
              className={`codakis-auth__volant codakis-auth__volant--${position}`}
            />
          ))}
        </div>
        {backLabel ? (
          <Link to={backHref} className="codakis-auth__back">
            ← {backLabel}
          </Link>
        ) : null}
      </aside>

      <main className="codakis-auth__main">
        <div className="codakis-auth__toolbar" aria-label={t("lang.switch")}>
          <LanguageSwitcher variant="auth" />
        </div>
        {children}
      </main>
    </div>
  );
}
