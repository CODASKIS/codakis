import { Car, Clock, MapPin, Phone, TriangleAlert } from "lucide-react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import {
  buildSchoolMapEmbedUrl,
  MOCK_DRIVING_SCHOOLS,
} from "../../data/mockDrivingSchools";
import Container from "../components/Container";
import DrivingSchoolLogo from "../components/DrivingSchoolLogo";
import DrivingSchoolMeta from "../components/DrivingSchoolMeta";
import PageBreadcrumb from "../components/PageBreadcrumb";
import SchoolForfaitPacks from "../components/SchoolForfaitPacks";
import SubNav from "../components/SubNav";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export default function DrivingSchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const subNavItems = useSecondaryNavItems();
  const lang = i18n.language.startsWith("en") ? "en" : "fr";
  const school = MOCK_DRIVING_SCHOOLS.find((item) => item.id === id);

  if (!school) {
    return (
      <>
        <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />
        <Container>
          <p className="fj-tech-empty">{t("schools.empty")}</p>
          <Link to="/auto-ecoles" className="fj-btn fj-btn--outline">
            {t("schools.seeAll")}
          </Link>
        </Container>
      </>
    );
  }

  const contactHref = `/contact?school=${encodeURIComponent(school.name)}`;
  const schoolTitle = school.name.toUpperCase();

  return (
    <>
      <PageMeta title={`${school.name} | CODAKIS`} description={school.description[lang]} />
      <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />

      <Container>
        <PageBreadcrumb
          items={[
            { label: t("schoolDetail.breadcrumbHome"), to: "/" },
            { label: t("nav.drivingSchools"), to: "/auto-ecoles" },
            { label: school.name },
          ]}
        />
      </Container>

      <div className="fj-school-page">
        <Container>
          <div className="fj-school-map-block">
            <div className="fj-school-map-block__map-wrap">
              <iframe
                title={t("schoolDetail.mapTitle", { name: school.name })}
                className="fj-school-map-block__map"
                src={buildSchoolMapEmbedUrl(school.latitude, school.longitude)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <aside className="fj-school-map-block__panel">
              <div className="fj-school-map-block__title-row">
                <DrivingSchoolLogo school={school} size="lg" />
                <h1 className="fj-school-map-block__title">{schoolTitle}</h1>
              </div>

              <DrivingSchoolMeta school={school} showPrice showExcerpt showCertifiedSince />

              <div className="fj-school-map-block__section">
                <h2 className="fj-school-map-block__label">
                  <MapPin size={16} aria-hidden />
                  {t("schoolDetail.address")}
                </h2>
                <p>{school.address}</p>
              </div>

              <div className="fj-school-map-block__section">
                <h2 className="fj-school-map-block__label">
                  <Clock size={16} aria-hidden />
                  {t("schoolDetail.hours")}
                </h2>
                <table className="fj-school-map-block__hours">
                  <tbody>
                    {DAY_KEYS.map((day) => (
                      <tr key={day}>
                        <th scope="row">{t(`schoolDetail.days.${day}`)}</th>
                        <td>
                          {school.hours[day] === "closed"
                            ? t("schoolDetail.closed")
                            : school.hours[day]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="fj-school-map-block__section">
                <h2 className="fj-school-map-block__label">
                  <Phone size={16} aria-hidden />
                  {t("schoolDetail.contact")}
                </h2>
                <a href={`tel:${school.phone.replace(/\s/g, "")}`} className="fj-school-map-block__phone">
                  {school.phone}
                </a>
              </div>

              <Link to={contactHref} className="fj-btn fj-btn--primary fj-school-map-block__cta">
                {t("schoolDetail.contactCta")}
              </Link>
            </aside>
          </div>

          <SchoolForfaitPacks
            school={school}
            title={t("schoolDetail.formationsTitle", { name: schoolTitle })}
            subtitle={t("packs.subtitleSchool")}
            className="fj-school-packs"
          />
        </Container>

        <section className="fj-school-quick">
          <Container>
            <div className="fj-school-quick__box">
              <article className="fj-school-quick__row">
                <TriangleAlert className="fj-school-quick__icon fj-school-quick__icon--code" aria-hidden />
                <div>
                  <h2>{t("schoolDetail.reviseCodeTitle")}</h2>
                  <p>{t("schoolDetail.reviseCodeText")}</p>
                </div>
              </article>
              <article className="fj-school-quick__row">
                <Car className="fj-school-quick__icon fj-school-quick__icon--drive" aria-hidden />
                <div>
                  <h2>{t("schoolDetail.bookLessonTitle")}</h2>
                  <p>{t("schoolDetail.bookLessonText")}</p>
                </div>
              </article>
            </div>
          </Container>
        </section>

        <section className="fj-school-about">
          <Container>
            <h2 className="fj-school-about__title">{schoolTitle}</h2>
            <p className="fj-school-about__intro">{school.longDescription[lang]}</p>

            <div className="fj-school-about__access">
              <div className="fj-school-about__access-visual" aria-hidden />
              <div>
                <h3>{t("schoolDetail.accessTitle")}</h3>
                <p>{school.accessInfo[lang]}</p>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
