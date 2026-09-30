"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  // Gradient fills the role of a real photo until images are added
  gradient: string;
  // Dominant accent for CTA / progress bar
  accent: string;
  // background-position hint so the "subject" isn't cropped
  bgPosition: string;
}

const COURSES: Course[] = [
  {
    id: 0,
    category: "Digital Skills",
    title: "Build Skills for Tomorrow",
    description:
      "Develop practical digital skills through hands-on learning and real-world projects.",
    cta: "Explore Course",
    href: "#programs",
    gradient:
      "linear-gradient(135deg, #003d38 0%, #005850 30%, #00706b 60%, #00a79d 100%)",
    accent: "#18BAAF",
    bgPosition: "center center",
  },
  {
    id: 1,
    category: "Programming",
    title: "Turn Ideas Into Code",
    description:
      "Learn programming fundamentals and transform ideas into useful digital solutions.",
    cta: "Explore Course",
    href: "#programs",
    gradient:
      "linear-gradient(135deg, #001a2c 0%, #003050 30%, #005880 60%, #0084a8 100%)",
    accent: "#18BAAF",
    bgPosition: "center top",
  },
  {
    id: 2,
    category: "Leadership",
    title: "Lead With Confidence",
    description:
      "Develop communication, teamwork, and leadership skills for your future.",
    cta: "Explore Course",
    href: "#programs",
    gradient:
      "linear-gradient(135deg, #1a0a2e 0%, #2d1155 30%, #4a1a7a 60%, #6b2fa0 100%)",
    accent: "#18BAAF",
    bgPosition: "center center",
  },
  {
    id: 3,
    category: "Entrepreneurship",
    title: "Build.\u00a0Create.\u00a0Grow.",
    description:
      "Turn your ideas into opportunities through practical entrepreneurship training.",
    cta: "Explore Course",
    href: "#programs",
    gradient:
      "linear-gradient(135deg, #1a1200 0%, #3d2c00 30%, #705200 60%, #a07800 100%)",
    accent: "#18BAAF",
    bgPosition: "center bottom",
  },
  {
    id: 4,
    category: "Creative Technology",
    title: "Create What Comes Next",
    description:
      "Explore creativity, technology, and innovation through practical projects.",
    cta: "Explore Course",
    href: "#programs",
    gradient:
      "linear-gradient(135deg, #0d1a0d 0%, #1a3a1a 30%, #1a5a2e 60%, #1a7a42 100%)",
    accent: "#18BAAF",
    bgPosition: "center center",
  },
];

const AUTOPLAY_MS = 3000;

// ─── Single slide background (image or gradient placeholder) ───────
function SlideBg({ course, isActive }: { course: Course; isActive: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={course.id}
      initial={{ scale: reduced ? 1 : 1.04, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: reduced ? 1 : 0.97, opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.75, ease: [0.32, 0, 0.67, 0] }}
      style={{
        position: "absolute",
        inset: 0,
        background: course.gradient,
        backgroundSize: "cover",
        backgroundPosition: course.bgPosition,
        backgroundRepeat: "no-repeat",
        willChange: "transform, opacity",
      }}
    >
      {/* Subtle grid / noise texture to make gradient look richer */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 400 300"
      >
        <defs>
          <pattern id={`tex-${course.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#tex-${course.id})`} />
      </svg>

      {/* Abstract shape for visual interest */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <circle cx="1100" cy="200" r="500" fill="rgba(255,255,255,0.06)" />
        <circle cx="1200" cy="100" r="300" fill="rgba(255,255,255,0.04)" />
        <circle cx="200"  cy="700" r="350" fill="rgba(255,255,255,0.03)" />
      </svg>
    </motion.div>
  );
}

// ─── Thumbnail for side slides ─────────────────────────────────────
function SideSlide({
  course,
  side,
  onClick,
}: {
  course: Course;
  side: "prev" | "next";
  onClick: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      onClick={onClick}
      aria-label={`${side === "prev" ? "Previous" : "Next"} course: ${course.title}`}
      initial={{ opacity: 0, x: side === "prev" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: side === "prev" ? -20 : 20 }}
      transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side === "prev" ? "left" : "right"]: 0,
        width: "clamp(60px, 12vw, 160px)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        zIndex: 10,
      }}
      whileHover={{ width: "clamp(70px, 14vw, 180px)" } as { width: string }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: course.gradient,
          backgroundSize: "cover",
          backgroundPosition: course.bgPosition,
          filter: "blur(1px) brightness(0.5)",
        }}
      />
      {/* Vignette toward center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            side === "prev"
              ? "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)"
              : "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)",
        }}
      />
      {/* Partial title peek */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(clamp(1.5rem, 4vw, 3rem) + 80px)", // align with main text area
          [side === "prev" ? "left" : "right"]: "1rem",
          [side === "prev" ? "right" : "left"]: "unset",
          maxWidth: "90%",
          textAlign: side === "prev" ? "left" : "right",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(0.55rem, 1vw, 0.75rem)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: "0.3rem",
          }}
        >
          {course.category}
        </p>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(0.7rem, 1.2vw, 0.95rem)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.2,
          }}
        >
          {course.title}
        </p>
      </div>
    </motion.button>
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

  // Touch swipe
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % COURSES.length) + COURSES.length) % COURSES.length);
      setProgress(0);
    },
    []
  );
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

  const course    = COURSES[current];
  const prevCourse = COURSES[(current - 1 + COURSES.length) % COURSES.length];
  const nextCourse = COURSES[(current + 1) % COURSES.length];

  // Text animation variants
  const textContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
    exit:  { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  };
  const textItem = {
    hidden: { opacity: 0, y: reduced ? 0 : 18 },
    show:   { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.5, ease: [0.25, 0.1, 0.25, 1] } },
    exit:   { opacity: 0, y: reduced ? 0 : -12, transition: { duration: reduced ? 0 : 0.3, ease: "easeIn" } },
  };

  return (
    <section
      id="home"
      data-nav-theme="dark"
      aria-label="Featured courses slideshow"
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        minHeight: 520,
        maxHeight: 980,
        background: "#000",
        overflow: "hidden",
        userSelect: "none",
      }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx < -40) goNext();
        if (dx >  40) goPrev();
      }}
    >
      {/* ── Full-screen slide backgrounds ─────────────────────── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <AnimatePresence mode="sync">
          <SlideBg key={course.id} course={course} isActive />
        </AnimatePresence>
      </div>

      {/* ── Overlay — stronger at bottom where text sits ───────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.82) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Side slides (prev / next peek) ─────────────────────── */}
      <AnimatePresence>
        <SideSlide key={`prev-${prevCourse.id}`} course={prevCourse} side="prev" onClick={goPrev} />
        <SideSlide key={`next-${nextCourse.id}`} course={nextCourse} side="next" onClick={goNext} />
      </AnimatePresence>

      {/* ── Main content — bottom-left, above overlay ──────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "0 clamp(80px, 14vw, 200px) clamp(1.5rem, 3vw, 2.5rem)",
        }}
      >
        {/* Text block */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={textContainer}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ marginBottom: "clamp(1rem, 2vw, 1.5rem)" }}
          >
            {/* Category */}
            <motion.p
              variants={textItem}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(0.65rem, 1vw, 0.8rem)",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: course.accent,
                marginBottom: "0.5rem",
              }}
            >
              {course.category}
            </motion.p>

            {/* Title */}
            <motion.h1
              variants={textItem}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.6rem, 3.5vw, 3rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "#fff",
                marginBottom: "0.65rem",
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              {course.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={textItem}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.82rem, 1.2vw, 1rem)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.72)",
                maxWidth: "38rem",
                marginBottom: "1.1rem",
              }}
            >
              {course.description}
            </motion.p>

            {/* CTA */}
            <motion.div variants={textItem}>
              <a
                href={course.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(0.78rem, 1vw, 0.88rem)",
                  fontWeight: 600,
                  color: "#fff",
                  background: course.accent,
                  padding: "0.55rem 1.25rem",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  boxShadow: `0 4px 20px ${course.accent}55`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 28px ${course.accent}77`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 20px ${course.accent}55`;
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.97)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
              >
                {course.cta}
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ── Controls row ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(0.75rem, 2vw, 1.5rem)",
          }}
        >
          {/* Prev arrow */}
          <button
            onClick={goPrev}
            aria-label="Previous course"
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.7)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "border-color 0.2s, color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.7)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          {/* Progress dots + bar */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "clamp(0.3rem, 0.8vw, 0.6rem)",
            }}
            role="tablist"
            aria-label="Course slides"
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
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: isActive ? 1 : 0,
                    flex: isActive ? 1 : "none",
                    minWidth: isActive ? 0 : undefined,
                    transition: "flex 0.4s ease",
                  }}
                >
                  {isActive ? (
                    /* Active: full-width progress bar */
                    <div
                      style={{
                        width: "100%",
                        height: 2,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "9999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          background: course.accent,
                          borderRadius: "9999px",
                          transition: paused ? "none" : "width 0.08s linear",
                        }}
                      />
                    </div>
                  ) : (
                    /* Inactive: small dot */
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.35)",
                        transition: "background 0.2s",
                        margin: "0 auto",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.7)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.35)")}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Slide counter */}
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(0.7rem, 1vw, 0.8rem)",
              fontWeight: 600,
              color: "rgba(255,255,255,0.55)",
              tabularNums: "tabular-nums",
              letterSpacing: "0.06em",
              flexShrink: 0,
            } as React.CSSProperties}
            aria-live="polite"
          >
            {String(current + 1).padStart(2, "0")} / {String(COURSES.length).padStart(2, "0")}
          </span>

          {/* Pause / Play */}
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
            aria-pressed={paused}
            style={{
              background: "none",
              border: `1px solid ${paused ? course.accent : "rgba(255,255,255,0.25)"}`,
              color: paused ? course.accent : "rgba(255,255,255,0.7)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "border-color 0.25s, color 0.25s",
            }}
          >
            {paused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            )}
          </button>

          {/* Next arrow */}
          <button
            onClick={goNext}
            aria-label="Next course"
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.7)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.7)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
