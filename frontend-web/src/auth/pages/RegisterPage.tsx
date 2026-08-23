import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { CEMAC_COUNTRIES } from "../../data/cemacCountries";
import { supportedLanguages } from "../../i18n";
import {
  AuthDivider,
  AuthField,
  AuthInput,
  AuthInputBox,
  AuthPasswordInput,
  AuthSelect,
  GoogleAuthButton,
} from "../components/AuthFormControls";
import AuthSplitLayout from "../components/AuthSplitLayout";
import { getPostLoginPath, isAuthenticatedForRole, loginWithGoogle, register } from "../authStore";
import { ROLE_CONFIG } from "../roles";
import type { UserRole } from "../types";

type RegisterPageProps = {
  role: Extract<UserRole, "candidat" | "gerant">;
};

export default function RegisterPage({ role }: RegisterPageProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role];
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("cm");
  const [schoolName, setSchoolName] = useState("");
  const [language, setLanguage] = useState(i18n.language);
  const [error, setError] = useState("");

  if (isAuthenticatedForRole(role)) {
    return <Navigate to={getPostLoginPath(role)} replace />;
  }

  function applyLanguage() {
    if (language !== i18n.language) {
      void i18n.changeLanguage(language);
    }
  }

  function handleGoogleSignup() {
    applyLanguage();
    const session = loginWithGoogle();
    navigate(getPostLoginPath(session.role), { replace: true });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !username.trim() || !password.trim() || !country) {
      setError(t("auth.errors.required"));
      return;
    }

    if (role === "gerant" && !schoolName.trim()) {
      setError(t("auth.errors.schoolRequired"));
      return;
    }

    applyLanguage();

    register(role, {
      fullName: fullName.trim(),
      username: username.trim(),
      password,
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      country,
      schoolName: schoolName.trim() || undefined,
    });
    navigate(getPostLoginPath(role), { replace: true });
  }

  return (
    <>
      <PageMeta
        title={t("auth.register.metaTitle", { role: t(`auth.roles.${role}.title`) })}
        description={t("auth.register.metaDescription")}
      />
      <AuthSplitLayout backHref={config.loginPath} backLabel={t("auth.backToLogin")}>
        <div className="codakis-auth__panel codakis-auth__panel--wide codakis-auth__panel--register">
          <h1 className="codakis-auth__title">{t("auth.register.title")}</h1>
          <p className="codakis-auth__subtitle">{t(`auth.roles.${role}.registerHint`)}</p>

          <GoogleAuthButton label={t("auth.google.signUp")} onClick={handleGoogleSignup} />
          <AuthDivider label={t("auth.orDivider")} />

          <form className="codakis-auth-form" onSubmit={handleSubmit} noValidate>
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

            {role === "gerant" ? (
              <AuthField label={t("auth.fields.schoolName")} htmlFor="schoolName">
                <AuthInputBox>
                  <AuthInput
                    id="schoolName"
                    type="text"
                    value={schoolName}
                    onChange={(event) => setSchoolName(event.target.value)}
                    placeholder={t("auth.fields.schoolNamePlaceholder")}
                  />
                </AuthInputBox>
              </AuthField>
            ) : null}

            <AuthField label={t("auth.fields.emailOrUsername")} htmlFor="register-username">
              <AuthInputBox>
                <AuthInput
                  id="register-username"
                  type="text"
                  autoComplete="username"
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

            <button type="submit" className="codakis-auth-form__submit">
              {t("auth.register.submit")}
            </button>
          </form>

          <p className="codakis-auth-form__footer">
            {t("auth.register.hasAccount")}{" "}
            <Link to={config.loginPath}>{t("auth.register.loginLink")}</Link>
          </p>
        </div>
      </AuthSplitLayout>
    </>
  );
}
