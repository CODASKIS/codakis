import { CalendarClock } from "lucide-react";
import { Badge, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import type { CalendarEvent } from "./calendarUtils";

type EventDetailPanelProps = {
  event: CalendarEvent | null;
  busy?: boolean;
  onConfirm?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  emptyTitle: string;
  emptyHint: string;
};

function statusVariant(statut: string): string {
  if (statut === "confirmee" || statut === "terminee" || statut === "ouvert") return "success";
  if (statut === "annulee" || statut === "annule") return "danger";
  if (statut === "complet") return "warning";
  return "primary";
}

export default function EventDetailPanel({
  event,
  busy = false,
  onConfirm,
  onComplete,
  onDelete,
  emptyTitle,
  emptyHint,
}: EventDetailPanelProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";

  if (!event) {
    return (
      <div className="codakis-event-panel codakis-event-panel--empty">
        <CalendarClock size={40} strokeWidth={1.5} className="codakis-event-panel__icon" aria-hidden />
        <h6>{emptyTitle}</h6>
        <p>{emptyHint}</p>
      </div>
    );
  }

  const start = new Date(event.starts_at);
  const end = new Date(event.ends_at);

  return (
    <div className="codakis-event-panel">
      <div className="codakis-event-panel__head">
        <Badge bg={event.kind === "seance" ? "primary" : "info"} className="codakis-event-panel__badge">
          {event.kind === "seance" ? t("scheduling.eventSeance") : t("scheduling.eventCreneau")}
        </Badge>
        <Badge bg={statusVariant(event.status)} className="codakis-event-panel__badge">{event.status}</Badge>
      </div>
      <h5 className="codakis-event-panel__title">{event.title}</h5>
      {event.subtitle ? <p className="codakis-event-panel__sub">{event.subtitle}</p> : null}

      <dl className="codakis-event-panel__meta">
        <div>
          <dt>{t("scheduling.when")}</dt>
          <dd>
            {start.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
            <br />
            {start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
            {" – "}
            {end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
          </dd>
        </div>
        {event.lieu ? (
          <div>
            <dt>{t("scheduling.where")}</dt>
            <dd>{event.lieu}</dd>
          </div>
        ) : null}
      </dl>

      <div className="codakis-event-panel__actions">
        {event.kind === "seance" && event.status === "planifiee" && onConfirm ? (
          <Button size="sm" variant="outline-primary" disabled={busy} onClick={onConfirm}>
            {t("moniteur.planning.confirm")}
          </Button>
        ) : null}
        {event.kind === "seance" && event.status === "confirmee" && onComplete ? (
          <Button size="sm" variant="primary" disabled={busy} onClick={onComplete}>
            {t("moniteur.planning.complete")}
          </Button>
        ) : null}
        {event.kind === "creneau" && onDelete ? (
          <Button size="sm" variant="outline-danger" disabled={busy} onClick={onDelete}>
            {t("moniteur.creneaux.delete")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
