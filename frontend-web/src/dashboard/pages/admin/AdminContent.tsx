import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Loader from "../../../components/common/Loader";
import {
  deleteAdminTheme,
  fetchAdminExamens,
  fetchAdminLecons,
  fetchAdminQuestions,
  fetchAdminQuizList,
  fetchAdminThemes,
  type PedagogyTheme,
} from "../../../lib/pedagogyApi";
import { useTablePagination } from "../../../hooks/useTablePagination";
import ComponentCard from "../../common/ComponentCard";
import Pagination from "../../ui/Pagination";
import TableActions from "../../ui/TableActions";

type TabId = "themes" | "lecons" | "questions" | "quiz" | "examens";

export default function AdminContent() {
  const [tab, setTab] = useState<TabId>("themes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [themes, setThemes] = useState<PedagogyTheme[]>([]);
  const [lecons, setLecons] = useState<Awaited<ReturnType<typeof fetchAdminLecons>>>([]);
  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof fetchAdminQuestions>>>([]);
  const [quizList, setQuizList] = useState<Awaited<ReturnType<typeof fetchAdminQuizList>>>([]);
  const [examens, setExamens] = useState<Awaited<ReturnType<typeof fetchAdminExamens>>>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [t, l, q, z, e] = await Promise.all([
      fetchAdminThemes(),
      fetchAdminLecons(),
      fetchAdminQuestions(),
      fetchAdminQuizList(),
      fetchAdminExamens(),
    ]);
    setThemes(t);
    setLecons(l);
    setQuestions(q);
    setQuizList(z);
    setExamens(e);
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

  const leconsPage = useTablePagination(lecons, { resetKey: tab });
  const questionsPage = useTablePagination(questions, { resetKey: tab });
  const quizPage = useTablePagination(quizList, { resetKey: tab });
  const examensPage = useTablePagination(examens, { resetKey: tab });

  const tabs = useMemo(
    () =>
      [
        { id: "themes" as const, label: `Thèmes (${themes.length})` },
        { id: "lecons" as const, label: `Leçons (${lecons.length})` },
        { id: "questions" as const, label: `Questions (${questions.length})` },
        { id: "quiz" as const, label: `Quiz (${quizList.length})` },
        { id: "examens" as const, label: `Examens (${examens.length})` },
      ] as const,
    [themes.length, lecons.length, questions.length, quizList.length, examens.length],
  );

  async function onDeleteTheme(theme: PedagogyTheme) {
    if (!window.confirm(`Supprimer le thème « ${theme.title_fr} » ?`)) return;
    setBusyId(theme.id);
    setError("");
    try {
      await deleteAdminTheme(theme.id);
      await load();
      setMessage("Thème supprimé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="ck-title">Contenu pédagogique</h2>
        <p className="ck-subtitle">Thèmes, leçons, questions, quiz et examens.</p>
      </div>

      {error ? <p className="ck-empty">{error}</p> : null}
      {message ? <p className="ck-empty" style={{ color: "var(--ck-green)" }}>{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ck-btn ck-btn--sm ${tab === item.id ? "ck-btn--primary" : "ck-btn--ghost"}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "themes" ? (
        <ComponentCard
          title="Thèmes"
          action={
            <Link to="/espace/admin/contenu/themes/nouveau" className="ck-btn ck-btn--primary ck-btn--sm">
              <Plus size={14} strokeWidth={2.5} />
              Nouveau thème
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {themes.map((theme) => (
              <article key={theme.id} className="ck-schools-panel" style={{ margin: 0 }}>
                <strong>{theme.title_fr}</strong>
                <p className="ck-empty">
                  {theme.code} · {theme.lecon_count} leçons · {theme.quiz_count} quiz
                  {theme.is_premium ? " · Premium" : ""}
                </p>
                <div className="ck-schools-profile__actions" style={{ marginTop: "1rem" }}>
                  <Link to={`/espace/admin/contenu/themes/${theme.id}`} className="ck-btn ck-btn--ghost ck-btn--sm">
                    <Pencil size={14} />
                    Modifier
                  </Link>
                  <button
                    type="button"
                    className="ck-btn ck-btn--danger ck-btn--sm"
                    disabled={busyId === theme.id}
                    onClick={() => void onDeleteTheme(theme)}
                  >
                    <Trash2 size={14} />
                    Suppr.
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!themes.length ? <p className="ck-empty">Aucun thème.</p> : null}
        </ComponentCard>
      ) : null}

      {tab === "lecons" ? (
        <ComponentCard
          title="Leçons / cours"
          desc="Créer et éditer le contenu pédagogique"
          action={
            <Link to="/espace/admin/contenu/lecons/nouveau" className="ck-btn ck-btn--primary ck-btn--sm">
              <Plus size={14} strokeWidth={2.5} />
              Nouvelle leçon
            </Link>
          }
        >
          <div className="ck-schools-table-wrap">
            <table className="ck-schools-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Thème</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leconsPage.paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>{item.theme_code || "—"}</td>
                    <td>{item.status}</td>
                    <td>
                      <TableActions
                        actions={[
                          {
                            label: "Modifier",
                            icon: Pencil,
                            to: `/espace/admin/contenu/lecons/${item.id}`,
                            variant: "primary",
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={leconsPage.page}
            pageSize={leconsPage.pageSize}
            total={leconsPage.total}
            onPageChange={leconsPage.setPage}
          />
        </ComponentCard>
      ) : null}

      {tab === "questions" ? (
        <ComponentCard
          title="Questions"
          desc="Banque QCM pour quiz et examens"
          action={
            <Link to="/espace/admin/contenu/questions/nouveau" className="ck-btn ck-btn--primary ck-btn--sm">
              <Plus size={14} strokeWidth={2.5} />
              Nouvelle question
            </Link>
          }
        >
          <div className="ck-schools-table-wrap">
            <table className="ck-schools-table">
              <thead>
                <tr>
                  <th>Énoncé</th>
                  <th>Thème</th>
                  <th>Difficulté</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questionsPage.paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.prompt.slice(0, 80)}
                        {item.prompt.length > 80 ? "…" : ""}
                      </strong>
                    </td>
                    <td>{item.theme_code || "—"}</td>
                    <td>{item.difficulty}</td>
                    <td>
                      <TableActions
                        actions={[
                          {
                            label: "Modifier",
                            icon: Pencil,
                            to: `/espace/admin/contenu/questions/${item.id}`,
                            variant: "primary",
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={questionsPage.page}
            pageSize={questionsPage.pageSize}
            total={questionsPage.total}
            onPageChange={questionsPage.setPage}
          />
        </ComponentCard>
      ) : null}

      {tab === "quiz" ? (
        <ComponentCard
          title="Quiz"
          desc="Assembler des questions par thème"
          action={
            <Link to="/espace/admin/contenu/quiz/nouveau" className="ck-btn ck-btn--primary ck-btn--sm">
              <Plus size={14} strokeWidth={2.5} />
              Nouveau quiz
            </Link>
          }
        >
          <div className="ck-schools-table-wrap">
            <table className="ck-schools-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Thème</th>
                  <th>Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizPage.paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>{item.theme_code || "—"}</td>
                    <td>{item.question_count}</td>
                    <td>
                      <TableActions
                        actions={[
                          {
                            label: "Modifier",
                            icon: Pencil,
                            to: `/espace/admin/contenu/quiz/${item.id}`,
                            variant: "primary",
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={quizPage.page} pageSize={quizPage.pageSize} total={quizPage.total} onPageChange={quizPage.setPage} />
        </ComponentCard>
      ) : null}

      {tab === "examens" ? (
        <ComponentCard
          title="Examens"
          desc="Épreuves finales et banque associée"
          action={
            <Link to="/espace/admin/contenu/examens/nouveau" className="ck-btn ck-btn--primary ck-btn--sm">
              <Plus size={14} strokeWidth={2.5} />
              Nouvel examen
            </Link>
          }
        >
          <div className="ck-schools-table-wrap">
            <table className="ck-schools-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Durée</th>
                  <th>Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {examensPage.paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>{item.duree_minutes} min</td>
                    <td>{item.nb_questions}</td>
                    <td>
                      <TableActions
                        actions={[
                          {
                            label: "Voir",
                            icon: Eye,
                            to: `/espace/admin/contenu/examens/${item.id}`,
                            variant: "primary",
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={examensPage.page}
            pageSize={examensPage.pageSize}
            total={examensPage.total}
            onPageChange={examensPage.setPage}
          />
        </ComponentCard>
      ) : null}
    </div>
  );
}
