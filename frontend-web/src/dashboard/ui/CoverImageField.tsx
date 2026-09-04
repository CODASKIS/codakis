import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { uploadCmsImage } from "../../lib/cms-admin-api";
import Button from "./Button";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function resolvePreviewUrl(url?: string | null): string {
  const value = url?.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/images/")) {
    return value;
  }
  if (value.startsWith("/api/")) {
    return `${API_URL}${value}`;
  }
  return `${API_URL}/api/v1/public/media/${value.replace(/^\//, "")}`;
}

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
};

/** Bannière / couverture : aperçu, remplacement ou suppression. */
export default function CoverImageField({
  value,
  onChange,
  label = "Image de bannière",
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const preview = resolvePreviewUrl(value);

  async function onPick(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadCmsImage(file);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="ck-cover-field">
      <span className="ck-cover-field__label">{label}</span>

      {preview ? (
        <div className="ck-cover-field__preview">
          <img src={preview} alt="" />
        </div>
      ) : (
        <div className="ck-cover-field__empty">Aucune bannière</div>
      )}

      <div className="ck-cover-field__actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          disabled={disabled || uploading}
          onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || uploading}
          startIcon={<ImagePlus size={16} strokeWidth={2.5} />}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Envoi…" : preview ? "Changer" : "Ajouter"}
        </Button>
        {preview ? (
          <Button
            type="button"
            variant="danger"
            disabled={disabled || uploading}
            startIcon={<Trash2 size={16} strokeWidth={2.5} />}
            onClick={() => {
              setError("");
              onChange(null);
            }}
          >
            Supprimer
          </Button>
        ) : null}
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}
    </div>
  );
}
