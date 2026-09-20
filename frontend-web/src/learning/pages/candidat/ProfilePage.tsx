import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Loader from "../../../components/common/Loader";
import PrefToggle from "../../../components/prefs/PrefToggle";
import { clearSession, getSession, setSession } from "../../../auth/authStore";
import { fetchMe, updateProfile, userToSession } from "../../../lib/authApi";
import { changePassword } from "../../../lib/pedagogyApi";
import { AUTH_PATHS } from "../../../constants/authPaths";

type Tab = "compte" | "securite";

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "securite" ? "securite" : "compte";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [typePermis, setTypePermis] = useState("");
  const [parcours, setParcours] = useState("");
  const [hasPassword, setHasPassword] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  /** MFA non implémentée — toggle visible mais désactivé. */
  const [mfaEnabled] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "securite") setTab("securite");
  }, [searchParams]);

  useEffect(() => {
    if (tab !== "securite" || loading) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [tab, loading]);

  useEffect(() => {
    let cancelled = false;
    void fetchMe()
      .then((user) => {
        if (cancelled) return;
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setPhone(user.phone ?? "");
        setTypePermis(user.type_permis ?? "");
        setParcours(user.parcours_souhaite ?? "");
        setHasPassword(user.has_password !== false);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Profil indisponible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const user = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      setSession(userToSession(user));
      setMessage("Profil mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onPasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPwdMessage("");
    setPwdError("");
    if (newPassword.length < 8) {
      setPwdError(t("account.passwordTooShort", "Le mot de passe doit contenir au moins 8 caractères."));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(t("account.passwordMismatch", "Les mots de passe ne correspondent pas."));
      return;
    }
    setPwdSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwdMessage(t("account.passwordSuccess", "Mot de passe mis à jour."));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : t("account.passwordError", "Impossible de modifier le mot de passe."));
    } finally {
      setPwdSaving(false);
    }
  }

  function logout() {
    clearSession();
    navigate("/connexion", { replace: true });
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-settings">
      <nav className="ck-settings__nav" aria-label="Paramètres">
        <button type="button" className={tab === "compte" ? "is-active" : undefined} onClick={() => setTab("compte")}>
          Gérer le compte
        </button>
        <button type="button" className={tab === "securite" ? "is-active" : undefined} onClick={() => setTab("securite")}>
          Sécurité
        </button>
        <Link to="/espace/candidat/preferences">Préférences</Link>
      </nav>

      <div className="ck-settings__panel">
        {tab === "compte" ? (
          <>
            <h1 className="ck-title">Gérer le compte</h1>
            <p className="ck-subtitle">{getSession()?.email}</p>

            <div className="ck-settings__section">
              <h2>Cours</h2>
              <label className="ck-form" style={{ display: "block" }}>
                <select value={typePermis || "permis_b"} disabled>
                  <option value="permis_b">Permis B</option>
                  <option value="permis_a">Permis A</option>
                  <option value="permis_c">Permis C</option>
                </select>
              </label>
              {parcours ? (
                <p className="ck-subtitle" style={{ marginTop: "0.8rem", marginBottom: 0 }}>
                  Parcours : {parcours}
                </p>
              ) : null}
            </div>

            <form className="ck-form ck-settings__section" onSubmit={(e) => void onSubmit(e)}>
              <h2>Identité</h2>
              <label>
                Prénom
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </label>
              <label>
                Nom
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </label>
              <label>
                Téléphone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              {error ? <p className="ck-empty">{error}</p> : null}
              {message ? (
                <p className="ck-empty" style={{ color: "var(--ck-green)" }}>
                  {message}
                </p>
              ) : null}
              <button type="submit" className="ck-btn ck-btn--primary" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </form>

            <div className="ck-settings__section">
              <h2>Liens</h2>
              <Link to="/espace/candidat/consort" className="ck-settings__link">
                Dossier Consort
              </Link>
              <Link to="/espace/candidat/auto-ecole" className="ck-settings__link">
                Auto-école & forfaits
              </Link>
              <a href="/mentions-legales" className="ck-settings__link">
                Termes et conditions
              </a>
              <a href="/confidentialite" className="ck-settings__link">
                Politique de confidentialité
              </a>
            </div>

            <button type="button" className="ck-settings__danger" onClick={logout}>
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <h1 className="ck-title">{t("account.securityTitle", "Sécurité du compte")}</h1>
            <p className="ck-subtitle">
              {t(
                "account.securityHint",
                "Changez votre mot de passe. La double authentification sera disponible bientôt.",
              )}
            </p>

            <div className="ck-settings__section ck-settings__mfa" id="mfa">
              <h2>Authentification à deux facteurs (MFA)</h2>
              <PrefToggle
                id="mfa-toggle"
                label="Activer la MFA"
                hint="Bientôt disponible — non implémentée pour le moment."
                checked={mfaEnabled}
                disabled
                onChange={() => undefined}
              />
            </div>

            {!hasPassword ? (
              <div className="ck-settings__section" id="mot-de-passe">
                <h2>{t("account.passwordTitle", "Mot de passe")}</h2>
                <p className="ck-subtitle">
                  {t(
                    "account.passwordGoogleHint",
                    "Ce compte utilise la connexion Google. Utilisez « Mot de passe oublié » pour définir un mot de passe local si besoin.",
                  )}
                </p>
                <Link to={AUTH_PATHS.forgotPassword} className="ck-btn ck-btn--primary">
                  Définir un mot de passe
                </Link>
              </div>
            ) : (
              <form
                className="ck-form ck-settings__section"
                id="mot-de-passe"
                onSubmit={(e) => void onPasswordSubmit(e)}
              >
                <h2>{t("account.passwordTitle", "Mot de passe")}</h2>
                <p className="ck-subtitle">
                  {t(
                    "account.passwordHint",
                    "Utilisez au moins 8 caractères. Votre session reste active après le changement.",
                  )}
                </p>
                <label>
                  {t("account.currentPassword", "Mot de passe actuel")}
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {t("account.newPassword", "Nouveau mot de passe")}
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </label>
                <label>
                  {t("account.confirmPassword", "Confirmer le mot de passe")}
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </label>
                {pwdError ? <p className="ck-empty">{pwdError}</p> : null}
                {pwdMessage ? (
                  <p className="ck-empty" style={{ color: "var(--ck-green)" }} role="status">
                    {pwdMessage}
                  </p>
                ) : null}
                <button type="submit" className="ck-btn ck-btn--primary" disabled={pwdSaving}>
                  {pwdSaving
                    ? t("account.passwordSaving", "Mise à jour…")
                    : t("account.passwordSave", "Mettre à jour le mot de passe")}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
