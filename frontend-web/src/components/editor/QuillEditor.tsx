import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./quill-editor.scss";
import { uploadCmsImage } from "../../lib/cms-admin-api";
import { resolveCmsMediaUrl } from "../../lib/cms-api";
import { toVideoEmbedUrl } from "../../lib/video-embed";

type QuillEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  videoPrompt?: string;
};

function isEmptyHtml(html: string): boolean {
  if (/<(img|iframe|video|table)\b/i.test(html)) return false;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder,
  minHeight = 280,
  videoPrompt = "Lien de la vidéo (YouTube, Vimeo ou fichier MP4)",
}: QuillEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const lastHtmlRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.replaceChildren();
    const mount = document.createElement("div");
    wrapper.appendChild(mount);

    const quill = new Quill(mount, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
            [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
          ],
          handlers: {
            image() {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = () => {
                const file = input.files?.[0];
                if (!file) return;
                const range = quill.getSelection(true);
                // Placeholder pendant l'upload pour que l'auteur voie la progression.
                quill.insertText(range.index, "…", "user");
                void uploadCmsImage(file)
                  .then((result) => {
                    quill.deleteText(range.index, 1, "user");
                    quill.insertEmbed(range.index, "image", resolveCmsMediaUrl(result.key), "user");
                    quill.setSelection(range.index + 1, 0, "user");
                  })
                  .catch(() => {
                    quill.deleteText(range.index, 1, "user");
                  });
              };
              input.click();
            },
            video() {
              const input = window.prompt(videoPrompt, "https://");
              const url = input?.trim();
              if (!url || url === "https://") return;
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "video", toVideoEmbedUrl(url) ?? url, "user");
              quill.setSelection(range.index + 1, 0, "user");
            },
          },
        },
      },
    });

    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
      lastHtmlRef.current = quill.root.innerHTML;
    }

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      if (html === lastHtmlRef.current) return;
      lastHtmlRef.current = html;
      onChangeRef.current(isEmptyHtml(html) ? "" : html);
    });

    quillRef.current = quill;

    return () => {
      quillRef.current = null;
      wrapper.replaceChildren();
    };
  }, [placeholder, videoPrompt]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const current = quill.root.innerHTML;
    if (value !== current && value !== lastHtmlRef.current) {
      quill.clipboard.dangerouslyPasteHTML(value || "");
      lastHtmlRef.current = quill.root.innerHTML;
    }
  }, [value]);

  return <div ref={wrapperRef} className="codakis-quill-editor" style={{ minHeight }} />;
}
