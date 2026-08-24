import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Form, ProgressBar } from "react-bootstrap";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import MainCard from "@/dashboardkit/components/Card/MainCard";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import MediaVideo from "../../../components/common/MediaVideo";
import { useAssessmentTimer } from "../../hooks/useAssessmentTimer";
import {
  AuthApiError,
  fetchCandidatExamenTake,
  fetchCandidatQuizTake,
  submitCandidatExamen,
  submitCandidatQuiz,
  type SubmitExamenResult,
  type SubmitQuizResult,
  type TakeQuestion,
} from "../../../lib/pedagogyApi";

type TakePageProps = { mode: "quiz" | "examen" };

export default function CandidatTakeAssessmentPage({ mode }: TakePageProps) {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [questions, setQuestions] = useState<TakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [quizResult, setQuizResult] = useState<SubmitQuizResult | null>(null);
  const [examenResult, setExamenResult] = useState<SubmitExamenResult | null>(null);
  const [startedAt] = useState(Date.now());
  const autoSubmittedRef = useRef(false);

  const result = quizResult ?? examenResult;
  const timer = useAssessmentTimer(durationMinutes, !loading && questions.length > 0 && !result && !submitting);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (mode === "quiz") {
        const data = await fetchCandidatQuizTake(id);
        setTitle(data.title);
        setDurationMinutes(data.duree_minutes);
        setQuestions(data.questions);
      } else {
        const data = await fetchCandidatExamenTake(id);
        setTitle(data.title);
        setDurationMinutes(data.duree_minutes);
        setQuestions(data.questions);
      }
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [id, mode, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    setError("");
    const payload = questions
      .map((question) => ({
        question_id: question.id,
        reponse_id: answers[question.id],
      }))
      .filter((item) => item.reponse_id);
    const duree_sec = Math.round((Date.now() - startedAt) / 1000);
    try {
      if (mode === "quiz") {
        setQuizResult(await submitCandidatQuiz(id, payload, duree_sec));
      } else {
        setExamenResult(await submitCandidatExamen(id, payload, duree_sec));
      }
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.submitError"));
      autoSubmittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [answers, id, mode, questions, result, startedAt, submitting, t]);

  useEffect(() => {
    if (!timer.isExpired || autoSubmittedRef.current || submitting || result) return;
    autoSubmittedRef.current = true;
    void handleSubmit();
  }, [timer.isExpired, handleSubmit, submitting, result]);

  if (loading) return <Loader />;
  if (error && !questions.length) return <Alert variant="danger">{error}</Alert>;

  if (result) {
    return (
      <MainCard title={t("candidat.pedagogy.results")} isOption={false} cardClass="" optionClass="" CardBodyClass="">
        <div className="text-center mb-4">
          <h3>{result.score}%</h3>
          <Badge bg={result.reussi ? "success" : "danger"} className="fs-6">
            {result.reussi ? t("candidat.pedagogy.passed") : t("candidat.pedagogy.failed")}
          </Badge>
        </div>
        {result.details.map((detail) => (
          <Alert key={detail.question_id} variant={detail.est_correcte ? "success" : "danger"}>
            <div className="fw-semibold">
              {detail.est_correcte ? "✓" : "✗"} {questions.find((q) => q.id === detail.question_id)?.prompt}
            </div>
            {detail.explanation ? <div className="small mt-1">{detail.explanation}</div> : null}
          </Alert>
        ))}
        <Link to="/espace/candidat/examens" className="btn btn-primary">
          {t("candidat.pedagogy.backExams")}
        </Link>
      </MainCard>
    );
  }

  const question = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  return (
    <MainCard title={title} isOption={false} cardClass="" optionClass="" CardBodyClass="">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <Link to="/espace/candidat/examens" className="btn btn-outline-secondary btn-sm">
          {t("candidat.pedagogy.backExams")}
        </Link>
        {durationMinutes != null ? (
          <Badge
            bg={timer.isLow ? "danger" : timer.isExpired ? "secondary" : "primary"}
            className="codakis-assessment-timer d-inline-flex align-items-center gap-1 px-3 py-2"
          >
            <Clock size={16} aria-hidden />
            <span>{timer.isExpired ? t("candidat.pedagogy.timeUp") : timer.formatted}</span>
          </Badge>
        ) : null}
      </div>

      <ProgressBar now={progress} className="mb-4" label={`${current + 1}/${questions.length}`} />

      {timer.isExpired && submitting ? (
        <Alert variant="warning">{t("candidat.pedagogy.autoSubmitting")}</Alert>
      ) : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {question ? (
        <>
          <p className="fw-semibold fs-5">{question.prompt}</p>
          {question.image_url ? (
            <CmsCoverImage
              url={question.image_url}
              alt=""
              className="rounded mb-3 w-100"
              style={{ maxHeight: 280, objectFit: "contain" }}
            />
          ) : null}
          <MediaVideo url={question.video_url} title={question.prompt} className="mb-3" />
          {question.reponses.map((reponse) => (
            <Form.Check
              key={reponse.id}
              type="radio"
              name={`question-${question.id}`}
              id={reponse.id}
              label={`${reponse.label}. ${reponse.texte}`}
              checked={answers[question.id] === reponse.id}
              disabled={timer.isExpired || submitting}
              onChange={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: reponse.id }))}
              className="mb-2"
            />
          ))}
          <div className="d-flex gap-2 mt-4">
            <Button variant="outline-secondary" disabled={current === 0 || timer.isExpired} onClick={() => setCurrent((c) => c - 1)}>
              {t("candidat.pedagogy.prev")}
            </Button>
            {current < questions.length - 1 ? (
              <Button variant="primary" disabled={timer.isExpired} onClick={() => setCurrent((c) => c + 1)}>
                {t("candidat.pedagogy.next")}
              </Button>
            ) : (
              <Button variant="success" disabled={submitting || timer.isExpired} onClick={() => void handleSubmit()}>
                {submitting ? t("candidat.pedagogy.submitting") : t("candidat.pedagogy.submit")}
              </Button>
            )}
          </div>
        </>
      ) : null}
    </MainCard>
  );
}
