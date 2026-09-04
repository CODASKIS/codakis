import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import BrandLogo from "../components/BrandLogo";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const explore = [
    { label: t("nav.drivingSchools"), to: "/auto-ecoles" },
    { label: t("nav.themes"), to: "/themes" },
    { label: t("nav.howItWorks"), to: "/comment-ca-marche" },
    { label: t("nav.blog"), to: "/blog" },
  ] as const;

  const account = [
    { label: t("nav.login"), to: AUTH_PATHS.login },
    { label: t("nav.signup"), to: AUTH_PATHS.register.candidat },
    { label: t("nav.signupSchool"), to: AUTH_PATHS.register.autoEcole },
    { label: t("nav.contact"), to: "/contact" },
    { label: t("footer.privacy"), to: "/politique-de-confidentialite" },
    { label: t("footer.terms"), to: "/conditions-d-utilisation" },
  ] as const;

  function handleNewsletter(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus("error");
      return;
    }
    setStatus("ok");
    setEmail("");
  }

  return (
    <footer className="ck-footer">
      <div className="fj-container ck-footer__newsletter">
        <div className="ck-footer__newsletter-copy">
          <h2>{t("footer.newsletterTitle")}</h2>
          <p>{t("footer.newsletterLead")}</p>
        </div>
        <form className="ck-footer__newsletter-form" onSubmit={handleNewsletter} noValidate>
          <label className="sr-only" htmlFor="footer-newsletter-email">
            {t("footer.newsletterEmailLabel")}
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder={t("footer.newsletterPlaceholder")}
            autoComplete="email"
          />
          <button type="submit" className="ck-public-btn ck-public-btn--primary">
            {t("footer.newsletterSubmit")}
          </button>
          {status === "ok" ? <p className="ck-footer__newsletter-msg is-ok">{t("footer.newsletterSuccess")}</p> : null}
          {status === "error" ? <p className="ck-footer__newsletter-msg is-error">{t("footer.newsletterError")}</p> : null}
        </form>
      </div>

      <div className="fj-container ck-footer__inner">
        <div className="ck-footer__brand">
          <BrandLogo size="sm" showTagline={false} />
          <p>{t("footer.description")}</p>
          <div className="ck-footer__cta-row">
            <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--primary">
              {t("nav.signup")}
            </Link>
            <Link to={AUTH_PATHS.register.autoEcole} className="ck-public-btn ck-public-btn--ghost">
              {t("nav.signupSchool")}
            </Link>
          </div>
        </div>

        <div className="ck-footer__cols">
          <div>
            <p className="ck-footer__heading">{t("footer.col1Title")}</p>
            <ul>
              {explore.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ck-footer__heading">{t("footer.colAccountTitle")}</p>
            <ul>
              {account.map((link) => (
                <li key={`${link.label}-${link.to}`}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="ck-footer__bottom">
        <div className="fj-container">
          <span>
            © {new Date().getFullYear()} CODAKIS — {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
