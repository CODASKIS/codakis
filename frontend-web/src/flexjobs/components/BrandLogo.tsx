import { Link } from "react-router";
import { useTheme } from "../../context/ThemeContext";

export const CODAKIS_LOGO = "/images/logo.png";
export const CODAKIS_LOGO_DARK = "/images/logo-dark.png";
export const CODAKIS_LOGO_ICON = "/images/logo-simple.png";

export function CodakisWordmark({ className }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <img
      src={theme === "dark" ? CODAKIS_LOGO_DARK : CODAKIS_LOGO}
      alt="CODAKIS"
      className={className}
    />
  );
}

type BrandLogoProps = {
  linkTo?: string;
  variant?: "full" | "icon";
  showTagline?: boolean;
  size?: "header" | "sm";
};

export default function BrandLogo({
  linkTo = "/",
  variant = "full",
  showTagline = true,
  size = "header",
}: BrandLogoProps) {
  return (
    <Link
      to={linkTo}
      className={`fj-brand fj-brand--codakis${size === "sm" ? " fj-brand--sm" : ""}${variant === "icon" ? " fj-brand--icon-only" : ""}`}
    >
      {variant === "icon" ? (
        <img
          src={CODAKIS_LOGO_ICON}
          alt="CODAKIS"
          className="fj-brand__logo"
          width={48}
          height={48}
        />
      ) : (
        <CodakisWordmark className="fj-brand__logo fj-brand__logo--wordmark" />
      )}
      {showTagline && size === "header" && variant === "full" ? (
        <span className="fj-brand__tagline fj-brand__tagline--hidden" aria-hidden="true" />
      ) : null}
    </Link>
  );
}
