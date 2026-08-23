import { GripVertical } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildDatetimeFromDayAndMinutes,
  CALENDAR_END_HOUR,
  CALENDAR_HOUR_HEIGHT,
  CALENDAR_START_HOUR,
  calendarHours,
  eventStatusClass,
  formatDayHeader,
  formatTimeShort,
  getEventDurationMinutes,
  getEventStyle,
  getWeekDays,
  isEventDraggable,
  minutesToTop,
  topToMinutes,
  type CalendarEvent,
} from "./calendarUtils";

type WeekCalendarProps = {
  weekStart: Date;
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
};

type DragState = {
  event: CalendarEvent;
  pointerId: number;
  offsetY: number;
  originDayIndex: number;
  previewDayIndex: number;
  previewTop: number;
  durationMinutes: number;
};

function useMobileCalendar() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export default function WeekCalendar({
  weekStart,
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
}: WeekCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const isMobile = useMobileCalendar();
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const hours = useMemo(() => calendarHours(), []);
  const gridHeight = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT;
  const gridRef = useRef<HTMLDivElement>(null);
  const dayColRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mobileDayIndex, setMobileDayIndex] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const index = days.findIndex(
      (day) =>
        day.getFullYear() === today.getFullYear() &&
        day.getMonth() === today.getMonth() &&
        day.getDate() === today.getDate(),
    );
    return index >= 0 ? index : 0;
  });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const dragMovedRef = useRef(false);

  useEffect(() => {
    if (!isMobile) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const index = days.findIndex(
      (day) =>
        day.getFullYear() === today.getFullYear() &&
        day.getMonth() === today.getMonth() &&
        day.getDate() === today.getDate(),
    );
    setMobileDayIndex(index >= 0 ? index : 0);
  }, [days, isMobile]);

  const visibleDayIndexes = isMobile ? [mobileDayIndex] : days.map((_, index) => index);
  const visibleDays = visibleDayIndexes.map((index) => days[index]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    days.forEach((day, index) => {
      map.set(
        index,
        events.filter((event) => {
          const start = new Date(event.starts_at);
          return (
            start.getFullYear() === day.getFullYear() &&
            start.getMonth() === day.getMonth() &&
            start.getDate() === day.getDate()
          );
        }),
      );
    });
    return map;
  }, [days, events]);

  const nowLine = useMemo(() => {
    const now = new Date();
    const todayIndex = days.findIndex(
      (day) =>
        day.getFullYear() === now.getFullYear() &&
        day.getMonth() === now.getMonth() &&
        day.getDate() === now.getDate(),
    );
    if (todayIndex < 0) return null;
    if (isMobile && todayIndex !== mobileDayIndex) return null;
    const minutes = now.getHours() * 60 + now.getMinutes();
    const gridStart = CALENDAR_START_HOUR * 60;
    const gridEnd = CALENDAR_END_HOUR * 60;
    if (minutes < gridStart || minutes > gridEnd) return null;
    return {
      dayIndex: isMobile ? 0 : todayIndex,
      top: ((minutes - gridStart) / 60) * CALENDAR_HOUR_HEIGHT,
    };
  }, [days, isMobile, mobileDayIndex]);

  const resolveDayIndexFromPointer = useCallback(
    (clientX: number, clientY: number): number | null => {
      for (let index = 0; index < dayColRefs.current.length; index += 1) {
        const col = dayColRefs.current[index];
        if (!col) continue;
        const rect = col.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          return visibleDayIndexes[index] ?? null;
        }
      }
      return null;
    },
    [visibleDayIndexes],
  );

  const resolveTopFromPointer = useCallback((clientY: number, offsetY: number, dayColIndex: number): number => {
    const col = dayColRefs.current[dayColIndex];
    if (!col) return 0;
    const rect = col.getBoundingClientRect();
    const rawTop = clientY - rect.top - offsetY;
    const maxTop = gridHeight - minutesToTop(CALENDAR_START_HOUR * 60 + 30);
    return Math.min(Math.max(rawTop, 0), Math.max(maxTop, 0));
  }, [gridHeight]);

  const finishDrag = useCallback(
    async (state: DragState) => {
      const targetDay = days[state.previewDayIndex];
      if (!targetDay || !onEventMove) return;

      const startMinutes = topToMinutes(state.previewTop);
      const startAt = buildDatetimeFromDayAndMinutes(targetDay, startMinutes);
      const endAt = new Date(startAt.getTime() + state.durationMinutes * 60_000);

      setMovingId(state.event.id);
      try {
        await onEventMove(state.event, startAt, endAt);
      } finally {
        setMovingId(null);
      }
    },
    [days, onEventMove],
  );

  useEffect(() => {
    if (!dragState) return undefined;
    const activeDrag = dragState;

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== activeDrag.pointerId) return;
      dragMovedRef.current = true;
      const colIndex = resolveDayIndexFromPointer(event.clientX, event.clientY);
      const dayIndex = colIndex ?? activeDrag.previewDayIndex;
      const visibleColIndex = visibleDayIndexes.indexOf(dayIndex);
      const resolvedColIndex = visibleColIndex >= 0 ? visibleColIndex : 0;
      const previewTop = resolveTopFromPointer(event.clientY, activeDrag.offsetY, resolvedColIndex);
      setDragState((current) =>
        current
          ? {
              ...current,
              previewDayIndex: dayIndex,
              previewTop,
            }
          : null,
      );
    }

    async function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== activeDrag.pointerId) return;
      setDragState(null);
      if (dragMovedRef.current) {
        await finishDrag(activeDrag);
      }
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragState, finishDrag, resolveDayIndexFromPointer, resolveTopFromPointer, visibleDayIndexes]);

  function startDrag(
    event: CalendarEvent,
    pointerEvent: React.PointerEvent<HTMLButtonElement>,
    dayIndex: number,
  ) {
    if (!draggableEvents || !onEventMove || !isEventDraggable(event) || movingId) return;
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    dragMovedRef.current = false;
    const style = getEventStyle(event.starts_at, event.ends_at);
    setDragState({
      event,
      pointerId: pointerEvent.pointerId,
      offsetY: pointerEvent.clientY - pointerEvent.currentTarget.getBoundingClientRect().top,
      originDayIndex: dayIndex,
      previewDayIndex: dayIndex,
      previewTop: style.top,
      durationMinutes: getEventDurationMinutes(event.starts_at, event.ends_at),
    });
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
  }

  function renderEvent(event: CalendarEvent, dayIndex: number) {
    const style = getEventStyle(event.starts_at, event.ends_at);
    const statusClass = eventStatusClass(event.kind, event.status);
    const isDragging = dragState?.event.id === event.id;
    const isDraggable = draggableEvents && isEventDraggable(event);

    if (isDragging && dragState && dayIndex !== dragState.previewDayIndex) {
      return null;
    }

    const previewStyle = isDragging && dragState
      ? { top: dragState.previewTop, height: style.height }
      : { top: style.top, height: style.height };

    return (
      <button
        key={event.id}
        type="button"
        className={`codakis-week-calendar__event ${statusClass}${selectedEventId === event.id ? " is-selected" : ""}${isDragging ? " is-dragging" : ""}${isDraggable ? " is-draggable" : ""}${movingId === event.id ? " is-moving" : ""}`}
        style={previewStyle}
        onPointerDown={(pointerEvent) => startDrag(event, pointerEvent, dayIndex)}
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
          }
          onEventClick?.(event);
        }}
      >
        {isDraggable ? (
          <GripVertical size={14} strokeWidth={2} className="codakis-week-calendar__event-grip" aria-hidden />
        ) : null}
        <span className="codakis-week-calendar__event-time">{formatTimeShort(event.starts_at, locale)}</span>
        <span className="codakis-week-calendar__event-title">{event.title}</span>
        {event.subtitle ? <span className="codakis-week-calendar__event-sub">{event.subtitle}</span> : null}
      </button>
    );
  }

  return (
    <div
      className={`codakis-week-calendar${loading ? " is-loading" : ""}${isMobile ? " is-mobile" : ""}${dragState ? " is-drag-active" : ""}`}
    >
      {isMobile ? (
        <div className="codakis-week-calendar__mobile-days" role="tablist" aria-label={t("scheduling.mobileDays")}>
          {days.map((day, index) => {
            const header = formatDayHeader(day, locale);
            return (
              <button
                key={day.toISOString()}
                type="button"
                role="tab"
                aria-selected={mobileDayIndex === index}
                className={`codakis-week-calendar__mobile-day${mobileDayIndex === index ? " is-active" : ""}${header.isToday ? " is-today" : ""}`}
                onClick={() => setMobileDayIndex(index)}
              >
                <span>{header.weekday}</span>
                <strong>{header.date}</strong>
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className="codakis-week-calendar__header"
        style={{ gridTemplateColumns: `${isMobile ? "3.6rem" : "4.8rem"} repeat(${visibleDays.length}, minmax(0, 1fr))` }}
      >
        <div className="codakis-week-calendar__corner" aria-hidden />
        {visibleDays.map((day) => {
          const header = formatDayHeader(day, locale);
          return (
            <div
              key={day.toISOString()}
              className={`codakis-week-calendar__day-head${header.isToday ? " is-today" : ""}`}
            >
              <span className="codakis-week-calendar__weekday">{header.weekday}</span>
              <span className="codakis-week-calendar__date">{header.date}</span>
            </div>
          );
        })}
      </div>

      <div
        className="codakis-week-calendar__scroll"
        style={{ gridTemplateColumns: `${isMobile ? "3.6rem" : "4.8rem"} 1fr` }}
        ref={gridRef}
      >
        <div className="codakis-week-calendar__hours" style={{ height: gridHeight }}>
          {hours.map((hour) => (
            <div key={hour} className="codakis-week-calendar__hour" style={{ height: CALENDAR_HOUR_HEIGHT }}>
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div
          className="codakis-week-calendar__grid"
          style={{
            height: gridHeight,
            gridTemplateColumns: `repeat(${visibleDays.length}, minmax(${isMobile ? "100%" : "0"}, 1fr))`,
          }}
        >
          {visibleDays.map((day, visibleColIndex) => {
            const dayIndex = visibleDayIndexes[visibleColIndex];
            return (
              <div
                key={day.toISOString()}
                className="codakis-week-calendar__day-col"
                ref={(node) => {
                  dayColRefs.current[visibleColIndex] = node;
                }}
              >
                {hours.map((hour) =>
                  interactiveSlots ? (
                    <button
                      key={hour}
                      type="button"
                      className="codakis-week-calendar__slot"
                      style={{ height: CALENDAR_HOUR_HEIGHT }}
                      aria-label={`${formatDayHeader(day, locale).weekday} ${hour}:00`}
                      onClick={() => onSlotClick?.(day, hour)}
                    />
                  ) : (
                    <div
                      key={hour}
                      className="codakis-week-calendar__slot is-readonly"
                      style={{ height: CALENDAR_HOUR_HEIGHT }}
                      aria-hidden
                    />
                  ),
                )}

                {(eventsByDay.get(dayIndex) ?? []).map((event) => renderEvent(event, dayIndex))}

                {nowLine?.dayIndex === visibleColIndex ? (
                  <div className="codakis-week-calendar__now" style={{ top: nowLine.top }} aria-hidden />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {!loading && events.length === 0 && emptyLabel ? (
        <p className="codakis-week-calendar__empty">{emptyLabel}</p>
      ) : null}

      <p className="codakis-week-calendar__hint">
        {hintLabel ??
          (draggableEvents ? t("scheduling.calendarHintDrag") : t("scheduling.calendarHint"))}
      </p>
    </div>
  );
}
