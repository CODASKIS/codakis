import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import BlogRecentCard from "./BlogRecentCard";
import Container from "./Container";
import { useBlogPosts } from "../hooks/useCmsData";
import { MOCK_BLOG_POSTS } from "../../data/mockCmsContent";

function sortPostsNewest<T extends { published_at?: string | null }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    return bTime - aTime;
  });
}

export default function HomeRecentBlogSection() {
  const { t } = useTranslation();
  const { data: posts, loading, error } = useBlogPosts(MOCK_BLOG_POSTS);
  const recentPosts = sortPostsNewest(posts).slice(0, 4);

  if (!loading && recentPosts.length === 0) {
    return null;
  }

  return (
    <section className="fj-home-blog" aria-labelledby="home-blog-title">
      <Container>
        <div className="fj-home-blog__head">
          <p className="fj-home-blog__eyebrow">{t("home.blogEyebrow")}</p>
          <h2 id="home-blog-title">{t("home.blogTitle")}</h2>
          <span className="fj-home-blog__rule" aria-hidden="true" />
        </div>

        {loading && recentPosts.length === 0 ? (
          <p className="fj-home-blog__status">{t("home.blogLoading")}</p>
        ) : error && recentPosts.length === 0 ? (
          <p className="fj-home-blog__status">{t("home.blogError")}</p>
        ) : (
          <>
            <div className="fj-home-blog__grid">
              {recentPosts.map((post) => (
                <BlogRecentCard key={post.slug} post={post} />
              ))}
            </div>
            <div className="fj-home-blog__actions">
              <Button href="/blog" variant="outline">
                {t("home.blogSeeAll")}
              </Button>
              <Link to="/blog" className="fj-link">
                {t("nav.blog")}
              </Link>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
