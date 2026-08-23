import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import { supportedLanguages } from "../../i18n";
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
  getSession,
  loginWithCredentials,
  loginWithGoogle,
  resolveAuthRedirect,
} from "../authStore";
import type { UserRole } from "../types";
import { parsePurchaseIntentFromSearch, rememberPurchaseIntent } from "../purchaseIntent";
import { MOCK_DRIVING_SCHOOLS } from "../../data/mockDrivingSchools";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = getSession();
  const purchaseIntent = useMemo(() => parsePurchaseIntentFromSearch(searchParams), [searchParams]);
  const purchaseSchool = useMemo(
    () => (purchaseIntent ? MOCK_DRIVING_SCHOOLS.find((s) => s.id === purchaseIntent.schoolId) : null),
    [purchaseIntent],
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState(i18n.language);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Navigate to={resolveAuthRedirect(session.role)} replace />;
  }

  function applyLanguage() {
    if (language !== i18n.language) {
      void i18n.changeLanguage(language);
    }
  }

  function finishAuth(role: UserRole) {
    if (purchaseIntent) rememberPurchaseIntent(purchaseIntent);
    navigate(resolveAuthRedirect(role), { replace: true });
  }

  async function handleGoogleLogin(idToken: string) {
    setError("");
    setLoading(true);
    applyLanguage();
    try {
      const newSession = await loginWithGoogle(idToken);
      finishAuth(newSession.role);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError(t("auth.errors.required"));
      return;
    }

    applyLanguage();
    setLoading(true);
    try {
      const newSession = await loginWithCredentials(username.trim(), password);
      finishAuth(newSession.role);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  const registerHref = purchaseIntent
    ? `${AUTH_PATHS.register.candidat}?${searchParams.toString()}`
    : AUTH_PATHS.register.candidat;

  return (
    <>
      <PageMeta title={t("auth.login.pageTitle")} description={t("auth.login.metaDescription")} />
      <AuthSplitLayout backHref="/" backLabel={t("auth.backToSite")}>
        <div className="codakis-auth__panel">
          <h1 className="codakis-auth__title">{t("auth.login.pageTitle")}</h1>
          <p className="codakis-auth__subtitle">
            {purchaseSchool
              ? t("auth.login.purchaseHint", { school: purchaseSchool.name })
              : t("auth.login.subtitle")}
          </p>

          {isGoogleAuthEnabled() ? (
            <>
              <GoogleSignInButton
                label={t("auth.google.signIn")}
                onSuccess={(token) => void handleGoogleLogin(token)}
                onError={() => setError(t("auth.errors.google"))}
              />
              <AuthDivider label={t("auth.orDivider")} />
            </>
          ) : null}

          <form className="codakis-auth-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
            <AuthField label={t("auth.fields.emailOrUsername")} htmlFor="username">
              <AuthInputBox>
                <AuthInput
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={t("auth.fields.usernamePlaceholder")}
                />
              </AuthInputBox>
            </AuthField>

            <AuthField label={t("auth.fields.password")} htmlFor="password">
              <AuthPasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.fields.passwordPlaceholder")}
              />
            </AuthField>

            <AuthField label={t("auth.fields.language")} htmlFor="language">
              <AuthInputBox>
                <AuthSelect
                  id="language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  {supportedLanguages.map((lng) => (
                    <option key={lng} value={lng}>
                      {t(`auth.languages.${lng}`)}
                    </option>
                  ))}
                </AuthSelect>
              </AuthInputBox>
            </AuthField>

            {error ? <p className="codakis-auth-form__error">{error}</p> : null}

            <button type="submit" className="codakis-auth-form__submit" disabled={loading}>
              {loading ? t("common.loading") : t("auth.login.submit")}
            </button>
          </form>

          <p className="codakis-auth-form__footer">
            <Link to="/connexion/mot-de-passe">{t("auth.login.forgot")}</Link>
          </p>

          <p className="codakis-auth-form__footer">
            {t("auth.login.noAccount")}{" "}
            <Link to={registerHref}>{t("auth.login.registerLink")}</Link>
          </p>
        </div>
      </AuthSplitLayout>
    </>
  );
}
