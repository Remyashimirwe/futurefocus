"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "../hooks";

// ─── Course data ───────────────────────────────────────────────────
interface Course {
  id: number;
  category: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  gradient: string;
  accent: string;
  bgPosition: string;
  image: string;
}

const COURSES: Course[] = [
  {
    id: 0,
    category: "Digital Skills",
    title: "Build Skills for Tomorrow",
    description: "Develop practical digital skills through hands-on learning and real-world projects.",
    cta: "Explore Course",
    href: "/programs",
    gradient: "linear-gradient(135deg, #003d38 0%, #005850 35%, #00706b 65%, #00a79d 100%)",
    accent: "#18BAAF",
    bgPosition: "center center",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&q=80&auto=format&fit=crop",
  },
  {
    id: 1,
    category: "Programming",
    title: "Turn Ideas Into Code",
    description: "Learn programming fundamentals and transform ideas into useful digital solutions.",
    cta: "Explore Course",
    href: "/programs",
    gradient: "linear-gradient(135deg, #001a2c 0%, #003050 35%, #005880 65%, #0084a8 100%)",
    accent: "#18BAAF",
    bgPosition: "center top",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1600&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    category: "Creative Technology",
    title: "Create What Comes Next",
    description: "Explore creativity, technology, and innovation through practical projects.",
    cta: "Explore Course",
    href: "/programs",
    gradient: "linear-gradient(135deg, #0d1a0d 0%, #1a3a1a 35%, #1a5a2e 65%, #1a7a42 100%)",
    accent: "#18BAAF",
    bgPosition: "center center",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&q=80&auto=format&fit=crop",
  },
];

const AUTOPLAY_MS = 10000;

// ─── Slide panel (used for all three visible panels) ───────────────
function SlidePanel({
  course,
  role,
  onClick,
  reduced,
}: {
  course: Course;
  role: "center" | "prev" | "next";
  onClick?: () => void;
  reduced: boolean;
}) {
  const isCenter = role === "center";

  return (
    <div
      onClick={!isCenter ? onClick : undefined}
      style={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        cursor: isCenter ? "default" : "pointer",
        flexShrink: 0,
        // Center is the large stage; sides are narrow panels
        width: isCenter ? "100%" : "clamp(55px, 11vw, 150px)",
        borderRadius: isCenter ? "12px" : "8px",
        transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}
      aria-label={!isCenter ? `${role === "prev" ? "Previous" : "Next"}: ${course.title}` : undefined}
      role={!isCenter ? "button" : undefined}
      tabIndex={!isCenter ? 0 : undefined}
      onKeyDown={!isCenter ? (e) => e.key === "Enter" && onClick?.() : undefined}
    >
      {/* Background gradient / image */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${course.id}-${role}`}
          initial={{ opacity: 0, scale: reduced ? 1 : (isCenter ? 1.05 : 1) }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : (isCenter ? 0.97 : 1) }}
          transition={{ duration: reduced ? 0 : 0.65, ease: [0.32, 0, 0.67, 0] }}
          style={{
            position: "absolute",
            inset: 0,
            background: course.gradient,
            backgroundSize: "cover",
            backgroundPosition: course.bgPosition,
            // Side panels: blurred + darkened
            filter: isCenter ? "none" : "blur(1.5px) brightness(0.4)",
            willChange: "transform, opacity",
          }}
        >
          {/* Photo (gradient stays behind as fallback) */}
          <Image
            src={course.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 90vw"
            priority={isCenter}
            style={{ objectFit: "cover", objectPosition: course.bgPosition }}
          />
          {/* Dot texture */}
          <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: isCenter ? 0.06 : 0.03 }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400">
            <defs><pattern id={`dot-${course.id}-${role}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="400" height="400" fill={`url(#dot-${course.id}-${role})`} />
          </svg>
          {/* Abstract shapes */}
          <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: isCenter ? 0.1 : 0.05 }} preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 700">
            <circle cx="750" cy="180" r="420" fill="rgba(255,255,255,0.06)" />
            <circle cx="820" cy="80"  r="260" fill="rgba(255,255,255,0.04)" />
            <circle cx="150" cy="600" r="300" fill="rgba(255,255,255,0.03)" />
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Center: dark gradient so bottom text is readable */}
      {isCenter && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.80) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Side: vignette toward center edge */}
      {!isCenter && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              role === "prev"
                ? "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)"
                : "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Side: peeking title text */}
      {!isCenter && (
        <div
          style={{
            position: "absolute",
            bottom: "clamp(5rem, 9vw, 7rem)",
            [role === "prev" ? "left" : "right"]: "0.75rem",
            zIndex: 3,
            maxWidth: "85%",
            textAlign: role === "prev" ? "left" : "right",
          }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(0.5rem, 0.9vw, 0.7rem)", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "0.25rem" }}>
            {course.category}
          </p>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(0.62rem, 1.1vw, 0.85rem)", fontWeight: 700, color: "rgba(255,255,255,0.6)", lineHeight: 1.2 }}>
            {course.title}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────
export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % COURSES.length) + COURSES.length) % COURSES.length);
    setProgress(0);
  }, []);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(goNext, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, goNext]);

  // Progress tick
  useEffect(() => {
    if (paused) { if (progressRef.current) clearInterval(progressRef.current); return; }
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(100, p + 100 / (AUTOPLAY_MS / 80)));
    }, 80);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [current, paused]);

  // Keyboard
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === " ")          setPaused((p) => !p);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goNext, goPrev]);

  const course     = COURSES[current];
  const prevCourse = COURSES[(current - 1 + COURSES.length) % COURSES.length];
  const nextCourse = COURSES[(current + 1) % COURSES.length];

  // Text reveal variants
  const textWrap = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
    exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 as const } },
  };
  const textLine = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    show:   { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
    exit:   { opacity: 0, y: reduced ? 0 : -10, transition: { duration: reduced ? 0 : 0.28, ease: "easeIn" as const } },
  };

  return (
    <section
      id="home"
      data-nav-theme="dark"
      aria-label="Featured courses"
      style={{
        position: "relative",
        width: "100%",
        height: "90svh",
        minHeight: 520,
        maxHeight: 880,
        background: "#050e0d",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx < -40) goNext();
        if (dx >  40) goPrev();
      }}
    >
      {/* ── Three-panel stage ─────────────────────────────────── */}
      {/*
          Layout: [prev-peek] [center-stage] [next-peek]
          The center takes all remaining flex space.
          On mobile the side panels shrink to 0 (hidden).
      */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          gap: "clamp(3px, 0.4vw, 6px)",
          padding: "clamp(3px, 0.4vw, 6px)",
          paddingTop: "var(--navbar-h, 64px)", // dynamically set by Navbar via CSS var
          minHeight: 0,
        }}
      >
        {/* Prev panel */}
        <div
          className="hidden sm:block"
          style={{ flexShrink: 0, height: "100%" }}
        >
          <SlidePanel course={prevCourse} role="prev" onClick={goPrev} reduced={reduced} />
        </div>

        {/* Center stage — takes all remaining space */}
        <div style={{ flex: 1, minWidth: 0, height: "100%", position: "relative" }}>
          <SlidePanel course={course} role="center" reduced={reduced} />

          {/* Text overlay — bottom-left of center panel */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              padding: "clamp(1.25rem, 3vw, 2.25rem) clamp(1.25rem, 3.5vw, 2.5rem)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={textWrap}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {/* Category */}
                <motion.p variants={textLine} style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(0.65rem, 1vw, 0.78rem)", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: course.accent, marginBottom: "0.5rem" }}>
                  {course.category}
                </motion.p>

                {/* Title */}
                <motion.h1 variants={textLine} style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3.2vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, color: "#fff", marginBottom: "0.6rem", textShadow: "0 2px 16px rgba(0,0,0,0.35)" }}>
                  {course.title}
                </motion.h1>

                {/* Description */}
                <motion.p variants={textLine} style={{ fontFamily: "var(--font-body)", fontSize: "clamp(0.8rem, 1.15vw, 0.95rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: "36rem", marginBottom: "1rem" }}>
                  {course.description}
                </motion.p>

                {/* CTA */}
                <motion.div variants={textLine}>
                  <Link
                    href={course.href}
                    style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(0.75rem, 0.95vw, 0.85rem)", fontWeight: 600, color: "#fff", background: course.accent, padding: "0.5rem 1.2rem", borderRadius: "9999px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", boxShadow: `0 4px 18px ${course.accent}55`, transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 26px ${course.accent}77`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 18px ${course.accent}55`; }}
                    onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)"; }}
                    onMouseUp={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                  >
                    {course.cta}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Next panel */}
        <div
          className="hidden sm:block"
          style={{ flexShrink: 0, height: "100%" }}
        >
          <SlidePanel course={nextCourse} role="next" onClick={goNext} reduced={reduced} />
        </div>
      </div>

      {/* ── Controls bar ──────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "clamp(0.6rem, 1.5vw, 1.2rem)",
          padding: "clamp(0.6rem, 1.2vw, 1rem) clamp(0.75rem, 2vw, 1.5rem)",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Prev */}
        <CtrlBtn onClick={goPrev} label="Previous course">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </CtrlBtn>

        {/* Dots + progress bar */}
        <div
          role="tablist"
          aria-label="Course slides"
          style={{ flex: 1, display: "flex", alignItems: "center", gap: "clamp(0.3rem, 0.7vw, 0.55rem)" }}
        >
          {COURSES.map((c, i) => {
            const isActive = i === current;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`Course ${i + 1}: ${c.title}`}
                onClick={() => goTo(i)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", flex: isActive ? 1 : "none", minWidth: isActive ? 0 : undefined, transition: "flex 0.35s ease" }}
              >
                {isActive ? (
                  <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.18)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: course.accent, borderRadius: "9999px", transition: paused ? "none" : "width 0.08s linear" }} />
                  </div>
                ) : (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", margin: "0 auto", transition: "background 0.2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.65)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.3)")}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <span style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(0.68rem, 0.9vw, 0.78rem)", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", flexShrink: 0 } as React.CSSProperties} aria-live="polite">
          {String(current + 1).padStart(2, "0")} / {String(COURSES.length).padStart(2, "0")}
        </span>

        {/* Pause/Play */}
        <CtrlBtn
          onClick={() => setPaused((p) => !p)}
          label={paused ? "Resume autoplay" : "Pause autoplay"}
          active={paused}
          accent={course.accent}
        >
          {paused ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21" /></svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
        </CtrlBtn>

        {/* Next */}
        <CtrlBtn onClick={goNext} label="Next course">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </CtrlBtn>
      </div>
    </section>
  );
}

// ─── Small control button ──────────────────────────────────────────
function CtrlBtn({
  onClick,
  label,
  children,
  active = false,
  accent,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      style={{
        background: "none",
        border: `1px solid ${active && accent ? accent : "rgba(255,255,255,0.22)"}`,
        color: active && accent ? accent : "rgba(255,255,255,0.65)",
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "border-color 0.2s, color 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.65)";
        (e.currentTarget as HTMLButtonElement).style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = active && accent ? accent : "rgba(255,255,255,0.22)";
        (e.currentTarget as HTMLButtonElement).style.color = active && accent ? accent : "rgba(255,255,255,0.65)";
      }}
    >
      {children}
    </button>
  );
}
