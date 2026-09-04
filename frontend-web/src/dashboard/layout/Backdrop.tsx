import { useSidebar } from "../context/SidebarContext";

export default function Backdrop() {
  const { isMobileOpen, closeMobile } = useSidebar();
  if (!isMobileOpen) return null;
  return <button type="button" className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" aria-label="Fermer" onClick={closeMobile} />;
}
