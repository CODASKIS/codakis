export type ElevenLabsVoiceOption = {
  id: string;
  label: string;
  lang: "fr" | "en" | "both";
};

/** Voix ElevenLabs curatées pour le parcours CODAKIS. */
export const ELEVENLABS_VOICES: ElevenLabsVoiceOption[] = [
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella (FR)", lang: "fr" },
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel", lang: "both" },
  { id: "pNInz6obpgDQGcFmaJgB", label: "Adam (EN)", lang: "en" },
  { id: "MF3mGyEYCl7XYWbV9V6O", label: "Elli", lang: "both" },
  { id: "TxGEqnHWrfWFTfGW9XjX", label: "Josh", lang: "en" },
  { id: "VR6AewLTigWG4xSOukaG", label: "Arnold", lang: "en" },
  { id: "yoZ06aMxZJJ28mfd3POQ", label: "Sam", lang: "both" },
];

export type UserPreferences = {
  soundEffects: boolean;
  speakingEnabled: boolean;
  elevenLabsVoiceId: string;
};

const STORAGE_KEY = "codakis.userPreferences";

const DEFAULTS: UserPreferences = {
  soundEffects: true,
  speakingEnabled: true,
  elevenLabsVoiceId: ELEVENLABS_VOICES[0].id,
};

type Listener = (prefs: UserPreferences) => void;
const listeners = new Set<Listener>();

function readPrefs(): UserPreferences {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    const voiceOk = ELEVENLABS_VOICES.some((v) => v.id === parsed.elevenLabsVoiceId);
    return {
      soundEffects: parsed.soundEffects ?? DEFAULTS.soundEffects,
      speakingEnabled: parsed.speakingEnabled ?? DEFAULTS.speakingEnabled,
      elevenLabsVoiceId: voiceOk ? (parsed.elevenLabsVoiceId as string) : DEFAULTS.elevenLabsVoiceId,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function getUserPreferences(): UserPreferences {
  return readPrefs();
}

export function setUserPreferences(patch: Partial<UserPreferences>): UserPreferences {
  const next = { ...readPrefs(), ...patch };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((fn) => fn(next));
  return next;
}

export function subscribeUserPreferences(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPreferredVoiceId(): string {
  return readPrefs().elevenLabsVoiceId;
}

export function isSpeakingEnabled(): boolean {
  return readPrefs().speakingEnabled;
}
