import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ChevronLeft, Download, ExternalLink, FileText } from "lucide-react";
import Loader from "../../../components/common/Loader";
import SpeakButton from "../../../components/prefs/SpeakButton";
import {
  completeCandidatLecon,
  fetchCandidatCoursePath,
  fetchCandidatLecon,
  type PedagogyLecon,
} from "../../../lib/pedagogyApi";

type PdfDoc = { href: string; label: string };

function extractPdfs(html: string): { cleanedHtml: string; pdfs: PdfDoc[] } {
  if (!html.trim()) return { cleanedHtml: "", pdfs: [] };
  if (typeof DOMParser === "undefined") return { cleanedHtml: html, pdfs: [] };

  const doc = new DOMParser().parseFromString(html, "text/html");
  const pdfs: PdfDoc[] = [];

  doc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href")?.trim() ?? "";
    if (!href) return;
    const looksPdf = /\.pdf(\?|#|$)/i.test(href) || /\/pdf\//i.test(href) || href.toLowerCase().includes("application/pdf");
    if (!looksPdf) return;
    pdfs.push({ href, label: (anchor.textContent || "Document PDF").trim() });
    const block = anchor.closest("p, li, div");
    if (block && block.textContent?.replace(/\s+/g, " ").trim() === (anchor.textContent || "").trim()) {
      block.remove();
    } else {
      anchor.remove();
    }
  });

  doc.querySelectorAll("h2").forEach((heading) => {
    const text = (heading.textContent || "").toLowerCase();
    if (!text.includes("document") && !text.includes("télécharger") && !text.includes("pdf")) return;
    const next = heading.nextElementSibling;
    if (!next || !next.textContent?.trim()) heading.remove();
  });

  return { cleanedHtml: doc.body.innerHTML, pdfs };
}

export default function LessonPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [lecon, setLecon] = useState<PedagogyLecon | null>(null);
  const [nextStep, setNextStep] = useState<{ type: string; id: string } | null>(null);
  const [passedQuizIds, setPassedQuizIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const lesson = await fetchCandidatLecon(id);
        if (cancelled) return;
        setLecon(lesson);
        const path = await fetchCandidatCoursePath(lesson.theme_id);
        if (cancelled) return;
        const idx = path.steps.findIndex((s) => s.type === "lecon" && s.id === id);
        const next = idx >= 0 ? path.steps[idx + 1] : undefined;
        setNextStep(next ?? null);
        setPassedQuizIds(path.passed_quiz_ids ?? []);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Leçon introuvable";
        if (/abonnement/i.test(msg)) {
          navigate("/espace/candidat/super", { replace: true });
          return;
        }
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const { cleanedHtml, pdfs } = useMemo(
    () => extractPdfs(lecon?.body || lecon?.excerpt || ""),
    [lecon],
  );

  async function handleCompleteAndContinue() {
    if (!lecon) return;
    setSaving(true);
    try {
      await completeCandidatLecon(lecon.id);
      const next = nextStep;
      if (!next) {
        navigate("/espace/candidat");
        return;
      }
      if (next.type === "quiz") {
        if (passedQuizIds.includes(next.id)) {
          navigate("/espace/candidat");
          return;
        }
        navigate(`/espace/candidat/quiz/${next.id}`);
        return;
      }
      navigate(`/espace/candidat/lecon/${next.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de valider la leçon");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader variant="page" />;
  if (!lecon) {
    const needsSub = /abonnement/i.test(error);
    return (
      <div className="ck-lesson-blocked">
        <div className="ck-lesson-blocked__card">
          <div className="ck-lesson-blocked__badge" aria-hidden>
            <FileText size={28} />
          </div>
          <h1 className="ck-title">{needsSub ? "Cours premium" : "Leçon indisponible"}</h1>
          <p className="ck-subtitle">{error || "Leçon introuvable"}</p>
          {needsSub ? (
            <p className="ck-locked-modal__hint">
              Les premiers chapitres (signalisation, priorités, circulation) sont gratuits. Les modules premium
              nécessitent un abonnement CODAKIS.
            </p>
          ) : null}
          <div className="ck-locked-modal__actions">
            <Link to="/espace/candidat" className="ck-btn ck-btn--primary ck-btn--block">
              Retour au parcours
            </Link>
            {needsSub ? (
              <Link to="/espace/candidat/super" className="ck-btn ck-btn--ghost ck-btn--block">
                Découvrir Super
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ck-challenge ck-lesson-page">
      <article className="ck-challenge__body ck-lesson">
        <div className="ck-lesson__inner">
          <Link to="/espace/candidat" className="ck-back">
            <ChevronLeft size={18} /> Retour
          </Link>
          <div className="ck-lesson__title-row">
            <SpeakButton text={lecon.title} size="md" className="ck-speak-btn--inline" />
            <h1 className="ck-title">{lecon.title}</h1>
          </div>
          <p className="ck-subtitle">
            Module {lecon.theme_code} · Leçon {lecon.sort_order}
          </p>
          {lecon.cover_image_url ? <img src={lecon.cover_image_url} alt="" className="ck-lesson__cover" /> : null}
          {cleanedHtml ? (
            <div className="ck-lesson__body" dangerouslySetInnerHTML={{ __html: cleanedHtml }} />
          ) : null}
          {pdfs.map((pdf) => (
            <section key={pdf.href} className="ck-lesson__pdf">
              <div className="ck-lesson__pdf-head">
                <FileText size={22} aria-hidden />
                <div className="ck-lesson__pdf-meta">
                  <strong>{pdf.label}</strong>
                  <span>Document PDF — ouvrez-le dans un nouvel onglet ou téléchargez-le.</span>
                </div>
              </div>
              <div className="ck-lesson__pdf-actions">
                <a href={pdf.href} target="_blank" rel="noopener noreferrer" className="ck-btn ck-btn--primary">
                  <ExternalLink size={16} aria-hidden />
                  Ouvrir
                </a>
                <a href={pdf.href} download className="ck-btn ck-btn--ghost" target="_blank" rel="noopener noreferrer">
                  <Download size={16} aria-hidden />
                  Télécharger
                </a>
              </div>
            </section>
          ))}
          {error ? <p className="ck-empty">{error}</p> : null}
        </div>
      </article>

      <footer className="ck-challenge__footer is-ready">
        <div className="ck-challenge__footer-inner">
          <div>
            <strong style={{ fontSize: "1.6rem" }}>
              {nextStep?.type === "quiz"
                ? "Prêt pour le test ?"
                : nextStep?.type === "lecon"
                  ? "Leçon suivante"
                  : "Fin de ce chapitre"}
            </strong>
            <p className="ck-subtitle" style={{ margin: "0.4rem 0 0" }}>
              {nextStep?.type === "quiz"
                ? "Validez cette leçon puis lancez le quiz du thème."
                : nextStep?.type === "lecon"
                  ? "Validez pour enchaîner sur la prochaine leçon du parcours."
                  : "Marquez la leçon comme lue pour débloquer la suite."}
            </p>
          </div>
          <button type="button" className="ck-btn ck-btn--primary" disabled={saving} onClick={() => void handleCompleteAndContinue()}>
            {saving
              ? "Validation…"
              : nextStep?.type === "quiz"
                ? "Commencer le quiz"
                : nextStep?.type === "lecon"
                  ? "Leçon suivante"
                  : "Terminer"}
          </button>
        </div>
      </footer>
    </div>
  );
}
