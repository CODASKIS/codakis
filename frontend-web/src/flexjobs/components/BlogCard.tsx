import { Link } from "react-router";
import { resolveCmsMediaUrl, type BlogPostListItem } from "../../lib/cms-api";

type BlogCardProps = {
  post: BlogPostListItem;
  compact?: boolean;
};

function formatDate(publishedAt: string | null | undefined) {
  if (!publishedAt) return "";
  return new Date(publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogCard({ post, compact = false }: BlogCardProps) {
  const cover = resolveCmsMediaUrl(post.cover_image_url);
  const dateLabel = formatDate(post.published_at);

  if (compact) {
    return (
      <article className="fj-blog-sidebar-item">
        <Link to={`/blog/${post.slug}`} className="no-underline hover:no-underline">
          <img src={cover} alt="" loading="lazy" />
        </Link>
        <h3>
          <Link to={`/blog/${post.slug}`} className="no-underline hover:no-underline">
            {post.title}
          </Link>
        </h3>
      </article>
    );
  }

  return (
    <article className="fj-blog-card">
      <Link to={`/blog/${post.slug}`} className="block no-underline hover:no-underline">
        <img src={cover} alt="" loading="lazy" />
      </Link>
      <div className="fj-blog-card__body">
        {dateLabel ? <p className="text-[1.4rem] text-[var(--fj-text-muted)] mb-2">{dateLabel}</p> : null}
        <h4>
          <Link to={`/blog/${post.slug}`} className="no-underline hover:no-underline">
            {post.title}
          </Link>
        </h4>
        {post.excerpt ? (
          <p className="text-[1.4rem] text-[var(--fj-text-muted)] line-clamp-3 m-0">{post.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}

export function BlogFeaturedCard({ post }: { post: BlogPostListItem }) {
  const cover = resolveCmsMediaUrl(post.cover_image_url);

  return (
    <article className="fj-blog-featured">
      <Link to={`/blog/${post.slug}`} className="block no-underline hover:no-underline">
        <img src={cover} alt="" loading="eager" />
      </Link>
      <div className="fj-blog-featured__body">
        <h2>
          <Link to={`/blog/${post.slug}`} className="no-underline hover:no-underline">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
      </div>
    </article>
  );
}
