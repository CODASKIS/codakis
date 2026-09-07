import { useRef, useState } from "react";
import { File as FileIcon, FileText, Film, ImagePlus, Trash2, Upload } from "lucide-react";
import { uploadDocument, uploadImage, uploadVideo, type CloudinaryUploadResult } from "../../lib/cms-admin-api";
import Button from "./Button";

// ── types ─────────────────────────────────────────────────────────────────────

export type UploadMode = "image" | "video" | "document" | "any";

type Props = {
  value: string | null;
  onChange: (url: string | null, result?: CloudinaryUploadResult) => void;
  mode?: UploadMode;
  label?: string;
  disabled?: boolean;
  /** Texte affiché sous le champ (ex. "Max 10 Mo · JPEG, PNG, WebP") */
  hint?: string;
};

// ── config par mode ───────────────────────────────────────────────────────────

const MODE_CONFIG: Record<
  UploadMode,
  {
    accept: string;
    maxLabel: string;
    uploader: (file: File) => Promise<CloudinaryUploadResult>;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  }
> = {
  image: {
    accept: "image/jpeg,image/png,image/webp,image/gif",
    maxLabel: "Max 10 Mo · JPEG, PNG, WebP, GIF",
    uploader: uploadImage,
    icon: ImagePlus,
  },
  video: {
    accept: "video/mp4,video/webm,video/quicktime",
    maxLabel: "Max 100 Mo · MP4, WebM, MOV",
    uploader: uploadVideo,
    icon: Film,
  },
  document: {
    accept: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp",
    maxLabel: "Max 20 Mo · PDF, DOCX, JPEG, PNG",
    uploader: uploadDocument,
    icon: FileText,
  },
  any: {
    accept: "image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    maxLabel: "Max 20 Mo",
    uploader: uploadDocument, // fallback — sera remplacé par la détection MIME
    icon: Upload,
  },
};

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(url);
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(url);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ── composant ─────────────────────────────────────────────────────────────────

export default function FileUploadField({
  value,
  onChange,
  mode = "image",
  label = "Fichier",
  disabled = false,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<CloudinaryUploadResult | null>(null);

  const cfg = MODE_CONFIG[mode];
  const Icon = cfg.icon;

  async function handlePick(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");

    // Pour le mode "any", choisit le bon uploader selon le type MIME
    let uploader = cfg.uploader;
    if (mode === "any") {
      if (file.type.startsWith("image/")) uploader = uploadImage;
      else if (file.type.startsWith("video/")) uploader = uploadVideo;
      else uploader = uploadDocument;
    }

    try {
      const result = await uploader(file);
      setLastResult(result);
      onChange(result.secure_url, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setError("");
    setLastResult(null);
    onChange(null);
  }

  // ── preview ─────────────────────────────────────────────────────────────────
  const renderPreview = () => {
    if (!value) return null;

    if (isImageUrl(value)) {
      return (
        <div className="ck-file-upload__preview ck-file-upload__preview--image">
          <img src={value} alt="Aperçu" />
        </div>
      );
    }

    if (isVideoUrl(value)) {
      return (
        <div className="ck-file-upload__preview ck-file-upload__preview--video">
          <video src={value} controls className="ck-file-upload__video" />
        </div>
      );
    }

    // Document / PDF
    return (
      <div className="ck-file-upload__preview ck-file-upload__preview--doc">
        <FileIcon size={32} strokeWidth={1.5} aria-hidden />
        <div className="ck-file-upload__doc-info">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="ck-file-upload__doc-link"
          >
            Voir le fichier
          </a>
          {lastResult ? (
            <span className="ck-file-upload__doc-size">{formatBytes(lastResult.size_bytes)}</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="ck-file-upload">
      {/* Label */}
      <span className="ck-file-upload__label">{label}</span>

      {/* Zone d'aperçu ou zone vide cliquable */}
      {value ? (
        renderPreview()
      ) : (
        <button
          type="button"
          className="ck-file-upload__dropzone"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          aria-label={`Choisir un fichier · ${label}`}
        >
          <Icon size={28} strokeWidth={1.5} aria-hidden />
          <span>{uploading ? "Envoi en cours…" : "Cliquez pour choisir un fichier"}</span>
          <span className="ck-file-upload__hint">{hint ?? cfg.maxLabel}</span>
        </button>
      )}

      {/* Barre de progression (uploading) */}
      {uploading ? (
        <div className="ck-file-upload__progress" role="status" aria-label="Upload en cours…">
          <span className="ck-file-upload__progress-bar" />
        </div>
      ) : null}

      {/* Actions */}
      <div className="ck-file-upload__actions">
        <input
          ref={inputRef}
          type="file"
          accept={cfg.accept}
          hidden
          disabled={disabled || uploading}
          onChange={(e) => void handlePick(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || uploading}
          startIcon={<Icon size={16} strokeWidth={2.5} />}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Envoi…" : value ? "Changer" : "Choisir"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="danger"
            disabled={disabled || uploading}
            startIcon={<Trash2 size={16} strokeWidth={2.5} />}
            onClick={handleRemove}
          >
            Supprimer
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="ck-file-upload__error" role="alert">
          {error}
        </p>
      ) : null}

      {/* Métadonnées après upload */}
      {lastResult && !error ? (
        <p className="ck-file-upload__meta">
          {formatBytes(lastResult.size_bytes)} · {lastResult.public_id}
        </p>
      ) : null}
    </div>
  );
}
