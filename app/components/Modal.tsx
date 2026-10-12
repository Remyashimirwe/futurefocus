"use client";

import { useEffect, useRef } from "react";

/**
 * Centered popup dialog. Closes on Escape, on a click outside the panel, or via
 * the header close button. Locks page scroll while open and moves focus inside.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Held in a ref so re-renders (every keystroke in a controlled field) don't
  // re-run the effect below and steal focus back to the first input.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("input, textarea, select, button")
        ?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(12, 13, 13, 0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${width} my-8 rounded-2xl p-5 sm:p-6`}
        style={{
          background: "var(--white)",
          border: "1px solid var(--gray-100)",
          boxShadow: "0 24px 60px rgba(12, 13, 13, 0.22)",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3
            className="text-base font-extrabold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 cursor-pointer transition-colors"
            style={{ color: "var(--gray-500)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-100)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
