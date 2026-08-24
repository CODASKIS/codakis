import { Download, FileText } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type CoursePdfDownloadsProps = {
  html: string;
};

function extractPdfLinks(html: string): { href: string; label: string }[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const links: { href: string; label: string }[] = [];
  doc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") ?? "";
    if (!/\.pdf(\?|#|$)/i.test(href)) return;
    const label = anchor.textContent?.trim() || href.split("/").pop() || "Document PDF";
    links.push({ href, label });
  });
  return links;
}

export default function CoursePdfDownloads({ html }: CoursePdfDownloadsProps) {
  const { t } = useTranslation();
  const pdfs = useMemo(() => extractPdfLinks(html), [html]);

  if (pdfs.length === 0) return null;

  return (
    <section className="codakis-player-pdfs" aria-labelledby="codakis-player-pdfs-title">
      <h3 id="codakis-player-pdfs-title">{t("coursePlayer.pdfTitle")}</h3>
      <ul>
        {pdfs.map((item) => (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="codakis-player-pdf-card">
              <span className="codakis-player-pdf-card__icon" aria-hidden>
                <FileText size={22} />
              </span>
              <span className="codakis-player-pdf-card__copy">
                <strong>{item.label}</strong>
                <small>PDF</small>
              </span>
              <Download size={18} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
