import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "react-bootstrap";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import CmsCoverImage from "../../../components/common/CmsCoverImage";
import MediaVideo from "../../../components/common/MediaVideo";
import Loader from "../../../components/common/Loader";
import ListenButton from "./ListenButton";
import RichPedagogyContent from "../simulation/RichPedagogyContent";
import { buildAssessmentSpeechText } from "../../../lib/assessmentSpeech";
import { pageTransition } from "../../../components/motion/motionPresets";
import { useAssessmentTimer } from "../../hooks/useAssessmentTimer";
import {
  AuthApiError,
  fetchCandidatQuizTake,
  submitCandidatQuiz,
  type SubmitQuizResult,
  type TakeQuestion,
} from "../../../lib/pedagogyApi";

type CourseInlineQuizProps = {
  quizId: string;
  alreadyPassed?: boolean;
  onPassed: () => void;
};

export default function CourseInlineQuiz({ quizId, alreadyPassed = false, onPassed }: CourseInlineQuizProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [questions, setQuestions] = useState<TakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitQuizResult | null>(null);
  const [startedAt] = useState(Date.now());
  const autoSubmittedRef = useRef(false);

  const timer = useAssessmentTimer(durationMinutes, !loading && questions.length > 0 && !result && !submitting);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCandidatQuizTake(quizId);
      setTitle(data.title);
      setDurationMinutes(data.duree_minutes);
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.loadError"));
    } finally {
      setLoading(false);
    }
  }, [quizId, t]);

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
      const quizResult = await submitCandidatQuiz(quizId, payload, duree_sec);
      setResult(quizResult);
      if (quizResult.reussi) onPassed();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("candidat.pedagogy.submitError"));
      autoSubmittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [answers, onPassed, quizId, questions, result, startedAt, submitting, t]);

  useEffect(() => {
    if (!timer.isExpired || autoSubmittedRef.current || submitting || result) return;
    autoSubmittedRef.current = true;
    void handleSubmit();
  }, [timer.isExpired, handleSubmit, submitting, result]);

  const question = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;
  const speechText = useMemo(
    () => (question ? buildAssessmentSpeechText(question, t) : title),
    [question, t, title],
  );

  if (loading) return <Loader variant="section" />;

  if (!error && questions.length === 0 && !alreadyPassed && !result) {
    return (
      <section className="codakis-player-quiz">
        <p className="codakis-player-quiz__feedback is-error">{t("candidat.pedagogy.loadError")}</p>
        <button type="button" className="codakis-player-quiz__submit" onClick={() => void load()}>
          {t("common.retry", { defaultValue: "Réessayer" })}
        </button>
      </section>
    );
  }
  if (alreadyPassed && !result) {
    return (
      <section className="codakis-player-quiz codakis-player-quiz--passed">
        <p className="codakis-player-quiz__label">{t("coursePlayer.themeQuiz")}</p>
        <h3>{title}</h3>
        <p className="codakis-player-quiz__feedback is-success">{t("coursePlayer.quizAlreadyPassed")}</p>
      </section>
    );
  }

  if (result) {
    return (
      <section className="codakis-player-quiz codakis-player-quiz--results">
        <p className="codakis-player-quiz__label">{t("coursePlayer.themeQuiz")}</p>
        <h3>{title}</h3>
        <div className={`codakis-assessment__score${result.reussi ? " is-pass" : " is-fail"}`}>
          <span className="codakis-assessment__score-value">{result.score}%</span>
          <Badge bg={result.reussi ? "success" : "danger"}>{result.reussi ? t("candidat.pedagogy.passed") : t("candidat.pedagogy.failed")}</Badge>
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
        {!result.reussi ? (
          <button type="button" className="codakis-player-quiz__submit" onClick={() => { setResult(null); setAnswers({}); setCurrent(0); }}>
            {t("coursePlayer.quizRetry")}
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className="codakis-player-quiz codakis-player-quiz--full">
      <div className="codakis-player-quiz__head">
        <p className="codakis-player-quiz__label">{t("coursePlayer.themeQuiz")}</p>
        <h3>{title}</h3>
        {durationMinutes != null ? (
          <span className={`codakis-assessment__timer${timer.isLow ? " is-low" : ""}`}>
            <Clock size={15} aria-hidden />
            {timer.isExpired ? t("candidat.pedagogy.timeUp") : timer.formatted}
          </span>
        ) : null}
      </div>

      <ListenButton text={speechText} resetKey={question?.id ?? "quiz"} className="codakis-player-quiz__listen" />

      <div className="codakis-assessment__progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="codakis-assessment__step">
        {current + 1} / {questions.length}
      </p>

      {error ? <p className="codakis-player-quiz__feedback is-error">{error}</p> : null}

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
            <RichPedagogyContent html={question.prompt} className="codakis-assessment__prompt" />
            {question.image_url ? <CmsCoverImage url={question.image_url} alt="" className="codakis-assessment__media" /> : null}
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
                    name={`inline-quiz-${question.id}`}
                    value={reponse.id}
                    checked={answers[question.id] === reponse.id}
                    disabled={timer.isExpired || submitting}
                    onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: reponse.id }))}
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
        <button type="button" className="codakis-assessment__nav-btn codakis-assessment__nav-btn--ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          {t("candidat.pedagogy.prev")}
        </button>
        {current < questions.length - 1 ? (
          <button type="button" className="codakis-assessment__nav-btn codakis-assessment__nav-btn--primary" onClick={() => setCurrent((c) => c + 1)}>
            {t("candidat.pedagogy.next")}
          </button>
        ) : (
          <button type="button" className="codakis-assessment__nav-btn codakis-assessment__nav-btn--primary" disabled={submitting || timer.isExpired} onClick={() => void handleSubmit()}>
            {submitting ? t("candidat.pedagogy.submitting") : t("candidat.pedagogy.submit")}
          </button>
        )}
      </footer>
    </section>
  );
}
