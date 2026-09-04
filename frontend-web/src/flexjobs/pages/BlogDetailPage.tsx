import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import CmsCoverImage from "../../components/common/CmsCoverImage";
import Loader from "../../components/common/Loader";
import {
  fetchBlogPost,
  fetchBlogPosts,
  type BlogPostDetail,
  type BlogPostListItem,
} from "../../lib/cms-api";
import { BlogArticleShare } from "../components/BlogArticleShare";
import BlogInlineCta from "../components/BlogInlineCta";
import { getIdenticonDataUrl } from "@/lib/identicon";
import { renderBlogBody } from "../../lib/blog-content";

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
        const contentHtml = await renderBlogBody(data.body);
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
      <div className="ck-article">
        <Loader variant="inline" theme="flexjobs" message={t("blogDetail.loading")} />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="ck-article">
        <h1 className="ck-page-title">{t("blogDetail.notFound")}</h1>
        <Link to="/blog" className="ck-public-btn ck-public-btn--primary" style={{ marginTop: "1.6rem" }}>
          {t("blogDetail.backToBlog")}
        </Link>
      </div>
    );
  }

  const dateLabel = formatDate(post.published_at, i18n.language);

  return (
    <>
      <PageMeta title={`${post.title} | CODAKIS`} description={post.excerpt ?? post.title} />

      <article className="ck-article">
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

        <h1 className="ck-page-title">{post.title}</h1>

        <div className="ck-article__meta">
          <img
            src={getIdenticonDataUrl(post.author_name || "BS", 40)}
            alt=""
            width={40}
            height={40}
            style={{ borderRadius: "999px" }}
          />
          <span>
            {t("blogDetail.authorBefore")} {post.author_name}
          </span>
          {dateLabel ? <span>{t("blogDetail.updated", { date: dateLabel })}</span> : null}
        </div>

        <CmsCoverImage url={post.cover_image_url} loading="eager" className="ck-article__cover" />

        <BlogArticleShare title={post.title} url={shareUrl} />
        <BlogInlineCta />

        <div className="ck-article__body fj-prose fj-wysiwyg" dangerouslySetInnerHTML={{ __html: html }} />

        {relatedPosts.length > 0 ? (
          <section className="ck-article__related">
            <h2>{t("blogArticle.asideTitle")}</h2>
            <ul className="ck-blog-list">
              {relatedPosts.map((item) => (
                <li key={item.slug}>
                  <Link to={`/blog/${item.slug}`} className="ck-blog-item">
                    <CmsCoverImage url={item.cover_image_url} loading="lazy" className="ck-blog-item__thumb" />
                    <div>
                      <h2>{item.title}</h2>
                      {item.excerpt ? <p>{item.excerpt}</p> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </>
  );
}
