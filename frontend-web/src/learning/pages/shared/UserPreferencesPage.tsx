import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { clearSession } from "../../../auth/authStore";
import PrefToggle from "../../../components/prefs/PrefToggle";
import {
  ELEVENLABS_VOICES,
  getUserPreferences,
  setUserPreferences,
  subscribeUserPreferences,
  type UserPreferences,
} from "../../../lib/userPreferences";

type Props = {
  profileTo: string;
  preferencesTo: string;
};

export default function UserPreferencesPage({ profileTo, preferencesTo }: Props) {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<UserPreferences>(() => getUserPreferences());

  useEffect(() => subscribeUserPreferences(setPrefs), []);

  useEffect(() => {
    document.title = "Préférences · CODAKIS";
  }, []);

  function patch(next: Partial<UserPreferences>) {
    setPrefs(setUserPreferences(next));
  }

  function logout() {
    clearSession();
    navigate("/connexion", { replace: true });
  }

  return (
    <div className="ck-prefs-page">
      <div className="ck-prefs-page__main">
        <h1 className="ck-prefs-page__title">Préférences</h1>

        <section className="ck-prefs-page__section">
          <h2 className="ck-prefs-page__section-title">Paramètres des leçons</h2>

          <PrefToggle
            id="ck-page-pref-sound"
            label="Effets sonores"
            checked={prefs.soundEffects}
            onChange={(soundEffects) => patch({ soundEffects })}
          />
          <PrefToggle
            id="ck-page-pref-speak"
            label="Lecture vocale"
            checked={prefs.speakingEnabled}
            onChange={(speakingEnabled) => patch({ speakingEnabled })}
          />
        </section>

        <section className="ck-prefs-page__section">
          <h2 className="ck-prefs-page__section-title">Voix</h2>
          <div className="ck-prefs__field">
            <span className="ck-prefs__label">Voix ElevenLabs</span>
            <select
              className="ck-prefs__select"
              value={prefs.elevenLabsVoiceId}
              aria-label="Voix ElevenLabs"
              onChange={(e) => patch({ elevenLabsVoiceId: e.target.value })}
            >
              {ELEVENLABS_VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      <aside className="ck-prefs-page__aside" aria-label="Navigation paramètres">
        <div className="ck-prefs-page__card">
          <nav className="ck-prefs-page__nav">
            <Link to={profileTo} className="ck-prefs-page__nav-item">
              Compte
            </Link>
            <Link to={preferencesTo} className="ck-prefs-page__nav-item is-active" aria-current="page">
              Préférences
            </Link>
            <Link to={profileTo} className="ck-prefs-page__nav-item">
              Profil
            </Link>
          </nav>
        </div>

        <button type="button" className="ck-prefs-page__logout" onClick={logout}>
          Se déconnecter
        </button>
      </aside>
    </div>
  );
}
