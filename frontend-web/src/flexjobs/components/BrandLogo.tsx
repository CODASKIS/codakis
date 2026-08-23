import { Link } from "react-router";

export const CODAKIS_LOGO = "/images/logo.png";
export const CODAKIS_LOGO_ICON = "/images/logo-simple.png";

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
  const logoSrc = variant === "icon" ? CODAKIS_LOGO_ICON : CODAKIS_LOGO;

  return (
    <Link
      to={linkTo}
      className={`fj-brand fj-brand--codakis${size === "sm" ? " fj-brand--sm" : ""}${variant === "icon" ? " fj-brand--icon-only" : ""}`}
    >
      <img
        src={logoSrc}
        alt="CODAKIS"
        className={`fj-brand__logo${variant === "full" ? " fj-brand__logo--wordmark" : ""}`}
        width={variant === "full" ? 180 : 48}
        height={48}
      />
      {showTagline && size === "header" && variant === "full" ? (
        <span className="fj-brand__tagline fj-brand__tagline--hidden" aria-hidden="true" />
      ) : null}
    </Link>
  );
}
