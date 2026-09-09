import { useEffect } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

const BRAND = "CODAKIS";

/** Titre d’onglet propre : « Accueil CODAKIS » (sans | — ·). */
export function formatDocumentTitle(raw: string | null | undefined): string {
  let label = (raw ?? "").trim();
  if (!label) return BRAND;

  label = label.replace(/\bCODAKIS\b/gi, " ");
  label = label.replace(/\s*[|·•]+\s*/g, " ");
  label = label.replace(/\s*[—–−]+\s*/g, " ");
  label = label.replace(/\s+/g, " ").trim();

  if (!label) return BRAND;
  if (label.toUpperCase() === BRAND) return BRAND;
  return `${label} ${BRAND}`;
}

export function setDocumentTitle(raw: string | null | undefined): void {
  document.title = formatDocumentTitle(raw);
}

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{formatDocumentTitle(title)}</title>
    {description ? <meta name="description" content={description} /> : null}
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

/** Synchronise document.title pour les shells sans PageMeta. */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    setDocumentTitle(title);
  }, [title]);
}

export default PageMeta;
