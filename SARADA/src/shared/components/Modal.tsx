import React, { useEffect, useRef } from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl" | "2xl" | "full";
  hideHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md", hideHeader = false }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  // Keyboard: Escape closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management: auto-focus first focusable element on open
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-[95vw]",
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-content ${sizeClasses[size]} animate-scale-in`}
      >
        {!hideHeader && (
          <div className="modal-header">
            <h2
              id={titleId}
              className="modal-title"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label={`Close ${title} dialog`}
              className="modal-close-btn"
            >
              Close
            </button>
          </div>
        )}
        <div className="modal-body custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
