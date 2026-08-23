import { Users } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import ThemedIcon from "./ThemedIcon";

export default function BlogInlineCta() {
  const { t } = useTranslation();

  return (
    <aside className="fj-blog-inline-cta" aria-label={t("blogArticle.inlineCtaAria")}>
      <div className="fj-blog-inline-cta__icon" aria-hidden="true">
        <ThemedIcon icon={Users} size={36} variant="nav" />
      </div>
      <div className="fj-blog-inline-cta__copy">
        <h2>{t("blogArticle.inlineCtaTitle")}</h2>
        <p>{t("blogArticle.inlineCtaText")}</p>
      </div>
      <div className="fj-blog-inline-cta__action">
        <Link to="/auto-ecoles" className="fj-btn fj-btn--primary">
          {t("blogArticle.inlineCtaButton")}
        </Link>
      </div>
    </aside>
  );
}
