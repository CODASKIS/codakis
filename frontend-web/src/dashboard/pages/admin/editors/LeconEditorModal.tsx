import { FormEvent, useEffect, useState } from "react";
import {
  createAdminLecon,
  deleteAdminLecon,
  fetchAdminThemes,
  updateAdminLecon,
  type PedagogyLecon,
  type PedagogyTheme,
} from "../../../../lib/pedagogyApi";
import Button from "../../../ui/Button";
import CoverImageField from "../../../ui/CoverImageField";
import Input from "../../../ui/Input";
import { Modal } from "../../../ui/Modal";
import WysiwygEditor from "../../../ui/WysiwygEditor";

type Props = {
  open: boolean;
  lecon: PedagogyLecon | null;
  onClose: () => void;
  onSaved: () => void;
};

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

export default function LeconEditorModal({ open, lecon, onClose, onSaved }: Props) {
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    void fetchAdminThemes()
      .then((list) => {
        setThemes(list);
        if (lecon) {
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
        } else {
          setDraft({ ...EMPTY, theme_id: list[0]?.id || "" });
        }
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Chargement thèmes impossible"));
  }, [open, lecon]);

  async function onSubmit(e: FormEvent) {
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
      if (lecon) await updateAdminLecon(lecon.id, payload);
      else await createAdminLecon(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!lecon) return;
    setSaving(true);
    setError("");
    try {
      await deleteAdminLecon(lecon.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={() => !saving && onClose()} className="max-w-3xl p-6 sm:p-8">
      <h3 className="ck-title" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {lecon ? "Modifier la leçon" : "Nouvelle leçon"}
      </h3>
      <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSubmit(e)}>
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
          minHeight={260}
          disabled={saving}
        />
        <div className="ck-schools-profile__grid">
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
          <Button type="submit" disabled={saving}>
            {saving ? "…" : "Enregistrer"}
          </Button>
          <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
            Annuler
          </Button>
          {lecon ? (
            <Button type="button" variant="danger" disabled={saving} onClick={() => void onDelete()}>
              Supprimer
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
