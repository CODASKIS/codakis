import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import { renderBlogBody } from "../../../lib/blog-content";
import { AuthApiError, fetchCandidatLecon, type PedagogyLecon } from "../../../lib/pedagogyApi";

export default function CandidatLessonPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const [lecon, setLecon] = useState<PedagogyLecon | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchCandidatLecon(id);
      setLecon(data);
      setBodyHtml(await renderBlogBody(data.body));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loader />;
  if (!lecon) return <Alert variant="danger">{error || t("candidat.pedagogy.leconNotFound")}</Alert>;

  return (
    <MainCard title={lecon.title} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <Link to="/espace/candidat/cours" className="btn btn-outline-secondary btn-sm mb-4">{t("candidat.pedagogy.backCourses")}</Link>
      {lecon.excerpt ? <p className="lead text-muted">{lecon.excerpt}</p> : null}
      {lecon.cover_image_url ? (
        <CmsCoverImage url={lecon.cover_image_url} alt={lecon.title} className="rounded mb-4 w-100" style={{ maxHeight: 320, objectFit: "cover" }} />
      ) : null}
      <div className="fj-prose fj-wysiwyg codakis-lesson-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <div className="mt-4">
        <Link to="/espace/candidat/examens" className="btn btn-primary btn-sm">{t("candidat.pedagogy.goExams")}</Link>
      </div>
    </MainCard>
  );
}
