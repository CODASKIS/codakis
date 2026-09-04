import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Dropdown({ isOpen, onClose, children, className = "" }: Props) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !target.closest(".dropdown-toggle")
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 z-50 mt-3 rounded-2xl border border-gray-200 bg-white shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
