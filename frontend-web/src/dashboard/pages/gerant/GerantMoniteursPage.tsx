import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, InputGroup, Modal, Row, Table } from "react-bootstrap";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import UserAvatar from "../../../components/common/UserAvatar";
import { useTablePagination } from "../../../hooks/useTablePagination";
import {
  AuthApiError,
  createGerantMoniteur,
  fetchGerantMoniteurs,
  fetchGerantSchool,
  resetGerantMoniteurPassword,
  type GerantMoniteur,
  type GerantSchool,
} from "../../../lib/authApi";
import { updateGerantMoniteurLimits } from "../../../lib/schedulingApi";

type InviteForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

const EMPTY_FORM: InviteForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
};

function fullName(item: GerantMoniteur): string {
  return `${item.first_name} ${item.last_name}`.trim();
}

export default function GerantMoniteursPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [school, setSchool] = useState<GerantSchool | null>(null);
  const [moniteurs, setMoniteurs] = useState<GerantMoniteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState<InviteForm>(EMPTY_FORM);
  const [selected, setSelected] = useState<GerantMoniteur | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [limitsForm, setLimitsForm] = useState({ max_seances_semaine: "12", capacite_creneau: "2" });
  const [savingLimits, setSavingLimits] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [schoolData, moniteursData] = await Promise.all([fetchGerantSchool(), fetchGerantMoniteurs()]);
      setSchool(schoolData);
      setMoniteurs(moniteursData);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.moniteurs.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const moniteurId = searchParams.get("moniteur");
    if (!moniteurId || moniteurs.length === 0) return;
    const match = moniteurs.find((item) => item.id === moniteurId);
    if (match) {
      setSelected(match);
      setTempPassword(null);
      setLimitsForm({
        max_seances_semaine: String(match.max_seances_semaine ?? 12),
        capacite_creneau: String(match.capacite_creneau ?? 2),
      });
    }
  }, [moniteurs, searchParams]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return moniteurs;
    return moniteurs.filter(
      (item) =>
        fullName(item).toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        (item.phone ?? "").toLowerCase().includes(query),
    );
  }, [moniteurs, search]);

  const pagination = useTablePagination(filtered, { pageSize: 10, resetKey: search });

  function openDetail(item: GerantMoniteur) {
    setSelected(item);
    setTempPassword(null);
    setCopied(false);
    setLimitsForm({
      max_seances_semaine: String(item.max_seances_semaine ?? 12),
      capacite_creneau: String(item.capacite_creneau ?? 2),
    });
    setSearchParams({ moniteur: item.id });
  }

  function closeDetail() {
    setSelected(null);
    setTempPassword(null);
    setCopied(false);
    if (searchParams.has("moniteur")) {
      searchParams.delete("moniteur");
      setSearchParams(searchParams);
    }
  }

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setInviting(true);
    setError("");
    setSuccess("");
    try {
      const created = await createGerantMoniteur({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });
      setShowInvite(false);
      setForm(EMPTY_FORM);
      setSuccess(t("gerant.moniteurs.inviteSuccess"));
      await load();
      setSelected(created);
      setTempPassword(created.temp_password);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.moniteurs.inviteError"));
    } finally {
      setInviting(false);
    }
  }

  async function handleResetPassword() {
    if (!selected) return;
    setResetting(true);
    setError("");
    setSuccess("");
    try {
      const result = await resetGerantMoniteurPassword(selected.id);
      setTempPassword(result.temp_password);
      setSuccess(t("gerant.moniteurs.resetSuccess"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.moniteurs.resetError"));
    } finally {
      setResetting(false);
    }
  }

  async function copyPassword() {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function handleSaveLimits(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSavingLimits(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateGerantMoniteurLimits(selected.id, {
        max_seances_semaine: Number(limitsForm.max_seances_semaine) || 12,
        capacite_creneau: Number(limitsForm.capacite_creneau) || 2,
      });
      setMoniteurs((current) =>
        current.map((item) =>
          item.id === selected.id
            ? { ...item, max_seances_semaine: updated.max_seances_semaine, capacite_creneau: updated.capacite_creneau }
            : item,
        ),
      );
      setSelected((current) =>
        current ? { ...current, max_seances_semaine: updated.max_seances_semaine, capacite_creneau: updated.capacite_creneau } : current,
      );
      setSuccess(t("gerant.moniteurs.limitsSaved"));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.moniteurs.limitsError"));
    } finally {
      setSavingLimits(false);
    }
  }

  const canInvite = school?.est_validee && !school?.est_refusee;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("gerant.moniteurs.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("gerant.moniteurs.subtitle")}</p>

          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          {!canInvite && school && !loading ? (
            <Alert variant="warning">{t("gerant.moniteurs.schoolNotValidated")}</Alert>
          ) : null}

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <Form.Control
              type="search"
              placeholder={t("gerant.moniteurs.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ maxWidth: 320 }}
            />
            <Button variant="primary" disabled={!canInvite} onClick={() => setShowInvite(true)}>
              {t("gerant.moniteurs.inviteCta")}
            </Button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 56 }} />
                    <th>{t("gerant.moniteurs.colName")}</th>
                    <th>{t("gerant.moniteurs.colEmail")}</th>
                    <th>{t("gerant.moniteurs.colPhone")}</th>
                    <th>{t("gerant.moniteurs.colStatus")}</th>
                    <th>{t("gerant.moniteurs.colSince")}</th>
                    <th>{t("gerant.moniteurs.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-muted text-center py-4">
                        {t("gerant.moniteurs.empty")}
                      </td>
                    </tr>
                  ) : (
                    pagination.paginatedItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <UserAvatar name={fullName(item)} photoUrl={item.avatar_url} sizeClass="h-12 w-12" textClass="text-sm" />
                        </td>
                        <td className="fw-semibold">{fullName(item)}</td>
                        <td>{item.email}</td>
                        <td>{item.phone ?? "—"}</td>
                        <td>
                          <Badge bg={item.is_active ? "success" : "secondary"}>
                            {item.is_active ? t("gerant.moniteurs.statusActive") : t("gerant.moniteurs.statusInactive")}
                          </Badge>
                        </td>
                        <td>{new Date(item.linked_at).toLocaleDateString()}</td>
                        <td>
                          <Button variant="link" size="sm" className="p-0" onClick={() => openDetail(item)}>
                            {t("gerant.moniteurs.viewDetail")}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              <TablePagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={pagination.setPage}
              />
            </>
          )}
        </MainCard>
      </Col>

      <Modal show={showInvite} onHide={() => !inviting && setShowInvite(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("gerant.moniteurs.inviteTitle")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(event) => void handleInvite(event)}>
          <Modal.Body>
            <p className="text-muted small">{t("gerant.moniteurs.inviteHint")}</p>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("dashboard.profile.firstName")}</Form.Label>
                  <Form.Control
                    required
                    value={form.first_name}
                    onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("dashboard.profile.lastName")}</Form.Label>
                  <Form.Control
                    required
                    value={form.last_name}
                    onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("dashboard.profile.email")}</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("dashboard.profile.phone")}</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" disabled={inviting} onClick={() => setShowInvite(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={inviting}>
              {inviting ? t("gerant.moniteurs.inviting") : t("gerant.moniteurs.sendInvite")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(selected)} onHide={closeDetail} centered>
        {selected ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{t("gerant.moniteurs.detailTitle")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex align-items-center gap-3 mb-4">
                <UserAvatar name={fullName(selected)} photoUrl={selected.avatar_url} sizeClass="h-16 w-16" />
                <div>
                  <h5 className="mb-1">{fullName(selected)}</h5>
                  <div className="text-muted small">{selected.email}</div>
                </div>
              </div>
              <p className="text-muted small">{t("gerant.moniteurs.detailHint")}</p>
              <dl className="row mb-4">
                <dt className="col-sm-4">{t("gerant.moniteurs.colPhone")}</dt>
                <dd className="col-sm-8">{selected.phone ?? "—"}</dd>
                <dt className="col-sm-4">{t("gerant.moniteurs.colStatus")}</dt>
                <dd className="col-sm-8">
                  <Badge bg={selected.is_active ? "success" : "secondary"}>
                    {selected.is_active ? t("gerant.moniteurs.statusActive") : t("gerant.moniteurs.statusInactive")}
                  </Badge>
                </dd>
                <dt className="col-sm-4">{t("gerant.moniteurs.colSince")}</dt>
                <dd className="col-sm-8">{new Date(selected.linked_at).toLocaleString()}</dd>
              </dl>

              <div className="mb-4 p-3 border rounded">
                <h6 className="mb-3">{t("gerant.moniteurs.limitsTitle")}</h6>
                <p className="text-muted small">{t("gerant.moniteurs.limitsHint")}</p>
                <Form onSubmit={(event) => void handleSaveLimits(event)}>
                  <Row className="g-3 align-items-end">
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label>{t("gerant.moniteurs.maxSeancesWeek")}</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          max={40}
                          required
                          value={limitsForm.max_seances_semaine}
                          onChange={(event) =>
                            setLimitsForm((current) => ({ ...current, max_seances_semaine: event.target.value }))
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label>{t("gerant.moniteurs.slotCapacity")}</Form.Label>
                        <Form.Select
                          value={limitsForm.capacite_creneau}
                          onChange={(event) =>
                            setLimitsForm((current) => ({ ...current, capacite_creneau: event.target.value }))
                          }
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col sm={12}>
                      <Button type="submit" variant="outline-primary" size="sm" disabled={savingLimits}>
                        {savingLimits ? t("gerant.moniteurs.savingLimits") : t("gerant.moniteurs.saveLimits")}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>

              {tempPassword ? (
                <Alert variant="warning">
                  <strong>{t("gerant.moniteurs.tempPassword")}</strong>
                  <InputGroup className="mt-2">
                    <Form.Control readOnly value={tempPassword} className="font-monospace" />
                    <Button variant="outline-secondary" onClick={() => void copyPassword()}>
                      {copied ? t("gerant.moniteurs.copied") : t("gerant.moniteurs.copyPassword")}
                    </Button>
                  </InputGroup>
                  <small className="d-block mt-2">{t("gerant.moniteurs.tempPasswordHint")}</small>
                </Alert>
              ) : (
                <Alert variant="info" className="small mb-3">
                  {selected.has_password ? t("gerant.moniteurs.passwordNotStored") : t("gerant.moniteurs.noPassword")}
                </Alert>
              )}

              {selected.has_password ? (
                <Button variant="outline-primary" disabled={resetting} onClick={() => void handleResetPassword()}>
                  {resetting ? t("gerant.moniteurs.resetting") : t("gerant.moniteurs.resetPassword")}
                </Button>
              ) : null}
            </Modal.Body>
          </>
        ) : null}
      </Modal>
    </Row>
  );
}
