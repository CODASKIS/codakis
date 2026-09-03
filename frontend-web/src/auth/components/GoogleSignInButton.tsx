import { useRef } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { GoogleAuthButton } from "./AuthFormControls";

type GoogleSignInButtonProps = {
  label: string;
  onSuccess: (idToken: string) => void;
  onError?: () => void;
};

export function isGoogleAuthEnabled(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
}

/** Bouton Google custom (Nunito) ; le widget officiel reste invisible pour le flux OAuth. */
export default function GoogleSignInButton({ label, onSuccess, onError }: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  if (!clientId) {
    return null;
  }

  function handleSuccess(response: CredentialResponse) {
    if (response.credential) {
      onSuccess(response.credential);
      return;
    }
    onError?.();
  }

  function handleClick() {
    const btn = hiddenBtnRef.current?.querySelector("div[role='button']") as HTMLElement | null;
    if (btn) {
      btn.click();
      return;
    }
    onError?.();
  }

  return (
    <div className="codakis-auth-google-wrap">
      <GoogleAuthButton label={label} onClick={handleClick} />
      <div ref={hiddenBtnRef} className="codakis-auth-google-hidden" aria-hidden="true">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.()}
          useOneTap={false}
          theme="outline"
          size="large"
          width="400"
          text="continue_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
}
