import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg } from "@fullcalendar/core";
import Loader from "../../../components/common/Loader";
import { fetchMoniteurSeances, type MoniteurSeance } from "../../../lib/enrollmentsApi";
import ComponentCard from "../../common/ComponentCard";
import SeanceDetailModal from "./SeanceDetailModal";
import { eventClassName } from "./moniteurUtils";

export default function MoniteurPlanning() {
  const [items, setItems] = useState<MoniteurSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MoniteurSeance | null>(null);

  async function load() {
    setItems(await fetchMoniteurSeances());
  }

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const events = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.candidat_name,
        start: item.starts_at,
        end: item.ends_at,
        classNames: [eventClassName(item.statut)],
        extendedProps: { seanceId: item.id },
      })),
    [items],
  );

  function onEventClick(arg: EventClickArg) {
    const id = arg.event.id;
    const seance = items.find((s) => s.id === id) ?? null;
    setSelected(seance);
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ta-page-title">Planning</h2>
        <p className="ta-page-sub">Calendrier de vos séances pratiques.</p>
      </div>

      {error ? <p className="text-sm text-error-500">{error}</p> : null}

      <ComponentCard title="Calendrier">
        <div className="ta-calendar min-h-[32rem]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            locale="fr"
            height="auto"
            events={events}
            eventClick={onEventClick}
            buttonText={{
              today: "Aujourd’hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              list: "Liste",
            }}
          />
        </div>
      </ComponentCard>

      <SeanceDetailModal
        seance={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onUpdated={load}
      />
    </div>
  );
}
