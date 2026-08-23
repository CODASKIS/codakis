import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import {
  AuthApiError,
  createGerantForfait,
  deleteGerantForfait,
  fetchGerantForfaits,
  updateGerantForfait,
  type GerantForfait,
  type SchoolForfaitType,
} from "../../../lib/enrollmentsApi";

type ForfaitForm = {
  type: SchoolForfaitType;
  label_fr: string;
  label_en: string;
  prix: string;
  heures_conduite: string;
  description_fr: string;
  description_en: string;
  est_actif: boolean;
};

const EMPTY_FORM: ForfaitForm = {
  type: "code_seul",
  label_fr: "",
  label_en: "",
  prix: "",
  heures_conduite: "",
  description_fr: "",
  description_en: "",
  est_actif: true,
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function typeLabel(type: string, t: (key: string) => string): string {
  if (type === "code_seul") return t("gerant.forfaits.typeCode");
  if (type === "conduite_seule") return t("gerant.forfaits.typeConduite");
  return t("gerant.forfaits.typeComplet");
}

export default function GerantForfaitsPage() {
  const { t } = useTranslation();
  const [forfaits, setForfaits] = useState<GerantForfait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<GerantForfait | null>(null);
  const [form, setForm] = useState<ForfaitForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setForfaits(await fetchGerantForfaits());
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.forfaits.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return forfaits;
    return forfaits.filter(
      (item) =>
        item.label_fr.toLowerCase().includes(q) ||
        item.label_en.toLowerCase().includes(q) ||
        typeLabel(item.type, t).toLowerCase().includes(q),
    );
  }, [forfaits, search, t]);

  const pagination = useTablePagination(filtered, { pageSize: 10, resetKey: search });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(item: GerantForfait) {
    setEditing(item);
    setForm({
      type: item.type as SchoolForfaitType,
      label_fr: item.label_fr,
      label_en: item.label_en,
      prix: String(item.prix),
      heures_conduite: item.heures_conduite != null ? String(item.heures_conduite) : "",
      description_fr: item.description_fr ?? "",
      description_en: item.description_en ?? "",
      est_actif: item.est_actif,
    });
    setShowModal(true);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      type: form.type,
      label_fr: form.label_fr.trim(),
      label_en: form.label_en.trim(),
      prix: Number(form.prix),
      heures_conduite: form.heures_conduite.trim() ? Number(form.heures_conduite) : null,
      description_fr: form.description_fr.trim() || undefined,
      description_en: form.description_en.trim() || undefined,
      est_actif: form.est_actif,
    };
    try {
      if (editing) {
        await updateGerantForfait(editing.id, payload);
        setSuccess(t("gerant.forfaits.updateSuccess"));
      } else {
        await createGerantForfait(payload);
        setSuccess(t("gerant.forfaits.createSuccess"));
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.forfaits.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(item: GerantForfait) {
    if (!window.confirm(t("gerant.forfaits.deactivateConfirm"))) return;
    setError("");
    setSuccess("");
    try {
      await deleteGerantForfait(item.id);
      setSuccess(t("gerant.forfaits.deactivateSuccess"));
      await load();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("gerant.forfaits.saveError"));
    }
  }

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("gerant.forfaits.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("gerant.forfaits.subtitle")}</p>

          {error ? <Alert variant="danger">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <Form.Control
              type="search"
              placeholder={t("gerant.forfaits.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ maxWidth: 320 }}
            />
            <Button variant="primary" onClick={openCreate}>
              {t("gerant.forfaits.createCta")}
            </Button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>{t("gerant.forfaits.colType")}</th>
                    <th>{t("gerant.forfaits.colLabel")}</th>
                    <th>{t("gerant.forfaits.colPrice")}</th>
                    <th>{t("gerant.forfaits.colHours")}</th>
                    <th>{t("gerant.forfaits.colStatus")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pagination.paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-muted text-center py-4">
                        {t("gerant.forfaits.empty")}
                      </td>
                    </tr>
                  ) : (
                    pagination.paginatedItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Badge bg="light" text="dark">
                            {typeLabel(item.type, t)}
                          </Badge>
                        </td>
                        <td className="fw-semibold">{item.label_fr}</td>
                        <td>{formatPrice(item.prix)} FCFA</td>
                        <td>{item.heures_conduite ?? "—"}</td>
                        <td>
                          <Badge bg={item.est_actif ? "success" : "secondary"}>
                            {item.est_actif ? t("gerant.forfaits.statusActive") : t("gerant.forfaits.statusInactive")}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button variant="link" size="sm" className="p-0 me-3" onClick={() => openEdit(item)}>
                            {t("common.edit")}
                          </Button>
                          {item.est_actif ? (
                            <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => void handleDeactivate(item)}>
                              {t("gerant.forfaits.deactivate")}
                            </Button>
                          ) : null}
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

      <Modal show={showModal} onHide={() => !saving && setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? t("gerant.forfaits.editTitle") : t("gerant.forfaits.createTitle")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(event) => void handleSave(event)}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("gerant.forfaits.colType")}</Form.Label>
                  <Form.Select
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as SchoolForfaitType }))}
                  >
                    <option value="code_seul">{t("gerant.forfaits.typeCode")}</option>
                    <option value="conduite_seule">{t("gerant.forfaits.typeConduite")}</option>
                    <option value="complet">{t("gerant.forfaits.typeComplet")}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("gerant.forfaits.colPrice")}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    required
                    value={form.prix}
                    onChange={(event) => setForm((current) => ({ ...current, prix: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("gerant.forfaits.labelFr")}</Form.Label>
                  <Form.Control
                    required
                    value={form.label_fr}
                    onChange={(event) => setForm((current) => ({ ...current, label_fr: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("gerant.forfaits.labelEn")}</Form.Label>
                  <Form.Control
                    required
                    value={form.label_en}
                    onChange={(event) => setForm((current) => ({ ...current, label_en: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("gerant.forfaits.colHours")}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.heures_conduite}
                    onChange={(event) => setForm((current) => ({ ...current, heures_conduite: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  id="forfait-actif"
                  label={t("gerant.forfaits.statusActive")}
                  checked={form.est_actif}
                  onChange={(event) => setForm((current) => ({ ...current, est_actif: event.target.checked }))}
                />
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("gerant.forfaits.descriptionFr")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.description_fr}
                    onChange={(event) => setForm((current) => ({ ...current, description_fr: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("gerant.forfaits.descriptionEn")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.description_en}
                    onChange={(event) => setForm((current) => ({ ...current, description_en: event.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" disabled={saving} onClick={() => setShowModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? t("gerant.forfaits.saving") : t("common.save")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Row>
  );
}
