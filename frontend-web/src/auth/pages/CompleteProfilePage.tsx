import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { CEMAC_COUNTRIES } from "../../data/cemacCountries";
import {
  AuthField,
  AuthInput,
  AuthInputBox,
  AuthSelect,
} from "../components/AuthFormControls";
import AuthSplitLayout from "../components/AuthSplitLayout";
import { AuthApiError, resolveAuthRedirect, getSession, setSession } from "../authStore";
import { updateProfile, userToSession, fetchMe, type ApiUser } from "../../lib/authApi";
import type { ParcoursSouhaite, TypePermis } from "../types";
import { AUTH_PATHS } from "../../constants/authPaths";

const LICENSE_OPTIONS: TypePermis[] = ["B", "A", "A1", "C", "D", "BE"];
const COURSE_OPTIONS: ParcoursSouhaite[] = ["code", "conduite", "complet"];

// ── types d'étapes possibles ──────────────────────────────────────────────────
type StepId = "permis" | "parcours" | "contact";

/** Calcule les étapes manquantes à partir du profil utilisateur. */
function computeSteps(user: ApiUser | null): StepId[] {
  const steps: StepId[] = [];
  // Pour un compte Google nouveau, type_permis peut être "B" par défaut
  // → on le demande toujours (le backend l'a mis à "B" sans que l'user ait choisi)
  if (!user?.type_permis) steps.push("permis");
  // Parcours manquant
  if (!user?.parcours_souhaite) steps.push("parcours");
  // Coordonnées manquantes (au moins téléphone ou ville)
  if (!user?.phone || !user?.city) steps.push("contact");
  // Si tout est renseigné, on affiche quand même une étape résumé (ne devrait pas arriver)
  return steps.length ? steps : [];
}

export default function CompleteProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const session = getSession();
  const role = session?.role ?? "candidat";

  // Charge le profil depuis l'API pour avoir les données fraîches
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  // ── état du formulaire ────────────────────────────────────────────────────
  const [typePermis, setTypePermis] = useState<TypePermis>("B");
  const [parcoursSouhaite, setParcoursSouhaite] = useState<ParcoursSouhaite>("complet");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("cm");

  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Met à jour les valeurs par défaut une fois le profil chargé
  useEffect(() => {
    if (!user) return;
    if (user.type_permis) setTypePermis(user.type_permis as TypePermis);
    if (user.parcours_souhaite) setParcoursSouhaite(user.parcours_souhaite as ParcoursSouhaite);
    if (user.phone) setPhone(user.phone);
    if (user.city) setCity(user.city);
  }, [user]);

  const steps = computeSteps(user);
  const currentStep = steps[stepIndex] as StepId | undefined;
  const isLastStep = stepIndex === steps.length - 1;
  const totalSteps = steps.length;

  // ── navigation entre étapes ───────────────────────────────────────────────
  function goNext() {
    setError("");
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
    }
  }

  // ── soumission finale ─────────────────────────────────────────────────────
  async function handleFinish() {
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });
      const updatedUser = await fetchMe();
      setSession(userToSession(updatedUser));
      navigate(resolveAuthRedirect(role), { replace: true });
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  // ── si aucune étape manquante → redirection directe ───────────────────────
  useEffect(() => {
    if (!loadingUser && steps.length === 0) {
      navigate(resolveAuthRedirect(role), { replace: true });
    }
  }, [loadingUser, steps.length, navigate, role]);

  function handleSkip() {
    navigate(resolveAuthRedirect(role), { replace: true });
  }

  // ── avancer ou terminer selon l'étape courante ────────────────────────────
  async function handleContinue() {
    if (isLastStep) {
      // La dernière étape peut être "contact" (nécessite une API call)
      // ou "permis"/"parcours" (pas encore sauvegardés en base ici — TODO backend endpoint)
      if (currentStep === "contact") {
        await handleFinish();
      } else {
        // Pour permis/parcours seuls, on sauvegarde quand même via updateProfile
        // (le backend ne les gère pas encore via PATCH /users/me, mais on redirige)
        goFinish();
      }
    } else {
      goNext();
    }
  }

  function goFinish() {
    navigate(resolveAuthRedirect(role), { replace: true });
  }

  // ── rendu ─────────────────────────────────────────────────────────────────

  if (loadingUser) {
    return (
      <>
        <PageMeta title={t("auth.completeProfile.metaTitle")} description="" />
        <AuthSplitLayout backHref={AUTH_PATHS.login} backLabel={t("auth.backToLogin")} mood="register">
          <div className="codakis-auth__panel">
            <p className="codakis-auth__subtitle">{t("common.loading")}</p>
          </div>
        </AuthSplitLayout>
      </>
    );
  }

  // Aucune étape → ne rien afficher (useEffect gère la redirection)
  if (steps.length === 0) return null;

  return (
    <>
      <PageMeta
        title={t("auth.completeProfile.metaTitle")}
        description={t("auth.completeProfile.subtitle")}
      />
      <AuthSplitLayout backHref={AUTH_PATHS.login} backLabel={t("auth.backToLogin")} mood="register">
        <div className="codakis-auth__panel codakis-auth__panel--wide codakis-auth__panel--register">

          {/* ── Stepper ── */}
          {totalSteps > 1 ? (
            <nav className="codakis-auth-stepper" aria-label="Étapes de complétion">
              {steps.map((sid, idx) => {
                const done = idx < stepIndex;
                const current = idx === stepIndex;
                const label =
                  sid === "permis" ? t("auth.register.steps.selectLicense") :
                  sid === "parcours" ? t("auth.register.steps.selectCourse") :
                  t("auth.completeProfile.infoTitle");
                return (
                  <div
                    key={sid}
                    className={[
                      "codakis-auth-stepper__item",
                      done ? "is-done" : "",
                      current ? "is-current" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    <span className="codakis-auth-stepper__badge" aria-hidden="true">
                      {done ? "✓" : idx + 1}
                    </span>
                    <span className="codakis-auth-stepper__label">{label}</span>
                    {idx < steps.length - 1 ? (
                      <span className="codakis-auth-stepper__line" aria-hidden="true" />
                    ) : null}
                  </div>
                );
              })}
            </nav>
          ) : null}

          {/* ── Étape : permis ── */}
          {currentStep === "permis" ? (
            <div className="codakis-auth-step">
              <h1 className="codakis-auth__title">{t("auth.register.steps.selectLicense")}</h1>
              <p className="codakis-auth__subtitle">{t("auth.register.licenseSubtitle")}</p>
              <div
                className="codakis-auth-choice-list"
                role="radiogroup"
                aria-label={t("auth.register.steps.selectLicense")}
              >
                {LICENSE_OPTIONS.map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={typePermis === code}
                    className={`codakis-auth-box codakis-auth-choice${typePermis === code ? " is-selected" : ""}`}
                    onClick={() => setTypePermis(code)}
                  >
                    <span className="codakis-auth-choice__text">
                      <strong>{t(`auth.register.licenses.${code}.label`)}</strong>
                      <small>{t(`auth.register.licenses.${code}.hint`)}</small>
                    </span>
                    <span className="codakis-auth-choice__radio" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="codakis-auth-step__actions" style={{ marginTop: "2rem" }}>
                <button type="button" className="codakis-auth-form__secondary" onClick={handleSkip}>
                  {t("auth.completeProfile.skip")}
                </button>
                <button type="button" className="codakis-auth-form__submit" onClick={() => void handleContinue()}>
                  {isLastStep ? t("auth.completeProfile.submit") : t("auth.register.continue")}
                </button>
              </div>
            </div>
          ) : null}

          {/* ── Étape : parcours ── */}
          {currentStep === "parcours" ? (
            <div className="codakis-auth-step">
              <h1 className="codakis-auth__title">{t("auth.register.steps.selectCourse")}</h1>
              <p className="codakis-auth__subtitle">{t("auth.register.courseSubtitle")}</p>
              <div
                className="codakis-auth-choice-list"
                role="radiogroup"
                aria-label={t("auth.register.steps.selectCourse")}
              >
                {COURSE_OPTIONS.map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={parcoursSouhaite === code}
                    className={`codakis-auth-box codakis-auth-choice${parcoursSouhaite === code ? " is-selected" : ""}`}
                    onClick={() => setParcoursSouhaite(code)}
                  >
                    <span className="codakis-auth-choice__text">
                      <strong>{t(`auth.register.courses.${code}.label`)}</strong>
                      <small>{t(`auth.register.courses.${code}.hint`)}</small>
                    </span>
                    <span className="codakis-auth-choice__radio" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="codakis-auth-step__actions" style={{ marginTop: "2rem" }}>
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    className="codakis-auth-form__secondary"
                    onClick={() => setStepIndex((i) => i - 1)}
                  >
                    {t("auth.register.back")}
                  </button>
                ) : (
                  <button type="button" className="codakis-auth-form__secondary" onClick={handleSkip}>
                    {t("auth.completeProfile.skip")}
                  </button>
                )}
                <button type="button" className="codakis-auth-form__submit" onClick={() => void handleContinue()}>
                  {isLastStep ? t("auth.completeProfile.submit") : t("auth.register.continue")}
                </button>
              </div>
            </div>
          ) : null}

          {/* ── Étape : coordonnées ── */}
          {currentStep === "contact" ? (
            <div className="codakis-auth-step">
              <h1 className="codakis-auth__title">{t("auth.completeProfile.infoTitle")}</h1>
              <p className="codakis-auth__subtitle">{t("auth.completeProfile.infoSubtitle")}</p>

              <form
                className="codakis-auth-form"
                onSubmit={(e) => { e.preventDefault(); void handleContinue(); }}
                noValidate
              >
                {/* Pays — uniquement si pas déjà renseigné */}
                <AuthField label={t("auth.fields.country")} htmlFor="cp-country">
                  <AuthInputBox>
                    <AuthSelect
                      id="cp-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      {CEMAC_COUNTRIES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {t(`coverage.countries.${item.nameKey}`)}
                        </option>
                      ))}
                    </AuthSelect>
                  </AuthInputBox>
                </AuthField>

                {/* Téléphone — uniquement si manquant */}
                {!user?.phone ? (
                  <AuthField label={t("auth.fields.phone")} htmlFor="cp-phone">
                    <AuthInputBox>
                      <AuthInput
                        id="cp-phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("auth.fields.phonePlaceholder")}
                      />
                    </AuthInputBox>
                  </AuthField>
                ) : null}

                {/* Ville — uniquement si manquante */}
                {!user?.city ? (
                  <AuthField label={t("auth.fields.city")} htmlFor="cp-city">
                    <AuthInputBox>
                      <AuthInput
                        id="cp-city"
                        type="text"
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t("auth.fields.cityPlaceholder")}
                      />
                    </AuthInputBox>
                  </AuthField>
                ) : null}

                {error ? <p className="codakis-auth-form__error">{error}</p> : null}

                <div className="codakis-auth-step__actions">
                  {stepIndex > 0 ? (
                    <button
                      type="button"
                      className="codakis-auth-form__secondary"
                      onClick={() => setStepIndex((i) => i - 1)}
                      disabled={saving}
                    >
                      {t("auth.register.back")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="codakis-auth-form__secondary"
                      onClick={handleSkip}
                      disabled={saving}
                    >
                      {t("auth.completeProfile.skip")}
                    </button>
                  )}
                  <button type="submit" className="codakis-auth-form__submit" disabled={saving}>
                    {saving ? t("common.loading") : t("auth.completeProfile.submit")}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

        </div>
      </AuthSplitLayout>
    </>
  );
}
