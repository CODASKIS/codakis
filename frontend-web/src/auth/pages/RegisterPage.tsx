import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { CEMAC_COUNTRIES } from "../../data/cemacCountries";
import { MOCK_DRIVING_SCHOOLS } from "../../data/mockDrivingSchools";
import {
  AuthDivider,
  AuthField,
  AuthInput,
  AuthInputBox,
  AuthPasswordInput,
  AuthSelect,
} from "../components/AuthFormControls";
import GoogleSignInButton, { isGoogleAuthEnabled } from "../components/GoogleSignInButton";
import AuthSplitLayout from "../components/AuthSplitLayout";
import {
  AuthApiError,
  loginWithGoogle,
  registerCandidatAccount,
  resolveAuthRedirect,
} from "../authStore";
import { ROLE_CONFIG } from "../roles";
import { AUTH_PATHS } from "../../constants/authPaths";
import { parsePurchaseIntentFromSearch, rememberPurchaseIntent } from "../purchaseIntent";
import type { ParcoursSouhaite, TypePermis } from "../types";

type RegisterPageProps = {
  role: "candidat";
};

const LICENSE_OPTIONS: TypePermis[] = ["B", "A", "A1", "C", "D", "BE"];
const COURSE_OPTIONS: ParcoursSouhaite[] = ["code", "conduite", "complet"];
const TOTAL_STEPS = 4;

export default function RegisterPage({ role }: RegisterPageProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const config = ROLE_CONFIG[role];
  const purchaseIntent = useMemo(() => parsePurchaseIntentFromSearch(searchParams), [searchParams]);
  const purchaseSchool = useMemo(
    () => (purchaseIntent ? MOCK_DRIVING_SCHOOLS.find((s) => s.id === purchaseIntent.schoolId) : null),
    [purchaseIntent],
  );

  const [step, setStep] = useState(1);
  const [typePermis, setTypePermis] = useState<TypePermis>("B");
  const [parcoursSouhaite, setParcoursSouhaite] = useState<ParcoursSouhaite>("complet");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("cm");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function finishAuth() {
    if (purchaseIntent) rememberPurchaseIntent(purchaseIntent);
    setStep(4);
  }

  function goToApp() {
    navigate(resolveAuthRedirect(role), { replace: true });
  }

  async function handleGoogleSignup(idToken: string) {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(idToken, { typePermis, parcoursSouhaite });
      finishAuth();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !username.trim() || !password.trim() || !confirmPassword.trim() || !country) {
      setError(t("auth.errors.required"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("auth.errors.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      await registerCandidatAccount(
        {
          fullName: fullName.trim(),
          username: username.trim(),
          password,
          phone: phone.trim() || undefined,
          city: city.trim() || undefined,
          country,
          typePermis,
          parcoursSouhaite,
        },
        i18n.language.startsWith("en") ? "en" : "fr",
      );
      finishAuth();
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  const loginHref = purchaseIntent
    ? `${AUTH_PATHS.login}?${searchParams.toString()}`
    : config.loginPath;

  const stepLabels = [
    t("auth.register.steps.selectLicense"),
    t("auth.register.steps.selectCourse"),
    t("auth.register.steps.createAccount"),
    t("auth.register.steps.startLearning"),
  ];

  return (
    <>
      <PageMeta
        title={t("auth.register.metaTitle", { role: t(`auth.roles.${role}.title`) })}
        description={t("auth.register.metaDescription")}
      />
      <AuthSplitLayout backHref={AUTH_PATHS.login} backLabel={t("auth.backToLogin")}>
        <div className="codakis-auth__panel codakis-auth__panel--wide codakis-auth__panel--register">
          <nav className="codakis-auth-stepper" aria-label={t("auth.register.steps.aria")}>
            {stepLabels.map((label, index) => {
              const number = index + 1;
              const done = number < step;
              const current = number === step;
              return (
                <div
                  key={label}
                  className={[
                    "codakis-auth-stepper__item",
                    done ? "is-done" : "",
                    current ? "is-current" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="codakis-auth-stepper__badge" aria-hidden="true">
                    {done ? "✓" : number}
                  </span>
                  <span className="codakis-auth-stepper__label">{label}</span>
                  {number < TOTAL_STEPS ? <span className="codakis-auth-stepper__line" aria-hidden="true" /> : null}
                </div>
              );
            })}
          </nav>

          {step === 1 ? (
            <div className="codakis-auth-step">
              <h1 className="codakis-auth__title">{t("auth.register.steps.selectLicense")}</h1>
              <p className="codakis-auth__subtitle">{t("auth.register.licenseSubtitle")}</p>
              <div className="codakis-auth-choice-list" role="radiogroup" aria-label={t("auth.register.steps.selectLicense")}>
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
              <button type="button" className="codakis-auth-form__submit" onClick={() => setStep(2)}>
                {t("auth.register.continue")}
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="codakis-auth-step">
              <h1 className="codakis-auth__title">{t("auth.register.steps.selectCourse")}</h1>
              <p className="codakis-auth__subtitle">{t("auth.register.courseSubtitle")}</p>
              <div className="codakis-auth-choice-list" role="radiogroup" aria-label={t("auth.register.steps.selectCourse")}>
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
              <div className="codakis-auth-step__actions">
                <button type="button" className="codakis-auth-form__secondary" onClick={() => setStep(1)}>
                  {t("auth.register.back")}
                </button>
                <button type="button" className="codakis-auth-form__submit" onClick={() => setStep(3)}>
                  {t("auth.register.continue")}
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="codakis-auth-step">
              <h1 className="codakis-auth__title">{t("auth.register.title")}</h1>
              <p className="codakis-auth__subtitle">
                {purchaseSchool
                  ? t("auth.register.purchaseHint", { school: purchaseSchool.name })
                  : t("auth.register.freeAccountHint")}
              </p>
              <p className="codakis-auth__summary">
                {t("auth.register.selectionSummary", {
                  license: t(`auth.register.licenses.${typePermis}.label`),
                  course: t(`auth.register.courses.${parcoursSouhaite}.label`),
                })}{" "}
                <button type="button" className="codakis-auth__summary-edit" onClick={() => setStep(1)}>
                  {t("auth.register.changeSelection")}
                </button>
              </p>

              {isGoogleAuthEnabled() ? (
                <>
                  <GoogleSignInButton
                    label={t("auth.google.signUp")}
                    onSuccess={(token) => void handleGoogleSignup(token)}
                    onError={() => setError(t("auth.errors.google"))}
                  />
                  <AuthDivider label={t("auth.orDivider")} />
                </>
              ) : null}

              <form className="codakis-auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
                <AuthField label={t("auth.fields.fullName")} htmlFor="fullName">
                  <AuthInputBox>
                    <AuthInput
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder={t("auth.fields.fullNamePlaceholder")}
                    />
                  </AuthInputBox>
                </AuthField>

                <AuthField label={t("auth.fields.emailOrUsername")} htmlFor="register-username">
                  <AuthInputBox>
                    <AuthInput
                      id="register-username"
                      type="email"
                      autoComplete="email"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder={t("auth.fields.emailPlaceholder")}
                    />
                  </AuthInputBox>
                </AuthField>

                <AuthField label={t("auth.fields.country")} htmlFor="country">
                  <AuthInputBox>
                    <AuthSelect
                      id="country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      required
                    >
                      {CEMAC_COUNTRIES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {t(`coverage.countries.${item.nameKey}`)}
                        </option>
                      ))}
                    </AuthSelect>
                  </AuthInputBox>
                </AuthField>

                <AuthField label={t("auth.fields.phoneAndCity")} htmlFor="phone">
                  <AuthInputBox className="codakis-auth-box--stack-mobile">
                    <AuthInput
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder={t("auth.fields.phonePlaceholder")}
                    />
                    <AuthInput
                      id="city"
                      type="text"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder={t("auth.fields.cityPlaceholder")}
                    />
                  </AuthInputBox>
                </AuthField>

                <AuthField label={t("auth.fields.password")} htmlFor="register-password">
                  <AuthPasswordInput
                    id="register-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("auth.fields.passwordPlaceholder")}
                  />
                </AuthField>

                <AuthField label={t("auth.fields.confirmPassword")} htmlFor="register-confirm-password">
                  <AuthPasswordInput
                    id="register-confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={t("auth.fields.confirmPasswordPlaceholder")}
                  />
                </AuthField>

                {error ? <p className="codakis-auth-form__error">{error}</p> : null}

                <div className="codakis-auth-step__actions">
                  <button type="button" className="codakis-auth-form__secondary" onClick={() => setStep(2)} disabled={loading}>
                    {t("auth.register.back")}
                  </button>
                  <button type="submit" className="codakis-auth-form__submit" disabled={loading}>
                    {loading
                      ? t("common.loading")
                      : purchaseSchool
                        ? t("auth.register.submitAndContinue")
                        : t("auth.register.submit")}
                  </button>
                </div>
              </form>

              <p className="codakis-auth-form__footer">
                {t("auth.register.hasAccount")}{" "}
                <Link to={loginHref}>{t("auth.register.loginLink")}</Link>
              </p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="codakis-auth-step codakis-auth-step--done">
              <h1 className="codakis-auth__title">{t("auth.register.steps.startLearning")}</h1>
              <p className="codakis-auth__subtitle">{t("auth.register.doneSubtitle")}</p>
              <p className="codakis-auth__summary">
                {t("auth.register.selectionSummary", {
                  license: t(`auth.register.licenses.${typePermis}.label`),
                  course: t(`auth.register.courses.${parcoursSouhaite}.label`),
                })}
              </p>
              <button type="button" className="codakis-auth-form__submit" onClick={goToApp}>
                {purchaseSchool ? t("auth.register.submitAndContinue") : t("auth.register.startCta")}
              </button>
            </div>
          ) : null}
        </div>
      </AuthSplitLayout>
    </>
  );
}
