import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import BrandLogo from "../components/BrandLogo";

export default function Footer() {
  const { t } = useTranslation();

  const cols = [
    {
      title: t("footer.col1Title"),
      links: [
        { label: t("nav.drivingSchools"), to: "/auto-ecoles" },
        { label: t("nav.themes"), to: "/themes" },
        { label: t("nav.subscription"), to: "/themes#abonnement" },
        { label: t("nav.howItWorks"), to: "/comment-ca-marche" },
      ],
    },
    {
      title: t("footer.col2Title"),
      links: [
        { label: t("nav.howItWorks"), to: "/comment-ca-marche" },
        { label: "CODAKIS", to: "/a-propos" },
        { label: t("nav.contact"), to: "/contact" },
        { label: t("nav.subscription"), to: "/themes#abonnement" },
      ],
    },
    {
      title: t("footer.colAccountTitle"),
      links: [
        { label: t("nav.login"), to: AUTH_PATHS.login },
        { label: t("nav.signup"), to: AUTH_PATHS.register.candidat },
        { label: t("nav.signupSchool"), to: AUTH_PATHS.register.autoEcole },
        { label: t("footer.loginSchool"), to: AUTH_PATHS.login },
        { label: t("footer.loginInstructor"), to: AUTH_PATHS.login },
      ],
    },
    {
      title: t("footer.col3Title"),
      links: [
        { label: t("nav.consort"), to: "/consort" },
        { label: t("nav.blog"), to: "/blog" },
        { label: t("nav.themes"), to: "/themes" },
        { label: t("nav.drivingSchools"), to: "/auto-ecoles" },
        { label: t("footer.privacy"), to: "/politique-de-confidentialite" },
        { label: t("footer.terms"), to: "/conditions-d-utilisation" },
      ],
    },
  ] as const;

  return (
    <footer className="fj-footer">
      <div className="fj-container">
        <div className="mb-8">
          <BrandLogo size="sm" showTagline={false} />
          <p className="mt-4 text-[1.4rem] text-[#64748b] max-w-[48rem]">{t("footer.description")}</p>
        </div>

        <div className="fj-footer__cols">
          {cols.map((col) => (
            <div key={col.title}>
              <p className="fj-footer__heading">{col.title}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.to}`}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="fj-footer__bottom">
          <Link to={AUTH_PATHS.login}>{t("nav.login")}</Link>
          <span>|</span>
          <Link to="/contact">{t("nav.contact")}</Link>
          <span>|</span>
          <span>
            © {new Date().getFullYear()} CODAKIS — {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
