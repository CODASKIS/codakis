import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import EventDetailPanel from "../../components/scheduling/EventDetailPanel";
import ScheduleLegend from "../../components/scheduling/ScheduleLegend";
import ScheduleToolbar from "../../components/scheduling/ScheduleToolbar";
import WeekCalendar from "../../components/scheduling/WeekCalendar";
import {
  seanceToCalendarEvent,
  type CalendarEvent,
} from "../../components/scheduling/calendarUtils";
import { formatWeekParam, getWeekStart } from "../../../lib/schedulingApi";
import { AuthApiError, fetchCandidatSeances, type CandidatSeance } from "../../../lib/enrollmentsApi";

function candidatSeanceToCalendarEvent(seance: CandidatSeance): CalendarEvent {
  const base = seanceToCalendarEvent({
    ...seance,
    candidat_name: seance.moniteur_name ?? "—",
    candidat_phone: null,
    forfait_label: seance.forfait_label,
    school_name: seance.school_name,
  });
  return {
    ...base,
    title: seance.moniteur_name ?? "—",
    subtitle: seance.school_name ?? seance.forfait_label ?? undefined,
    raw: seance,
  };
}

export default function CandidatSeancesPage() {
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [seances, setSeances] = useState<CandidatSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSeances(await fetchCandidatSeances());
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.seances.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const weekParam = formatWeekParam(weekStart);

  const weekEvents = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return seances
      .filter((seance) => {
        const start = new Date(seance.starts_at);
        return start >= weekStart && start < weekEnd;
      })
      .map(candidatSeanceToCalendarEvent)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }, [seances, weekStart, weekParam]);

  const upcoming = useMemo(
    () => seances.filter((item) => item.statut !== "terminee" && item.statut !== "annulee"),
    [seances],
  );

  if (loading) return <Loader />;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("candidat.seances.title")} isOption={false} cardClass="codakis-schedule-page" optionClass="" CardBodyClass="">
          <p className="text-muted mb-3">{t("candidat.seances.subtitle")}</p>
          {error ? <Alert variant="danger">{error}</Alert> : null}

          {seances.length === 0 ? (
            <Alert variant="info">{t("candidat.seances.empty")}</Alert>
          ) : (
            <>
              {upcoming.length === 0 ? (
                <Alert variant="light" className="border mb-3">{t("candidat.seances.noUpcoming")}</Alert>
              ) : null}

              <ScheduleToolbar weekStart={weekStart} onChange={setWeekStart} />

              <div className="codakis-schedule-layout">
                <div>
                  <WeekCalendar
                    weekStart={weekStart}
                    events={weekEvents}
                    selectedEventId={selected?.id}
                    emptyLabel={t("candidat.seances.emptyWeek")}
                    hintLabel={t("scheduling.calendarHintReadonly")}
                    onEventClick={setSelected}
                  />
                  <ScheduleLegend showCreneaux={false} />
                </div>

                <div className="codakis-schedule-sidebar">
                  <EventDetailPanel
                    event={selected}
                    emptyTitle={t("scheduling.selectEvent")}
                    emptyHint={t("scheduling.selectSeanceHint")}
                  />

                  <div className="codakis-schedule-stat">
                    <div className="codakis-schedule-stat__label">{t("scheduling.allSeances")}</div>
                    <div className="codakis-agenda-list">
                      {seances.map((seance) => {
                        const event = candidatSeanceToCalendarEvent(seance);
                        return (
                          <button
                            key={seance.id}
                            type="button"
                            className={`codakis-agenda-item${selected?.id === seance.id ? " is-selected" : ""}`}
                            onClick={() => setSelected(event)}
                          >
                            <span className="codakis-agenda-item__time">
                              {new Date(seance.starts_at).toLocaleString(locale, {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="codakis-agenda-item__title">
                              {seance.moniteur_name ?? t("candidat.seances.unassigned")}
                            </span>
                            <span className="codakis-agenda-item__meta">{seance.lieu ?? seance.statut}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </MainCard>
      </Col>
    </Row>
  );
}
