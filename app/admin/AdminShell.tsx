"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

type NavItem = { href: string; label: string; group: string; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    group: "Insights",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    group: "Manage",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/publish",
    label: "Publish",
    group: "Manage",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    group: "Manage",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
];

const GROUPS = ["Insights", "Manage"];

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

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(900px 420px at 82% -8%, rgba(0,167,157,0.10), transparent 60%), radial-gradient(700px 380px at 6% 100%, rgba(79,205,196,0.12), transparent 62%), var(--gray-100)",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0"
        style={{
          background: "linear-gradient(180deg, #003d38 0%, #005850 62%, #00655c 100%)",
          transform: sidebarOpen ? "translateX(0)" : undefined,
          boxShadow: "6px 0 30px rgba(0,61,56,0.22)",
        }}
        aria-label="Admin navigation"
      >
        {/* soft glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(320px 220px at 10% 0%, rgba(79,205,196,0.22), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Brand */}
        <div
          className="relative flex items-center gap-3 px-5 h-16 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-10 w-10 rounded-xl overflow-hidden shrink-0 relative"
            style={{
              background: "#f1f2f2",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
            }}
          >
            <Image src="/future focus.jpeg" alt="" fill sizes="40px" className="object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Future<span style={{ color: "var(--ff-300)" }}>Focus</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Admin console
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group}>
              <p
                className="px-3.5 mb-2 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-heading)" }}
              >
                {group}
              </p>
              <div className="space-y-1">
                {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={[
                        "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                        "hover:bg-white/10 hover:text-white",
                        active
                          ? "bg-white/15 text-white shadow-[0_6px_18px_-8px_rgba(0,0,0,0.6)]"
                          : "text-white/65",
                      ].join(" ")}
                      style={{ fontFamily: "var(--font-heading)" }}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          left: -6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 3,
                          height: active ? 22 : 0,
                          borderRadius: 999,
                          background: "linear-gradient(180deg, var(--ff-300), var(--ff-500))",
                          boxShadow: active ? "0 0 12px rgba(79,205,196,0.9)" : "none",
                          transition: "height 0.25s ease",
                        }}
                      />
                      <span style={{ color: active ? "var(--ff-300)" : "rgba(255,255,255,0.55)" }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-medium transition-colors duration-200 hover:text-white"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-heading)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View public site
            <span
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--ff-300)" }}
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
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
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(16px) saturate(160%)",
            WebkitBackdropFilter: "blur(16px) saturate(160%)",
            borderBottom: "1px solid rgba(12,13,13,0.06)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 24px -20px rgba(0,61,56,0.5)",
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
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] hidden sm:inline" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>
                  Admin
                </span>
                <span className="hidden sm:inline text-[10px]" style={{ color: "var(--gray-300)" }} aria-hidden="true">
                  /
                </span>
                <h1
                  className="text-base sm:text-lg font-extrabold"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}
                >
                  {currentLabel}
                </h1>
              </div>
              <p className="text-[11px] hidden sm:block" style={{ color: "var(--gray-500)" }}>
                {today}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 pr-3" style={{ borderRight: "1px solid var(--gray-100)" }}>
              <div className="text-right leading-tight">
                <p className="text-xs font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                  {name}
                </p>
                <p className="text-[10px]" style={{ color: "var(--gray-500)" }}>{email}</p>
              </div>
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-extrabold relative"
                style={{
                  background: "linear-gradient(135deg, var(--ff-400), var(--ff-700))",
                  color: "#fff",
                  fontFamily: "var(--font-heading)",
                  boxShadow: "0 6px 16px -6px rgba(0,167,157,0.7)",
                }}
                aria-hidden="true"
              >
                {name.charAt(0).toUpperCase()}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
                  style={{ background: "#22c55e", border: "2px solid #fff" }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="group text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200"
              style={{
                fontFamily: "var(--font-heading)",
                background: "transparent",
                border: "1.5px solid var(--gray-100)",
                color: "var(--gray-700)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--ff-400)";
                e.currentTarget.style.color = "var(--ff-700)";
                e.currentTarget.style.background = "var(--ff-50)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--gray-100)";
                e.currentTarget.style.color = "var(--gray-700)";
                e.currentTarget.style.background = "transparent";
              }}
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
