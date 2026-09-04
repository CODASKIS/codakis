import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Save } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  createAdminBlogPost,
  fetchAdminBlogPost,
  updateAdminBlogPost,
} from "../../../lib/cms-admin-api";
import PageBack from "../../common/PageBack";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import WysiwygEditor from "../../ui/WysiwygEditor";

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: "draft" | "published";
};

const EMPTY: Draft = { title: "", slug: "", excerpt: "", body: "", status: "draft" };

export default function AdminBlogForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    setLoading(true);
    void fetchAdminBlogPost(id)
      .then((post) => {
        if (cancelled) return;
        setDraft({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          body: post.body,
          status: post.status,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: draft.title.trim(),
        slug: draft.slug.trim() || undefined,
        excerpt: draft.excerpt.trim() || null,
        body: draft.body,
        status: draft.status,
      };
      if (isNew) {
        const created = await createAdminBlogPost(payload);
        navigate(`/espace/admin/blog/${created.id}`, { replace: true });
      } else {
        await updateAdminBlogPost(id, payload);
        navigate("/espace/admin/blog");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <PageBack to="/espace/admin/blog" label="Retour au blog" />
        <h2 className="ck-title">{isNew ? "Nouvel article" : "Modifier l’article"}</h2>
        <p className="ck-subtitle">Rédaction et publication.</p>
      </div>

      <ComponentCard title="Contenu">
        <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSave(e)}>
          <Input label="Titre" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          <Input label="Slug (optionnel)" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          <Input label="Extrait" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
          <WysiwygEditor
            label="Corps de l’article"
            value={draft.body}
            onChange={(body) => setDraft((d) => ({ ...d, body }))}
            placeholder="Rédigez l’article…"
            minHeight={320}
            disabled={saving}
          />
          <label>
            Statut
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft["status"] })}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </label>
          {error ? <p className="ck-empty">{error}</p> : null}
          <div className="ck-schools-profile__actions">
            <Button type="submit" disabled={saving} startIcon={<Save size={16} strokeWidth={2.5} />}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/espace/admin/blog")}>
              Annuler
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
