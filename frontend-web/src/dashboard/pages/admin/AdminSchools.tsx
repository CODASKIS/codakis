import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Eye, RefreshCw } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { fetchAllSchools, type AutoEcolePending, type SchoolStatus } from "../../../lib/authApi";
import { useTablePagination } from "../../../hooks/useTablePagination";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/Button";
import Pagination from "../../ui/Pagination";
import TableActions from "../../ui/TableActions";

const STATUS_LABEL: Record<SchoolStatus, string> = {
  pending: "En attente",
  validated: "Validée",
  rejected: "Refusée",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR");
}

export default function AdminSchools() {
  const [schools, setSchools] = useState<AutoEcolePending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SchoolStatus>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setSchools(await fetchAllSchools());
  }, []);

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
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schools.filter((school) => {
      if (statusFilter !== "all" && school.status !== statusFilter) return false;
      if (!q) return true;
      return [
        school.raison_sociale,
        school.gerant_name,
        school.gerant_email,
        school.numero_agrement,
        school.adresse,
        school.ville ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [schools, search, statusFilter]);

  const { paginatedItems, page, setPage, pageSize, total } = useTablePagination(filtered, {
    resetKey: `${search}|${statusFilter}`,
  });

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="ck-title">Auto-écoles</h2>
          <p className="ck-subtitle">
            {schools.filter((s) => s.status === "pending").length} en attente · {schools.length} au total
          </p>
        </div>
        <Button variant="ghost" startIcon={<RefreshCw size={16} strokeWidth={2.5} />} onClick={() => void load()}>
          Actualiser
        </Button>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}

      <ComponentCard title="Annuaire">
        <div className="ta-toolbar">
          <input
            className="ta-toolbar__search"
            type="search"
            placeholder="Rechercher école, gérant, agrément…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="ta-toolbar__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="validated">Validées</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>

        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>École</th>
                <th>Gérant</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((school) => (
                <tr key={school.id}>
                  <td>
                    <Link
                      to={`/espace/admin/ecoles/${school.id}`}
                      className="ta-cell-stack"
                      style={{ textDecoration: "none", color: "inherit", display: "block" }}
                    >
                      <p className="ta-cell-stack__title">{school.raison_sociale}</p>
                      <p className="ta-cell-stack__sub">
                        {school.ville ? `${school.ville} · ` : ""}
                        {school.numero_agrement}
                      </p>
                    </Link>
                  </td>
                  <td>
                    <div className="ta-cell-stack">
                      <p className="ta-cell-stack__title">{school.gerant_name}</p>
                      <p className="ta-cell-stack__sub">{school.gerant_email}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`ck-schools-pill${school.status === "validated" ? " is-on" : ""}`}>
                      {STATUS_LABEL[school.status]}
                    </span>
                  </td>
                  <td>
                    <span className="ta-cell-stack__sub">{formatDate(school.created_at)}</span>
                  </td>
                  <td>
                    <TableActions
                      actions={[
                        {
                          label: "Voir",
                          icon: Eye,
                          to: `/espace/admin/ecoles/${school.id}`,
                          variant: "primary",
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="ck-empty">Aucune auto-école.</p> : null}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </ComponentCard>
    </div>
  );
}
