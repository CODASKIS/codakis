import type { TFunction } from "i18next";
import type { TakeQuestion } from "./pedagogyApi";

export function buildAssessmentSpeechText(question: TakeQuestion, t: TFunction): string {
  const parts = [question.prompt.trim()];
  question.reponses.forEach((reponse, index) => {
    const label = reponse.label?.trim() || String.fromCharCode(65 + index);
    parts.push(t("coursePlayer.speechAnswer", { label, text: reponse.texte.trim() }));
  });
  return parts.filter(Boolean).join(". ");
}
