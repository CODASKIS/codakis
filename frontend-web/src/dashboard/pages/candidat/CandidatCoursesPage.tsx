import { ChevronRight, Crown, GraduationCap, Layers3, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Badge, Col, Row } from "react-bootstrap";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import PlatformAccessPanel from "../../components/PlatformAccessPanel";
import { fadeUpVariants, staggerContainer } from "../../../components/motion/motionPresets";
import { isPremiumUser } from "../../../auth/authStore";
import {
  AuthApiError,
  fetchCandidatThemes,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";

export default function CandidatCoursesPage() {
  const { t, i18n } = useTranslation();
  const isPremium = isPremiumUser();
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const themesData = await fetchCandidatThemes();
      setThemes(themesData);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const themeTitle = (theme: PedagogyTheme) => (i18n.language.startsWith("en") ? theme.title_en : theme.title_fr);

  if (loading) return <Loader />;

  return (
    <Row>
      <Col lg={12}>
        <MainCard
          title={t("dashboard.nav.courses")}
          isOption={false}
          cardClass="codakis-courses"
          optionClass=""
          CardBodyClass=""
        >
          <PlatformAccessPanel showBanner={!isPremium} />

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

          <section className="codakis-courses__hero">
            <div className="codakis-courses__hero-icon" aria-hidden>
              <GraduationCap size={30} strokeWidth={1.8} />
            </div>
            <div className="codakis-courses__hero-copy">
              <span className="codakis-courses__eyebrow">{t("candidat.pedagogy.learningPath")}</span>
              <h2>{t("candidat.pedagogy.coursesTitle")}</h2>
              <p>{t("candidat.pedagogy.coursesLead")}</p>
            </div>
            <div className="codakis-courses__stats" aria-label={t("candidat.pedagogy.pathSummary")}>
              <div>
                <Layers3 size={20} aria-hidden />
                <strong>{themes.length}</strong>
                <span>{t("candidat.pedagogy.modules")}</span>
              </div>
            </div>
          </section>

          <div className="codakis-courses__section-heading">
            <div>
              <span>{t("candidat.pedagogy.curriculum")}</span>
              <h3>{t("candidat.pedagogy.allThemes")}</h3>
            </div>
            <p>{t("candidat.pedagogy.openModuleHint")}</p>
          </div>

          <motion.div
            className="codakis-courses__module-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {themes.map((theme, index) => (
              <motion.div key={theme.id} variants={fadeUpVariants}>
                <Link
                  to={`/espace/candidat/cours/module/${theme.id}`}
                  className={`codakis-courses__module-card${theme.locked ? " is-locked" : ""}`}
                >
                  <span className="codakis-courses__module-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="codakis-courses__module-title">
                    <small>{t("candidat.pedagogy.themeLabel", { number: index + 1 })}</small>
                    <strong>{themeTitle(theme)}</strong>
                  </span>
                  <span className="codakis-courses__module-meta">
                    {theme.is_premium ? (
                      <Badge className="codakis-courses__premium">
                        {theme.locked ? <Lock size={12} aria-hidden /> : <Crown size={13} aria-hidden />}
                        {t("candidat.pedagogy.premium")}
                      </Badge>
                    ) : null}
                    <span>
                      {t("candidat.pedagogy.lessonCount", {
                        count: theme.lecon_count ?? 0,
                      })}
                    </span>
                  </span>
                  <span className="codakis-courses__module-go">
                    {t("candidat.pedagogy.openModule")}
                    <ChevronRight size={18} aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </MainCard>
      </Col>
    </Row>
  );
}
