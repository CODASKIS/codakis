import Button from "../../flexjobs/components/Button";

export type ServiceDomainOption = { code: string; label: string };

export type TechnicianFilters = {
  query: string;
  domainCode: string | null;
  city: string | null;
  availability: "all" | "available" | "busy";
  minRating: string;
  sortBy: "rating" | "reviews" | "name";
};

export const defaultTechnicianFilters: TechnicianFilters = {
  query: "",
  domainCode: null,
  city: null,
  availability: "all",
  minRating: "",
  sortBy: "rating",
};

const selectClassName = "fj-select";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="fj-label">
      {children}
    </label>
  );
}

type TechnicianSearchFilterProps = {
  filters: TechnicianFilters;
  cities: string[];
  domains: ServiceDomainOption[];
  resultCount: number;
  onChange: (patch: Partial<TechnicianFilters>) => void;
  onReset: () => void;
};

export default function TechnicianSearchFilter({
  filters,
  cities,
  domains,
  resultCount,
  onChange,
  onReset,
}: TechnicianSearchFilterProps) {
  const hasActiveFilters =
    filters.query.trim() !== "" ||
    filters.domainCode !== null ||
    filters.city !== null ||
    filters.availability !== "all" ||
    filters.minRating !== "" ||
    filters.sortBy !== "rating";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="fj-filter-badge">
          {resultCount} technicien{resultCount > 1 ? "s" : ""} trouvé{resultCount > 1 ? "s" : ""}
        </span>
        {hasActiveFilters ? (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            Réinitialiser
          </Button>
        ) : null}
      </div>

      <div className="fj-filter-grid">
        <div className="fj-form-group fj-filter-grid__wide">
          <FieldLabel htmlFor="technician-search">Recherche</FieldLabel>
          <input
            id="technician-search"
            type="search"
            className="fj-input"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Nom, domaine, ville, quartier..."
          />
        </div>

        <div className="fj-form-group">
          <FieldLabel htmlFor="technician-domain">Domaine</FieldLabel>
          <select
            id="technician-domain"
            value={filters.domainCode ?? ""}
            onChange={(e) => onChange({ domainCode: e.target.value || null })}
            className={selectClassName}
          >
            <option value="">Tous les domaines</option>
            {domains.map((domain) => (
              <option key={domain.code} value={domain.code}>
                {domain.label}
              </option>
            ))}
          </select>
        </div>

        <div className="fj-form-group">
          <FieldLabel htmlFor="technician-city">Ville</FieldLabel>
          <select
            id="technician-city"
            value={filters.city ?? ""}
            onChange={(e) => onChange({ city: e.target.value || null })}
            className={selectClassName}
          >
            <option value="">Toutes les villes</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="fj-form-group">
          <FieldLabel htmlFor="technician-availability">Disponibilité</FieldLabel>
          <select
            id="technician-availability"
            value={filters.availability}
            onChange={(e) =>
              onChange({
                availability: e.target.value as TechnicianFilters["availability"],
              })
            }
            className={selectClassName}
          >
            <option value="all">Tous</option>
            <option value="available">Disponible</option>
            <option value="busy">Occupé</option>
          </select>
        </div>

        <div className="fj-form-group">
          <FieldLabel htmlFor="technician-rating">Note minimum</FieldLabel>
          <select
            id="technician-rating"
            value={filters.minRating}
            onChange={(e) => onChange({ minRating: e.target.value })}
            className={selectClassName}
          >
            <option value="">Toutes les notes</option>
            <option value="4.5">4,5 et plus</option>
            <option value="4.7">4,7 et plus</option>
            <option value="4.8">4,8 et plus</option>
          </select>
        </div>

        <div className="fj-form-group">
          <FieldLabel htmlFor="technician-sort">Trier par</FieldLabel>
          <select
            id="technician-sort"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ sortBy: e.target.value as TechnicianFilters["sortBy"] })
            }
            className={selectClassName}
          >
            <option value="rating">Meilleure note</option>
            <option value="reviews">Plus d&apos;avis</option>
            <option value="name">Nom (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
