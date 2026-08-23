import { useTranslation } from "react-i18next";

type ScheduleLegendProps = {
  showSeances?: boolean;
  showCreneaux?: boolean;
};

export default function ScheduleLegend({ showSeances = true, showCreneaux = true }: ScheduleLegendProps) {
  const { t } = useTranslation();

  return (
    <div className="codakis-schedule-legend">
      {showSeances ? (
        <>
          <span className="codakis-schedule-legend__item">
            <i className="codakis-schedule-legend__dot is-warning" />
            {t("scheduling.legend.seancePlanned")}
          </span>
          <span className="codakis-schedule-legend__item">
            <i className="codakis-schedule-legend__dot is-success" />
            {t("scheduling.legend.seanceConfirmed")}
          </span>
        </>
      ) : null}
      {showCreneaux ? (
        <>
          <span className="codakis-schedule-legend__item">
            <i className="codakis-schedule-legend__dot is-open" />
            {t("scheduling.legend.creneauOpen")}
          </span>
          <span className="codakis-schedule-legend__item">
            <i className="codakis-schedule-legend__dot is-full" />
            {t("scheduling.legend.creneauFull")}
          </span>
        </>
      ) : null}
    </div>
  );
}
