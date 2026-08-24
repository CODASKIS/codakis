import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "../../../components/motion/motionPresets";
import { Alert, Badge } from "react-bootstrap";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import Loader from "../../../components/common/Loader";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import MediaVideo from "../../../components/common/MediaVideo";
import PlatformAccessPanel, { isPlatformAccessError } from "../../components/PlatformAccessPanel";
import ListenButton from "../../components/course/ListenButton";
import { buildAssessmentSpeechText } from "../../../lib/assessmentSpeech";
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
  const [paywallBlocked, setPaywallBlocked] = useState(false);
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
      if (isPlatformAccessError(err)) {
        setPaywallBlocked(true);
      } else {
        setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
      }
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
      if (isPlatformAccessError(err)) {
        setPaywallBlocked(true);
      } else {
        setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.submitError"));
      }
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

  if (loading) return <Loader variant="section" />;
  if (paywallBlocked) {
    return (
      <div className="codakis-assessment codakis-assessment--locked">
        <PlatformAccessPanel showBanner onAccessGranted={() => void load()} />
      </div>
    );
  }
  if (error && !questions.length) return <Alert variant="danger">{error}</Alert>;

  if (result) {
    return (
      <div className="codakis-assessment codakis-assessment--results">
        <header className="codakis-assessment__header">
          <Link to="/espace/candidat/examens" className="codakis-assessment__back">
            <ArrowLeft size={16} aria-hidden />
            {t("candidat.pedagogy.backExams")}
          </Link>
          <h1>{t("candidat.pedagogy.results")}</h1>
        </header>

        <div className={`codakis-assessment__score${result.reussi ? " is-pass" : " is-fail"}`}>
          <span className="codakis-assessment__score-value">{result.score}%</span>
          <Badge bg={result.reussi ? "success" : "danger"} className="codakis-assessment__score-badge">
            {result.reussi ? t("candidat.pedagogy.passed") : t("candidat.pedagogy.failed")}
          </Badge>
        </div>

        <div className="codakis-assessment__review">
          {result.details.map((detail) => {
            const prompt = questions.find((q) => q.id === detail.question_id)?.prompt;
            return (
              <article
                key={detail.question_id}
                className={`codakis-assessment__review-item${detail.est_correcte ? " is-correct" : " is-wrong"}`}
              >
                <div className="codakis-assessment__review-head">
                  {detail.est_correcte ? <CheckCircle2 size={18} aria-hidden /> : <XCircle size={18} aria-hidden />}
                  <strong>{prompt}</strong>
                </div>
                {detail.explanation ? <p>{detail.explanation}</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  const question = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;
  const speechText = useMemo(
    () => (question ? buildAssessmentSpeechText(question, t) : title),
    [question, t, title],
  );

  return (
    <div className="codakis-assessment">
      <header className="codakis-assessment__header">
        <Link to="/espace/candidat/examens" className="codakis-assessment__back">
          <ArrowLeft size={16} aria-hidden />
          {t("candidat.pedagogy.backExams")}
        </Link>
        <div className="codakis-assessment__meta">
          <h1>{title}</h1>
          {durationMinutes != null ? (
            <span
              className={`codakis-assessment__timer${timer.isLow ? " is-low" : ""}${timer.isExpired ? " is-expired" : ""}`}
            >
              <Clock size={15} aria-hidden />
              {timer.isExpired ? t("candidat.pedagogy.timeUp") : timer.formatted}
            </span>
          ) : null}
        </div>
      </header>

      <div className="codakis-assessment__progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="codakis-assessment__step">
        {current + 1} / {questions.length}
      </p>

      {timer.isExpired && submitting ? (
        <Alert variant="warning">{t("candidat.pedagogy.autoSubmitting")}</Alert>
      ) : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {question ? (
        <ListenButton text={speechText} resetKey={question.id} className="codakis-assessment__listen mb-3" />
      ) : null}

      {question ? (
        <AnimatePresence mode="wait">
          <motion.article
            key={question.id}
            className="codakis-assessment__question"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={pageTransition}
          >
          <p className="codakis-assessment__prompt">{question.prompt}</p>
          {question.image_url ? (
            <CmsCoverImage url={question.image_url} alt="" className="codakis-assessment__media" />
          ) : null}
          <MediaVideo url={question.video_url} title={question.prompt} className="codakis-assessment__video" />

          <fieldset className="codakis-assessment__options">
            <legend className="visually-hidden">{question.prompt}</legend>
            {question.reponses.map((reponse, index) => (
              <label
                key={reponse.id}
                className={`codakis-assessment__option${answers[question.id] === reponse.id ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={reponse.id}
                  checked={answers[question.id] === reponse.id}
                  disabled={timer.isExpired || submitting}
                  onChange={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: reponse.id }))}
                />
                <span className="codakis-assessment__option-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="codakis-assessment__option-text">
                  <strong>{reponse.label}.</strong> {reponse.texte}
                </span>
              </label>
            ))}
          </fieldset>
          </motion.article>
        </AnimatePresence>
      ) : null}

      <footer className="codakis-assessment__nav">
        <button
          type="button"
          className="codakis-assessment__nav-btn codakis-assessment__nav-btn--ghost"
          disabled={current === 0 || timer.isExpired}
          onClick={() => setCurrent((c) => c - 1)}
        >
          {t("candidat.pedagogy.prev")}
        </button>
        {current < questions.length - 1 ? (
          <button
            type="button"
            className="codakis-assessment__nav-btn codakis-assessment__nav-btn--primary"
            disabled={timer.isExpired}
            onClick={() => setCurrent((c) => c + 1)}
          >
            {t("candidat.pedagogy.next")}
            <ArrowRight size={16} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className="codakis-assessment__nav-btn codakis-assessment__nav-btn--primary"
            disabled={submitting || timer.isExpired}
            onClick={() => void handleSubmit()}
          >
            {submitting ? t("candidat.pedagogy.submitting") : t("candidat.pedagogy.submit")}
          </button>
        )}
      </footer>
    </div>
  );
}
