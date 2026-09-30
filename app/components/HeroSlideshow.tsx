"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useReducedMotion } from "../hooks";

interface Slide {
  id: number;
  category: string;
  title: string;
  description: string;
  cta: string;
  bg: string;
  accent: string;
  pattern: string;
}

const SLIDES: Slide[] = [
  {
    id: 0,
    category: "FUTURE FOCUS",
    title: "Discover Your Future",
    description: "Explore your potential, build confidence, and take the first step toward a brighter future.",
    cta: "Explore Programs",
    bg: "from-[#003d38] via-[#005850] to-[#00706b]",
    accent: "#18BAAF",
    pattern: "circles",
  },
  {
    id: 1,
    category: "LEARNING",
    title: "Learn.\u00a0Build.\u00a0Create.",
    description: "Develop practical skills through engaging, hands-on learning designed for the real world.",
    cta: "View Programs",
    bg: "from-[#00706b] via-[#005850] to-[#003d38]",
    accent: "#00A79D",
    pattern: "grid",
  },
  {
    id: 2,
    category: "TECHNOLOGY & SKILLS",
    title: "Skills for Tomorrow",
    description: "Build digital and professional skills that prepare you for opportunities in a rapidly changing world.",
    cta: "Start Learning",
    bg: "from-[#004a45] via-[#006860] to-[#009990]",
    accent: "#4FCDC4",
    pattern: "dots",
  },
  {
    id: 3,
    category: "INNOVATION",
    title: "Turn Ideas Into Impact",
    description: "Transform your ideas into meaningful projects through creativity, teamwork, and innovation.",
    cta: "Explore Innovation",
    bg: "from-[#003530] via-[#00504b] to-[#007a72]",
    accent: "#18BAAF",
    pattern: "lines",
  },
  {
    id: 4,
    category: "PERSONAL DEVELOPMENT",
    title: "Grow With Confidence",
    description: "Strengthen communication, leadership, problem-solving, and the confidence to pursue your goals.",
    cta: "Discover More",
    bg: "from-[#005850] via-[#007a72] to-[#00a79d]",
    accent: "#00A79D",
    pattern: "circles",
  },
  {
    id: 5,
    category: "FUTURE FOCUS",
    title: "Your Future Starts Here",
    description: "Join a community focused on learning, growth, opportunity, and building the future together.",
    cta: "Apply Now",
    bg: "from-[#002e2b] via-[#004a45] to-[#006860]",
    accent: "#4FCDC4",
    pattern: "grid",
  },
];

const AUTOPLAY_INTERVAL = 6000;

function SlidePattern({ type, accent }: { type: string; accent: string }) {
  const op = 0.07;
  if (type === "circles") return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 800">
      <circle cx="900" cy="200" r="320" stroke={accent} strokeWidth="1.5" fill="none" opacity={op} />
      <circle cx="900" cy="200" r="220" stroke={accent} strokeWidth="1"   fill="none" opacity={op * 0.8} />
      <circle cx="900" cy="200" r="120" stroke={accent} strokeWidth="0.8" fill="none" opacity={op * 0.6} />
      <circle cx="200" cy="650" r="180" stroke={accent} strokeWidth="1"   fill="none" opacity={op * 0.5} />
      <circle cx="1300" cy="700" r="100" stroke={accent} strokeWidth="0.8" fill="none" opacity={op * 0.4} />
    </svg>
  );
  if (type === "grid") return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 800">
      <defs><pattern id="hgrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M60 0L0 0 0 60" fill="none" stroke={accent} strokeWidth="0.6" opacity={op} />
      </pattern></defs>
      <rect width="1440" height="800" fill="url(#hgrid)" />
      <rect x="800" y="100" width="500" height="300" rx="4" stroke={accent} strokeWidth="1" fill="none" opacity={op * 0.6} />
    </svg>
  );
  if (type === "dots") return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 800">
      <defs><pattern id="hdots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill={accent} opacity={op} />
      </pattern></defs>
      <rect width="1440" height="800" fill="url(#hdots)" />
      <circle cx="1050" cy="350" r="200" stroke={accent} strokeWidth="1" fill="none" opacity={op * 0.7} />
    </svg>
  );
  if (type === "lines") return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 800">
      {[0,1,2,3,4,5,6].map((i) => (
        <line key={i} x1={600+i*120} y1="0" x2={300+i*120} y2="800" stroke={accent} strokeWidth="0.8" opacity={op*(1-i*0.1)} />
      ))}
      <polyline points="700,0 900,400 1100,0" fill="none" stroke={accent} strokeWidth="1" opacity={op*0.5} />
    </svg>
  );
  return null;
}

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [paused, setPaused]       = useState(false);
  const [entered, setEntered]     = useState(false); // initial cinematic entrance
  const reduced = useReducedMotion();

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cinematic entrance — trigger after a short delay (loader finishes)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), reduced ? 0 : 200);
    return () => clearTimeout(t);
  }, [reduced]);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (animating) return;
      setDirection(dir);
      setPrev(current);
      setAnimating(true);
      setCurrent(index);
      setProgress(0);
      setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
    },
    [animating, current]
  );

  const goNext = useCallback(() => goTo((current + 1) % SLIDES.length, "next"), [current, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, "prev"), [current, goTo]);

  // Progress tick
  useEffect(() => {
    if (paused) return;
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(100, p + 100 / (AUTOPLAY_INTERVAL / 100)));
    }, 100);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [current, paused]);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    autoplayRef.current = setTimeout(() => goNext(), AUTOPLAY_INTERVAL);
    return () => { if (autoplayRef.current) clearTimeout(autoplayRef.current); };
  }, [current, paused, goNext]);

  // Keyboard nav
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goNext, goPrev]);

  const slide     = SLIDES[current];
  const prevSlide = SLIDES[(current - 1 + SLIDES.length) % SLIDES.length];
  const nextSlide = SLIDES[(current + 1) % SLIDES.length];

  // Entrance animation delays (staggered)
  const DELAYS = reduced ? ["0s","0s","0s","0s"] : ["0s","0.12s","0.24s","0.38s"];
  const DURATION = reduced ? "0s" : "0.7s";

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ height: "100svh", minHeight: 600, maxHeight: 900 }}
      data-nav-theme="dark"
      aria-label="Hero slideshow"
    >
      {/* ── Slide backgrounds ─────────────────────────────────── */}
      {SLIDES.map((s, i) => {
        const isCurrent = i === current;
        const isPrev    = i === prev;
        return (
          <div
            key={s.id}
            className="absolute inset-0"
            style={{
              zIndex: isCurrent ? 20 : isPrev ? 10 : 0,
              opacity: isCurrent ? 1 : 0,
              transition: reduced ? "none" : "opacity 0.7s ease",
              pointerEvents: isCurrent ? "auto" : "none",
            }}
            aria-hidden={!isCurrent}
          >
            {/* Gradient bg with slow Ken Burns zoom */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${s.bg}`}
              style={{
                transform: isCurrent && !reduced ? "scale(1.06)" : "scale(1)",
                transition: isCurrent && !reduced ? `transform ${AUTOPLAY_INTERVAL}ms linear` : "none",
              }}
            />
            <SlidePattern type={s.pattern} accent={s.accent} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
          </div>
        );
      })}

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="relative z-30 h-full flex flex-col justify-center ff-container">
        <div className="max-w-2xl">

          {/* Category */}
          <div
            key={`cat-${current}`}
            className="inline-flex items-center gap-2.5 mb-5"
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? "translateY(0)" : "translateY(18px)",
              transition: `opacity ${DURATION} ${DELAYS[0]} ease, transform ${DURATION} ${DELAYS[0]} ease`,
            }}
          >
            <span className="h-px w-8" style={{ background: slide.accent }} />
            <span
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: slide.accent, fontFamily: "var(--font-heading)" }}
            >
              {slide.category}
            </span>
          </div>

          {/* Title */}
          <h1
            key={`title-${current}`}
            className="text-white leading-tight mb-5"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
              letterSpacing: "-0.03em",
              opacity: entered ? 1 : 0,
              transform: entered ? "translateY(0)" : "translateY(22px)",
              transition: `opacity ${DURATION} ${DELAYS[1]} ease, transform ${DURATION} ${DELAYS[1]} ease`,
            }}
          >
            {slide.title}
          </h1>

          {/* Description */}
          <p
            key={`desc-${current}`}
            className="text-white/75 max-w-md mb-8"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
              lineHeight: 1.7,
              opacity: entered ? 1 : 0,
              transform: entered ? "translateY(0)" : "translateY(18px)",
              transition: `opacity ${DURATION} ${DELAYS[2]} ease, transform ${DURATION} ${DELAYS[2]} ease`,
            }}
          >
            {slide.description}
          </p>

          {/* CTA */}
          <div
            key={`cta-${current}`}
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? "translateY(0)" : "translateY(16px)",
              transition: `opacity ${DURATION} ${DELAYS[3]} ease, transform ${DURATION} ${DELAYS[3]} ease`,
            }}
          >
            <button
              className="group inline-flex items-center gap-2.5 font-semibold rounded-full cursor-pointer"
              style={{
                background: slide.accent,
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontSize: "0.9rem",
                padding: "0.9rem 2rem",
                boxShadow: `0 8px 32px ${slide.accent}55`,
                border: "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = "translateY(-2px)";
                b.style.boxShadow = `0 14px 40px ${slide.accent}66`;
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = "";
                b.style.boxShadow = `0 8px 32px ${slide.accent}55`;
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
            >
              {slide.cta}
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:translate-x-1 transition-transform duration-200"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Side previews (desktop) ────────────────────────────── */}
      <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 pr-10">
        {[prevSlide, nextSlide].map((s, i) => (
          <button
            key={i}
            onClick={i === 0 ? goPrev : goNext}
            className="group flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            style={{ background: "none", border: "none" }}
            aria-label={i === 0 ? `Previous: ${s.title}` : `Next: ${s.title}`}
          >
            <div
              className={`rounded-xl overflow-hidden border border-white/20 group-hover:border-white/50 transition-all duration-300 group-hover:scale-105`}
              style={{ width: 88, height: 58 }}
            >
              <div className={`w-full h-full bg-gradient-to-br ${s.bg}`} />
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-white/40 text-[10px] tracking-widest uppercase font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {i === 0 ? "Prev" : "Next"}
              </p>
              <p className="text-white/65 text-xs font-medium mt-0.5 max-w-[110px] leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
                {s.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Bottom controls ────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 right-0 z-30 ff-container">
        <div className="flex items-end justify-between">

          {/* Progress bar + dots */}
          <div className="flex flex-col gap-3">
            <div className="w-40 h-px rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: paused ? "rgba(255,255,255,0.3)" : slide.accent,
                  borderRadius: "9999px",
                  transition: paused ? "none" : "width 0.1s linear",
                }}
              />
            </div>
            <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slide ${i + 1}: ${s.title}`}
                  onClick={() => goTo(i, i > current ? "next" : "prev")}
                  style={{
                    height: 8,
                    width: i === current ? 28 : 8,
                    borderRadius: "9999px",
                    background: i === current ? slide.accent : "rgba(255,255,255,0.35)",
                    border: "none",
                    cursor: "pointer",
                    transition: "width 0.3s ease, background 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Counter + pause/play + arrows */}
          <div className="flex items-center gap-4">
            <span
              className="text-white/50 text-sm tabular-nums"
              style={{ fontFamily: "var(--font-heading)" }}
              aria-live="polite"
            >
              {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              {/* Prev */}
              <button
                onClick={goPrev}
                className="h-10 w-10 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.25)", background: "none" }}
                aria-label="Previous slide"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              </button>

              {/* Pause/Play */}
              <button
                onClick={() => setPaused((p) => !p)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-200"
                style={{
                  border: paused ? `1.5px solid ${slide.accent}` : "1px solid rgba(255,255,255,0.25)",
                  background: paused ? `${slide.accent}22` : "none",
                }}
                aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
                aria-pressed={paused}
              >
                {paused ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21" /></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={goNext}
                className="h-10 w-10 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.25)", background: "none" }}
                aria-label="Next slide"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-1.5"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 1s 1s ease",
        }}
      >
        <span className="text-white/35 text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: "var(--font-heading)" }}>
          Scroll
        </span>
        <div className="w-px h-8 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div
            className="w-full rounded-full"
            style={{
              height: "40%",
              background: "rgba(255,255,255,0.5)",
              animation: reduced ? "none" : "heroScrollDown 1.7s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes heroScrollDown {
          0%   { transform: translateY(-100%); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(250%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
