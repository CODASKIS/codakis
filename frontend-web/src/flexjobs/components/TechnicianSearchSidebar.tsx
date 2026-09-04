import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import { FJ_IMG } from "../assets/online-images";

export default function TechnicianSearchSidebar() {
  const { t } = useTranslation();

  return (
    <aside className="fj-tech-sidebar">
      <div className="fj-tech-sidebar__promo">
        <img src={FJ_IMG.sidebarPromo} alt="" className="fj-tech-sidebar__image" />
        <div className="fj-tech-sidebar__body">
          <h3>{t("sidebar.promoTitle")}</h3>
          <p>{t("sidebar.promoText")}</p>
          <Link to={AUTH_PATHS.register.candidat} className="ck-public-btn ck-public-btn--primary ck-public-btn--block">
            {t("nav.signup")}
          </Link>
          <Link to={AUTH_PATHS.login} className="fj-tech-sidebar__link">
            {t("sidebar.alreadyMember")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
