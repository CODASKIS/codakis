import { useCallback, useEffect, useState } from "react";
import { Badge, Col, Row, Table } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import { ApiError } from "../../../lib/api";
import { fetchAdminBlogPosts, type AdminBlogPost } from "../../../lib/cms-admin-api";

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale.startsWith("en") ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminBlogPage() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPosts(await fetchAdminBlogPosts());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard.adminBlog.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const { paginatedItems, page, setPage, pageSize, total } = useTablePagination(posts);

  return (
    <Row>
      <Col sm={12}>
        <MainCard
          title={t("dashboard.adminBlog.title")}
          isOption={false}
          cardClass=""
          optionClass=""
          CardBodyClass=""
        >
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <p className="text-muted mb-0">{t("dashboard.adminBlog.lead")}</p>
            <Link to="/admin/blog/nouveau" className="btn btn-primary btn-sm">
              {t("dashboard.adminBlog.create")}
            </Link>
          </div>

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

          {loading ? (
            <Loader variant="inline" theme="flexjobs" message={t("common.loading")} />
          ) : posts.length === 0 ? (
            <p className="text-muted mb-0">{t("dashboard.adminBlog.empty")}</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>{t("dashboard.adminBlog.colTitle")}</th>
                    <th>{t("dashboard.adminBlog.colAuthor")}</th>
                    <th>{t("dashboard.adminBlog.colDate")}</th>
                    <th>{t("dashboard.adminBlog.colStatus")}</th>
                    <th className="text-end">{t("dashboard.adminBlog.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <CmsCoverImage
                            url={post.cover_image_url}
                            width={48}
                            height={48}
                            className="rounded object-fit-cover flex-shrink-0"
                            loading="lazy"
                          />
                          <div>
                            <p className="fw-semibold mb-0">{post.title}</p>
                            <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: "28rem" }}>
                              {post.excerpt ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{post.author_name}</td>
                      <td>{formatDate(post.published_at, i18n.language)}</td>
                      <td>
                        <Badge bg={post.status === "published" ? "success" : "secondary"}>
                          {post.status === "published"
                            ? t("dashboard.adminBlog.statusPublished")
                            : t("dashboard.adminBlog.statusDraft")}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {post.status === "published" ? (
                          <Link to={`/blog/${post.slug}`} className="btn btn-outline-primary btn-sm me-2" target="_blank">
                            {t("dashboard.adminBlog.viewPublic")}
                          </Link>
                        ) : null}
                        <Link to={`/admin/blog/${post.id}/modifier`} className="btn btn-outline-secondary btn-sm">
                          {t("dashboard.adminBlog.edit")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
            </div>
          )}
        </MainCard>
      </Col>
    </Row>
  );
}
