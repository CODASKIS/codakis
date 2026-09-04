import SpeakButton from "./SpeakButton";

type Props = {
  text: string;
  language?: string;
  autoPlay?: boolean;
  className?: string;
};

/** Bulle d’énoncé + bouton voix (style Duo). */
export default function SpeakPrompt({ text, language, autoPlay = true, className = "" }: Props) {
  return (
    <div className={`ck-speak-prompt ${className}`.trim()}>
      <SpeakButton text={text} language={language} autoPlay={autoPlay} size="lg" />
      <h1 className="ck-speak-prompt__text">{text}</h1>
    </div>
  );
}
