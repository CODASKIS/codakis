import { useTranslation } from "react-i18next";
import { CEMAC_COUNTRIES, cemacFlagUrl } from "../../data/cemacCountries";
import CemacAfricaMap from "./CemacAfricaMap";
import Container from "./Container";

const STATS = ["stat1", "stat2", "stat3"] as const;

export default function HomeCemacCoverageSection() {
  const { t } = useTranslation();

  return (
    <section className="fj-cemac-coverage" aria-labelledby="cemac-coverage-title">
      <Container>
        <div className="fj-cemac-coverage__grid">
          <div className="fj-cemac-coverage__visual">
            <CemacAfricaMap className="fj-cemac-coverage__map" />
          </div>

          <div className="fj-cemac-coverage__content">
            <h2 id="cemac-coverage-title">{t("coverage.title")}</h2>

            <div className="fj-cemac-coverage__stats">
              {STATS.map((key) => (
                <div key={key} className="fj-cemac-coverage__stat">
                  <p className="fj-cemac-coverage__stat-value">{t(`coverage.${key}Value`)}</p>
                  <p className="fj-cemac-coverage__stat-label">{t(`coverage.${key}Label`)}</p>
                  <p className="fj-cemac-coverage__stat-trend">{t(`coverage.${key}Trend`)}</p>
                </div>
              ))}
            </div>

            <p className="fj-cemac-coverage__lead">{t("coverage.lead")}</p>

            <ul className="fj-cemac-coverage__countries">
              {CEMAC_COUNTRIES.map((country) => (
                <li key={country.code}>
                  <img
                    src={cemacFlagUrl(country.code)}
                    alt=""
                    width={24}
                    height={18}
                    loading="lazy"
                    className="fj-cemac-coverage__flag"
                  />
                  <span>{t(`coverage.countries.${country.nameKey}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
