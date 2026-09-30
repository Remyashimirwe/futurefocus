"use client";

import { useRef, useCallback } from "react";
import { useInView, useReducedMotion } from "../hooks";

// ─── Magnetic hook (local) ────────────────────────────────────────
function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width  / 2)) * strength;
      const dy = (e.clientY - (rect.top  + rect.height / 2)) * strength;
      el.style.transform  = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 0.1s ease";
    },
    [reduced, strength]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform  = "";
    el.style.transition = "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

// ─── Footer link with animated underline ─────────────────────────
function FooterLink({ href, label }: { href: string; label: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const id = href.startsWith("#") ? href.slice(1) : null;
    if (id) {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <a
      href={href}
      onClick={handleClick}
      className="group inline-flex items-center gap-1.5 text-sm"
      style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-heading)", textDecoration: "none", transition: "color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
    >
      <span className="relative">
        {label}
        <span
          className="absolute bottom-0 left-0 h-px rounded-full w-0 group-hover:w-full transition-all duration-300"
          style={{ background: "var(--ff-400)" }}
          aria-hidden="true"
        />
      </span>
    </a>
  );
}

// ─── Social button ────────────────────────────────────────────────
function SocialButton({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const mag = useMagnetic(0.4);
  return (
    <a
      ref={mag.ref as React.RefObject<HTMLAnchorElement>}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseMove={mag.onMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)";
        (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)";
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        mag.onMouseLeave();
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--ff-400)";
        (e.currentTarget as HTMLAnchorElement).style.color = "var(--ff-400)";
        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(24,186,175,0.08)";
      }}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 40, height: 40, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.5)",
        transition: "border-color 0.25s, color 0.25s, background 0.25s",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

// ─── Main Footer ──────────────────────────────────────────────────
export default function Footer() {
  const applyMag = useMagnetic(0.3);
  const reduced  = useReducedMotion();

  // Scroll-triggered reveal for the big headline + word
  const [ctaRef, ctaInView]  = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [wordRef, wordInView] = useInView<HTMLDivElement>({ threshold: 0.05 });

  return (
    <footer
      aria-label="Site footer"
      style={{ background: "var(--ff-900)", overflow: "hidden" }}
      data-nav-theme="dark"
    >
      {/* ── CTA block ──────────────────────────────────────────── */}
      <div className="relative ff-container pt-24 pb-20">

        {/* Giant watermark word — scroll-triggered */}
        <div
          ref={wordRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 0,
            opacity: wordInView || reduced ? 1 : 0,
            transition: reduced ? "none" : "opacity 1.2s ease",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(8rem, 22vw, 22rem)",
              fontWeight: 800,
              letterSpacing: "-0.06em",
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.04)",
              userSelect: "none",
              whiteSpace: "nowrap",
              transform: wordInView || reduced ? "translateY(0)" : "translateY(40px)",
              transition: reduced ? "none" : "opacity 1.2s ease, transform 1.2s ease",
            }}
          >
            YOUR FUTURE
          </span>
        </div>

        {/* Decorative SVG */}
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.7 }}
          viewBox="0 0 1280 560"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="1200" cy="-80" r="380" fill="none" stroke="rgba(24,186,175,0.07)" strokeWidth="1" />
          <circle cx="1200" cy="-80" r="280" fill="none" stroke="rgba(24,186,175,0.05)" strokeWidth="1" />
          <circle cx="-60"  cy="560" r="260" fill="none" stroke="rgba(0,167,157,0.06)"  strokeWidth="1" />
          {[[980,80],[1010,100],[1040,80],[1010,60],[995,90],[1025,90],[1010,75]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="1.5" fill="rgba(24,186,175,0.25)" />
          ))}
          <line x1="0" y1="1" x2="1280" y2="1" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </svg>

        {/* CTA content — scroll reveal */}
        <div
          ref={ctaRef}
          className="relative flex flex-col items-center text-center"
          style={{
            zIndex: 1,
            opacity: ctaInView || reduced ? 1 : 0,
            transform: ctaInView || reduced ? "translateY(0)" : "translateY(32px)",
            transition: reduced ? "none" : "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-7">
            <span className="h-px w-10" style={{ background: "var(--ff-400)" }} />
            <span
              style={{
                fontFamily: "var(--font-heading)", fontSize: "0.65rem", fontWeight: 600,
                letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ff-400)",
              }}
            >
              Ready to Begin?
            </span>
            <span className="h-px w-10" style={{ background: "var(--ff-400)" }} />
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              color: "#fff",
              marginBottom: "1.25rem",
            }}
          >
            Your Future{" "}
            <span
              style={{
                WebkitTextStroke: "2px var(--ff-400)",
                color: "transparent",
              }}
            >
              Starts Here.
            </span>
          </h2>

          {/* Sub-copy */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 1.4vw, 1.125rem)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.5)",
              maxWidth: "38rem",
              marginBottom: "2.5rem",
              opacity: ctaInView || reduced ? 1 : 0,
              transform: ctaInView || reduced ? "translateY(0)" : "translateY(16px)",
              transition: reduced ? "none" : "opacity 0.8s 0.1s ease, transform 0.8s 0.1s ease",
            }}
          >
            Explore our programs, discover your strengths, and take the first step toward a future you&apos;re proud of.
          </p>

          {/* Apply Now */}
          <div
            style={{
              opacity: ctaInView || reduced ? 1 : 0,
              transform: ctaInView || reduced ? "translateY(0)" : "translateY(12px)",
              transition: reduced ? "none" : "opacity 0.8s 0.2s ease, transform 0.8s 0.2s ease",
            }}
          >
            <a
              ref={applyMag.ref as React.RefObject<HTMLAnchorElement>}
              href="#contact"
              onMouseMove={applyMag.onMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--ff-500)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow  = "0 8px 36px rgba(0,167,157,0.35)";
                applyMag.onMouseLeave();
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--ff-400)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow  = "0 12px 48px rgba(24,186,175,0.45)";
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
              onMouseUp={(e)   => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2.5 font-semibold rounded-full"
              style={{
                fontFamily: "var(--font-heading)", fontSize: "0.95rem",
                padding: "1rem 2.25rem",
                background: "var(--ff-500)", color: "#fff",
                boxShadow: "0 8px 36px rgba(0,167,157,0.35)",
                textDecoration: "none",
                transition: "background 0.2s, box-shadow 0.2s, transform 0.15s",
              }}
            >
              Start Your Journey
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="ff-container">
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* ── Nav grid ────────────────────────────────────────────── */}
      <div className="ff-container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand col */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div style={{ height: 40, width: 40, borderRadius: 10, background: "var(--ff-700)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
                FF
              </div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em", color: "#fff" }}>
                Future<span style={{ color: "var(--ff-400)" }}>Focus</span>
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 1.65, color: "rgba(255,255,255,0.4)", maxWidth: "22rem" }}>
              Empowering young people with the skills, knowledge, and confidence to shape their own future — one step at a time.
            </p>
            <div className="flex gap-2.5 mt-1" aria-label="Social media links">
              <SocialButton href="https://instagram.com" label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
              </SocialButton>
              <SocialButton href="https://linkedin.com" label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </SocialButton>
              <SocialButton href="https://facebook.com" label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
              </SocialButton>
              <SocialButton href="https://youtube.com" label="YouTube">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" /></svg>
              </SocialButton>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ff-400)", marginBottom: "1.25rem" }}>Explore</h3>
            <ul className="flex flex-col gap-3" role="list">
              {[["#home","Home"],["#programs","Programs"],["#why-choose-us","Why Choose Us"],["#gallery","Gallery"]].map(([href,label]) => (
                <li key={href}><FooterLink href={href} label={label} /></li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ff-400)", marginBottom: "1.25rem" }}>Connect</h3>
            <ul className="flex flex-col gap-3" role="list">
              {[["#contact","Contact Us"],["#contact","Apply"]].map(([href,label],i) => (
                <li key={i}><FooterLink href={href} label={label} /></li>
              ))}
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ff-400)", marginBottom: "1.25rem" }}>Contact</h3>
            <ul className="flex flex-col gap-4" role="list">
              {[
                { icon: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>), value: "hello@futurefocus.org", href: "mailto:hello@futurefocus.org" },
                { icon: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>), value: "+250 700 000 000", href: "tel:+250700000000" },
                { icon: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>), value: "Kigali, Rwanda", href: "#" },
              ].map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="inline-flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                  >
                    <span className="mt-0.5 shrink-0" style={{ color: "var(--ff-400)" }}>{item.icon}</span>
                    {item.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────── */}
      <div className="ff-container"><div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} /></div>
      <div className="ff-container py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.22)" }}>
            © {new Date().getFullYear()} Future Focus · All Rights Reserved
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms"].map((label) => (
              <a key={label} href="#" style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.22)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
