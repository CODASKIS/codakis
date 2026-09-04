import { useEffect, useState } from "react";
import { Clock, MapPin, Phone } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { buildSchoolMapEmbedUrl } from "../../data/mockDrivingSchools";
import { fetchPublicSchool, mapPublicSchoolToDrivingSchool } from "../../lib/publicSchoolsApi";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import Container from "../components/Container";
import DrivingSchoolLogo from "../components/DrivingSchoolLogo";
import PageBreadcrumb from "../components/PageBreadcrumb";
import PublicPageHeader from "../components/PublicPageHeader";
import SchoolForfaitPacks from "../components/SchoolForfaitPacks";
import SubNav from "../components/SubNav";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export default function DrivingSchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const buyForfaitId = searchParams.get("buy");
  const { t, i18n } = useTranslation();
  const subNavItems = useSecondaryNavItems();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const [school, setSchool] = useState<DrivingSchool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void fetchPublicSchool(id)
      .then((detail) => setSchool(mapPublicSchoolToDrivingSchool(detail, detail.forfaits)))
      .catch(() => setSchool(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />
        <Container>
          <p className="ck-page-lead">{t("common.loading")}</p>
        </Container>
      </>
    );
  }

  if (!school) {
    return (
      <>
        <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />
        <Container>
          <p className="ck-page-lead">{t("schools.empty")}</p>
          <Link to="/auto-ecoles" className="ck-public-btn ck-public-btn--ghost">
            {t("schools.seeAll")}
          </Link>
        </Container>
      </>
    );
  }

  const contactHref = `/contact?school=${encodeURIComponent(school.name)}`;
  const location = `${school.city}${school.district ? `, ${school.district}` : ""}`;

  return (
    <>
      <PageMeta title={`${school.name} | CODAKIS`} description={school.description[lang]} />
      <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />

      <div className="ck-page">
        <PageBreadcrumb
          items={[
            { label: t("schoolDetail.breadcrumbHome"), to: "/" },
            { label: t("nav.drivingSchools"), to: "/auto-ecoles" },
            { label: school.name },
          ]}
        />

        <section className="ck-school-profile">
          <div className="ck-school-profile__main">
            <DrivingSchoolLogo school={school} size="lg" />
            <div>
              <h1 className="ck-page-title" style={{ fontSize: "clamp(2.2rem, 3vw, 3rem)" }}>
                {school.name}
              </h1>
              <span className="ck-school-profile__badge">{t("schools.certified")}</span>
              <p className="ck-page-lead" style={{ marginTop: "0.4rem" }}>
                {location} · {t("schools.ratingAria", { rating: school.rating })}
              </p>
              <p className="ck-page-lead">{school.description[lang]}</p>
            </div>
          </div>
          <div className="ck-school-profile__actions">
            <Link to={contactHref} className="ck-public-btn ck-public-btn--primary">
              {t("schoolDetail.contactCta")}
            </Link>
            <a href={`tel:${school.phone.replace(/\s/g, "")}`} className="ck-public-btn ck-public-btn--ghost">
              {school.phone}
            </a>
          </div>
        </section>

        <PublicPageHeader
          title={t("schoolDetail.formationsTitle", { name: school.name })}
          lead={t("packs.subtitleSchool")}
        />
        <SchoolForfaitPacks school={school} className="fj-school-packs" initialBuyForfaitId={buyForfaitId} />

        <div className="ck-school-info">
          <div className="ck-school-info__item">
            <h3>
              <MapPin size={18} aria-hidden /> {t("schoolDetail.address")}
            </h3>
            <p>{school.address}</p>
          </div>
          <div className="ck-school-info__item">
            <h3>
              <Phone size={18} aria-hidden /> {t("schoolDetail.contact")}
            </h3>
            <a href={`tel:${school.phone.replace(/\s/g, "")}`}>{school.phone}</a>
          </div>
          <div className="ck-school-info__item">
            <h3>
              <Clock size={18} aria-hidden /> {t("schoolDetail.hours")}
            </h3>
            <p>
              {DAY_KEYS.slice(0, 3)
                .map((day) => `${t(`schoolDetail.days.${day}`)}: ${school.hours[day] === "closed" ? t("schoolDetail.closed") : school.hours[day]}`)
                .join(" · ")}
            </p>
          </div>
        </div>

        <section className="ck-page-section">
          <div className="ck-page-section__head">
            <h2>{school.name}</h2>
            <p>{school.longDescription[lang]}</p>
          </div>
          <p className="ck-page-lead">
            <strong>{t("schoolDetail.accessTitle")} — </strong>
            {school.accessInfo[lang]}
          </p>
        </section>

        <section className="ck-school-map" aria-label={t("schoolDetail.mapTitle", { name: school.name })}>
          <iframe
            title={t("schoolDetail.mapTitle", { name: school.name })}
            src={buildSchoolMapEmbedUrl(school.latitude, school.longitude)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </div>
    </>
  );
}
