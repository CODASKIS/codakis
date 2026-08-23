import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { BlogPostListItem } from "../../lib/cms-api";
import CmsCoverImage from "../../components/common/CmsCoverImage";

type BlogArticleAsideProps = {
  relatedPosts: BlogPostListItem[];
};

function formatDate(publishedAt: string | null | undefined, locale: string) {
  if (!publishedAt) return "";
  return new Date(publishedAt).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogArticleAside({ relatedPosts }: BlogArticleAsideProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const dateLocale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) {
      navigate("/blog");
      return;
    }
    navigate(`/blog?q=${encodeURIComponent(normalized)}`);
  }

  return (
    <aside className="fj-blog-article__aside" aria-label={t("blogArticle.asideAria")}>
      <div className="fj-blog-aside-box">
        <h2>{t("blogArticle.asideTitle")}</h2>
        <p>{t("blogArticle.asideText")}</p>
        <Link to="/auto-ecoles" className="fj-btn fj-btn--primary fj-btn--block">
          {t("blogArticle.asideCta")}
        </Link>
      </div>

      <form className="fj-blog-aside-search" role="search" onSubmit={handleSearch}>
        <label className="sr-only" htmlFor="article-sidebar-search">
          {t("blog.searchLabel")}
        </label>
        <input
          id="article-sidebar-search"
          type="search"
          className="fj-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("blog.searchPlaceholder")}
        />
        <button type="submit" className="fj-blog-search__btn" aria-label={t("blog.searchAria")}>
          <Search size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>

      {relatedPosts.length > 0 ? (
        <div className="fj-blog-aside-related">
          <h2>{t("blogArticle.relatedTitle")}</h2>
          <ul>
            {relatedPosts.map((post) => {
              const dateLabel = formatDate(post.published_at, dateLocale);
              return (
                <li key={post.slug}>
                  <Link to={`/blog/${post.slug}`} className="fj-blog-aside-related__item">
                    <CmsCoverImage url={post.cover_image_url} loading="lazy" />
                    <div>
                      <span className="fj-blog-aside-related__title">{post.title}</span>
                      {dateLabel ? (
                        <span className="fj-blog-aside-related__date">{dateLabel}</span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
