import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import {
  AuthField,
  AuthInput,
  AuthInputBox,
  AuthPasswordInput,
} from "../components/AuthFormControls";
import AuthSplitLayout from "../components/AuthSplitLayout";
import { AuthApiError, confirmPasswordReset, requestPasswordReset } from "../authStore";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError(t("auth.errors.required"));
      return;
    }

    setLoading(true);
    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message);
      if (response.debugOtp) {
        setOtp(response.debugOtp);
      }
      setStep("reset");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!otp.trim() || !newPassword.trim()) {
      setError(t("auth.errors.required"));
      return;
    }

    setLoading(true);
    try {
      const response = await confirmPasswordReset(email.trim(), otp.trim(), newPassword);
      setMessage(response);
      navigate(AUTH_PATHS.login, { replace: true });
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta title={t("auth.forgot.metaTitle")} description={t("auth.forgot.metaDescription")} />
      <AuthSplitLayout backHref={AUTH_PATHS.login} backLabel={t("auth.backToLogin")}>
        <div className="codakis-auth__panel">
          <h1 className="codakis-auth__title">{t("auth.forgot.title")}</h1>
          <p className="codakis-auth__subtitle">{t("auth.forgot.subtitle")}</p>
          <p className="codakis-auth__hint">{t("auth.forgot.hint")}</p>

          {message && step === "email" ? <p className="codakis-auth-form__success">{message}</p> : null}

          {step === "email" ? (
            <form className="codakis-auth-form" onSubmit={(event) => void handleEmailSubmit(event)} noValidate>
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

              <button type="submit" className="codakis-auth-form__submit" disabled={loading}>
                {loading ? t("common.loading") : t("auth.forgot.submit")}
              </button>
            </form>
          ) : (
            <form className="codakis-auth-form" onSubmit={(event) => void handleResetSubmit(event)} noValidate>
              <AuthField label={t("auth.forgot.otpLabel")} htmlFor="forgot-otp">
                <AuthInputBox>
                  <AuthInput
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder={t("auth.forgot.otpPlaceholder")}
                  />
                </AuthInputBox>
              </AuthField>

              <AuthField label={t("auth.fields.password")} htmlFor="forgot-new-password">
                <AuthPasswordInput
                  id="forgot-new-password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={t("auth.fields.passwordPlaceholder")}
                />
              </AuthField>

              {error ? <p className="codakis-auth-form__error">{error}</p> : null}
              {message ? <p className="codakis-auth-form__success">{message}</p> : null}

              <button type="submit" className="codakis-auth-form__submit" disabled={loading}>
                {loading ? t("common.loading") : t("auth.forgot.resetSubmit")}
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
