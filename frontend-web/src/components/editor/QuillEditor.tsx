import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./quill-editor.scss";

type QuillEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

function isEmptyHtml(html: string): boolean {
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
}

export default function QuillEditor({ value, onChange, placeholder, minHeight = 280 }: QuillEditorProps) {
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
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "link"],
          [{ align: [] }],
          ["clean"],
        ],
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
  }, [placeholder]);

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
