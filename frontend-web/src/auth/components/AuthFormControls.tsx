import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

type AuthFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function AuthField({ label, htmlFor, children }: AuthFieldProps) {
  return (
    <div className="codakis-auth-form__field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

type AuthInputBoxProps = {
  children: ReactNode;
  className?: string;
};

export function AuthInputBox({ children, className }: AuthInputBoxProps) {
  return <div className={`codakis-auth-box${className ? ` ${className}` : ""}`}>{children}</div>;
}

export function AuthInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`codakis-auth-box__input${props.className ? ` ${props.className}` : ""}`} />;
}

export function AuthSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`codakis-auth-box__select${props.className ? ` ${props.className}` : ""}`} />
  );
}

type AuthPasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function AuthPasswordInput(props: AuthPasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <AuthInputBox className="codakis-auth-box--with-toggle">
      <AuthInput {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="codakis-auth-box__toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? t("auth.password.hide") : t("auth.password.show")}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
      </button>
    </AuthInputBox>
  );
}

type AuthInputWithActionProps = {
  input: InputHTMLAttributes<HTMLInputElement>;
  actionLabel: string;
  onAction: () => void;
  actionType?: "button" | "submit";
};

export function AuthInputWithAction({
  input,
  actionLabel,
  onAction,
  actionType = "button",
}: AuthInputWithActionProps) {
  return (
    <AuthInputBox className="codakis-auth-box--with-action">
      <AuthInput {...input} />
      <button type={actionType} className="codakis-auth-box__action" onClick={onAction} aria-label={actionLabel}>
        {actionLabel}
      </button>
    </AuthInputBox>
  );
}

export function GoogleIcon() {
  return (
    <svg className="codakis-auth-google__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type GoogleAuthButtonProps = {
  label: string;
  onClick: () => void;
};

export function GoogleAuthButton({ label, onClick }: GoogleAuthButtonProps) {
  return (
    <button type="button" className="codakis-auth-google" onClick={onClick}>
      <GoogleIcon />
      <span>{label}</span>
    </button>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="codakis-auth-divider" role="separator">
      <span>{label}</span>
    </div>
  );
}
