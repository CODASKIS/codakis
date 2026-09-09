import { getPreferredVoiceId, isSpeakingEnabled } from "../lib/userPreferences";
import { synthesizeCandidatSpeech } from "../lib/pedagogyApi";

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
/** Invalide toute synthèse / lecture en cours (fermeture quiz, navigation, etc.). */
let speakSession = 0;
let currentAbort: AbortController | null = null;

const MAX_CHUNK = 2200;

export function stripSpeakHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function chunkText(text: string, maxLen = MAX_CHUNK): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(". ", maxLen);
    if (cut < maxLen * 0.4) cut = rest.lastIndexOf(" ", maxLen);
    if (cut < maxLen * 0.3) cut = maxLen;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.filter(Boolean);
}

async function playBlob(blob: Blob, session: number, signal: AbortSignal): Promise<void> {
  if (session !== speakSession || signal.aborted) return;

  const url = URL.createObjectURL(blob);
  currentObjectUrl = url;
  const audio = new Audio(url);
  currentAudio = audio;

  await new Promise<void>((resolve, reject) => {
    if (session !== speakSession || signal.aborted) {
      URL.revokeObjectURL(url);
      if (currentObjectUrl === url) currentObjectUrl = null;
      resolve();
      return;
    }

    audio.onended = () => {
      if (currentObjectUrl === url) {
        URL.revokeObjectURL(url);
        currentObjectUrl = null;
      }
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (currentObjectUrl === url) {
        URL.revokeObjectURL(url);
        currentObjectUrl = null;
      }
      if (currentAudio === audio) currentAudio = null;
      reject(new Error("Lecture audio impossible"));
    };
    void audio.play().catch((err) => {
      if (session !== speakSession || signal.aborted) {
        resolve();
        return;
      }
      reject(err);
    });
  });
}

/** Lecture TTS ElevenLabs en respectant les préférences utilisateur. */
export async function speakText(text: string, language?: string): Promise<void> {
  const cleaned = stripSpeakHtml(text);
  if (!cleaned || !isSpeakingEnabled()) return;

  stopSpeaking();

  const session = ++speakSession;
  const abort = new AbortController();
  currentAbort = abort;

  const parts = chunkText(cleaned);
  for (const part of parts) {
    if (session !== speakSession || abort.signal.aborted || !isSpeakingEnabled()) return;

    let blob: Blob;
    try {
      blob = await synthesizeCandidatSpeech(part, language, getPreferredVoiceId(), abort.signal);
    } catch (err) {
      if (abort.signal.aborted || session !== speakSession) return;
      throw err;
    }

    await playBlob(blob, session, abort.signal);
  }
}

/** Narration question + options (A, B, C…). */
export function buildQuizSpeakText(
  prompt: string,
  options: Array<{ label?: string | null; texte: string }>,
): string {
  const q = stripSpeakHtml(prompt);
  const lines = options.map((opt, i) => {
    const letter = (opt.label || String.fromCharCode(65 + i)).trim();
    return `Option ${letter}. ${stripSpeakHtml(opt.texte)}`;
  });
  return [q, ...lines].filter(Boolean).join(". ");
}

export function stopSpeaking(): void {
  speakSession += 1;
  if (currentAbort) {
    currentAbort.abort();
    currentAbort = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}
