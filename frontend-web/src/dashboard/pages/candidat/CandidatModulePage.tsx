import { ChevronRight, Crown, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Col, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import ModuleSegmentNav from "../../components/common/ModuleSegmentNav";
import PlatformAccessPanel from "../../components/PlatformAccessPanel";
import { fadeUpVariants, staggerContainer } from "../../../components/motion/motionPresets";
import { isPremiumUser } from "../../../auth/authStore";
import {
  AuthApiError,
  fetchCandidatCoursePath,
  fetchCandidatLecons,
  fetchCandidatThemes,
  type PedagogyLecon,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

const UPGRADE_HREF = "/tarifs";

export default function CandidatModulePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { themeId = "" } = useParams<{ themeId: string }>();
  const isPremium = isPremiumUser();
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [lecons, setLecons] = useState<PedagogyLecon[]>([]);
  const [firstStepRef, setFirstStepRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!themeId) return;
    setLoading(true);
    setError("");
    try {
      const themesPromise = themes.length > 0 ? Promise.resolve(themes) : fetchCandidatThemes();
      const [themesData, leconsData, path] = await Promise.all([
        themesPromise,
        fetchCandidatLecons(themeId),
        fetchCandidatCoursePath(themeId).catch(() => null),
      ]);
      if (themes.length === 0) {
        setThemes(themesData);
      }
      setLecons(leconsData);
      setFirstStepRef(path?.steps[0]?.ref ?? leconsData[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [themeId, t, themes]);

  useEffect(() => {
    void load();
  }, [load]);

  const themeTitle = (theme: PedagogyTheme) =>
    i18n.language.startsWith("en") ? theme.title_en : theme.title_fr;

  const activeTheme = useMemo(() => themes.find((item) => item.id === themeId) ?? null, [themes, themeId]);

  const segments = useMemo(
    () =>
      themes.map((theme, index) => ({
        id: theme.id,
        label: `${String(index + 1).padStart(2, "0")}. ${themeTitle(theme)}`,
        meta: theme.locked ? t("candidat.pedagogy.premium") : undefined,
      })),
    [themes, i18n.language, t],
  );

  if (loading) return <Loader />;

  if (!activeTheme) {
    return <div className="alert alert-danger">{error || t("candidat.pedagogy.themeNotFound")}</div>;
  }

  const locked = Boolean(activeTheme.locked);
  const playHref = firstStepRef ? `/espace/candidat/cours/module/${themeId}/etape/${firstStepRef}` : null;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("dashboard.nav.courses")} isOption={false} cardClass="codakis-courses" optionClass="" CardBodyClass="">
          <PlatformAccessPanel showBanner={!isPremium} />

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

          <ModuleSegmentNav
            segments={segments}
            activeId={themeId}
            onSelect={(id) => navigate(`/espace/candidat/cours/module/${id}`)}
            ariaLabel={t("candidat.pedagogy.modules")}
            className="codakis-courses__module-nav"
          />

          <motion.div
            key={themeId}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="codakis-courses__module-panel"
          >
            <header className="codakis-courses__module-header">
              <div>
                <span className="codakis-courses__eyebrow">{t("candidat.pedagogy.themeLabel", { number: themes.findIndex((item) => item.id === themeId) + 1 })}</span>
                <h2>{themeTitle(activeTheme)}</h2>
                <p>{t("candidat.pedagogy.moduleLead")}</p>
              </div>
              <div className="codakis-courses__module-actions">
                {activeTheme.is_premium ? (
                  <Badge className="codakis-courses__premium">
                    {locked ? <Lock size={12} aria-hidden /> : <Crown size={13} aria-hidden />}
                    {t("candidat.pedagogy.premium")}
                  </Badge>
                ) : null}
                {!locked && playHref ? (
                  <Link to={playHref} className="btn btn-primary">
                    {t("candidat.pedagogy.startModule")}
                  </Link>
                ) : null}
              </div>
            </header>

            {locked ? (
              <div className="codakis-courses__paywall">
                <Lock size={20} aria-hidden />
                <div>
                  <strong>{t("candidat.pedagogy.lockedTitle")}</strong>
                  <p>{t("candidat.pedagogy.lockedLead")}</p>
                </div>
                <Link to={UPGRADE_HREF} className="btn btn-primary btn-sm">
                  {t("dashboard.userMenu.upgradeCta")}
                </Link>
              </div>
            ) : (
              <motion.ol
                className="codakis-courses__lesson-list"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {lecons.map((lecon, lessonIndex) => (
                  <motion.li key={lecon.id} variants={fadeUpVariants}>
                    <Link to={`/espace/candidat/cours/module/${themeId}/etape/${lecon.id}`} className="codakis-courses__lesson">
                      <span className="codakis-courses__lesson-step" aria-hidden>
                        {lessonIndex + 1}
                      </span>
                      <span className="codakis-courses__lesson-copy">
                        <strong>{lecon.title}</strong>
                        {lecon.excerpt ? <span>{lecon.excerpt}</span> : null}
                      </span>
                      <span className="codakis-courses__lesson-action">
                        {t("candidat.pedagogy.readLesson")}
                        <ChevronRight size={18} aria-hidden />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ol>
            )}
          </motion.div>

          <Link to="/espace/candidat/cours" className="codakis-courses__back-link">
            {t("candidat.pedagogy.backCourses")}
          </Link>
        </MainCard>
      </Col>
    </Row>
  );
}
