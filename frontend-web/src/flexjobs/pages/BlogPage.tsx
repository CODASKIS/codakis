import { Search } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/common/Loader";
import CmsCoverImage from "../../components/common/CmsCoverImage";
import PublicPageHeader from "../components/PublicPageHeader";
import { useBlogPosts } from "../hooks/useCmsData";
import type { BlogPostListItem } from "../../lib/cms-api";

function sortPostsNewest(posts: BlogPostListItem[]): BlogPostListItem[] {
  return [...posts].sort((a, b) => {
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    return bTime - aTime;
  });
}

export default function BlogPage() {
  const { t } = useTranslation();
  const { data: posts, loading, error } = useBlogPosts([]);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) setQuery(urlQuery);
  }, [searchParams]);

  const visiblePosts = useMemo(() => {
    const sorted = sortPostsNewest(posts);
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sorted;
    return sorted.filter((post) =>
      [post.title, post.excerpt ?? "", post.slug].join(" ").toLowerCase().includes(normalized),
    );
  }, [posts, query]);

  return (
    <>
      <PageMeta title={t("blog.metaTitle")} description={t("blog.metaDescription")} />

      <div className="ck-page">
        <PublicPageHeader title={t("nav.blog")} lead={t("blog.metaDescription")} />

        <form
          className="ck-public-search ck-public-search--compact ck-public-search--page"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="sr-only" htmlFor="blog-search">
            {t("blog.searchLabel")}
          </label>
          <div className="fj-search-box">
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("blog.searchPlaceholder")}
            />
            <button type="submit" aria-label={t("blog.searchAria")}>
              <Search size={18} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </form>

        {loading && posts.length === 0 ? (
          <Loader variant="inline" theme="flexjobs" message={t("blog.loading")} />
        ) : posts.length === 0 ? (
          <p className="ck-page-lead">{error ? t("blog.error") : t("blog.empty")}</p>
        ) : visiblePosts.length === 0 ? (
          <p className="ck-page-lead">{t("blog.noResults")}</p>
        ) : (
          <ul className="ck-blog-list">
            {visiblePosts.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="ck-blog-item">
                  <CmsCoverImage url={post.cover_image_url} loading="lazy" className="ck-blog-item__thumb" />
                  <div>
                    <h2>{post.title}</h2>
                    {post.excerpt ? <p>{post.excerpt}</p> : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
