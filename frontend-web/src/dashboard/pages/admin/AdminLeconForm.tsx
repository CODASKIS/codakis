import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Save, Trash2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  createAdminLecon,
  deleteAdminLecon,
  fetchAdminLecons,
  fetchAdminThemes,
  updateAdminLecon,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";
import PageBack from "../../common/PageBack";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import CoverImageField from "../../ui/CoverImageField";
import Input from "../../ui/Input";
import WysiwygEditor from "../../ui/WysiwygEditor";

type Draft = {
  theme_id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string | null;
  sort_order: string;
  status: string;
};

const EMPTY: Draft = {
  theme_id: "",
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_image_url: null,
  sort_order: "0",
  status: "draft",
};

export default function AdminLeconForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchAdminThemes();
        if (cancelled) return;
        setThemes(list);
        if (isNew) {
          setDraft({ ...EMPTY, theme_id: list[0]?.id || "" });
        } else {
          const lecons = await fetchAdminLecons();
          if (cancelled) return;
          const lecon = lecons.find((l) => l.id === id);
          if (!lecon) {
            setError("Leçon introuvable.");
            return;
          }
          setDraft({
            theme_id: lecon.theme_id,
            title: lecon.title,
            slug: lecon.slug,
            excerpt: lecon.excerpt || "",
            body: lecon.body,
            cover_image_url: lecon.cover_image_url || null,
            sort_order: String(lecon.sort_order),
            status: lecon.status,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
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
        theme_id: draft.theme_id,
        title: draft.title.trim(),
        slug: draft.slug.trim() || undefined,
        excerpt: draft.excerpt.trim() || null,
        body: draft.body,
        cover_image_url: draft.cover_image_url?.trim() || "",
        sort_order: Number(draft.sort_order) || 0,
        status: draft.status,
      };
      if (isNew) await createAdminLecon(payload);
      else await updateAdminLecon(id, payload);
      navigate("/espace/admin/contenu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (isNew || !window.confirm("Supprimer cette leçon ?")) return;
    setSaving(true);
    try {
      await deleteAdminLecon(id);
      navigate("/espace/admin/contenu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
      setSaving(false);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <PageBack to="/espace/admin/contenu" label="Retour au contenu" />
        <h2 className="ck-title">{isNew ? "Nouvelle leçon" : "Modifier la leçon"}</h2>
      </div>
      <ComponentCard title="Leçon / cours">
        <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSave(e)}>
          <label>
            Thème
            <select
              value={draft.theme_id}
              onChange={(e) => setDraft({ ...draft, theme_id: e.target.value })}
              required
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title_fr}
                </option>
              ))}
            </select>
          </label>
          <Input label="Titre" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          <Input label="Slug (optionnel)" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          <Input label="Extrait" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
          <CoverImageField
            value={draft.cover_image_url}
            onChange={(cover_image_url) => setDraft((d) => ({ ...d, cover_image_url }))}
            disabled={saving}
          />
          <WysiwygEditor
            label="Contenu du cours"
            value={draft.body}
            onChange={(body) => setDraft((d) => ({ ...d, body }))}
            placeholder="Rédigez le cours : titres, listes, liens, vidéo…"
            minHeight={320}
            disabled={saving}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Ordre"
              type="number"
              value={draft.sort_order}
              onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
            />
            <label>
              Statut
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </label>
          </div>
          {error ? <p className="ck-empty">{error}</p> : null}
          <div className="ck-schools-profile__actions flex-wrap">
            <Button type="submit" disabled={saving} startIcon={<Save size={16} strokeWidth={2.5} />}>
              {saving ? "…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/espace/admin/contenu")}>
              Annuler
            </Button>
            {!isNew ? (
              <Button
                type="button"
                variant="danger"
                disabled={saving}
                startIcon={<Trash2 size={16} strokeWidth={2.5} />}
                onClick={() => void onDelete()}
              >
                Supprimer
              </Button>
            ) : null}
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
