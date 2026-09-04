import { Users } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function BlogInlineCta() {
  const { t } = useTranslation();

  return (
    <aside className="ck-blog-cta" aria-label={t("blogArticle.inlineCtaAria")}>
      <span className="ck-blog-cta__icon" aria-hidden>
        <Users size={22} strokeWidth={2.4} />
      </span>
      <div className="ck-blog-cta__copy">
        <h2>{t("blogArticle.inlineCtaTitle")}</h2>
        <p>{t("blogArticle.inlineCtaText")}</p>
      </div>
      <Link to="/auto-ecoles" className="ck-public-btn ck-public-btn--primary">
        {t("blogArticle.inlineCtaButton")}
      </Link>
    </aside>
  );
}
