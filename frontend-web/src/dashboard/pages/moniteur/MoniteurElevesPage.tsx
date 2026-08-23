import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Col, Form, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import UserAvatar from "../../../components/common/UserAvatar";
import { AuthApiError, fetchMoniteurEleves, type MoniteurEleve } from "../../../lib/schedulingApi";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function MoniteurElevesPage() {
  const { t } = useTranslation();
  const [eleves, setEleves] = useState<MoniteurEleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEleves(await fetchMoniteurEleves());
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("moniteur.eleves.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eleves;
    return eleves.filter(
      (item) =>
        item.candidat_name.toLowerCase().includes(q) ||
        item.candidat_email.toLowerCase().includes(q) ||
        item.forfait_label.toLowerCase().includes(q),
    );
  }, [eleves, search]);

  const pagination = useTablePagination(filtered, { pageSize: 10, resetKey: search });

  if (loading) return <Loader />;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("moniteur.eleves.title")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("moniteur.eleves.subtitle")}</p>
          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Form.Control
            type="search"
            placeholder={t("moniteur.eleves.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
            style={{ maxWidth: 320 }}
          />

          {filtered.length === 0 ? (
            <Alert variant="light" className="border">{t("moniteur.eleves.empty")}</Alert>
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: 56 }} />
                    <th>{t("moniteur.eleves.colCandidate")}</th>
                    <th>{t("moniteur.eleves.colForfait")}</th>
                    <th>{t("moniteur.eleves.colHours")}</th>
                    <th>{t("moniteur.eleves.colSeances")}</th>
                    <th>{t("moniteur.eleves.colNext")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.paginatedItems.map((item) => (
                    <tr key={item.candidat_id}>
                      <td>
                        <UserAvatar name={item.candidat_name} sizeClass="h-10 w-10" textClass="text-sm" />
                      </td>
                      <td>
                        <div className="fw-semibold">{item.candidat_name}</div>
                        <div className="text-muted">{item.candidat_email}</div>
                        {item.candidat_phone ? <div className="text-muted">{item.candidat_phone}</div> : null}
                      </td>
                      <td>{item.forfait_label}</td>
                      <td>
                        <Badge bg={item.heures_restantes > 0 ? "primary" : "secondary"}>
                          {item.heures_restantes}/{item.heures_total} h
                        </Badge>
                      </td>
                      <td>{item.seances_count}</td>
                      <td>{formatDateTime(item.next_seance_at)}</td>
                    </tr>
                  ))}
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
    </Row>
  );
}
