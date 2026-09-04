import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Save } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  createAdminTheme,
  fetchAdminThemes,
  updateAdminTheme,
} from "../../../lib/pedagogyApi";
import PageBack from "../../common/PageBack";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

type Draft = {
  code: string;
  title_fr: string;
  title_en: string;
  sort_order: string;
  is_premium: boolean;
};

const EMPTY: Draft = { code: "", title_fr: "", title_en: "", sort_order: "0", is_premium: false };

export default function AdminThemeForm() {
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
    void fetchAdminThemes()
      .then((list) => {
        if (cancelled) return;
        const theme = list.find((t) => t.id === id);
        if (!theme) {
          setError("Thème introuvable.");
          return;
        }
        setDraft({
          code: theme.code,
          title_fr: theme.title_fr,
          title_en: theme.title_en,
          sort_order: String(theme.sort_order),
          is_premium: theme.is_premium,
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
        code: draft.code.trim(),
        title_fr: draft.title_fr.trim(),
        title_en: draft.title_en.trim(),
        sort_order: Number(draft.sort_order) || 0,
        is_premium: draft.is_premium,
      };
      if (isNew) await createAdminTheme(payload);
      else await updateAdminTheme(id, payload);
      navigate("/espace/admin/contenu");
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
        <PageBack to="/espace/admin/contenu" label="Retour au contenu" />
        <h2 className="ck-title">{isNew ? "Nouveau thème" : "Modifier le thème"}</h2>
      </div>
      <ComponentCard title="Thème">
        <form className="ck-form ck-schools-profile__form space-y-3" onSubmit={(e) => void onSave(e)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required />
            <Input
              label="Ordre"
              type="number"
              value={draft.sort_order}
              onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
            />
          </div>
          <Input
            label="Titre FR"
            value={draft.title_fr}
            onChange={(e) => setDraft({ ...draft, title_fr: e.target.value })}
            required
          />
          <Input
            label="Titre EN"
            value={draft.title_en}
            onChange={(e) => setDraft({ ...draft, title_en: e.target.value })}
          />
          <label className="ta-check-row">
            <input
              type="checkbox"
              checked={draft.is_premium}
              onChange={(e) => setDraft({ ...draft, is_premium: e.target.checked })}
            />
            <span>Thème premium</span>
          </label>
          {error ? <p className="ck-empty">{error}</p> : null}
          <div className="ck-schools-profile__actions">
            <Button type="submit" disabled={saving} startIcon={<Save size={16} strokeWidth={2.5} />}>
              {saving ? "…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/espace/admin/contenu")}>
              Annuler
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
