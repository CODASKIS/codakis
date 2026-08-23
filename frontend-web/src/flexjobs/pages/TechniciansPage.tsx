import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { resolveSearchQueryLabel, normalizeThemeCode } from "../../i18n/themeLabels";
import { MOCK_DRIVING_SCHOOLS } from "../../data/mockDrivingSchools";
import {
  fetchPublicSchools,
  filterPublicSchools,
  mapPublicSchoolToDrivingSchool,
} from "../../lib/publicSchoolsApi";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import Container from "../components/Container";
import DrivingSchoolCard from "../components/DrivingSchoolCard";
import HeaderSearch from "../components/HeaderSearch";
import Pagination from "../components/Pagination";
import SubNav from "../components/SubNav";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";

const PAGE_SIZE = 10;

export default function TechniciansPage() {
  const { t } = useTranslation();
  const subNavItems = useSecondaryNavItems();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schools, setSchools] = useState<DrivingSchool[]>(MOCK_DRIVING_SCHOOLS);
  const query = searchParams.get("q") ?? "";
  const city = searchParams.get("ville") ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  useEffect(() => {
    void fetchPublicSchools()
      .then((items) => {
        if (items.length > 0) {
          setSchools(items.map((item) => mapPublicSchoolToDrivingSchool(item)));
        }
      })
      .catch(() => {
        setSchools(MOCK_DRIVING_SCHOOLS);
      });
  }, []);

  const results = useMemo(() => {
    if (schools === MOCK_DRIVING_SCHOOLS) {
      const q = query.trim().toLowerCase();
      const c = city.trim().toLowerCase();
      return schools.filter((item) => {
        if (c && !item.city.toLowerCase().includes(c)) return false;
        if (!q) return true;
        return `${item.name} ${item.city} ${item.address}`.toLowerCase().includes(q);
      });
    }
    const apiItems = schools.map((s) => ({
      id: s.id,
      name: s.name,
      city: s.city,
      district: s.district,
      address: s.address,
      phone: s.phone,
      logo_url: s.logoUrl ?? null,
      description: s.description.fr,
      long_description: s.longDescription.fr,
      access_info: s.accessInfo.fr,
      site_web: null,
      latitude: s.latitude,
      longitude: s.longitude,
      country_code: "CM",
      price_from: s.priceFrom,
      certified_since: s.certifiedSince,
      hours: s.hours,
    }));
    return filterPublicSchools(apiItems, query, city).map((item) => mapPublicSchoolToDrivingSchool(item));
  }, [schools, query, city]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) {
      const nextParams = new URLSearchParams(searchParams);
      if (currentPage <= 1) nextParams.delete("page");
      else nextParams.set("page", String(currentPage));
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentPage, page, searchParams, setSearchParams]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [currentPage, results]);

  const handlePageChange = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage <= 1) nextParams.delete("page");
    else nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const themeCode = normalizeThemeCode(query);
  const displayQuery = resolveSearchQueryLabel(query, t);

  const heading = city.trim()
    ? t("schools.headingCity", { city: city.trim() })
    : query.trim()
      ? themeCode
        ? t("schools.headingTheme", { theme: displayQuery })
        : t("schools.headingQuery", { query: displayQuery })
      : t("schools.headingAll");

  return (
    <>
      <PageMeta title={t("schools.metaTitle")} description={t("schools.metaDescription")} />
      <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />
      <HeaderSearch defaultKeyword={query} defaultLocation={city} />

      <Container>
        <h1 className="fj-page-title">{heading}</h1>
        <p className="fj-page-lead">{t("schools.lead")}</p>

        {paginatedResults.length === 0 ? (
          <p className="fj-tech-empty">{t("schools.empty")}</p>
        ) : (
          <div className="fj-job-list">
            {paginatedResults.map((school) => (
              <DrivingSchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}

        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={results.length} onPageChange={handlePageChange} />

        <p className="mt-4">
          <Link to="/" className="fj-link-muted">{t("schools.backHome")}</Link>
        </p>
      </Container>
    </>
  );
}
