import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import ConfirmModal from "../../../components/common/ConfirmModal";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import { getSession } from "../../../auth/authStore";
import type { UserRole } from "../../../auth/types";
import {
  AuthApiError,
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
  type ApiUser,
} from "../../../lib/authApi";

const ROLES: UserRole[] = ["admin", "candidat", "moniteur", "gerant"];

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "dark",
  candidat: "primary",
  moniteur: "warning",
  gerant: "success",
};

type CreateForm = {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone: string;
  password: string;
};

const EMPTY_FORM: CreateForm = {
  first_name: "",
  last_name: "",
  email: "",
  role: "candidat",
  phone: "",
  password: "",
};

function fullName(user: ApiUser): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const currentUserId = getSession()?.id;
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [confirmUser, setConfirmUser] = useState<ApiUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<"delete" | "toggle" | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await fetchAdminUsers());
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!query) return true;
      return (
        user.email.toLowerCase().includes(query) ||
        fullName(user).toLowerCase().includes(query) ||
        (user.phone ?? "").toLowerCase().includes(query)
      );
    });
  }, [users, search, roleFilter]);

  const { paginatedItems, page, setPage, pageSize, total } = useTablePagination(filteredUsers, {
    resetKey: `${search}|${roleFilter}`,
  });

  function openConfirm(action: "delete" | "toggle", user: ApiUser) {
    setConfirmUser(user);
    setConfirmAction(action);
  }

  function closeConfirm() {
    if (busyId) return;
    setConfirmUser(null);
    setConfirmAction(null);
  }

  async function handleToggleActive(user: ApiUser) {
    setBusyId(user.id);
    setError("");
    setSuccess("");
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active });
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.updateError"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user: ApiUser) {
    if (user.id === currentUserId) {
      setError(t("admin.users.deleteSelf"));
      return;
    }

    setBusyId(user.id);
    setError("");
    setSuccess("");
    try {
      await deleteAdminUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      closeConfirm();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.deleteError"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmAction() {
    if (!confirmUser || !confirmAction) return;
    if (confirmAction === "delete") {
      await handleDelete(confirmUser);
      return;
    }
    await handleToggleActive(confirmUser);
    closeConfirm();
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      const created = await createAdminUser({
        email: form.email.trim(),
        role: form.role,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || undefined,
        country_code: "CM",
        langue: "fr",
        password: form.password.trim() || undefined,
      });
      setUsers((current) => [created, ...current]);
      setSuccess(t("admin.users.createSuccess"));
      setForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.users.createError"));
    } finally {
      setCreating(false);
    }
  }

  function roleLabel(role: UserRole): string {
    return t(`auth.roles.${role}.title`);
  }

  return (
    <Row>
      <Col sm={12}>
        <MainCard title={t("admin.users.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <p className="text-muted mb-0">{t("admin.users.subtitle")}</p>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              {t("admin.users.create")}
            </Button>
          </div>

          {error ? <div className="alert alert-danger py-2">{error}</div> : null}
          {success ? <div className="alert alert-success py-2">{success}</div> : null}

          <div className="d-flex flex-wrap gap-3 mb-4">
            <Form.Control
              type="search"
              size="sm"
              className="flex-grow-1"
              style={{ maxWidth: "320px" }}
              placeholder={t("admin.users.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Form.Select
              size="sm"
              style={{ maxWidth: "200px" }}
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as UserRole | "all")}
            >
              <option value="all">{t("admin.users.filterAllRoles")}</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </Form.Select>
          </div>

          {loading ? (
            <Loader variant="inline" theme="flexjobs" message={t("common.loading")} />
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted mb-0">{t("admin.users.empty")}</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>{t("admin.users.columns.name")}</th>
                    <th>{t("admin.users.columns.email")}</th>
                    <th>{t("admin.users.columns.role")}</th>
                    <th>{t("admin.users.columns.phone")}</th>
                    <th>{t("admin.users.columns.status")}</th>
                    <th>{t("admin.users.columns.school")}</th>
                    <th className="text-end">{t("admin.users.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="fw-semibold">{fullName(user)}</div>
                        {user.id === currentUserId ? (
                          <small className="text-muted">({t("dashboard.user")})</small>
                        ) : null}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={ROLE_BADGE[user.role]}>{roleLabel(user.role)}</Badge>
                      </td>
                      <td>{user.phone || "—"}</td>
                      <td>
                        <Badge bg={user.is_active ? "success" : "secondary"}>
                          {user.is_active ? t("admin.users.statusActive") : t("admin.users.statusInactive")}
                        </Badge>
                      </td>
                      <td>
                        {user.role === "gerant" && user.school_name ? (
                          <div>
                            <div>{user.school_name}</div>
                            <small className={user.school_validated ? "text-success" : "text-warning"}>
                              {user.school_validated
                                ? t("admin.users.schoolValidated")
                                : t("admin.users.schoolPending")}
                            </small>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex flex-wrap gap-2 justify-content-end">
                          <Link to={`/admin/utilisateurs/${user.id}`} className="btn btn-outline-primary btn-sm">
                            {t("admin.users.viewDetails")}
                          </Link>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={busyId === user.id}
                            onClick={() => openConfirm("toggle", user)}
                          >
                            {user.is_active ? t("admin.users.deactivate") : t("admin.users.activate")}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            disabled={busyId === user.id || user.id === currentUserId}
                            onClick={() => openConfirm("delete", user)}
                          >
                            {t("admin.users.delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
            </div>
          )}
        </MainCard>
      </Col>

      <Modal show={showCreate} onHide={() => !creating && setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("admin.users.createTitle")}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={(event) => void handleCreate(event)}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.firstName")}</Form.Label>
                  <Form.Control
                    required
                    value={form.first_name}
                    onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.lastName")}</Form.Label>
                  <Form.Control
                    required
                    value={form.last_name}
                    onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.email")}</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.role")}</Form.Label>
                  <Form.Select
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, role: event.target.value as UserRole }))
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.phone")}</Form.Label>
                  <Form.Control
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("admin.users.fields.password")}</Form.Label>
                  <Form.Control
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  <Form.Text className="text-muted">{t("admin.users.fields.passwordHint")}</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" disabled={creating} onClick={() => setShowCreate(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? t("admin.users.creating") : t("admin.users.createSubmit")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(confirmUser && confirmAction)}
        title={
          confirmAction === "delete"
            ? t("admin.users.deleteTitle")
            : confirmUser?.is_active
              ? t("admin.users.deactivateTitle")
              : t("admin.users.activateTitle")
        }
        message={
          confirmAction === "delete"
            ? t("admin.users.deleteConfirm", { email: confirmUser?.email ?? "" })
            : confirmUser?.is_active
              ? t("admin.users.deactivateConfirm", { email: confirmUser.email })
              : t("admin.users.activateConfirm", { email: confirmUser?.email ?? "" })
        }
        variant={confirmAction === "delete" ? "danger" : confirmUser?.is_active ? "warning" : "success"}
        busy={Boolean(confirmUser && busyId === confirmUser.id)}
        onCancel={closeConfirm}
        onConfirm={() => void handleConfirmAction()}
      />
    </Row>
  );
}
