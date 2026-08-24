import Calendar from "@fullcalendar/react/all";
import monarchTheme from "@fullcalendar/react/themes/monarch";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { formatWeekParam, getWeekStart } from "../../../lib/schedulingApi";
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  toFullCalendarEvents,
  type CalendarEvent,
} from "./calendarUtils";
import "./codakis-fullcalendar.scss";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";

type WeekCalendarProps = {
  weekStart?: Date;
  onWeekChange?: (weekStart: Date) => void;
  events: CalendarEvent[];
  selectedEventId?: string | null;
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (day: Date, hour: number) => void;
  onEventMove?: (event: CalendarEvent, startsAt: Date, endsAt: Date) => void | Promise<void>;
  loading?: boolean;
  emptyLabel?: string;
  hintLabel?: string;
  interactiveSlots?: boolean;
  draggableEvents?: boolean;
  toolbarAction?: React.ReactNode;
};

function padHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00:00`;
}

function toDate(value: Date | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export default function WeekCalendar({
  weekStart,
  onWeekChange,
  events,
  selectedEventId,
  onEventClick,
  onSlotClick,
  onEventMove,
  loading = false,
  emptyLabel,
  hintLabel,
  interactiveSlots = false,
  draggableEvents = false,
  toolbarAction,
}: WeekCalendarProps) {
  const { t, i18n } = useTranslation();
  const localeCode = i18n.language.startsWith("en") ? "en-gb" : "fr";
  const movingRef = useRef(false);
  const initialDateRef = useRef(weekStart ?? getWeekStart());
  const syncedWeekRef = useRef(formatWeekParam(initialDateRef.current));

  useEffect(() => {
    if (weekStart) {
      syncedWeekRef.current = formatWeekParam(weekStart);
    }
  }, [weekStart]);

  const fcEvents = useMemo(
    () => toFullCalendarEvents(events, draggableEvents),
    [draggableEvents, events],
  );

  return (
    <div className={`codakis-fc-wrap${loading ? " is-loading" : ""}`}>
      {toolbarAction ? <div className="codakis-fc-wrap__action">{toolbarAction}</div> : null}

      <div id="codakis-calendar" className="codakis-fc">
        <Calendar
          plugins={[monarchTheme]}
          locale={localeCode}
          firstDay={1}
          initialView="timeGridWeek"
          initialDate={initialDateRef.current}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          todayText={t("scheduling.weekToday")}
          monthText={t("scheduling.views.month")}
          weekTextLong={t("scheduling.views.week")}
          dayText={t("scheduling.views.day")}
          weekends
          allDaySlot={false}
          slotMinTime={padHour(CALENDAR_START_HOUR)}
          slotMaxTime={padHour(CALENDAR_END_HOUR)}
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          height="auto"
          expandRows
          nowIndicator
          events={fcEvents}
          eventClass={(info) =>
            info.event.id === selectedEventId ? "is-selected" : ""
          }
          editable={draggableEvents}
          eventStartEditable={draggableEvents}
          eventDurationEditable={false}
          selectable={interactiveSlots}
          selectMirror={interactiveSlots}
          unselectAuto
          datesSet={(info) => {
            if (!onWeekChange) return;
            const nextWeek = getWeekStart(info.start);
            const nextKey = formatWeekParam(nextWeek);
            if (nextKey === syncedWeekRef.current) return;
            syncedWeekRef.current = nextKey;
            onWeekChange(nextWeek);
          }}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            const calEvent = info.event.extendedProps.calendarEvent as CalendarEvent | undefined;
            if (calEvent) onEventClick?.(calEvent);
          }}
          dateClick={(info) => {
            if (!interactiveSlots || movingRef.current) return;
            const date = toDate(info.date);
            if (!date) return;
            onSlotClick?.(date, date.getHours());
          }}
          eventDrop={async (info) => {
            const calEvent = info.event.extendedProps.calendarEvent as CalendarEvent | undefined;
            const start = toDate(info.event.start);
            const end = toDate(info.event.end);
            if (!calEvent || !start || !onEventMove) {
              info.revert();
              return;
            }
            movingRef.current = true;
            try {
              await onEventMove(calEvent, start, end ?? start);
            } catch {
              info.revert();
            } finally {
              movingRef.current = false;
            }
          }}
        />
      </div>

      {!loading && events.length === 0 && emptyLabel ? (
        <p className="codakis-fc-wrap__empty">{emptyLabel}</p>
      ) : null}

      <p className="codakis-fc-wrap__hint">
        {hintLabel ??
          (draggableEvents ? t("scheduling.calendarHintPlanningDrag") : t("scheduling.calendarHint"))}
      </p>
    </div>
  );
}
