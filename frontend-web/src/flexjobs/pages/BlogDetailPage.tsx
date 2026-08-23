import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import {
  fetchBlogPost,
  fetchBlogPosts,
  resolveCmsMediaUrl,
  type BlogPostDetail,
  type BlogPostListItem,
} from "../../lib/cms-api";
import BlogArticleAside from "../components/BlogArticleAside";
import BlogArticleShare from "../components/BlogArticleShare";
import BlogInlineCta from "../components/BlogInlineCta";
import Button from "../components/Button";
import Container from "../components/Container";
import SubNav from "../components/SubNav";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";
import { markdownToHtml } from "../utils/markdown";

function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(publishedAt: string | null | undefined, locale: string) {
  if (!publishedAt) return "";
  return new Date(publishedAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogDetailPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const subNavItems = useSecondaryNavItems();
  const [html, setHtml] = useState("");
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : `/blog/${slug}`),
    [slug],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    void Promise.all([fetchBlogPost(slug), fetchBlogPosts()])
      .then(async ([data, posts]) => {
        if (cancelled) return;
        setPost(data);
        setRelatedPosts(
          posts
            .filter((item) => item.slug !== slug)
            .sort((a, b) => {
              const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
              const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
              return bTime - aTime;
            })
            .slice(0, 4),
        );
        const contentHtml = await markdownToHtml(data.body);
        if (!cancelled) {
          setHtml(contentHtml);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Container className="fj-blog-article fj-blog-article--loading">
        <p>{t("blogDetail.loading")}</p>
      </Container>
    );
  }

  if (notFound || !post) {
    return (
      <Container className="fj-blog-article fj-blog-article--loading">
        <h1>{t("blogDetail.notFound")}</h1>
        <Button href="/blog" className="mt-4">
          {t("blogDetail.backToBlog")}
        </Button>
      </Container>
    );
  }

  const cover = resolveCmsMediaUrl(post.cover_image_url);
  const dateLabel = formatDate(post.published_at, i18n.language);

  return (
    <>
      <PageMeta title={`${post.title} | CODAKIS`} description={post.excerpt ?? post.title} />
      <SubNav activePath="/blog" items={[...subNavItems]} />

      <article className="fj-blog-article">
        <Container>
          <header className="fj-blog-article__header">
            <div className="fj-blog-article__intro">
              <nav className="fj-breadcrumb" aria-label={t("blogDetail.breadcrumbAria")}>
                <ol>
                  <li>
                    <Link to="/">{t("breadcrumb.home")}</Link>
                  </li>
                  <li>
                    <Link to="/blog">{t("breadcrumb.blog")}</Link>
                  </li>
                  <li className="active" aria-current="page">
                    {post.title}
                  </li>
                </ol>
              </nav>

              <h1 className="fj-blog-article__title">{post.title}</h1>

              <div className="fj-blog-article__meta">
                <span className="fj-blog-article__avatar" aria-hidden="true">
                  {authorInitials(post.author_name || "BS")}
                </span>
                <div>
                  <p className="fj-blog-article__author">
                    {t("blogDetail.authorBefore")} <Link to="/blog">{post.author_name}</Link>
                  </p>
                  {dateLabel ? (
                    <p className="fj-blog-article__date">{t("blogDetail.updated", { date: dateLabel })}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="fj-blog-article__cover">
              <img src={cover} alt="" />
            </div>
          </header>
        </Container>

        <Container>
          <div className="fj-blog-article__layout">
            <div className="fj-blog-article__main">
              <BlogArticleShare title={post.title} url={shareUrl} />
              <BlogInlineCta />
              <div className="fj-prose fj-wysiwyg fj-blog-article__content" dangerouslySetInnerHTML={{ __html: html }} />
            </div>

            <BlogArticleAside relatedPosts={relatedPosts} />
          </div>
        </Container>
      </article>
    </>
  );
}
