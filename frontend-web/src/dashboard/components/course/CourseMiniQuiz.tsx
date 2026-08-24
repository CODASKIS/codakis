import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TakeQuestion } from "../../../lib/pedagogyApi";
import { validateCandidatCheckpoint } from "../../../lib/pedagogyApi";
import { buildAssessmentSpeechText } from "../../../lib/assessmentSpeech";
import ListenButton from "./ListenButton";

type CourseMiniQuizProps = {
  question: TakeQuestion;
  onValidated: (passed: boolean) => void;
};

export default function CourseMiniQuiz({ question, onValidated }: CourseMiniQuizProps) {
  const { t } = useTranslation();
  const speechText = useMemo(() => buildAssessmentSpeechText(question, t), [question, t]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; explanation?: string | null } | null>(
    null,
  );

  async function handleValidate() {
    if (!selected || loading || result) return;
    setLoading(true);
    try {
      const response = await validateCandidatCheckpoint(question.id, selected);
      setResult({ correct: response.est_correcte, explanation: response.explanation });
      onValidated(response.est_correcte);
    } catch {
      setResult({ correct: false, explanation: null });
      onValidated(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="codakis-player-quiz" aria-labelledby="codakis-player-quiz-title">
      <p className="codakis-player-quiz__label">{t("coursePlayer.quizLabel")}</p>
      <h3 id="codakis-player-quiz-title">{question.prompt}</h3>

      <ListenButton text={speechText} resetKey={question.id} className="codakis-player-quiz__listen" />

      <fieldset className="codakis-player-quiz__options">
        <legend className="visually-hidden">{question.prompt}</legend>
        {question.reponses.map((reponse, index) => (
          <label
            key={reponse.id}
            className={`codakis-player-quiz__option${selected === reponse.id ? " is-selected" : ""}${
              result && selected === reponse.id ? (result.correct ? " is-correct" : " is-wrong") : ""
            }`}
          >
            <input
              type="radio"
              name={`checkpoint-${question.id}`}
              value={reponse.id}
              checked={selected === reponse.id}
              disabled={Boolean(result)}
              onChange={() => setSelected(reponse.id)}
            />
            <span className="codakis-player-quiz__option-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{reponse.texte}</span>
          </label>
        ))}
      </fieldset>

      {result ? (
        <p
          className={`codakis-player-quiz__feedback${result.correct ? " is-success" : " is-error"}`}
          role="status"
        >
          {result.correct ? t("coursePlayer.quizCorrect") : t("coursePlayer.quizWrong")}
          {result.explanation ? ` — ${result.explanation}` : ""}
        </p>
      ) : null}

      {!result ? (
        <button
          type="button"
          className="codakis-player-quiz__submit"
          disabled={!selected || loading}
          onClick={() => void handleValidate()}
        >
          {loading ? t("coursePlayer.quizValidating") : t("coursePlayer.quizValidate")}
        </button>
      ) : null}
    </section>
  );
}
