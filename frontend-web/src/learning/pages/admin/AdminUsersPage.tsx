import { useEffect, useMemo, useState } from "react";
import Loader from "../../../components/common/Loader";
import { fetchAdminUsers, type ApiUser } from "../../../lib/authApi";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";

export default function AdminUsersPage() {
  const [items, setItems] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | ApiUser["role"]>("all");

  useEffect(() => {
    let cancelled = false;
    void fetchAdminUsers()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Chargement impossible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((u) => u.role === filter)),
    [items, filter],
  );

  if (loading) return <Loader variant="page" />;

  return (
    <section className="ck-schools-panel">
      <div className="ck-schools-panel__head ck-schools-panel__head--row">
        <div>
          <h2>{items.length} utilisateurs</h2>
          <p>Comptes de la plateforme</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="ck-pro__select">
          <option value="all">Tous</option>
          <option value="candidat">Candidats</option>
          <option value="gerant">Gérants</option>
          <option value="moniteur">Moniteurs</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {error ? <p className="ck-empty">{error}</p> : null}
      <div className="ck-schools-table-wrap">
        <table className="ck-schools-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
              return (
                <tr key={user.id}>
                  <td>
                    <div className="ck-schools-person">
                      <img src={getUserAvatarUrl(name, 36, user.avatar_url)} alt="" width={36} height={36} />
                      <div>
                        <strong>{name}</strong>
                        <small>{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`ck-schools-pill${user.is_active ? " is-on" : ""}`}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length ? <p className="ck-empty">Aucun utilisateur.</p> : null}
      </div>
    </section>
  );
}
