import { Link } from "react-router";
import { resolveCmsMediaUrl, type BlogPostListItem } from "../../lib/cms-api";

type BlogRecentCardProps = {
  post: BlogPostListItem;
};

function formatShortDate(publishedAt: string | null | undefined) {
  if (!publishedAt) return "";
  return new Date(publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Carte blog horizontale (image à gauche) — style Medicare. */
export default function BlogRecentCard({ post }: BlogRecentCardProps) {
  const cover = resolveCmsMediaUrl(post.cover_image_url);
  const dateLabel = formatShortDate(post.published_at);

  return (
    <article className="fj-home-blog-card">
      <Link to={`/blog/${post.slug}`} className="fj-home-blog-card__media no-underline hover:no-underline">
        <img src={cover} alt="" loading="lazy" />
      </Link>
      <div className="fj-home-blog-card__body">
        <h3 className="fj-home-blog-card__title">
          <Link to={`/blog/${post.slug}`} className="no-underline hover:no-underline">
            {post.title}
          </Link>
        </h3>
        {dateLabel ? (
          <p className="fj-home-blog-card__meta">
            {post.author_name}
            <span aria-hidden="true"> • </span>
            {dateLabel}
          </p>
        ) : null}
        {post.excerpt ? <p className="fj-home-blog-card__excerpt">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}
