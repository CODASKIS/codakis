import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { formatWeekParam, getWeekStart, shiftWeek } from "../../lib/schedulingApi";

type WeekNavigatorProps = {
  weekStart: Date;
  onChange: (weekStart: Date) => void;
};

function formatWeekLabel(weekStart: Date, locale: string): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const start = weekStart.toLocaleDateString(locale, opts);
  const end = weekEnd.toLocaleDateString(locale, { ...opts, year: "numeric" });
  return `${start} – ${end}`;
}

export default function WeekNavigator({ weekStart, onChange }: WeekNavigatorProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const currentWeekStart = getWeekStart();

  function goToday() {
    onChange(currentWeekStart);
  }

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => onChange(shiftWeek(weekStart, -1))}
        aria-label={t("scheduling.weekPrev")}
      >
        ‹
      </Button>
      <strong className="px-2">{formatWeekLabel(weekStart, locale)}</strong>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => onChange(shiftWeek(weekStart, 1))}
        aria-label={t("scheduling.weekNext")}
      >
        ›
      </Button>
      <Button
        variant="link"
        size="sm"
        className="text-decoration-none"
        disabled={formatWeekParam(weekStart) === formatWeekParam(currentWeekStart)}
        onClick={goToday}
      >
        {t("scheduling.weekToday")}
      </Button>
    </div>
  );
}

export { formatWeekParam, getWeekStart };
