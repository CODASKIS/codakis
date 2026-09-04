import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import {
  AuthDivider,
  AuthField,
  AuthInput,
  AuthInputBox,
  AuthPasswordInput,
} from "../components/AuthFormControls";
import GoogleSignInButton, { isGoogleAuthEnabled } from "../components/GoogleSignInButton";
import AuthSplitLayout from "../components/AuthSplitLayout";
import {
  AuthApiError,
  loginWithCredentials,
  loginWithGoogle,
  resolveAuthRedirect,
} from "../authStore";
import type { UserRole } from "../types";
import { parsePurchaseIntentFromSearch, rememberPurchaseIntent } from "../purchaseIntent";
import { fetchPublicSchool } from "../../lib/publicSchoolsApi";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseIntent = useMemo(() => parsePurchaseIntentFromSearch(searchParams), [searchParams]);
  const [purchaseSchoolName, setPurchaseSchoolName] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!purchaseIntent?.schoolId) {
      setPurchaseSchoolName(null);
      return;
    }
    let cancelled = false;
    void fetchPublicSchool(purchaseIntent.schoolId)
      .then((school) => {
        if (!cancelled) setPurchaseSchoolName(school.name);
      })
      .catch(() => {
        if (!cancelled) setPurchaseSchoolName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [purchaseIntent]);

  function finishAuth(role: UserRole) {
    if (purchaseIntent) rememberPurchaseIntent(purchaseIntent);
    navigate(resolveAuthRedirect(role), { replace: true });
  }

  async function handleGoogleLogin(idToken: string) {
    setError("");
    setLoading(true);
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
      <AuthSplitLayout backHref="/" backLabel={t("auth.backToSite")} mood="login">
        <div className="codakis-auth__panel">
          <h1 className="codakis-auth__title">{t("auth.login.pageTitle")}</h1>
          <p className="codakis-auth__subtitle">
            {purchaseSchoolName
              ? t("auth.login.purchaseHint", { school: purchaseSchoolName })
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

            {error ? <p className="codakis-auth-form__error">{error}</p> : null}

            <button type="submit" className="codakis-auth-form__submit" disabled={loading}>
              {loading ? t("common.loading") : t("auth.login.submit")}
            </button>
          </form>

          <p className="codakis-auth-form__footer">
            <Link to={AUTH_PATHS.forgotPassword}>{t("auth.login.forgot")}</Link>
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
