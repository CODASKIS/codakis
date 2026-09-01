import { FormEvent, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { askCandidatTutor, AuthApiError } from "../../../lib/pedagogyApi";

type CourseAiTutorProps = {
  context: string;
  className?: string;
};

type ChatMessage = { role: "user" | "assistant"; text: string };

export default function CourseAiTutor({ context, className = "" }: CourseAiTutorProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);
    try {
      const reply = await askCandidatTutor({
        message: question,
        context,
        language: i18n.language,
      });
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      const fallback =
        err instanceof AuthApiError ? err.message : t("coursePlayer.tutorUnavailable");
      setMessages((prev) => [...prev, { role: "assistant", text: fallback }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`codakis-tutor${className ? ` ${className}` : ""}`}>
      {open ? (
        <div className="codakis-tutor__panel" role="dialog" aria-label={t("coursePlayer.tutorTitle")}>
          <header className="codakis-tutor__head">
            <strong>{t("coursePlayer.tutorTitle")}</strong>
            <button type="button" className="codakis-tutor__close" onClick={() => setOpen(false)} aria-label="Fermer">
              <X size={18} aria-hidden />
            </button>
          </header>
          <div className="codakis-tutor__messages">
            {messages.length === 0 ? (
              <p className="codakis-tutor__hint">{t("coursePlayer.tutorHint")}</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={`codakis-tutor__bubble codakis-tutor__bubble--${msg.role}`}
                >
                  {msg.text}
                </div>
              ))
            )}
            {loading ? <p className="codakis-tutor__typing">{t("coursePlayer.tutorThinking")}</p> : null}
          </div>
          <form className="codakis-tutor__form" onSubmit={(e) => void handleSubmit(e)}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("coursePlayer.tutorPlaceholder")}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label={t("coursePlayer.tutorSend")}>
              <Send size={16} aria-hidden />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="codakis-tutor__fab"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <MessageCircle size={20} aria-hidden />
        {t("coursePlayer.tutorFab")}
      </button>
    </div>
  );
}
