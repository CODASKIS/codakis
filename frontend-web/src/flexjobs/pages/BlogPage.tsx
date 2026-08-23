import { Search } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/common/Loader";
import BlogCard, { BlogFeaturedCard } from "../components/BlogCard";
import Container from "../components/Container";
import SubNav from "../components/SubNav";
import { useBlogPosts } from "../hooks/useCmsData";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";
import { MOCK_BLOG_POSTS } from "../../data/mockCmsContent";
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
  const subNavItems = useSecondaryNavItems();
  const { data: posts, loading, error } = useBlogPosts(MOCK_BLOG_POSTS);
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

  const featuredPost = visiblePosts[0] ?? null;
  const sidebarPosts = visiblePosts.slice(1, 5);
  const gridPosts = visiblePosts.slice(5);

  return (
    <>
      <PageMeta title={t("blog.metaTitle")} description={t("blog.metaDescription")} />
      <SubNav activePath="/blog" items={[...subNavItems]} />

      <section className="fj-section">
        <Container>
          <div className="fj-blog-page-header">
            <h1>{t("nav.blog")}</h1>
            <form
              className="fj-blog-search"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="sr-only" htmlFor="blog-search">
                {t("blog.searchLabel")}
              </label>
              <input
                id="blog-search"
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
          </div>

          {loading && posts.length === 0 ? (
            <Loader variant="inline" theme="flexjobs" message={t("blog.loading")} />
          ) : posts.length === 0 ? (
            <p className="text-center py-8 text-[1.6rem]">
              {error ? t("blog.error") : t("blog.empty")}
            </p>
          ) : visiblePosts.length === 0 ? (
            <p className="text-center py-8 text-[1.6rem]">{t("blog.noResults")}</p>
          ) : (
            <>
              {featuredPost ? (
                <div className="fj-blog-hero">
                  <div className="fj-blog-hero__grid">
                    <BlogFeaturedCard post={featuredPost} />
                    {sidebarPosts.length > 0 ? (
                      <div className="fj-blog-sidebar-list">
                        {sidebarPosts.map((post) => (
                          <BlogCard key={post.slug} post={post} compact />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {gridPosts.length > 0 ? (
                <>
                  <hr className="fj-blog-divider" />
                  <div className="fj-blog-tabs" role="tablist" aria-label={t("blog.tabsLabel")}>
                    <span className="is-active" role="tab" aria-selected="true">
                      {t("blog.latest")}
                    </span>
                    <Link to="/blog" role="tab">
                      {t("blog.all")}
                    </Link>
                  </div>
                  <div className="fj-blog-card-grid">
                    {gridPosts.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
