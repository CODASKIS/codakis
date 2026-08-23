import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatWeekParam, getWeekStart, shiftWeek } from "../../../lib/schedulingApi";

type ScheduleToolbarProps = {
  weekStart: Date;
  onChange: (weekStart: Date) => void;
  action?: React.ReactNode;
};

function formatWeekLabel(weekStart: Date, locale: string): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const start = weekStart.toLocaleDateString(locale, opts);
  const end = weekEnd.toLocaleDateString(locale, { ...opts, year: "numeric" });
  return `${start} – ${end}`;
}

export default function ScheduleToolbar({ weekStart, onChange, action }: ScheduleToolbarProps) {
  const { t, i18n } = useTranslation();
  const displayLocale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const currentWeekStart = getWeekStart();
  const isCurrentWeek = formatWeekParam(weekStart) === formatWeekParam(currentWeekStart);

  return (
    <div className="codakis-schedule-toolbar">
      <div className="codakis-schedule-toolbar__nav">
        <button
          type="button"
          className="codakis-schedule-toolbar__btn"
          onClick={() => onChange(shiftWeek(weekStart, -1))}
          aria-label={t("scheduling.weekPrev")}
        >
          <ChevronLeft size={20} strokeWidth={2} aria-hidden />
        </button>
        <div className="codakis-schedule-toolbar__label">
          <CalendarDays size={22} strokeWidth={1.75} className="codakis-schedule-toolbar__icon" aria-hidden />
          <span>{formatWeekLabel(weekStart, displayLocale)}</span>
        </div>
        <button
          type="button"
          className="codakis-schedule-toolbar__btn"
          onClick={() => onChange(shiftWeek(weekStart, 1))}
          aria-label={t("scheduling.weekNext")}
        >
          <ChevronRight size={20} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className={`codakis-schedule-toolbar__today${isCurrentWeek ? " is-active" : ""}`}
          disabled={isCurrentWeek}
          onClick={() => onChange(currentWeekStart)}
        >
          {t("scheduling.weekToday")}
        </button>
      </div>
      {action ? <div className="codakis-schedule-toolbar__action">{action}</div> : null}
    </div>
  );
}
