import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { deleteAdminBlogPost, fetchAdminBlogPosts, type AdminBlogPost } from "../../../lib/cms-admin-api";
import ComponentCard from "../../common/ComponentCard";
import TableActions from "../../ui/TableActions";

export default function AdminBlog() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPosts(await fetchAdminBlogPosts());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onDelete(post: AdminBlogPost) {
    if (!window.confirm(`Supprimer « ${post.title} » ?`)) return;
    setBusyId(post.id);
    setError("");
    try {
      await deleteAdminBlogPost(post.id);
      await load();
      setMessage("Article supprimé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="ck-title">Blog</h2>
          <p className="ck-subtitle">{posts.length} articles</p>
        </div>
        <Link to="/espace/admin/blog/nouveau" className="ck-btn ck-btn--primary">
          <Plus size={16} strokeWidth={2.5} />
          Nouvel article
        </Link>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}
      {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}

      <ComponentCard title="Articles">
        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="ta-cell-stack">
                      <p className="ta-cell-stack__title">{post.title}</p>
                      <p className="ta-cell-stack__sub">/{post.slug}</p>
                    </div>
                  </td>
                  <td>{post.author_name}</td>
                  <td>
                    <span className={`ck-schools-pill${post.status === "published" ? " is-on" : ""}`}>
                      {post.status === "published" ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td>{new Date(post.updated_at || post.created_at).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <TableActions
                      actions={[
                        ...(post.status === "published"
                          ? [
                              {
                                label: "Voir public",
                                icon: ExternalLink,
                                to: `/blog/${post.slug}`,
                                external: true,
                              },
                            ]
                          : []),
                        {
                          label: "Modifier",
                          icon: Pencil,
                          to: `/espace/admin/blog/${post.id}`,
                          variant: "primary" as const,
                        },
                        {
                          label: "Supprimer",
                          icon: Trash2,
                          variant: "danger" as const,
                          disabled: busyId === post.id,
                          onClick: () => void onDelete(post),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!posts.length ? <p className="ck-empty">Aucun article.</p> : null}
        </div>
      </ComponentCard>
    </div>
  );
}
