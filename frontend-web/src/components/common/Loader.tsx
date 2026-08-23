import type { ReactNode } from "react";
import CodakisLoaderPanel from "./CodakisLoaderPanel";

interface LoaderProps {
  variant?: "page" | "section" | "inline";
  message?: string;
  className?: string;
  children?: ReactNode;
  theme?: "default" | "flexjobs";
}

/** Loader unifié CODAKIS — logo + spinner aux mêmes dimensions partout. */
export default function Loader({
  variant = "section",
  message,
  className = "",
  children,
}: LoaderProps) {
  const content = (
    <>
      <CodakisLoaderPanel message={message} />
      {children}
    </>
  );

  if (variant === "page") {
    return (
      <div className={`codakis-loader-overlay ${className}`.trim()}>
        {content}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`codakis-loader-inline ${className}`.trim()}>
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

export { CodakisLoaderPanel };
