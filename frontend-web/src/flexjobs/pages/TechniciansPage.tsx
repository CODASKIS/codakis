import { Grid3X3, LayoutList, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/common/Loader";
import { AUTH_PATHS } from "../../constants/authPaths";
import { resolveSearchQueryLabel, normalizeThemeCode } from "../../i18n/themeLabels";
import {
  fetchPublicSchools,
  mapPublicSchoolToDrivingSchool,
} from "../../lib/publicSchoolsApi";
import type { DrivingSchool } from "../../data/mockDrivingSchools";
import Container from "../components/Container";
import DrivingSchoolCard from "../components/DrivingSchoolCard";
import DrivingSchoolSearchFilters, {
  type SchoolSearchFilters,
} from "../components/DrivingSchoolSearchFilters";
import Pagination from "../components/Pagination";
import SubNav from "../components/SubNav";
import { useSecondaryNavItems } from "../hooks/useSecondaryNavItems";

const PAGE_SIZE_GRID = 6;
const PAGE_SIZE_LIST = 10;

type ViewMode = "list" | "grid";
type SortKey = "name" | "price_asc" | "price_desc" | "newest";

function parseFilters(params: URLSearchParams): SchoolSearchFilters {
  return {
    q: params.get("q") ?? "",
    ville: params.get("ville") ?? "",
    pays: params.get("pays") ?? "",
    priceMin: params.get("price_min") ?? "",
    priceMax: params.get("price_max") ?? "",
    sort: params.get("sort") ?? "name",
  };
}

function filtersToParams(filters: SchoolSearchFilters, page: number, view: ViewMode): URLSearchParams {
  const next = new URLSearchParams();
  if (filters.q.trim()) next.set("q", filters.q.trim());
  if (filters.ville.trim()) next.set("ville", filters.ville.trim());
  if (filters.pays.trim()) next.set("pays", filters.pays.trim());
  if (filters.priceMin.trim()) next.set("price_min", filters.priceMin.trim());
  if (filters.priceMax.trim()) next.set("price_max", filters.priceMax.trim());
  if (filters.sort && filters.sort !== "name") next.set("sort", filters.sort);
  if (page > 1) next.set("page", String(page));
  if (view === "grid") next.set("view", "grid");
  return next;
}

export default function TechniciansPage() {
  const { t } = useTranslation();
  const subNavItems = useSecondaryNavItems();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const appliedFilters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [draftFilters, setDraftFilters] = useState<SchoolSearchFilters>(appliedFilters);

  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const viewMode: ViewMode = searchParams.get("view") === "grid" ? "grid" : "list";
  const sort = (appliedFilters.sort || "name") as SortKey;
  const pageSize = viewMode === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;

  useEffect(() => {
    setDraftFilters(appliedFilters);
  }, [appliedFilters]);

  const loadSchools = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const priceMin = appliedFilters.priceMin.trim() ? Number.parseInt(appliedFilters.priceMin, 10) : undefined;
      const priceMax = appliedFilters.priceMax.trim() ? Number.parseInt(appliedFilters.priceMax, 10) : undefined;
      const items = await fetchPublicSchools({
        q: appliedFilters.q.trim() || undefined,
        ville: appliedFilters.ville.trim() || undefined,
        pays: appliedFilters.pays.trim() || undefined,
        price_min: Number.isFinite(priceMin) ? priceMin : undefined,
        price_max: Number.isFinite(priceMax) ? priceMax : undefined,
        sort: appliedFilters.sort || undefined,
      });
      setSchools(items.map((item) => mapPublicSchoolToDrivingSchool(item)));
    } catch {
      setSchools([]);
      setLoadError(t("schools.error"));
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, t]);

  useEffect(() => {
    void fetchPublicSchools()
      .then((items) => {
        const cities = [...new Set(items.map((item) => item.city).filter(Boolean))].sort((a, b) =>
          a.localeCompare(b, "fr"),
        );
        setAllCities(cities);
      })
      .catch(() => setAllCities([]));
  }, []);

  useEffect(() => {
    void loadSchools();
  }, [loadSchools]);

  const totalPages = Math.max(1, Math.ceil(schools.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== currentPage) {
      const nextParams = filtersToParams(appliedFilters, currentPage, viewMode);
      setSearchParams(nextParams, { replace: true });
    }
  }, [appliedFilters, currentPage, page, setSearchParams, viewMode]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return schools.slice(start, start + pageSize);
  }, [currentPage, pageSize, schools]);

  const handlePageChange = (nextPage: number) => {
    setSearchParams(filtersToParams(appliedFilters, nextPage, viewMode));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFilters = () => {
    setSearchParams(filtersToParams(draftFilters, 1, viewMode));
  };

  const handleClearFilters = () => {
    const empty: SchoolSearchFilters = {
      q: "",
      ville: "",
      pays: "",
      priceMin: "",
      priceMax: "",
      sort: "name",
    };
    setDraftFilters(empty);
    setSearchParams(filtersToParams(empty, 1, viewMode));
  };

  const handleSortChange = (nextSort: SortKey) => {
    const next = { ...appliedFilters, sort: nextSort };
    setDraftFilters(next);
    setSearchParams(filtersToParams(next, 1, viewMode));
  };

  const handleViewChange = (nextView: ViewMode) => {
    setSearchParams(filtersToParams(appliedFilters, currentPage, nextView));
  };

  const themeCode = normalizeThemeCode(appliedFilters.q);
  const displayQuery = resolveSearchQueryLabel(appliedFilters.q, t);

  const heading = appliedFilters.ville.trim()
    ? t("schools.headingCity", { city: appliedFilters.ville.trim() })
    : appliedFilters.q.trim()
      ? themeCode
        ? t("schools.headingTheme", { theme: displayQuery })
        : t("schools.headingQuery", { query: displayQuery })
      : t("schools.headingAll");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "name", label: t("schools.sort.name") },
    { key: "newest", label: t("schools.sort.newest") },
    { key: "price_asc", label: t("schools.sort.priceAsc") },
    { key: "price_desc", label: t("schools.sort.priceDesc") },
  ];

  return (
    <>
      <PageMeta title={t("schools.metaTitle")} description={t("schools.metaDescription")} />
      <SubNav activePath="/auto-ecoles" items={[...subNavItems]} />

      <Container className="fj-marketplace-page">
        <div className="fj-marketplace-header">
          <div>
            <h1 className="fj-page-title">{heading}</h1>
            <p className="fj-page-lead">{t("schools.lead")}</p>
          </div>
          <Link to={AUTH_PATHS.register.autoEcole} className="fj-btn fj-btn--primary fj-marketplace-header__cta">
            <PlusCircle size={18} aria-hidden />
            {t("schools.registerSchool")}
          </Link>
        </div>

        <div className="fj-marketplace-layout">
          <DrivingSchoolSearchFilters
            filters={draftFilters}
            cities={allCities}
            onChange={(patch) => setDraftFilters((current) => ({ ...current, ...patch }))}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          <div className="fj-marketplace-main">
            <div className="fj-marketplace-toolbar">
              <p className="fj-marketplace-toolbar__count">
                {t("schools.count", { count: schools.length })}
              </p>

              <div className="fj-marketplace-toolbar__sort" role="tablist" aria-label={t("schools.sort.label")}>
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={sort === option.key}
                    className={sort === option.key ? "is-active" : undefined}
                    onClick={() => handleSortChange(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="fj-marketplace-toolbar__views">
                <button
                  type="button"
                  className={viewMode === "list" ? "is-active" : undefined}
                  aria-label={t("schools.viewList")}
                  onClick={() => handleViewChange("list")}
                >
                  <LayoutList size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  className={viewMode === "grid" ? "is-active" : undefined}
                  aria-label={t("schools.viewGrid")}
                  onClick={() => handleViewChange("grid")}
                >
                  <Grid3X3 size={18} aria-hidden />
                </button>
              </div>
            </div>

            {loading ? <Loader variant="inline" theme="flexjobs" message={t("schools.loading")} /> : null}
            {loadError ? <p className="fj-tech-empty">{loadError}</p> : null}

            {!loading && !loadError && paginatedResults.length === 0 ? (
              <p className="fj-tech-empty">{t("schools.empty")}</p>
            ) : null}

            {!loading && !loadError && paginatedResults.length > 0 ? (
              <div className={`fj-marketplace-results fj-marketplace-results--${viewMode}`}>
                {paginatedResults.map((school) => (
                  <DrivingSchoolCard key={school.id} school={school} layout={viewMode} />
                ))}
              </div>
            ) : null}

            {!loading && !loadError && schools.length > 0 ? (
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={schools.length}
                onPageChange={handlePageChange}
              />
            ) : null}
          </div>
        </div>
      </Container>
    </>
  );
}
