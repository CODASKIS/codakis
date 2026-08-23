import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge, Button, Col, Form, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import { AuthApiError, fetchAllSchools, type AutoEcolePending, type SchoolStatus } from "../../../lib/authApi";

const STATUS_BADGE: Record<SchoolStatus, string> = {
  pending: "warning",
  validated: "success",
  rejected: "danger",
};

type StatusFilter = "all" | SchoolStatus;

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function AdminSchoolsPage() {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<AutoEcolePending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const loadSchools = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSchools(await fetchAllSchools());
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.schools.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSchools();
  }, [loadSchools]);

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLowerCase();
    return schools.filter((school) => {
      if (statusFilter !== "all" && school.status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [
        school.raison_sociale,
        school.gerant_name,
        school.gerant_email,
        school.numero_agrement,
        school.adresse,
        school.ville ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [schools, search, statusFilter]);

  const { paginatedItems, page, setPage, pageSize, total } = useTablePagination(filteredSchools, {
    resetKey: `${search}|${statusFilter}`,
  });

  return (
    <MainCard title={t("admin.schools.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <p className="text-muted mb-4">{t("admin.schools.subtitle")}</p>
      {error ? <p className="text-danger">{error}</p> : null}

      <Row className="g-3 mb-4">
        <Col md={6}>
          <Form.Control
            type="search"
            placeholder={t("admin.schools.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">{t("admin.schools.filterAll")}</option>
            <option value="pending">{t("admin.schools.status.pending")}</option>
            <option value="validated">{t("admin.schools.status.validated")}</option>
            <option value="rejected">{t("admin.schools.status.rejected")}</option>
          </Form.Select>
        </Col>
        <Col md={2} className="text-md-end">
          <Button variant="outline-secondary" onClick={() => void loadSchools()} disabled={loading}>
            {t("admin.schools.refresh")}
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : filteredSchools.length === 0 ? (
        <p>{t("admin.schools.empty")}</p>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>{t("admin.schools.columns.school")}</th>
                <th>{t("admin.schools.columns.manager")}</th>
                <th>{t("admin.schools.columns.status")}</th>
                <th>{t("admin.schools.columns.registered")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((school) => (
                <tr key={school.id}>
                  <td>
                    <Link to={`/admin/auto-ecoles/${school.id}`} className="fw-semibold text-decoration-none">
                      {school.raison_sociale}
                    </Link>
                    <div className="small text-muted">
                      {school.ville ? `${school.ville} · ` : ""}
                      {school.country_code}
                    </div>
                  </td>
                  <td>
                    <div>{school.gerant_name}</div>
                    <small className="text-muted">{school.gerant_email}</small>
                  </td>
                  <td>
                    <Badge bg={STATUS_BADGE[school.status]}>{t(`admin.schools.status.${school.status}`)}</Badge>
                  </td>
                  <td>{formatDate(school.created_at)}</td>
                  <td className="text-end">
                    <Link to={`/admin/auto-ecoles/${school.id}`} className="btn btn-outline-primary btn-sm">
                      {t("admin.schools.viewDetails")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      )}
    </MainCard>
  );
}
