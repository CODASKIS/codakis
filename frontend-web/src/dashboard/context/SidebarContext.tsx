import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (hovered: boolean) => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        toggleSidebar: () => setIsExpanded((v) => !v),
        toggleMobileSidebar: () => setIsMobileOpen((v) => !v),
        setIsHovered,
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
