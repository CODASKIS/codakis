import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import EventDetailPanel from "../../components/scheduling/EventDetailPanel";
import ScheduleLegend from "../../components/scheduling/ScheduleLegend";
import WeekCalendar from "../../components/scheduling/WeekCalendar";
import {
  creneauToCalendarEvent,
  getEventDurationMinutes,
  slotToDatetimeLocal,
  type CalendarEvent,
} from "../../components/scheduling/calendarUtils";
import {
  AuthApiError,
  createMoniteurCreneau,
  deleteMoniteurCreneau,
  fetchMoniteurCreneaux,
  formatWeekParam,
  getWeekStart,
  updateMoniteurCreneau,
  type Creneau,
} from "../../../lib/schedulingApi";

export default function MoniteurCreneauxPage() {
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    starts_at: "",
    duration_minutes: "60",
    capacite_max: "1",
    lieu: "",
    notes: "",
  });

  const weekParam = formatWeekParam(weekStart);
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCreneaux(await fetchMoniteurCreneaux(weekParam));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("moniteur.creneaux.loadError"));
    } finally {
      setLoading(false);
    }
  }, [weekParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const calendarEvents = useMemo(
    () =>
      [...creneaux]
        .map(creneauToCalendarEvent)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [creneaux],
  );

  function openCreateModal(day?: Date, hour?: number) {
    setForm({
      starts_at: day && hour !== undefined ? slotToDatetimeLocal(day, hour) : "",
      duration_minutes: "60",
      capacite_max: "1",
      lieu: "",
      notes: "",
    });
    setShowCreate(true);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await createMoniteurCreneau({
        starts_at: new Date(form.starts_at).toISOString(),
        duration_minutes: Number(form.duration_minutes) || 60,
        capacite_max: Number(form.capacite_max) || 1,
        lieu: form.lieu.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setShowCreate(false);
      setForm({ starts_at: "", duration_minutes: "60", capacite_max: "1", lieu: "", notes: "" });
      setSuccess(t("moniteur.creneaux.createSuccess"));
      await load();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("moniteur.creneaux.createError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(creneau: Creneau) {
    if (!window.confirm(t("moniteur.creneaux.deleteConfirm"))) return;
    setBusyId(creneau.id);
    setError("");
    try {
      await deleteMoniteurCreneau(creneau.id);
      setSuccess(t("moniteur.creneaux.deleteSuccess"));
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("moniteur.creneaux.deleteError"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleMoveEvent(event: CalendarEvent, startsAt: Date, endsAt: Date) {
    if (event.kind !== "creneau") return;
    setError("");
    setSuccess("");
    try {
      await updateMoniteurCreneau(event.id, {
        starts_at: startsAt.toISOString(),
        duration_minutes: getEventDurationMinutes(startsAt.toISOString(), endsAt.toISOString()),
      });
      setSuccess(t("scheduling.moveSuccess"));
      await load();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("scheduling.moveError"));
    }
  }

  const selectedCreneau =
    selected?.kind === "creneau" ? (selected.raw as Creneau) : null;

  if (loading && creneaux.length === 0) return <Loader />;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("moniteur.creneaux.title")} isOption={false} cardClass="codakis-schedule-page" optionClass="" CardBodyClass="">
          <p className="text-muted mb-3">{t("moniteur.creneaux.subtitle")}</p>
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
                emptyLabel={t("moniteur.creneaux.empty")}
                interactiveSlots
                draggableEvents
                toolbarAction={
                  <Button variant="primary" size="sm" onClick={() => openCreateModal()}>
                    {t("moniteur.creneaux.addCta")}
                  </Button>
                }
                onEventClick={setSelected}
                onSlotClick={(day, hour) => openCreateModal(day, hour)}
                onEventMove={handleMoveEvent}
              />
              <ScheduleLegend showSeances={false} />
            </div>

            <div className="codakis-schedule-sidebar">
              <EventDetailPanel
                event={selected?.kind === "creneau" ? selected : null}
                busy={Boolean(busyId)}
                emptyTitle={t("scheduling.selectCreneau")}
                emptyHint={t("scheduling.selectCreneauHint")}
                onDelete={
                  selectedCreneau && selectedCreneau.places_prises === 0 && selectedCreneau.statut !== "annule"
                    ? () => void handleDelete(selectedCreneau)
                    : undefined
                }
              />

              <div className="codakis-schedule-stat">
                <div className="codakis-schedule-stat__label">{t("scheduling.weekCreneaux")}</div>
                <div className="codakis-agenda-list">
                  {calendarEvents.length === 0 ? (
                    <p className="text-muted mb-0">{t("moniteur.creneaux.empty")}</p>
                  ) : (
                    calendarEvents.map((event) => (
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
                        <span className="codakis-agenda-item__meta">{event.status}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </MainCard>
      </Col>

      <Modal show={showCreate} onHide={() => !saving && setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("moniteur.creneaux.addTitle")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(e) => void handleCreate(e)}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("moniteur.creneaux.colWhen")}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    required
                    value={form.starts_at}
                    onChange={(e) => setForm((c) => ({ ...c, starts_at: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("moniteur.creneaux.duration")}</Form.Label>
                  <Form.Control
                    type="number"
                    min={30}
                    max={180}
                    step={15}
                    value={form.duration_minutes}
                    onChange={(e) => setForm((c) => ({ ...c, duration_minutes: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("moniteur.creneaux.capacity")}</Form.Label>
                  <Form.Select
                    value={form.capacite_max}
                    onChange={(e) => setForm((c) => ({ ...c, capacite_max: e.target.value }))}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("moniteur.creneaux.colLieu")}</Form.Label>
                  <Form.Control value={form.lieu} onChange={(e) => setForm((c) => ({ ...c, lieu: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("moniteur.creneaux.notes")}</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" disabled={saving} onClick={() => setShowCreate(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? t("moniteur.creneaux.saving") : t("moniteur.creneaux.save")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Row>
  );
}
