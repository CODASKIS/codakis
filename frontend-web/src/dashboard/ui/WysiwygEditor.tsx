import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
};

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  ["blockquote", "code-block"],
  ["link", "image", "video"],
  [{ align: [] }],
  ["clean"],
] as const;

function normalizeHtml(html: string) {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<p><br></p>" || trimmed === "<p></p>") return "";
  return html;
}

/** Éditeur WYSIWYG (Quill) — HTML en entrée/sortie pour leçons & blog. */
export default function WysiwygEditor({
  value,
  onChange,
  label = "Contenu",
  placeholder = "Rédigez et mettez en forme…",
  minHeight = 280,
  disabled = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const lastHtmlRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || quillRef.current) return;

    const editorEl = document.createElement("div");
    host.appendChild(editorEl);

    const quill = new Quill(editorEl, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: TOOLBAR,
      },
    });

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
      lastHtmlRef.current = value;
    }

    quill.on("text-change", () => {
      const html = normalizeHtml(quill.root.innerHTML);
      lastHtmlRef.current = html;
      onChangeRef.current(html);
    });

    quillRef.current = quill;

    return () => {
      quill.off("text-change");
      quillRef.current = null;
      host.innerHTML = "";
    };
    // Mount once; external value sync handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    quill.enable(!disabled);
  }, [disabled]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    if (value === lastHtmlRef.current) return;
    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(value || "");
    lastHtmlRef.current = value;
    if (selection) {
      const len = quill.getLength();
      quill.setSelection(Math.min(selection.index, Math.max(0, len - 1)));
    }
  }, [value]);

  return (
    <div className={`ta-wysiwyg${disabled ? " is-disabled" : ""}`}>
      {label ? <span className="ta-wysiwyg__label">{label}</span> : null}
      <div
        ref={hostRef}
        className="ta-wysiwyg__surface"
        style={{ ["--ta-wysiwyg-min" as string]: `${minHeight}px` }}
      />
      <p className="ta-wysiwyg__hint">Gras, listes, liens, images et vidéos — aperçu style du site.</p>
    </div>
  );
}
