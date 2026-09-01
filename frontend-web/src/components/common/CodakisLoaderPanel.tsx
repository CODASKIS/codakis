import { CODAKIS_LOGO_ICON } from "../../flexjobs/components/BrandLogo";

export const CODAKIS_LOADER_LOGO_PX = 48;

type CodakisLoaderPanelProps = {
  message?: string;
  className?: string;
  showLogo?: boolean;
};

/** Panneau loader CODAKIS — logo animé uniquement (sans spinner séparé). */
export default function CodakisLoaderPanel({
  message,
  className = "",
  showLogo = true,
}: CodakisLoaderPanelProps) {
  return (
    <div className={`codakis-loader-panel${className ? ` ${className}` : ""}`}>
      {showLogo ? (
        <img
          src={CODAKIS_LOGO_ICON}
          alt=""
          className="codakis-loader-panel__logo codakis-loader-panel__logo--spin"
          width={CODAKIS_LOADER_LOGO_PX}
          height={CODAKIS_LOADER_LOGO_PX}
          aria-hidden
        />
      ) : null}
      {message ? <p className="codakis-loader-panel__text">{message}</p> : null}
    </div>
  );
}
