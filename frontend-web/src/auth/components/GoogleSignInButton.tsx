import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type GoogleSignInButtonProps = {
  label: string;
  onSuccess: (idToken: string) => void;
  onError?: () => void;
};

export function isGoogleAuthEnabled(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
}

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
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.()}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
