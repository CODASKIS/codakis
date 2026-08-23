import { authFetch, AuthApiError } from "./authApi";

export type PedagogyTheme = {
  id: string;
  code: string;
  title_fr: string;
  title_en: string;
  sort_order: number;
  is_premium: boolean;
  lecon_count: number;
  quiz_count: number;
};

export type PedagogyLecon = {
  id: string;
  theme_id: string;
  theme_code: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  sort_order: number;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PedagogyReponse = {
  id: string;
  label: string;
  texte: string;
  est_correcte?: boolean;
  sort_order: number;
};

export type PedagogyQuestion = {
  id: string;
  theme_id: string | null;
  theme_code: string | null;
  prompt: string;
  image_url: string | null;
  explanation: string | null;
  difficulty: number;
  est_actif: boolean;
  reponses: PedagogyReponse[];
  created_at: string;
  updated_at: string;
};

export type PedagogyQuiz = {
  id: string;
  theme_id: string;
  theme_code: string | null;
  title: string;
  description: string | null;
  question_count: number;
  est_actif: boolean;
  linked_count: number;
  question_ids?: string[];
  created_at: string;
  updated_at: string;
};

export type PedagogyExamen = {
  id: string;
  title: string;
  description: string | null;
  duree_minutes: number;
  nb_questions: number;
  max_erreurs: number;
  est_actif: boolean;
  linked_count: number;
  question_ids?: string[];
  created_at: string;
  updated_at: string;
};

export type TakeQuestion = {
  id: string;
  prompt: string;
  image_url: string | null;
  reponses: { id: string; label: string; texte: string }[];
};

export type SubmitResultDetail = {
  question_id: string;
  reponse_id: string | null;
  correct_reponse_id: string;
  est_correcte: boolean;
  explanation: string | null;
};

export type SubmitQuizResult = {
  score: number;
  nb_correctes: number;
  nb_total: number;
  reussi: boolean;
  details: SubmitResultDetail[];
};

export type SubmitExamenResult = {
  score: number;
  nb_erreurs: number;
  nb_total: number;
  reussi: boolean;
  details: SubmitResultDetail[];
};

export { AuthApiError };

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/api/v1/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

// Admin
export async function fetchAdminThemes(): Promise<PedagogyTheme[]> {
  return authFetch<PedagogyTheme[]>("/api/v1/admin/pedagogy/themes");
}

export async function createAdminTheme(payload: {
  code: string;
  title_fr: string;
  title_en: string;
  sort_order?: number;
  is_premium?: boolean;
}): Promise<PedagogyTheme> {
  return authFetch<PedagogyTheme>("/api/v1/admin/pedagogy/themes", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAdminTheme(id: string, payload: Record<string, unknown>): Promise<PedagogyTheme> {
  return authFetch<PedagogyTheme>(`/api/v1/admin/pedagogy/themes/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteAdminTheme(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/admin/pedagogy/themes/${id}`, { method: "DELETE" });
}

export async function fetchAdminLecons(themeId?: string): Promise<PedagogyLecon[]> {
  const query = themeId ? `?theme_id=${themeId}` : "";
  return authFetch<PedagogyLecon[]>(`/api/v1/admin/pedagogy/lecons${query}`);
}

export async function fetchAdminLecon(id: string): Promise<PedagogyLecon> {
  return authFetch<PedagogyLecon>(`/api/v1/admin/pedagogy/lecons/${id}`);
}

export async function createAdminLecon(payload: Record<string, unknown>): Promise<PedagogyLecon> {
  return authFetch<PedagogyLecon>("/api/v1/admin/pedagogy/lecons", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAdminLecon(id: string, payload: Record<string, unknown>): Promise<PedagogyLecon> {
  return authFetch<PedagogyLecon>(`/api/v1/admin/pedagogy/lecons/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteAdminLecon(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/admin/pedagogy/lecons/${id}`, { method: "DELETE" });
}

export async function fetchAdminQuestions(themeId?: string): Promise<PedagogyQuestion[]> {
  const query = themeId ? `?theme_id=${themeId}` : "";
  return authFetch<PedagogyQuestion[]>(`/api/v1/admin/pedagogy/questions${query}`);
}

export async function fetchAdminQuestion(id: string): Promise<PedagogyQuestion> {
  return authFetch<PedagogyQuestion>(`/api/v1/admin/pedagogy/questions/${id}`);
}

export async function createAdminQuestion(payload: Record<string, unknown>): Promise<PedagogyQuestion> {
  return authFetch<PedagogyQuestion>("/api/v1/admin/pedagogy/questions", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAdminQuestion(id: string, payload: Record<string, unknown>): Promise<PedagogyQuestion> {
  return authFetch<PedagogyQuestion>(`/api/v1/admin/pedagogy/questions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteAdminQuestion(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/admin/pedagogy/questions/${id}`, { method: "DELETE" });
}

export async function fetchAdminQuizList(): Promise<PedagogyQuiz[]> {
  return authFetch<PedagogyQuiz[]>("/api/v1/admin/pedagogy/quiz");
}

export async function fetchAdminQuiz(id: string): Promise<PedagogyQuiz> {
  return authFetch<PedagogyQuiz>(`/api/v1/admin/pedagogy/quiz/${id}`);
}

export async function createAdminQuiz(payload: Record<string, unknown>): Promise<PedagogyQuiz> {
  return authFetch<PedagogyQuiz>("/api/v1/admin/pedagogy/quiz", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAdminQuiz(id: string, payload: Record<string, unknown>): Promise<PedagogyQuiz> {
  return authFetch<PedagogyQuiz>(`/api/v1/admin/pedagogy/quiz/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteAdminQuiz(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/admin/pedagogy/quiz/${id}`, { method: "DELETE" });
}

export async function fetchAdminExamens(): Promise<PedagogyExamen[]> {
  return authFetch<PedagogyExamen[]>("/api/v1/admin/pedagogy/examens");
}

export async function fetchAdminExamen(id: string): Promise<PedagogyExamen> {
  return authFetch<PedagogyExamen>(`/api/v1/admin/pedagogy/examens/${id}`);
}

export async function createAdminExamen(payload: Record<string, unknown>): Promise<PedagogyExamen> {
  return authFetch<PedagogyExamen>("/api/v1/admin/pedagogy/examens", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAdminExamen(id: string, payload: Record<string, unknown>): Promise<PedagogyExamen> {
  return authFetch<PedagogyExamen>(`/api/v1/admin/pedagogy/examens/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteAdminExamen(id: string): Promise<void> {
  await authFetch<void>(`/api/v1/admin/pedagogy/examens/${id}`, { method: "DELETE" });
}

// Candidat
export async function fetchCandidatThemes(): Promise<PedagogyTheme[]> {
  return authFetch<PedagogyTheme[]>("/api/v1/candidat/pedagogy/themes");
}

export async function fetchCandidatLecons(themeId: string): Promise<PedagogyLecon[]> {
  return authFetch<PedagogyLecon[]>(`/api/v1/candidat/pedagogy/themes/${themeId}/lecons`);
}

export async function fetchCandidatLecon(id: string): Promise<PedagogyLecon> {
  return authFetch<PedagogyLecon>(`/api/v1/candidat/pedagogy/lecons/${id}`);
}

export async function fetchCandidatQuizList(): Promise<PedagogyQuiz[]> {
  return authFetch<PedagogyQuiz[]>("/api/v1/candidat/pedagogy/quiz");
}

export async function fetchCandidatQuizTake(id: string): Promise<{ id: string; title: string; theme_code: string; questions: TakeQuestion[] }> {
  return authFetch(`/api/v1/candidat/pedagogy/quiz/${id}`);
}

export async function submitCandidatQuiz(id: string, answers: { question_id: string; reponse_id: string }[]): Promise<SubmitQuizResult> {
  return authFetch<SubmitQuizResult>(`/api/v1/candidat/pedagogy/quiz/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function fetchCandidatExamens(): Promise<PedagogyExamen[]> {
  return authFetch<PedagogyExamen[]>("/api/v1/candidat/pedagogy/examens");
}

export async function fetchCandidatExamenTake(id: string): Promise<{ id: string; title: string; duree_minutes: number; max_erreurs: number; questions: TakeQuestion[] }> {
  return authFetch(`/api/v1/candidat/pedagogy/examens/${id}`);
}

export async function submitCandidatExamen(
  id: string,
  answers: { question_id: string; reponse_id: string }[],
  duree_sec?: number,
): Promise<SubmitExamenResult> {
  return authFetch<SubmitExamenResult>(`/api/v1/candidat/pedagogy/examens/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers, duree_sec }),
  });
}
