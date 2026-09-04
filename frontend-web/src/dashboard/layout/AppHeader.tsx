import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { CODAKIS_LOGO_ICON } from "../../flexjobs/components/BrandLogo";
import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../header/UserDropdown";

type Props = {
  /** Titre de la page courante (nav active). */
  title?: string;
  /** Libellé d’espace (ex. Espace gérant) — affiché en secondaire. */
  spaceLabel?: string;
  profileTo: string;
  preferencesTo: string;
};

export default function AppHeader({ title, spaceLabel, profileTo, preferencesTo }: Props) {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  function handleToggle() {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  }

  return (
    <header className="sticky top-0 z-30 flex w-full border-b border-[var(--ck-line)] bg-white">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button type="button" className="ta-header-toggle shrink-0" onClick={handleToggle} aria-label="Menu">
            {isMobileOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
          <Link
            to="/"
            className="shrink-0 lg:hidden"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img
              src={CODAKIS_LOGO_ICON}
              alt="CODAKIS"
              style={{ width: "2.2rem", height: "2.2rem", objectFit: "contain" }}
            />
          </Link>
          <div className="ta-header-titles min-w-0">
            {title ? <h1 className="ta-header-title">{title}</h1> : null}
            {spaceLabel ? <p className="ta-header-space">{spaceLabel}</p> : null}
          </div>
        </div>

        <UserDropdown profileTo={profileTo} preferencesTo={preferencesTo} />
      </div>
    </header>
  );
}
