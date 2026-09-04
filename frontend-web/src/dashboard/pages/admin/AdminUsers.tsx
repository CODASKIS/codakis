import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Eye, Plus, Trash2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import type { UserRole } from "../../../auth/types";
import { deleteAdminUser, fetchAdminUsers, type ApiUser } from "../../../lib/authApi";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import { useTablePagination } from "../../../hooks/useTablePagination";
import { getSession } from "../../../auth/authStore";
import ComponentCard from "../../common/ComponentCard";
import Pagination from "../../ui/Pagination";
import TableActions from "../../ui/TableActions";

const ROLES: UserRole[] = ["admin", "candidat", "moniteur", "gerant"];
const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  candidat: "Candidat",
  gerant: "Gérant",
  moniteur: "Moniteur",
};

function fullName(user: ApiUser) {
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

export default function AdminUsers() {
  const currentUserId = getSession()?.id;
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setUsers(await fetchAdminUsers());
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
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        fullName(u).toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const { paginatedItems, page, setPage, pageSize, total } = useTablePagination(filtered, {
    resetKey: `${search}|${roleFilter}`,
  });

  async function onDelete(user: ApiUser) {
    if (user.id === currentUserId) {
      setError("Impossible de supprimer votre propre compte.");
      return;
    }
    if (!window.confirm(`Supprimer ${fullName(user)} ?`)) return;
    setBusyId(user.id);
    setError("");
    try {
      await deleteAdminUser(user.id);
      setUsers((list) => list.filter((u) => u.id !== user.id));
      setMessage("Utilisateur supprimé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="ck-title">Utilisateurs</h2>
          <p className="ck-subtitle">{users.length} comptes plateforme</p>
        </div>
        <Link to="/espace/admin/utilisateurs/nouveau" className="ck-btn ck-btn--primary">
          <Plus size={16} strokeWidth={2.5} />
          Créer un compte
        </Link>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}
      {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}

      <ComponentCard title="Liste">
        <div className="ta-toolbar">
          <input
            className="ta-toolbar__search"
            type="search"
            placeholder="Rechercher nom, e-mail, téléphone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="ta-toolbar__select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            aria-label="Filtrer par rôle"
          >
            <option value="all">Tous les rôles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="ck-schools-table-wrap">
          <table className="ck-schools-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>École</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/espace/admin/utilisateurs/${user.id}`} className="ck-schools-person" style={{ textDecoration: "none", color: "inherit" }}>
                      <img src={getUserAvatarUrl(fullName(user), 36, user.avatar_url)} alt="" width={36} height={36} />
                      <div>
                        <strong>{fullName(user)}</strong>
                        <small>{user.email}</small>
                      </div>
                    </Link>
                  </td>
                  <td>{ROLE_LABEL[user.role]}</td>
                  <td>{user.phone || "—"}</td>
                  <td>
                    <span className={`ck-schools-pill${user.is_active ? " is-on" : ""}`}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td>{user.school_name || "—"}</td>
                  <td>
                    <TableActions
                      actions={[
                        {
                          label: "Voir",
                          icon: Eye,
                          to: `/espace/admin/utilisateurs/${user.id}`,
                          variant: "primary",
                        },
                        {
                          label: "Supprimer",
                          icon: Trash2,
                          variant: "danger",
                          disabled: busyId === user.id || user.id === currentUserId,
                          onClick: () => void onDelete(user),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="ck-empty">Aucun utilisateur.</p> : null}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </ComponentCard>
    </div>
  );
}
