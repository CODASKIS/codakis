import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
};

export function Modal({ isOpen, onClose, children, className = "", showCloseButton = true }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto p-4">
      <button type="button" className="fixed inset-0 bg-gray-400/50 backdrop-blur-[32px]" aria-label="Fermer" onClick={onClose} />
      <div
        ref={modalRef}
      className={`relative w-full max-w-lg rounded-3xl border border-[#e4e7ec] bg-white shadow-[0_20px_40px_rgba(16,24,40,0.12)] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        ) : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
