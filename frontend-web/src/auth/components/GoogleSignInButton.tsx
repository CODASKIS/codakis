import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { GoogleIcon } from "./AuthFormControls";

type GoogleSignInButtonProps = {
  label: string;
  onSuccess: (idToken: string) => void;
  onError?: () => void;
};

export function isGoogleAuthEnabled(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
}

/**
 * Habillage Nunito du bouton Google.
 *
 * Le widget officiel est rendu dans une iframe accounts.google.com : il est donc
 * impossible de le déclencher depuis notre page. On le superpose transparent
 * au-dessus de l'habillage pour que le clic parte du vrai bouton Google — seule
 * façon fiable sur mobile, où le flux s'ouvre dans un nouvel onglet.
 */
export default function GoogleSignInButton({ label, onSuccess, onError }: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

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

  return (
    <div className="codakis-auth-google-wrap">
      <span className="codakis-auth-google" aria-hidden="true">
        <GoogleIcon />
        <span>{label}</span>
      </span>
      <div className="codakis-auth-google-overlay">
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
