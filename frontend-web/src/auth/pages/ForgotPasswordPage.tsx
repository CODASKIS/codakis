import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import { AuthField, AuthInput, AuthInputBox } from "../components/AuthFormControls";
import AuthSplitLayout from "../components/AuthSplitLayout";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("auth.errors.required"));
      return;
    }

    setSent(true);
  }

  return (
    <>
      <PageMeta title={t("auth.forgot.metaTitle")} description={t("auth.forgot.metaDescription")} />
      <AuthSplitLayout backHref={AUTH_PATHS.login} backLabel={t("auth.backToLogin")}>
        <div className="codakis-auth__panel">
          <h1 className="codakis-auth__title">{t("auth.forgot.title")}</h1>
          <p className="codakis-auth__subtitle">{t("auth.forgot.subtitle")}</p>
          <p className="codakis-auth__hint">{t("auth.forgot.hint")}</p>

          {sent ? (
            <p className="codakis-auth-form__success">{t("auth.forgot.sent", { email })}</p>
          ) : (
            <form className="codakis-auth-form" onSubmit={handleSubmit} noValidate>
              <AuthField label={t("auth.fields.emailOrUsername")} htmlFor="forgot-email">
                <AuthInputBox>
                  <AuthInput
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("auth.fields.emailPlaceholder")}
                  />
                </AuthInputBox>
              </AuthField>

              {error ? <p className="codakis-auth-form__error">{error}</p> : null}

              <button type="submit" className="codakis-auth-form__submit">
                {t("auth.forgot.submit")}
              </button>
            </form>
          )}

          <p className="codakis-auth-form__footer">
            <Link to={AUTH_PATHS.login}>{t("auth.backToLogin")}</Link>
            {" · "}
            <Link to="/contact">{t("auth.forgot.contact")}</Link>
          </p>
        </div>
      </AuthSplitLayout>
    </>
  );
}
