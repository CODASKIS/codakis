import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { CEMAC_COUNTRIES } from "../../data/cemacCountries";
import { MOCK_DRIVING_SCHOOLS } from "../../data/mockDrivingSchools";
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
  loginWithGoogle,
  registerCandidatAccount,
  resolveAuthRedirect,
} from "../authStore";
import { ROLE_CONFIG } from "../roles";
import { AUTH_PATHS } from "../../constants/authPaths";
import { parsePurchaseIntentFromSearch, rememberPurchaseIntent } from "../purchaseIntent";

type RegisterPageProps = {
  role: "candidat";
};

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

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("cm");
  const [language, setLanguage] = useState(i18n.language);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function applyLanguage() {
    if (language !== i18n.language) {
      void i18n.changeLanguage(language);
    }
  }

  function finishAuth() {
    if (purchaseIntent) rememberPurchaseIntent(purchaseIntent);
    navigate(resolveAuthRedirect(role), { replace: true });
  }

  async function handleGoogleSignup(idToken: string) {
    setError("");
    setLoading(true);
    applyLanguage();
    try {
      await loginWithGoogle(idToken);
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

    applyLanguage();
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
        },
        language.startsWith("en") ? "en" : "fr",
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

  return (
    <>
      <PageMeta
        title={t("auth.register.metaTitle", { role: t(`auth.roles.${role}.title`) })}
        description={t("auth.register.metaDescription")}
      />
      <AuthSplitLayout backHref={AUTH_PATHS.login} backLabel={t("auth.backToLogin")}>
        <div className="codakis-auth__panel codakis-auth__panel--wide codakis-auth__panel--register">
          <h1 className="codakis-auth__title">{t("auth.register.title")}</h1>
          <p className="codakis-auth__subtitle">
            {purchaseSchool
              ? t("auth.register.purchaseHint", { school: purchaseSchool.name })
              : t(`auth.roles.${role}.registerHint`)}
          </p>

          <p className="codakis-auth-form__hint">{t("auth.register.freeAccountHint")}</p>

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

            <AuthField label={t("auth.fields.language")} htmlFor="register-language">
              <AuthInputBox>
                <AuthSelect
                  id="register-language"
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
              {loading ? t("common.loading") : purchaseSchool ? t("auth.register.submitAndContinue") : t("auth.register.submit")}
            </button>
          </form>

          <p className="codakis-auth-form__footer">
            {t("auth.register.hasAccount")}{" "}
            <Link to={loginHref}>{t("auth.register.loginLink")}</Link>
          </p>
        </div>
      </AuthSplitLayout>
    </>
  );
}
