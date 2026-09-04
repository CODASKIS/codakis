import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import { getUserAvatarUrl } from "../../../lib/uiAvatars";
import { fetchMoniteurSeances, type MoniteurSeance } from "../../../lib/enrollmentsApi";
import ComponentCard from "../../common/ComponentCard";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import SeanceDetailModal from "./SeanceDetailModal";
import { formatDateTime, groupStudents, statusBadgeColor, type StudentGroup } from "./moniteurUtils";

export default function MoniteurEleves() {
  const [items, setItems] = useState<MoniteurSeance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<StudentGroup | null>(null);
  const [selectedSeance, setSelectedSeance] = useState<MoniteurSeance | null>(null);
  const [confirmOnly, setConfirmOnly] = useState(false);

  async function load() {
    setItems(await fetchMoniteurSeances());
  }

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
  }, []);

  const students = useMemo(() => groupStudents(items), [items]);
  const studentId = student?.id;
  const activeStudent = useMemo(
    () => (studentId ? students.find((s) => s.id === studentId) ?? null : null),
    [students, studentId],
  );

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ta-page-title">Élèves</h2>
        <p className="ta-page-sub">{students.length} élèves suivis · séances qui vous sont assignées</p>
      </div>

      {error ? <p className="text-sm text-error-500">{error}</p> : null}

      <ComponentCard title="Liste des élèves">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="px-3 py-3 font-medium">Élève</th>
                <th className="px-3 py-3 font-medium">Téléphone</th>
                <th className="px-3 py-3 font-medium">Séances</th>
                <th className="px-3 py-3 font-medium">Prochaine</th>
                <th className="px-3 py-3 font-medium">Progression</th>
              </tr>
            </thead>
            <tbody>
              {students.map((row) => {
                const upcoming =
                  row.seances
                    .filter((s) => s.statut !== "terminee")
                    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0] ?? null;
                const done = row.seances.filter((s) => s.statut === "terminee").length;
                const total = row.seances.length;
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-gray-50 hover:bg-brand-25"
                    onClick={() => setStudent(row)}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getUserAvatarUrl(row.name, 36)}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full"
                        />
                        <strong className="text-gray-800">{row.name}</strong>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{row.phone || "—"}</td>
                    <td className="px-3 py-3 text-gray-600">{total}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {upcoming ? formatDateTime(upcoming.starts_at) : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-gray-700">
                        {done === total && total ? (
                          <CheckCircle2 size={14} className="text-success-500" />
                        ) : done ? (
                          <Clock3 size={14} className="text-warning-500" />
                        ) : (
                          <Circle size={14} className="text-gray-400" />
                        )}
                        {done}/{total}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!students.length ? <p className="px-3 py-6 text-sm text-gray-500">Aucun élève assigné pour le moment.</p> : null}
        </div>
      </ComponentCard>

      <Modal isOpen={Boolean(activeStudent)} onClose={() => setStudent(null)} className="max-w-xl">
        {activeStudent ? (
          <div className="p-6 pt-8 sm:p-8">
            <div className="flex items-center gap-4 pr-8">
              <img
                src={getUserAvatarUrl(activeStudent.name, 64)}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{activeStudent.name}</h2>
                <p className="text-sm text-gray-500">{activeStudent.phone || "Sans téléphone"}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Séances</h3>
              {activeStudent.seances
                .slice()
                .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-3"
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setConfirmOnly(false);
                        setSelectedSeance(s);
                      }}
                    >
                      <p className="font-medium text-gray-800">{formatDateTime(s.starts_at)}</p>
                      <p className="text-xs text-gray-500">{s.lieu || s.forfait_label || "Séance pratique"}</p>
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge color={statusBadgeColor(s.statut)}>{s.statut}</Badge>
                      {s.statut !== "terminee" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setConfirmOnly(true);
                            setSelectedSeance(s);
                          }}
                        >
                          Terminer
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <SeanceDetailModal
        seance={selectedSeance}
        open={Boolean(selectedSeance)}
        confirmOnly={confirmOnly}
        onClose={() => setSelectedSeance(null)}
        onUpdated={load}
      />
    </div>
  );
}
