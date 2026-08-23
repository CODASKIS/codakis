import { CreditCard, RefreshCw, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Col, Form, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import TablePagination from "../../../components/common/TablePagination";
import { useTablePagination } from "../../../hooks/useTablePagination";
import { AuthApiError } from "../../../lib/authApi";
import {
  fetchAdminPayments,
  fetchAdminPaymentStats,
  type AdminPaymentItem,
  type AdminPaymentStats,
} from "../../../lib/payment-api";

const STATUS_BADGE: Record<string, string> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
};

function formatFcfa(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPaymentsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-GB" : "fr-FR";
  const [stats, setStats] = useState<AdminPaymentStats | null>(null);
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, paymentsData] = await Promise.all([
        fetchAdminPaymentStats(),
        fetchAdminPayments({
          status: statusFilter === "all" ? undefined : statusFilter,
          purpose: purposeFilter === "all" ? undefined : purposeFilter,
          limit: 200,
        }),
      ]);
      setStats(statsData);
      setPayments(paymentsData);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("admin.payments.loadError"));
    } finally {
      setLoading(false);
    }
  }, [purposeFilter, statusFilter, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((item) =>
      [
        item.reference,
        item.payer_name,
        item.payer_email,
        item.school_name,
        item.message,
        item.receipt_number,
        item.phone,
      ]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(q)),
    );
  }, [payments, search]);

  const pagination = useTablePagination(filtered, { pageSize: 15 });

  if (loading && !stats) return <Loader />;

  return (
    <Row>
      <Col lg={12}>
        <MainCard title={t("admin.payments.title")} isOption={false} cardClass="codakis-admin-payments" optionClass="" CardBodyClass="">
          <p className="text-muted mb-4">{t("admin.payments.subtitle")}</p>
          {error ? <div className="alert alert-danger">{error}</div> : null}

          {stats ? (
            <Row className="g-3 mb-4">
              <Col md={6} xl={3}>
                <div className="codakis-admin-stat-card">
                  <Wallet size={22} strokeWidth={1.75} aria-hidden />
                  <div>
                    <span>{t("admin.payments.stats.volume")}</span>
                    <strong>{formatFcfa(stats.total_volume_fcfa, locale)} FCFA</strong>
                  </div>
                </div>
              </Col>
              <Col md={6} xl={3}>
                <div className="codakis-admin-stat-card">
                  <CreditCard size={22} strokeWidth={1.75} aria-hidden />
                  <div>
                    <span>{t("admin.payments.stats.completed")}</span>
                    <strong>{stats.completed_count}</strong>
                  </div>
                </div>
              </Col>
              <Col md={6} xl={3}>
                <div className="codakis-admin-stat-card is-warning">
                  <RefreshCw size={22} strokeWidth={1.75} aria-hidden />
                  <div>
                    <span>{t("admin.payments.stats.pending")}</span>
                    <strong>{stats.pending_count}</strong>
                  </div>
                </div>
              </Col>
              <Col md={6} xl={3}>
                <div className="codakis-admin-stat-card is-muted">
                  <CreditCard size={22} strokeWidth={1.75} aria-hidden />
                  <div>
                    <span>{t("admin.payments.stats.enrollments")}</span>
                    <strong>{stats.enrollment_count}</strong>
                  </div>
                </div>
              </Col>
            </Row>
          ) : null}

          <div className="codakis-admin-payments__filters">
            <Form.Control
              type="search"
              placeholder={t("admin.payments.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t("admin.payments.filterAllStatus")}</option>
              <option value="completed">{t("admin.payments.status.completed")}</option>
              <option value="pending">{t("admin.payments.status.pending")}</option>
              <option value="failed">{t("admin.payments.status.failed")}</option>
            </Form.Select>
            <Form.Select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)}>
              <option value="all">{t("admin.payments.filterAllPurpose")}</option>
              <option value="enrollment">{t("admin.payments.purpose.enrollment")}</option>
              <option value="subscription">{t("admin.payments.purpose.subscription")}</option>
            </Form.Select>
            <button type="button" className="codakis-schedule-toolbar__today" onClick={() => void load()}>
              {t("admin.payments.refresh")}
            </button>
          </div>

          <div className="table-responsive">
            <Table hover className="codakis-admin-payments__table mb-0">
              <thead>
                <tr>
                  <th>{t("admin.payments.columns.reference")}</th>
                  <th>{t("admin.payments.columns.payer")}</th>
                  <th>{t("admin.payments.columns.school")}</th>
                  <th>{t("admin.payments.columns.amount")}</th>
                  <th>{t("admin.payments.columns.channel")}</th>
                  <th>{t("admin.payments.columns.status")}</th>
                  <th>{t("admin.payments.columns.date")}</th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-muted text-center py-4">
                      {t("admin.payments.empty")}
                    </td>
                  </tr>
                ) : (
                  pagination.paginatedItems.map((item) => (
                    <tr key={item.reference}>
                      <td>
                        <code>{item.reference}</code>
                        {item.receipt_number ? (
                          <div className="small text-muted">{item.receipt_number}</div>
                        ) : null}
                      </td>
                      <td>
                        <div>{item.payer_name ?? "—"}</div>
                        <div className="small text-muted">{item.payer_email ?? item.phone}</div>
                      </td>
                      <td>{item.school_name ?? "—"}</td>
                      <td>{formatFcfa(item.amount_fcfa, locale)} FCFA</td>
                      <td>{item.channel}</td>
                      <td>
                        <Badge bg={STATUS_BADGE[item.status] ?? "secondary"}>
                          {t(`admin.payments.status.${item.status}`, { defaultValue: item.status })}
                        </Badge>
                      </td>
                      <td>{formatDate(item.completed_at ?? item.created_at, locale)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={filtered.length}
            onPageChange={pagination.setPage}
          />
        </MainCard>
      </Col>
    </Row>
  );
}
