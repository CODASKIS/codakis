import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Col, ProgressBar, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import EventDetailPanel from "../../components/scheduling/EventDetailPanel";
import ScheduleLegend from "../../components/scheduling/ScheduleLegend";
import WeekCalendar from "../../components/scheduling/WeekCalendar";
import {
  creneauToCalendarEvent,
  getEventDurationMinutes,
  seanceToCalendarEvent,
  type CalendarEvent,
} from "../../components/scheduling/calendarUtils";
import { formatWeekParam, getWeekStart, AuthApiError, fetchMoniteurWeeklyPlanning, updateMoniteurCreneau, type WeeklyPlanning } from "../../../lib/schedulingApi";
import { updateMoniteurSeance, type MoniteurSeance } from "../../../lib/enrollmentsApi";

export default function MoniteurPlanningPage() {
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [planning, setPlanning] = useState<WeeklyPlanning | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const weekParam = formatWeekParam(weekStart);
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPlanning(await fetchMoniteurWeeklyPlanning(weekParam));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("moniteur.planning.loadError"));
    } finally {
      setLoading(false);
    }
  }, [weekParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const calendarEvents = useMemo(() => {
    if (!planning) return [];
    const seances = planning.seances
      .filter((item) => item.statut !== "terminee" && item.statut !== "annulee")
      .map(seanceToCalendarEvent);
    const creneaux = planning.creneaux.map(creneauToCalendarEvent);
    return [...seances, ...creneaux].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  }, [planning]);

  const upcomingSeances = useMemo(
    () => calendarEvents.filter((event) => event.kind === "seance"),
    [calendarEvents],
  );

  const limitPercent = useMemo(() => {
    if (!planning || planning.max_seances_semaine <= 0) return 0;
    return Math.min(100, Math.round((planning.seances_semaine / planning.max_seances_semaine) * 100));
  }, [planning]);

  async function setStatus(seance: MoniteurSeance, statut: string) {
    setBusyId(seance.id);
    setError("");
    setSuccess("");
    try {
      await updateMoniteurSeance(seance.id, { statut });
      setSuccess(t("moniteur.planning.updateSuccess"));
      await load();
      setSelected(null);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("moniteur.planning.updateError"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleMoveEvent(event: CalendarEvent, startsAt: Date, endsAt: Date) {
    setError("");
    setSuccess("");
    setBusyId(event.id);
    try {
      const durationMinutes = getEventDurationMinutes(startsAt.toISOString(), endsAt.toISOString());
      if (event.kind === "seance") {
        await updateMoniteurSeance(event.id, {
          starts_at: startsAt.toISOString(),
          duration_minutes: durationMinutes,
        });
      } else {
        await updateMoniteurCreneau(event.id, {
          starts_at: startsAt.toISOString(),
          duration_minutes: durationMinutes,
        });
      }
      setSuccess(t("scheduling.moveSuccess"));
      await load();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("scheduling.moveError"));
    } finally {
      setBusyId(null);
    }
  }

  if (loading && !planning) return <Loader />;

  const selectedSeance =
    selected?.kind === "seance" ? (selected.raw as MoniteurSeance) : null;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("moniteur.planning.title")} isOption={false} cardClass="codakis-schedule-page" optionClass="" CardBodyClass="">
          <p className="text-muted mb-3">{t("moniteur.planning.subtitle")}</p>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert> : null}

          <div className="codakis-schedule-layout">
            <div>
              <WeekCalendar
                weekStart={weekStart}
                onWeekChange={setWeekStart}
                events={calendarEvents}
                selectedEventId={selected?.id}
                loading={loading}
                emptyLabel={t("moniteur.planning.emptyWeek")}
                hintLabel={t("scheduling.calendarHintPlanningDrag")}
                draggableEvents
                onEventClick={setSelected}
                onEventMove={handleMoveEvent}
              />
              <ScheduleLegend />
            </div>

            <div className="codakis-schedule-sidebar">
              {planning ? (
                <div className="codakis-schedule-stat">
                  <div className="codakis-schedule-stat__label">{t("moniteur.planning.weeklyLimit")}</div>
                  <div className="codakis-schedule-stat__value">
                    {planning.seances_semaine}/{planning.max_seances_semaine} {t("moniteur.planning.sessions")}
                    {" · "}
                    {planning.heures_semaine.toFixed(1)} h
                  </div>
                  <ProgressBar
                    now={limitPercent}
                    variant={limitPercent >= 100 ? "danger" : limitPercent >= 80 ? "warning" : "success"}
                  />
                  {limitPercent >= 100 ? (
                    <small className="text-danger d-block mt-2">{t("moniteur.planning.limitReached")}</small>
                  ) : null}
                </div>
              ) : null}

              <EventDetailPanel
                event={selected?.kind === "seance" ? selected : null}
                busy={Boolean(busyId)}
                emptyTitle={t("scheduling.selectEvent")}
                emptyHint={t("scheduling.selectEventHint")}
                onConfirm={
                  selectedSeance?.statut === "planifiee"
                    ? () => void setStatus(selectedSeance, "confirmee")
                    : undefined
                }
                onComplete={
                  selectedSeance?.statut === "confirmee"
                    ? () => void setStatus(selectedSeance, "terminee")
                    : undefined
                }
              />

              <div className="codakis-schedule-stat">
                <div className="codakis-schedule-stat__label">{t("scheduling.upcomingList")}</div>
                <div className="codakis-agenda-list">
                  {upcomingSeances.length === 0 ? (
                    <p className="text-muted mb-0">{t("moniteur.planning.emptyWeek")}</p>
                  ) : (
                    upcomingSeances.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`codakis-agenda-item${selected?.id === event.id ? " is-selected" : ""}`}
                        onClick={() => setSelected(event)}
                      >
                        <span className="codakis-agenda-item__time">
                          {new Date(event.starts_at).toLocaleString(locale, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="codakis-agenda-item__title">{event.title}</span>
                        <span className="codakis-agenda-item__meta">{event.lieu ?? event.status}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </MainCard>
      </Col>
    </Row>
  );
}
