"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/publish",
    label: "Publish",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
];

export default function AdminShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const currentLabel =
    NAV_ITEMS.find((item) => isActive(item.href))?.label ?? "Overview";

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-100)" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0"
        style={{
          background: "linear-gradient(180deg, #003d38 0%, #005850 100%)",
          transform: sidebarOpen ? "translateX(0)" : undefined,
          boxShadow: "4px 0 24px rgba(0,61,56,0.18)",
        }}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 h-16 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 relative" style={{ background: "#f1f2f2" }}>
            <Image src="/future focus.jpeg" alt="" fill sizes="36px" className="object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Future<span style={{ color: "var(--ff-400)" }}>Focus</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Control Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: active ? "rgba(255,255,255,0.13)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.65)",
                  border: `1px solid ${active ? "rgba(255,255,255,0.14)" : "1px solid transparent"}`,
                }}
              >
                <span style={{ color: active ? "var(--ff-300)" : "rgba(255,255,255,0.5)" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-heading)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View public site
          </Link>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--gray-100)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg cursor-pointer"
              style={{ background: "none", border: "none", color: "var(--gray-700)" }}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {sidebarOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
                )}
              </svg>
            </button>
            <h1
              className="text-base sm:text-lg font-extrabold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}
            >
              {currentLabel}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pr-3" style={{ borderRight: "1px solid var(--gray-100)" }}>
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))", color: "#fff", fontFamily: "var(--font-heading)" }}
                aria-hidden="true"
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                  {name}
                </p>
                <p className="text-[10px]" style={{ color: "var(--gray-500)" }}>{email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors duration-200"
              style={{
                fontFamily: "var(--font-heading)",
                background: "transparent",
                border: "1.5px solid var(--gray-100)",
                color: "var(--gray-700)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ff-400)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--gray-100)")}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
