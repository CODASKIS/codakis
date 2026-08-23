import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, ProgressBar, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import {
  AuthApiError,
  fetchGerantCandidatConsort,
  fetchGerantMoniteurs,
  validateGerantConsortPiece,
  type ConsortDossier,
  type GerantMoniteur,
} from "../../../lib/authApi";
import {
  createGerantSeance,
  fetchGerantInscription,
  fetchGerantInscriptions,
  updateGerantSeance,
  type GerantInscription,
  type GerantInscriptionDetail,
  type SeancePratique,
} from "../../../lib/enrollmentsApi";
import {
  assignGerantCreneau,
  fetchGerantMoniteurCreneaux,
  formatWeekParam,
  getWeekStart,
  type Creneau,
} from "../../../lib/schedulingApi";

const PIECE_KEYS = ["id", "birth", "medical", "photos", "address", "stamps"] as const;

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function pieceStatusBadge(status: string): string {
  if (status === "validated") return "success";
  if (status === "pending") return "warning";
  return "secondary";
}

export default function GerantInscriptionsPage() {
  const { t } = useTranslation();
  const [inscriptions, setInscriptions] = useState<GerantInscription[]>([]);
  const [moniteurs, setMoniteurs] = useState<GerantMoniteur[]>([]);
  const [selected, setSelected] = useState<GerantInscriptionDetail | null>(null);
  const [consort, setConsort] = useState<ConsortDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [consortBusy, setConsortBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showSeance, setShowSeance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seanceMode, setSeanceMode] = useState<"direct" | "creneau">("creneau");
  const [availableCreneaux, setAvailableCreneaux] = useState<Creneau[]>([]);
  const [creneauxLoading, setCreneauxLoading] = useState(false);
  const [seanceForm, setSeanceForm] = useState({
    starts_at: "",
    moniteur_id: "",
    creneau_id: "",
    lieu: "",
    notes: "",
    duration_minutes: "60",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inscriptionsData, moniteursData] = await Promise.all([fetchGerantInscriptions(), fetchGerantMoniteurs()]);
      setInscriptions(inscriptionsData);
      setMoniteurs(moniteursData);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.inscriptions.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inscriptions;
    return inscriptions.filter(
      (item) =>
        item.candidat_name.toLowerCase().includes(q) ||
        item.candidat_email.toLowerCase().includes(q) ||
        item.forfait_label.toLowerCase().includes(q),
    );
  }, [inscriptions, search]);

  const pagination = useTablePagination(filtered, { pageSize: 10, resetKey: search });

  async function openDetail(item: GerantInscription) {
    setDetailLoading(true);
    setError("");
    setConsort(null);
    try {
      const [detail, dossier] = await Promise.all([
        fetchGerantInscription(item.id),
        fetchGerantCandidatConsort(item.candidat_id),
      ]);
      setSelected(detail);
      setConsort(dossier);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.inscriptions.loadError"));
    } finally {
      setDetailLoading(false);
    }
  }

  async function loadCreneauxForMoniteur(moniteurId: string) {
    if (!moniteurId) {
      setAvailableCreneaux([]);
      return;
    }
    setCreneauxLoading(true);
    try {
      const week = formatWeekParam(getWeekStart());
      setAvailableCreneaux(await fetchGerantMoniteurCreneaux(moniteurId, week));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.inscriptions.creneauxLoadError"));
      setAvailableCreneaux([]);
    } finally {
      setCreneauxLoading(false);
    }
  }

  async function handleCreateSeance(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      if (seanceMode === "creneau") {
        if (!seanceForm.creneau_id) {
          setError(t("gerant.inscriptions.creneauRequired"));
          return;
        }
        await assignGerantCreneau({
          inscription_id: selected.id,
          creneau_id: seanceForm.creneau_id,
        });
      } else {
        await createGerantSeance({
          inscription_id: selected.id,
          moniteur_id: seanceForm.moniteur_id || null,
          starts_at: new Date(seanceForm.starts_at).toISOString(),
          duration_minutes: Number(seanceForm.duration_minutes) || 60,
          lieu: seanceForm.lieu.trim() || undefined,
          notes: seanceForm.notes.trim() || undefined,
        });
      }
      setShowSeance(false);
      setSeanceForm({ starts_at: "", moniteur_id: "", creneau_id: "", lieu: "", notes: "", duration_minutes: "60" });
      setAvailableCreneaux([]);
      setSuccess(t("gerant.inscriptions.seanceCreated"));
      setSelected(await fetchGerantInscription(selected.id));
      await load();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.inscriptions.seanceError"));
    } finally {
      setSaving(false);
    }
  }

  async function assignMoniteur(seance: SeancePratique, moniteurId: string) {
    if (!selected) return;
    setSaving(true);
    try {
      await updateGerantSeance(seance.id, { moniteur_id: moniteurId || null });
      setSelected(await fetchGerantInscription(selected.id));
      setSuccess(t("gerant.inscriptions.assignSuccess"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.inscriptions.seanceError"));
    } finally {
      setSaving(false);
    }
  }

  async function updateSeanceStatus(seance: SeancePratique, statut: string) {
    if (!selected) return;
    setSaving(true);
    try {
      await updateGerantSeance(seance.id, { statut });
      setSelected(await fetchGerantInscription(selected.id));
      await load();
      setSuccess(t("gerant.inscriptions.seanceUpdated"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.inscriptions.seanceError"));
    } finally {
      setSaving(false);
    }
  }

  async function validatePiece(pieceKey: string) {
    if (!selected) return;
    setConsortBusy(pieceKey);
    setError("");
    try {
      setConsort(await validateGerantConsortPiece(selected.candidat_id, pieceKey));
      setSuccess(t("gerant.inscriptions.consortValidated"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.inscriptions.consortError"));
    } finally {
      setConsortBusy(null);
    }
  }

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("gerant.inscriptions.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("gerant.inscriptions.subtitle")}</p>
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert> : null}

          <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
            <Form.Control
              type="search"
              placeholder={t("gerant.inscriptions.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 320 }}
            />
            <Button variant="outline-secondary" size="sm" onClick={() => void load()}>{t("gerant.inscriptions.refresh")}</Button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>{t("gerant.inscriptions.colCandidate")}</th>
                    <th>{t("gerant.inscriptions.colForfait")}</th>
                    <th>{t("gerant.inscriptions.colHours")}</th>
                    <th>{t("gerant.inscriptions.colSeances")}</th>
                    <th>{t("gerant.inscriptions.colDate")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pagination.paginatedItems.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">{t("gerant.inscriptions.empty")}</td></tr>
                  ) : (
                    pagination.paginatedItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold">{item.candidat_name}</div>
                          <div className="small text-muted">{item.candidat_email}</div>
                        </td>
                        <td>{item.forfait_label}</td>
                        <td>{item.heures_conduite_restantes}/{item.heures_conduite_total} h</td>
                        <td>{item.seances_count}</td>
                        <td>{new Date(item.enrolled_at).toLocaleDateString()}</td>
                        <td className="text-end">
                          <Button variant="outline-primary" size="sm" onClick={() => void openDetail(item)}>
                            {t("gerant.inscriptions.viewDetail")}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              <TablePagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onPageChange={pagination.setPage} />
            </>
          )}
        </MainCard>
      </Col>

      <Modal show={Boolean(selected)} onHide={() => { setSelected(null); setConsort(null); }} size="lg" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{selected?.candidat_name ?? t("gerant.inscriptions.detailTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? <Loader /> : selected ? (
            <>
              <Row className="g-3 mb-4">
                <Col md={6}><strong>{t("dashboard.profile.email")}:</strong> {selected.candidat_email}</Col>
                <Col md={6}><strong>{t("dashboard.profile.phone")}:</strong> {selected.candidat_phone ?? "—"}</Col>
                <Col md={6}><strong>{t("gerant.inscriptions.colForfait")}:</strong> {selected.forfait_label}</Col>
                <Col md={6}><strong>{t("gerant.inscriptions.colHours")}:</strong> {selected.heures_conduite_restantes}/{selected.heures_conduite_total} h</Col>
              </Row>

              {consort ? (
                <div className="mb-4 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{t("gerant.inscriptions.consortTitle")}</h6>
                    <Badge bg="primary">{consort.progress_percent}%</Badge>
                  </div>
                  <ProgressBar now={consort.progress_percent} className="mb-3" />
                  <Table size="sm" className="mb-0">
                    <tbody>
                      {PIECE_KEYS.map((key) => {
                        const piece = consort.pieces.find((item) => item.key === key);
                        const status = piece?.status ?? "missing";
                        return (
                          <tr key={key}>
                            <td>{t(`consort.pieces.${key}.title`)}</td>
                            <td><Badge bg={pieceStatusBadge(status)}>{t(`dashboard.consort.status.${status}`)}</Badge></td>
                            <td className="text-end">
                              {status === "pending" ? (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  disabled={consortBusy === key}
                                  onClick={() => void validatePiece(key)}
                                >
                                  {t("gerant.inscriptions.consortValidate")}
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : null}

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">{t("gerant.inscriptions.seancesTitle")}</h6>
                <Button size="sm" variant="primary" onClick={() => setShowSeance(true)}>{t("gerant.inscriptions.addSeance")}</Button>
              </div>

              {selected.seances.length === 0 ? (
                <p className="text-muted">{t("gerant.inscriptions.noSeances")}</p>
              ) : (
                <Table size="sm" hover className="align-middle">
                  <thead>
                    <tr>
                      <th>{t("gerant.inscriptions.colWhen")}</th>
                      <th>{t("gerant.inscriptions.colMoniteur")}</th>
                      <th>{t("gerant.inscriptions.colLieu")}</th>
                      <th>{t("gerant.inscriptions.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.seances.map((seance) => (
                      <tr key={seance.id}>
                        <td>{formatDateTime(seance.starts_at)}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={seance.moniteur_id ?? ""}
                            disabled={saving}
                            onChange={(e) => void assignMoniteur(seance, e.target.value)}
                          >
                            <option value="">{t("gerant.inscriptions.unassigned")}</option>
                            {moniteurs.map((m) => (
                              <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>{seance.lieu ?? "—"}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={seance.statut}
                            disabled={saving}
                            onChange={(e) => void updateSeanceStatus(seance, e.target.value)}
                          >
                            <option value="planifiee">{t("gerant.inscriptions.statusPlanned")}</option>
                            <option value="confirmee">{t("gerant.inscriptions.statusConfirmed")}</option>
                            <option value="terminee">{t("gerant.inscriptions.statusDone")}</option>
                            <option value="annulee">{t("gerant.inscriptions.statusCancelled")}</option>
                          </Form.Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          ) : null}
        </Modal.Body>
      </Modal>

      <Modal show={showSeance} onHide={() => !saving && setShowSeance(false)} centered>
        <Modal.Header closeButton><Modal.Title>{t("gerant.inscriptions.addSeance")}</Modal.Title></Modal.Header>
        <Form onSubmit={(e) => void handleCreateSeance(e)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t("gerant.inscriptions.seanceMode")}</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  id="seance-mode-creneau"
                  name="seanceMode"
                  label={t("gerant.inscriptions.modeCreneau")}
                  checked={seanceMode === "creneau"}
                  onChange={() => setSeanceMode("creneau")}
                />
                <Form.Check
                  type="radio"
                  id="seance-mode-direct"
                  name="seanceMode"
                  label={t("gerant.inscriptions.modeDirect")}
                  checked={seanceMode === "direct"}
                  onChange={() => setSeanceMode("direct")}
                />
              </div>
            </Form.Group>

            {seanceMode === "creneau" ? (
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t("gerant.inscriptions.colMoniteur")}</Form.Label>
                    <Form.Select
                      required
                      value={seanceForm.moniteur_id}
                      onChange={(e) => {
                        const moniteurId = e.target.value;
                        setSeanceForm((c) => ({ ...c, moniteur_id: moniteurId, creneau_id: "" }));
                        void loadCreneauxForMoniteur(moniteurId);
                      }}
                    >
                      <option value="">{t("gerant.inscriptions.selectMoniteur")}</option>
                      {moniteurs.map((m) => (
                        <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t("gerant.inscriptions.selectCreneau")}</Form.Label>
                    {creneauxLoading ? (
                      <p className="text-muted small mb-0">{t("gerant.inscriptions.creneauxLoading")}</p>
                    ) : (
                      <Form.Select
                        required
                        value={seanceForm.creneau_id}
                        disabled={!seanceForm.moniteur_id || availableCreneaux.length === 0}
                        onChange={(e) => setSeanceForm((c) => ({ ...c, creneau_id: e.target.value }))}
                      >
                        <option value="">
                          {availableCreneaux.length === 0
                            ? t("gerant.inscriptions.noCreneaux")
                            : t("gerant.inscriptions.pickCreneau")}
                        </option>
                        {availableCreneaux.map((c) => (
                          <option key={c.id} value={c.id}>
                            {new Date(c.starts_at).toLocaleString()} — {c.places_libres} {t("gerant.inscriptions.placesLeft")} ({c.lieu ?? "—"})
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            ) : (
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t("gerant.inscriptions.colWhen")}</Form.Label>
                    <Form.Control type="datetime-local" required value={seanceForm.starts_at} onChange={(e) => setSeanceForm((c) => ({ ...c, starts_at: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("gerant.inscriptions.duration")}</Form.Label>
                    <Form.Control type="number" min={30} max={180} step={15} value={seanceForm.duration_minutes} onChange={(e) => setSeanceForm((c) => ({ ...c, duration_minutes: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t("gerant.inscriptions.colMoniteur")}</Form.Label>
                    <Form.Select value={seanceForm.moniteur_id} onChange={(e) => setSeanceForm((c) => ({ ...c, moniteur_id: e.target.value }))}>
                      <option value="">{t("gerant.inscriptions.unassigned")}</option>
                      {moniteurs.map((m) => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t("gerant.inscriptions.lieu")}</Form.Label>
                    <Form.Control value={seanceForm.lieu} onChange={(e) => setSeanceForm((c) => ({ ...c, lieu: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t("gerant.inscriptions.notes")}</Form.Label>
                    <Form.Control as="textarea" rows={2} value={seanceForm.notes} onChange={(e) => setSeanceForm((c) => ({ ...c, notes: e.target.value }))} />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" disabled={saving} onClick={() => setShowSeance(false)}>{t("common.cancel")}</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? t("gerant.inscriptions.saving") : t("gerant.inscriptions.saveSeance")}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Row>
  );
}
