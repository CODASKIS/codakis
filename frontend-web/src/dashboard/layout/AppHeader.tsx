import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { CODAKIS_LOGO_ICON } from "../../flexjobs/components/BrandLogo";
import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../header/UserDropdown";

type Props = {
  title?: string;
  profileTo: string;
};

export default function AppHeader({ title, profileTo }: Props) {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  function handleToggle() {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  }

  return (
    <header className="sticky top-0 z-30 flex w-full border-b border-gray-200 bg-white">
      <div className="flex w-full items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-brand-50 hover:text-brand-700"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
          <Link to="/" className="lg:hidden">
            <img src={CODAKIS_LOGO_ICON} alt="CODAKIS" className="h-9 w-9 object-contain" />
          </Link>
          {title ? <h1 className="ta-header-title hidden sm:block">{title}</h1> : null}
        </div>

        <UserDropdown profileTo={profileTo} />
      </div>
    </header>
  );
}
