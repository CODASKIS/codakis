import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { resolveSearchQueryLabel, normalizeThemeCode } from "../../i18n/themeLabels";
import { filterDrivingSchools, MOCK_DRIVING_SCHOOLS } from "../../data/mockDrivingSchools";
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
  const query = searchParams.get("q") ?? "";
  const city = searchParams.get("ville") ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const results = useMemo(
    () => filterDrivingSchools(MOCK_DRIVING_SCHOOLS, query, city),
    [query, city],
  );

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
      : t("schools.heading");

  return (
    <>
      <PageMeta title={t("schools.metaTitle")} description={t("schools.metaDescription")} />
      <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />

      <section className="fj-section fj-tech-search">
        <Container>
          <div className="fj-tech-search__intro">
            <h1>{heading}</h1>
            <p>{t("schools.intro")}</p>
          </div>

          <div className="mb-8">
            <HeaderSearch defaultKeyword={query} defaultLocation={city} />
          </div>

          <div className="fj-tech-search-main">
            <div className="fj-tech-search-meta">
              <p>{t("schools.count", { count: results.length })}</p>
            </div>

            {results.length === 0 ? (
              <div className="fj-tech-empty fj-tech-empty--box">
                <p>{t("schools.empty")}</p>
                <Link to="/auto-ecoles" className="fj-btn fj-btn--outline">
                  {t("schools.seeAll")}
                </Link>
              </div>
            ) : (
              <>
                <div className="fj-job-list">
                  {paginatedResults.map((school, index) => (
                    <DrivingSchoolCard
                      key={school.id}
                      school={school}
                      isNew={(currentPage - 1) * PAGE_SIZE + index < 3}
                    />
                  ))}
                </div>

                <Pagination
                  page={currentPage}
                  pageSize={PAGE_SIZE}
                  total={results.length}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
