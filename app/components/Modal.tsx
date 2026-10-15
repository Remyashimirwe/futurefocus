"use client";

import { useEffect, useRef } from "react";

/**
 * Centered popup dialog in the admin's light-glass style: frosted panel that
 * scales in over a blurred backdrop, gradient accent bar, optional icon tile
 * and subtitle. Closes on Escape, on a click outside the panel, or via the
 * header close button. Locks page scroll while open and moves focus inside.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
  subtitle,
  icon,
  tone = "brand",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  /** Small line under the title. */
  subtitle?: string;
  /** Optional icon shown in a rounded tile next to the title. */
  icon?: React.ReactNode;
  /** Drives the accent bar / icon tile colour. */
  tone?: "brand" | "danger";
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

  const accent =
    tone === "danger"
      ? "linear-gradient(90deg, #ef4444 0%, #f87171 40%, rgba(248,113,113,0) 90%)"
      : "linear-gradient(90deg, var(--ff-500) 0%, var(--ff-300) 40%, rgba(79,205,196,0) 90%)";

  const tile =
    tone === "danger"
      ? { background: "#fff1f1", border: "1px solid #ffd7d7", color: "#b42318" }
      : {
          background: "linear-gradient(135deg, var(--ff-100), var(--ff-50))",
          border: "1px solid var(--ff-100)",
          color: "var(--ff-700)",
        };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      style={{
        background: "rgba(6, 24, 22, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "ffFadeIn 0.2s ease-out both",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} my-8 overflow-hidden rounded-[26px]`}
        style={{
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow:
            "0 40px 90px -32px rgba(0,43,39,0.5), 0 2px 8px rgba(0,43,39,0.06)",
          animation: "ffCardIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Gradient accent bar */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: accent }}
        />

        <div className="flex items-start gap-3.5 px-5 sm:px-6 pt-6 pb-4">
          {icon && (
            <div
              aria-hidden="true"
              className="shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center"
              style={tile}
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-extrabold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--gray-500)" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 cursor-pointer transition-colors duration-200 hover:bg-[var(--gray-100)]"
            style={{ color: "var(--gray-500)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 sm:px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
