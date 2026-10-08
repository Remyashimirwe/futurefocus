"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/",             label: "Home" },
  { href: "/programs",     label: "Programs" },
  { href: "/why-choose-us", label: "Why Choose Us" },
  { href: "/gallery",      label: "Gallery" },
  { href: "/contact",      label: "Contact Us" },
];

type NavTheme = "dark" | "light";

// Pages whose first screen is a dark hero → element id of that hero
const DARK_HERO_ROUTES: Record<string, string> = {
  "/": "home",
  "/apply": "apply-hero",
  "/login": "login-hero",
};

// Navbar height: compact when scrolled, taller at top
const NAV_H_TOP      = 64; // px — at top of page
const NAV_H_SCROLLED = 52; // px — after scroll

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const darkHeroId = DARK_HERO_ROUTES[pathname] ?? null;
  const [scrolled, setScrolled] = useState(false);
  const [navTheme, setNavTheme] = useState<NavTheme>(darkHeroId ? "dark" : "light");
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync navbar height to CSS variable so hero can read it
  useEffect(() => {
    const update = () => {
      const h = window.scrollY > 40 ? NAV_H_SCROLLED : NAV_H_TOP;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Track scroll for bg transition
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dark-hero pages: dark while the hero is on screen, light once past it
  useEffect(() => {
    if (!darkHeroId) return;
    const el = document.getElementById(darkHeroId);
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setNavTheme(entry.isIntersecting ? "dark" : "light"),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [darkHeroId]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href === pathname) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(href);
    }
  };

  const handleApplyClick = () => {
    setMenuOpen(false);
    if (pathname === "/apply") {
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/apply");
    }
  };

  const handleLoginClick = () => {
    setMenuOpen(false);
    if (pathname === "/login") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/login");
    }
  };

  const isDark    = navTheme === "dark";
  const isAtHero  = !scrolled && isDark;

  const navBg = isAtHero
    ? "transparent"
    : isDark
    ? "rgba(0,30,27,0.94)"
    : "rgba(255,255,255,0.97)";

  const textColor  = isAtHero || isDark ? "rgba(255,255,255,0.88)" : "var(--gray-700)";
  const logoColor  = isAtHero || isDark ? "#fff"                   : "var(--ff-800)";
  const hoverBg    = isAtHero || isDark ? "rgba(255,255,255,0.1)"  : "var(--ff-50)";
  const hoverText  = isAtHero || isDark ? "#fff"                   : "var(--ff-700)";

  const navH = scrolled ? NAV_H_SCROLLED : NAV_H_TOP;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: navH,
        transition: "height 0.3s ease, background 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease",
        background: navBg,
        backdropFilter: isAtHero ? "none" : "blur(18px)",
        WebkitBackdropFilter: isAtHero ? "none" : "blur(18px)",
        boxShadow: isAtHero ? "none" : isDark ? "0 1px 0 rgba(255,255,255,0.06)" : "0 1px 0 rgba(0,0,0,0.08)",
        borderBottom: isAtHero ? "none" : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Full-width inner — no max-width container, touches edges */}
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: "clamp(1rem, 3vw, 2.5rem)",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => handleNavClick("/")}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem" }}
          aria-label="Future Focus Academy — back to top"
        >
          <div style={{ height: scrolled ? 38 : 44, width: scrolled ? 38 : 44, borderRadius: scrolled ? 10 : 11, background: "#f1f2f2", position: "relative", overflow: "hidden", flexShrink: 0, transition: "height 0.3s ease, width 0.3s ease, border-radius 0.3s ease" }}>
            <Image src="/future focus.jpeg" alt="" fill sizes="44px" priority style={{ objectFit: "cover", transform: "scale(1.12)" }} />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em", lineHeight: 1, color: logoColor, transition: "color 0.4s ease" }}>
            Future<span style={{ color: "var(--ff-400)" }}>Focus</span> Academy
          </span>
        </button>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-0.5" role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <button
                  onClick={() => handleNavClick(href)}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.84rem",
                    fontWeight: isActive ? 600 : 500,
                    padding: "0.42rem 0.9rem",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    border: "none",
                    background: isActive
                      ? isAtHero || isDark ? "rgba(255,255,255,0.14)" : "var(--ff-500)"
                      : "transparent",
                    color: isActive ? "#fff" : textColor,
                    transition: "background 0.22s, color 0.22s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
                      (e.currentTarget as HTMLButtonElement).style.color = hoverText;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = textColor;
                    }
                  }}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Login + Apply CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={handleLoginClick}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.84rem",
              fontWeight: 600,
              padding: "0.46rem 1.15rem",
              borderRadius: "9999px",
              background: "transparent",
              border: `1.5px solid ${isAtHero || isDark ? "rgba(255,255,255,0.35)" : "var(--gray-300)"}`,
              color: textColor,
              cursor: "pointer",
              transition: "background 0.22s, color 0.22s, border-color 0.22s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
              (e.currentTarget as HTMLButtonElement).style.color = hoverText;
              (e.currentTarget as HTMLButtonElement).style.borderColor = isAtHero || isDark ? "rgba(255,255,255,0.7)" : "var(--ff-400)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = textColor;
              (e.currentTarget as HTMLButtonElement).style.borderColor = isAtHero || isDark ? "rgba(255,255,255,0.35)" : "var(--gray-300)";
            }}
          >
            Login
          </button>
          <button
            onClick={handleApplyClick}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.84rem",
              fontWeight: 600,
              padding: "0.5rem 1.2rem",
              borderRadius: "9999px",
              background: "var(--ff-500)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 3px 16px rgba(0,167,157,0.35)",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background  = "var(--ff-400)";
              (e.currentTarget as HTMLButtonElement).style.transform   = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow   = "0 6px 24px rgba(24,186,175,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background  = "var(--ff-500)";
              (e.currentTarget as HTMLButtonElement).style.transform   = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow   = "0 3px 16px rgba(0,167,157,0.35)";
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)"; }}
            onMouseUp={(e)   => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
          >
            Apply Now
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{ background: "none", border: "none", cursor: "pointer", color: isAtHero || isDark ? "#fff" : "var(--gray-700)", padding: "0.4rem", transition: "color 0.4s" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className="md:hidden overflow-hidden"
        style={{
          maxHeight: menuOpen ? "450px" : "0",
          transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)",
          background: isDark ? "rgba(0,30,27,0.97)" : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <ul className="flex flex-col" role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <button
                  onClick={() => handleNavClick(href)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.9rem clamp(1rem, 3vw, 2.5rem)",
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 600 : 500,
                    background: isActive ? "var(--ff-500)" : "transparent",
                    color: isActive ? "#fff" : isDark ? "rgba(255,255,255,0.8)" : "var(--gray-700)",
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
          <li style={{ padding: `0.75rem clamp(1rem, 3vw, 2.5rem) 0.4rem` }}>
            <button
              onClick={handleLoginClick}
              style={{
                width: "100%",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "0.7rem",
                borderRadius: "9999px",
                background: "transparent",
                border: `1.5px solid ${isDark ? "rgba(255,255,255,0.3)" : "var(--gray-300)"}`,
                color: isDark ? "rgba(255,255,255,0.9)" : "var(--gray-700)",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              Login
            </button>
          </li>
          <li style={{ padding: `0.4rem clamp(1rem, 3vw, 2.5rem) 0.9rem` }}>
            <button
              onClick={handleApplyClick}
              style={{ width: "100%", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.9rem", padding: "0.75rem", borderRadius: "9999px", background: "var(--ff-500)", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Apply Now →
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}
