import SpeakButton from "./SpeakButton";

type Props = {
  text: string;
  /** Texte lu à voix haute (si différent de l’affichage, ex. question + options). */
  speakText?: string;
  language?: string;
  autoPlay?: boolean;
  className?: string;
};

/** Bulle d’énoncé + bouton voix (style Duo). */
export default function SpeakPrompt({
  text,
  speakText,
  language,
  autoPlay = true,
  className = "",
}: Props) {
  return (
    <div className={`ck-speak-prompt ${className}`.trim()}>
      <SpeakButton text={speakText ?? text} language={language} autoPlay={autoPlay} size="lg" />
      <h1 className="ck-speak-prompt__text">{text}</h1>
    </div>
  );
}
