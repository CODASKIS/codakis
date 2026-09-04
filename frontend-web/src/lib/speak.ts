import { getPreferredVoiceId, isSpeakingEnabled } from "../lib/userPreferences";
import { synthesizeCandidatSpeech } from "../lib/pedagogyApi";

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

/** Lecture TTS ElevenLabs en respectant les préférences utilisateur. */
export async function speakText(text: string, language?: string): Promise<void> {
  const cleaned = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned || !isSpeakingEnabled()) return;

  stopSpeaking();

  const blob = await synthesizeCandidatSpeech(cleaned, language, getPreferredVoiceId());
  const url = URL.createObjectURL(blob);
  currentObjectUrl = url;
  const audio = new Audio(url);
  currentAudio = audio;

  await new Promise<void>((resolve, reject) => {
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
    void audio.play().catch(reject);
  });
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}
