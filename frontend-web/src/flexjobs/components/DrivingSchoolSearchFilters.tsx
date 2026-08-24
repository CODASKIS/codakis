import { useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { AUTH_PATHS } from "../../constants/authPaths";
import { CEMAC_COUNTRIES } from "../../data/cemacCountries";

export type SchoolSearchFilters = {
  q: string;
  ville: string;
  pays: string;
  priceMin: string;
  priceMax: string;
  sort: string;
};

type DrivingSchoolSearchFiltersProps = {
  filters: SchoolSearchFilters;
  cities: string[];
  onChange: (patch: Partial<SchoolSearchFilters>) => void;
  onApply: () => void;
  onClear: () => void;
};

export default function DrivingSchoolSearchFilters({
  filters,
  cities,
  onChange,
  onApply,
  onClear,
}: DrivingSchoolSearchFiltersProps) {
  const { t } = useTranslation();

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.q.trim() ||
          filters.ville.trim() ||
          filters.pays.trim() ||
          filters.priceMin.trim() ||
          filters.priceMax.trim() ||
          (filters.sort && filters.sort !== "name"),
      ),
    [filters],
  );

  return (
    <aside className="fj-marketplace-filters" aria-label={t("schools.filters.title")}>
      <div className="fj-marketplace-filters__head">
        <h2>{t("schools.filters.title")}</h2>
        {hasActiveFilters ? (
          <button type="button" className="fj-marketplace-filters__clear" onClick={onClear}>
            {t("schools.filters.clearAll")}
          </button>
        ) : null}
      </div>

      <div className="fj-marketplace-filters__block">
        <label className="fj-marketplace-filters__label" htmlFor="school-filter-q">
          {t("schools.filters.keyword")}
        </label>
        <input
          id="school-filter-q"
          type="search"
          className="fj-input"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder={t("schools.filters.keywordPlaceholder")}
        />
      </div>

      <div className="fj-marketplace-filters__block">
        <label className="fj-marketplace-filters__label" htmlFor="school-filter-pays">
          {t("schools.filters.country")}
        </label>
        <select
          id="school-filter-pays"
          className="fj-input"
          value={filters.pays}
          onChange={(e) => onChange({ pays: e.target.value })}
        >
          <option value="">{t("schools.filters.allCountries")}</option>
          {CEMAC_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code.toUpperCase()}>
              {t(`coverage.countries.${country.nameKey}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="fj-marketplace-filters__block">
        <label className="fj-marketplace-filters__label" htmlFor="school-filter-ville">
          {t("schools.filters.city")}
        </label>
        <select
          id="school-filter-ville"
          className="fj-input"
          value={filters.ville}
          onChange={(e) => onChange({ ville: e.target.value })}
        >
          <option value="">{t("schools.filters.allCities")}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="fj-marketplace-filters__block">
        <span className="fj-marketplace-filters__label">{t("schools.filters.price")}</span>
        <div className="fj-marketplace-filters__price-row">
          <input
            type="number"
            min={0}
            step={5000}
            className="fj-input"
            value={filters.priceMin}
            onChange={(e) => onChange({ priceMin: e.target.value })}
            placeholder={t("schools.filters.priceMin")}
            aria-label={t("schools.filters.priceMin")}
          />
          <span aria-hidden>—</span>
          <input
            type="number"
            min={0}
            step={5000}
            className="fj-input"
            value={filters.priceMax}
            onChange={(e) => onChange({ priceMax: e.target.value })}
            placeholder={t("schools.filters.priceMax")}
            aria-label={t("schools.filters.priceMax")}
          />
        </div>
      </div>

      <button type="button" className="fj-btn fj-btn--primary fj-btn--block" onClick={onApply}>
        {t("schools.filters.apply")}
      </button>

      <div className="fj-marketplace-filters__register">
        <h3>{t("schools.filters.registerTitle")}</h3>
        <p>{t("schools.filters.registerLead")}</p>
        <Link to={AUTH_PATHS.register.autoEcole} className="fj-btn fj-btn--outline fj-btn--block">
          {t("schools.filters.registerCta")}
        </Link>
      </div>
    </aside>
  );
}
