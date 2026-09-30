"use client";

import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#programs", label: "Programs" },
  { href: "#why-choose-us", label: "Why Choose Us" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact Us" },
];

type NavTheme = "dark" | "light";

interface ThemeEntry {
  id: string;
  theme: NavTheme;
}

// Each page section declares its background theme via data-nav-theme attribute.
// The navbar reads which section is currently intersecting its bottom edge.
const SECTION_THEMES: ThemeEntry[] = [
  { id: "home",          theme: "dark"  }, // teal hero
  { id: "programs",      theme: "light" }, // white/light bg
  { id: "why-choose-us", theme: "light" }, // white
  { id: "gallery",       theme: "light" }, // light teal bg
  { id: "contact",       theme: "light" }, // white
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [navTheme, setNavTheme] = useState<NavTheme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Track scroll for collapsed state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection Observer to detect which section is behind the navbar
  useEffect(() => {
    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    const NAVBAR_H = 90;

    SECTION_THEMES.forEach(({ id, theme }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setNavTheme(theme);
            setActiveSection(id);
          }
        },
        {
          // Observe a thin horizontal slice at the navbar bottom
          rootMargin: `-${NAVBAR_H}px 0px -${window.innerHeight - NAVBAR_H - 2}px 0px`,
          threshold: 0,
        }
      );
      obs.observe(el);
      observersRef.current.push(obs);
    });

    return () => observersRef.current.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Derived style values
  const isDark = navTheme === "dark";
  const isAtHero = !scrolled && activeSection === "home";

  // Navbar container bg
  let navBg: string;
  if (isAtHero) {
    navBg = "transparent";
  } else if (isDark) {
    navBg = "rgba(0,56,52,0.92)";
  } else {
    navBg = "rgba(255,255,255,0.96)";
  }

  const textColor   = isAtHero || isDark ? "rgba(255,255,255,0.88)" : "var(--gray-700)";
  const logoColor   = isAtHero || isDark ? "#fff"                   : "var(--ff-800)";
  const logoAccent  = "var(--ff-400)";
  const hoverText   = isAtHero || isDark ? "#fff"                   : "var(--ff-700)";
  const borderColor = isAtHero || isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ paddingTop: scrolled ? "0.6rem" : "1.25rem", transition: "padding 0.35s ease" }}
    >
      <div className="ff-container">
        <nav
          role="navigation"
          aria-label="Main navigation"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "1rem",
            padding: scrolled ? "0.6rem 1.25rem" : "0.85rem 1.5rem",
            background: navBg,
            backdropFilter: isAtHero ? "none" : "blur(16px)",
            WebkitBackdropFilter: isAtHero ? "none" : "blur(16px)",
            boxShadow: isAtHero
              ? "none"
              : isDark
              ? "0 4px 32px rgba(0,0,0,0.3)"
              : "0 4px 32px rgba(0,0,0,0.07)",
            border: `1px solid ${borderColor}`,
            transition:
              "background 0.4s ease, box-shadow 0.4s ease, padding 0.35s ease, border-color 0.4s ease",
          }}
        >
          {/* Logo */}
          <button
            onClick={() => handleNavClick("#home")}
            className="flex items-center gap-2.5 cursor-pointer"
            aria-label="Future Focus — go to top"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <div
              style={{
                height: 36,
                width: 36,
                borderRadius: 10,
                background: "var(--ff-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "0.8rem",
                flexShrink: 0,
                transition: "background 0.4s ease",
              }}
            >
              FF
            </div>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: logoColor,
                transition: "color 0.4s ease",
              }}
            >
              Future
              <span style={{ color: logoAccent }}>Focus</span>
            </span>
          </button>

          {/* Desktop links */}
          <ul
            className="hidden md:flex items-center gap-0.5"
            role="list"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const id = href.slice(1);
              const isActive = activeSection === id;
              return (
                <li key={href}>
                  <button
                    onClick={() => handleNavClick(href)}
                    aria-current={isActive ? "page" : undefined}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 600 : 500,
                      padding: "0.45rem 1rem",
                      borderRadius: "9999px",
                      cursor: "pointer",
                      border: "none",
                      background: isActive
                        ? isDark || isAtHero
                          ? "rgba(255,255,255,0.15)"
                          : "var(--ff-500)"
                        : "transparent",
                      color: isActive
                        ? isDark || isAtHero
                          ? "#fff"
                          : "#fff"
                        : textColor,
                      transition: "background 0.25s ease, color 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = hoverText;
                        (e.currentTarget as HTMLButtonElement).style.background =
                          isDark || isAtHero ? "rgba(255,255,255,0.08)" : "var(--ff-50)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = textColor;
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }
                    }}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Apply CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleNavClick("#contact")}
              className="group inline-flex items-center gap-2 font-semibold rounded-full cursor-pointer"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.85rem",
                padding: "0.55rem 1.25rem",
                background: "var(--ff-500)",
                color: "#fff",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,167,157,0.35)",
                transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--ff-400)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(24,186,175,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--ff-500)";
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,167,157,0.35)";
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(0.97)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
            >
              Apply Now
              <svg
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform duration-200"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg cursor-pointer transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            style={{
              background: "none",
              border: "none",
              color: isAtHero || isDark ? "#fff" : "var(--gray-700)",
              transition: "color 0.4s ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden"
          style={{
            maxHeight: menuOpen ? "400px" : "0",
            transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div
            style={{
              marginTop: "0.5rem",
              borderRadius: "1rem",
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            <ul className="flex flex-col py-2" role="list">
              {NAV_LINKS.map(({ href, label }) => {
                const id = href.slice(1);
                const isActive = activeSection === id;
                return (
                  <li key={href}>
                    <button
                      onClick={() => handleNavClick(href)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "0.875rem 1.5rem",
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.9rem",
                        fontWeight: isActive ? 600 : 500,
                        background: isActive ? "var(--ff-500)" : "transparent",
                        color: isActive ? "#fff" : "var(--gray-700)",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.2s, color 0.2s",
                      }}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
              <li style={{ padding: "0.75rem 1rem" }}>
                <button
                  onClick={() => handleNavClick("#contact")}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    padding: "0.75rem",
                    borderRadius: "9999px",
                    background: "var(--ff-500)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Apply Now →
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
