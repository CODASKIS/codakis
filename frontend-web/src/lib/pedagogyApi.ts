import { authFetch, AuthApiError, getAccessToken } from "./authApi";

export type PedagogyTheme = {
  id: string;
  code: string;
  title_fr: string;
  title_en: string;
  sort_order: number;
  is_premium: boolean;
  lecon_count: number;
  quiz_count: number;
  locked?: boolean;
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
  locked?: boolean;
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
  video_url: string | null;
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
  duree_minutes: number;
  est_actif: boolean;
  sort_order: number;
  in_course_path: boolean;
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
  video_url: string | null;
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
  points_earned?: number;
  points_total?: number;
  niveau?: number;
};

export type SubmitExamenResult = {
  score: number;
  nb_erreurs: number;
  nb_total: number;
  reussi: boolean;
  details: SubmitResultDetail[];
  points_earned?: number;
  points_total?: number;
  niveau?: number;
};

export { AuthApiError };

const CACHE_TTL_MS = 60_000;

type CacheEntry<T> = { data: T; expires: number };

let themesCache: CacheEntry<PedagogyTheme[]> | null = null;
let quizListCache: CacheEntry<PedagogyQuiz[]> | null = null;
let examListCache: CacheEntry<PedagogyExamen[]> | null = null;

function readCache<T>(entry: CacheEntry<T> | null): T | null {
  if (!entry || Date.now() >= entry.expires) return null;
  return entry.data;
}

function writeCache<T>(data: T): CacheEntry<T> {
  return { data, expires: Date.now() + CACHE_TTL_MS };
}

export function invalidatePedagogyCache() {
  themesCache = null;
  quizListCache = null;
  examListCache = null;
}

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

export async function fetchAdminCoursePath(themeId: string): Promise<CoursePath> {
  return authFetch<CoursePath>(`/api/v1/admin/pedagogy/themes/${themeId}/path`);
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
  const cached = readCache(themesCache);
  if (cached) return cached;
  const data = await authFetch<PedagogyTheme[]>("/api/v1/candidat/pedagogy/themes");
  themesCache = writeCache(data);
  return data;
}

export async function fetchCandidatLecons(themeId: string): Promise<PedagogyLecon[]> {
  return authFetch<PedagogyLecon[]>(`/api/v1/candidat/pedagogy/themes/${themeId}/lecons`);
}

export async function fetchCandidatLecon(id: string): Promise<PedagogyLecon> {
  return authFetch<PedagogyLecon>(`/api/v1/candidat/pedagogy/lecons/${id}`);
}

export type CandidatProgress = {
  completed_lecon_ids: string[];
  passed_quiz_ids: string[];
  passed_examen_ids: string[];
  total_lecons: number;
  completed_count: number;
  percent: number;
};

export type AttemptErrorDetail = {
  question_id: string;
  prompt: string | null;
  explanation: string | null;
};

export type AttemptHistoryItem = {
  id: string;
  kind: "quiz" | "examen";
  title: string;
  score: number;
  reussi: boolean;
  nb_total: number;
  nb_erreurs: number;
  termine_le: string;
  errors: AttemptErrorDetail[];
};

export type CandidatDashboard = {
  progress_percent: number;
  completed_lecons: number;
  total_lecons: number;
  quizzes_passed: number;
  examens_passed: number;
  success_rate: number;
  recent_attempts: AttemptHistoryItem[];
  points?: number;
  niveau?: number;
  chapters_read?: number;
  chapters_total?: number;
  next_level_at?: number;
};

export type Gamification = {
  points: number;
  niveau: number;
  chapters_read: number;
  chapters_total: number;
  next_level_at: number;
  points_to_next_level: number;
};

export type RoadmapStep = {
  type: "lecon" | "quiz";
  id: string;
  ref: string;
  title: string;
  sort_order: number;
  status: "done" | "current" | "locked" | "premium_locked";
  theme_id: string;
  theme_code: string;
  theme_title: string;
  theme_index: number;
  global_index: number;
};

export type RoadmapSection = {
  theme_id: string;
  theme_code: string;
  theme_title: string;
  theme_index: number;
  is_premium: boolean;
  locked: boolean;
  steps: RoadmapStep[];
};

export type RoadmapResponse = {
  sections: RoadmapSection[];
  gamification: Gamification;
};

export async function fetchGamification(): Promise<Gamification> {
  return authFetch<Gamification>("/api/v1/candidat/pedagogy/gamification");
}

export async function fetchRoadmap(): Promise<RoadmapResponse> {
  return authFetch<RoadmapResponse>("/api/v1/candidat/pedagogy/roadmap");
}

export type CoursePathStep = {
  type: "lecon" | "quiz";
  id: string;
  ref: string;
  title: string;
  sort_order: number;
  status?: string | null;
};

export type CoursePath = {
  theme_id: string;
  steps: CoursePathStep[];
  completed_lecon_ids: string[];
  passed_quiz_ids: string[];
};

export function stepRefForQuiz(quizId: string) {
  return `quiz-${quizId}`;
}

export function parseStepRef(ref: string): { type: "lecon" | "quiz"; id: string } {
  if (ref.startsWith("quiz-")) {
    return { type: "quiz", id: ref.slice(5) };
  }
  return { type: "lecon", id: ref };
}

export async function fetchCandidatProgress(): Promise<CandidatProgress> {
  return authFetch<CandidatProgress>("/api/v1/candidat/pedagogy/progress");
}

export async function fetchCandidatDashboard(): Promise<CandidatDashboard> {
  return authFetch<CandidatDashboard>("/api/v1/candidat/pedagogy/dashboard");
}

export async function askCandidatTutor(payload: {
  message: string;
  context?: string;
  language?: string;
}): Promise<string> {
  const result = await authFetch<{ reply: string }>("/api/v1/candidat/pedagogy/tutor", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.reply;
}

export async function completeCandidatLecon(leconId: string): Promise<CandidatProgress> {
  return authFetch<CandidatProgress>(`/api/v1/candidat/pedagogy/lecons/${leconId}/complete`, {
    method: "POST",
  });
}

export async function fetchCandidatThemeCheckpoint(
  themeId: string,
  leconId?: string,
): Promise<TakeQuestion | null> {
  const query = leconId ? `?lecon_id=${encodeURIComponent(leconId)}` : "";
  return authFetch<TakeQuestion | null>(`/api/v1/candidat/pedagogy/themes/${themeId}/checkpoint${query}`);
}

export async function fetchCandidatCoursePath(themeId: string): Promise<CoursePath> {
  return authFetch<CoursePath>(`/api/v1/candidat/pedagogy/themes/${themeId}/path`);
}

export async function synthesizeCandidatSpeech(text: string, language?: string): Promise<Blob> {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  const url = base ? `${base}/api/v1/candidat/pedagogy/tts` : "/api/v1/candidat/pedagogy/tts";
  const token = getAccessToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text, language }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new AuthApiError(
      typeof payload.detail === "string" ? payload.detail : "Synthèse vocale indisponible",
      response.status,
    );
  }
  return response.blob();
}

export async function validateCandidatCheckpoint(
  questionId: string,
  reponseId: string,
): Promise<{ est_correcte: boolean; correct_reponse_id: string | null; explanation: string | null }> {
  return authFetch("/api/v1/candidat/pedagogy/checkpoint/validate", {
    method: "POST",
    body: JSON.stringify({ question_id: questionId, reponse_id: reponseId }),
  });
}

export async function fetchCandidatQuizList(): Promise<PedagogyQuiz[]> {
  const cached = readCache(quizListCache);
  if (cached) return cached;
  const data = await authFetch<PedagogyQuiz[]>("/api/v1/candidat/pedagogy/quiz");
  quizListCache = writeCache(data);
  return data;
}

export async function fetchCandidatQuizTake(id: string): Promise<{ id: string; title: string; theme_code: string; duree_minutes: number; questions: TakeQuestion[] }> {
  return authFetch(`/api/v1/candidat/pedagogy/quiz/${id}`);
}

export async function submitCandidatQuiz(
  id: string,
  answers: { question_id: string; reponse_id: string }[],
  duree_sec?: number,
): Promise<SubmitQuizResult> {
  return authFetch<SubmitQuizResult>(`/api/v1/candidat/pedagogy/quiz/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers, duree_sec }),
  });
}

export async function fetchCandidatExamens(): Promise<PedagogyExamen[]> {
  const cached = readCache(examListCache);
  if (cached) return cached;
  const data = await authFetch<PedagogyExamen[]>("/api/v1/candidat/pedagogy/examens");
  examListCache = writeCache(data);
  return data;
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
