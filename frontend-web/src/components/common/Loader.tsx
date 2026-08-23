import type { ReactNode } from "react";

const spinnerClass =
  "animate-spin rounded-full border-solid border-brand-500 border-t-transparent";

export function LoaderSpinner({
  size = "lg",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div
      className={`${spinnerClass} ${sizes[size]} ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

interface LoaderProps {
  /** Plein écran (preloader TailAdmin) */
  variant?: "page" | "section" | "inline";
  message?: string;
  className?: string;
  children?: ReactNode;
  theme?: "default" | "flexjobs";
}

/** Preloader TailAdmin — overlay plein écran ou bloc centré */
export default function Loader({
  variant = "section",
  message,
  className = "",
  children,
  theme = "default",
}: LoaderProps) {
  const flexjobs = theme === "flexjobs";

  const content = flexjobs ? (
    <>
      <div className="fj-inline-loader__spinner" role="status" aria-label="Chargement" />
      {message ? <p className="fj-inline-loader__message">{message}</p> : null}
      {children}
    </>
  ) : (
    <>
      <LoaderSpinner size="lg" />
      {message && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
      {children}
    </>
  );

  if (variant === "page") {
    return (
      <div className="fixed top-0 left-0 z-999999 flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center text-center">{content}</div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={
          flexjobs
            ? `fj-inline-loader ${className}`.trim()
            : `flex w-full flex-col items-center justify-center py-16 text-center ${className}`
        }
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center text-center lg:min-h-[calc(100vh-5rem)] ${className}`}
    >
      {content}
    </div>
  );
}
