"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView, useReducedMotion } from "../hooks";

// ─── Reveal wrapper ───────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView || reduced ? 1 : 0,
        transform: inView || reduced ? "translateY(0)" : "translateY(28px)",
        transition: reduced
          ? "none"
          : `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setCount(target); return; }
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, reduced]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── 3D Tilt card ─────────────────────────────────────────────────
function TiltCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    el.style.transition = "transform 0.1s ease";
    // Glow follows cursor
    const glow = el.querySelector<HTMLDivElement>(".tilt-glow");
    if (glow) {
      glow.style.opacity = "1";
      glow.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(0,167,157,0.12) 0%, transparent 70%)`;
    }
  }, [reduced]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
    const glow = el.querySelector<HTMLDivElement>(".tilt-glow");
    if (glow) glow.style.opacity = "0";
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: "transform", transformStyle: "preserve-3d", ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="tilt-glow absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-300" style={{ opacity: 0, zIndex: 1 }} />
      {children}
    </div>
  );
}

// ─── Programs Section ─────────────────────────────────────────────
import { PROGRAMS, type Program } from "@/lib/program-data";

/** Per-tag accent colours — drives the pill dot and the hover accent line. */
const TAG_ACCENTS: Record<string, { dot: string; from: string; to: string }> = {
  Technology: { dot: "#00a79d", from: "#00a79d", to: "#4fcdc4" },
  Career:     { dot: "#f5a524", from: "#f5a524", to: "#ffd79a" },
  Global:     { dot: "#3b82f6", from: "#3b82f6", to: "#93c5fd" },
  Creative:   { dot: "#a855f7", from: "#a855f7", to: "#d8b4fe" },
  Music:      { dot: "#ec4899", from: "#ec4899", to: "#f9a8d4" },
};

function ProgramCard({ p }: { p: Program }) {
  const accent = TAG_ACCENTS[p.tag] ?? TAG_ACCENTS.Technology;

  return (
    <Link href="/apply" className="flex h-full" style={{ textDecoration: "none" }}>
      <TiltCard
        className="group relative flex h-full w-full cursor-pointer flex-col rounded-[26px] bg-white transition-shadow duration-300 shadow-[0_2px_14px_rgba(0,0,0,0.05)] hover:shadow-[0_34px_64px_-32px_rgba(0,88,80,0.55)]"
        style={{ border: "1px solid var(--gray-100)", overflow: "hidden" }}
      >
        {/* Gradient hairline border — appears on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 rounded-[26px] p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 38%, rgba(0,167,157,0) 72%)`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
          }}
        />

        {/* Accent line sweeping across the top edge */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-30 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
        />

        {/* Photo — inset with its own radius for a modern framed look */}
        <div className="relative shrink-0 p-3 pb-0" style={{ zIndex: 2 }}>
          <div
            className="relative overflow-hidden rounded-[20px]"
            style={{ height: 178, background: "var(--ff-100)" }}
          >
            {p.img ? (
              <Image
                src={p.img}
                alt=""
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                style={{ objectFit: "cover" }}
                className="transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--ff-100), var(--ff-50))" }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--ff-300)" }} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}

            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(0,20,18,0.34) 0%, rgba(0,20,18,0) 45%, rgba(0,20,18,0.5) 100%)" }}
            />

            {/* Diagonal shine sweep */}
            <span
              aria-hidden="true"
              className="absolute -inset-y-8 -left-1/3 w-1/3 -rotate-12 bg-white/25 blur-md opacity-0 transition-all duration-700 ease-out group-hover:left-[120%] group-hover:opacity-100"
            />

            {p.tag && (
              <span
                className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "#fff", boxShadow: `0 0 8px ${accent.dot}` }}
                  aria-hidden="true"
                />
                {p.tag}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col p-6 pt-5" style={{ zIndex: 3 }}>
          <h3
            className="mb-2 line-clamp-2 text-[1.06rem] font-extrabold leading-snug tracking-[-0.015em] transition-colors duration-200 group-hover:text-[var(--ff-700)]"
            style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}
          >
            {p.title}
          </h3>

          <p
            className="line-clamp-3 break-words text-sm leading-relaxed"
            style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}
          >
            {p.desc}
          </p>

          {/* Divider sweeps in on hover; pill CTA pinned to the bottom */}
          <div className="mt-auto pt-5">
            <div
              aria-hidden="true"
              className="h-px w-full origin-left scale-x-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-x-100"
              style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to}00)` }}
            />
            <div
              className="mt-4 flex items-center justify-between gap-3 rounded-full py-1.5 pl-4 pr-1.5 transition-colors duration-300 bg-[var(--ff-50)] group-hover:bg-[var(--ff-700)]"
            >
              <span
                className="text-sm font-bold transition-colors duration-300 text-[var(--gray-900)] group-hover:text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Apply now
              </span>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 bg-white text-[var(--ff-700)] shadow-[0_4px_10px_-4px_rgba(0,61,56,0.5)] group-hover:translate-x-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}

export function ProgramsSection({ programs = PROGRAMS }: { programs?: Program[] }) {
  return (
    <section id="programs" className="ff-section" style={{ background: "var(--ff-50)" }} data-nav-theme="light">
      <div className="ff-container">
        <Reveal className="max-w-xl mb-14">
          <span className="text-xs font-semibold tracking-[0.16em] uppercase mb-3 block" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>
            What We Offer
          </span>
          <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            Our Programs
          </h2>
          <p style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
            Practical, engaging programs designed to equip young people with the skills they need to thrive in a rapidly changing world.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p, i) => (
            <Reveal key={i} delay={i * 0.07} className="h-full">
              <ProgramCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Programs (home page preview) ────────────────────────
export function FeaturedProgramsSection({ programs = PROGRAMS }: { programs?: Program[] }) {
  return (
    <section id="programs" className="ff-section" style={{ background: "var(--ff-50)" }} data-nav-theme="light">
      <div className="ff-container">
        <Reveal className="max-w-xl mb-14">
          <span className="text-xs font-semibold tracking-[0.16em] uppercase mb-3 block" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>
            What We Offer
          </span>
          <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            Our Programs
          </h2>
          <p style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
            Practical, engaging programs designed to equip young people with the skills they need to thrive in a rapidly changing world.
          </p>
        </Reveal>

        {/* Narrower, centred grid so the cards don't stretch across the full container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {programs.slice(0, 6).map((p, i) => (
            <Reveal key={i} delay={i * 0.07} className="h-full">
              <ProgramCard p={p} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-12 flex justify-center">
          <Link href="/programs" className="btn-brand group">
            View All Programs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────
const REASONS = [
  { num: "01", title: "Youth-Centered Design",  desc: "Every program is built around the needs, interests, and aspirations of young people—not the other way around." },
  { num: "02", title: "Real-World Relevance",    desc: "We teach skills that matter today and tomorrow, drawing from industry realities and emerging trends." },
  { num: "03", title: "Expert Facilitators",     desc: "Learn from passionate mentors and practitioners who bring genuine expertise and enthusiasm to every session." },
  { num: "04", title: "Supportive Community",    desc: "Join a vibrant network of peers, mentors, and alumni committed to growing and lifting each other up." },
];

const STATS = [
  { stat: 500, suffix: "+", label: "Students Enrolled" },
  { stat: 12,  suffix: "+", label: "Programs Available" },
  { stat: 95,  suffix: "%", label: "Satisfaction Rate" },
  { stat: 30,  suffix: "+", label: "Expert Mentors" },
];

const STAT_ACCENTS = ["var(--ff-200)", "var(--ff-300)", "#ffffff", "var(--ff-400)"];

export function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us"
      className="ff-section relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--white) 0%, var(--ff-50) 55%, var(--white) 100%)" }}
      data-nav-theme="light"
    >
      {/* Ambient glow blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div style={{ position: "absolute", top: "-10rem", right: "-8rem", width: "26rem", height: "26rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,167,157,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-12rem", left: "-10rem", width: "30rem", height: "30rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(24,186,175,0.13) 0%, transparent 70%)" }} />
      </div>

      <div className="ff-container relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <Reveal className="max-w-2xl mx-auto text-center mb-14">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase px-4 py-2 rounded-full mb-5"
            style={{ background: "var(--ff-100)", color: "var(--ff-700)", fontFamily: "var(--font-heading)" }}
          >
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ff-500)" }} />
            Why Future Focus Academy
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-[1.08]" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
            Built for the <span style={{ color: "var(--ff-500)" }}>Next Generation</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
            Future Focus Academy is more than a program—it&apos;s a movement. We believe every young person deserves the tools, guidance, and community to shape their own future.
          </p>
        </Reveal>

        {/* Reason cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {REASONS.map((r, i) => (
            <Reveal key={r.num} delay={i * 0.08} className="h-full">
              <div
                className="group h-full rounded-2xl p-6 relative overflow-hidden border border-[var(--gray-100)] hover:border-[var(--ff-300)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-18px_rgba(0,167,157,0.45)]"
                style={{ background: "#fff" }}
              >
                {/* Gradient accent line revealed on hover */}
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  style={{ background: "linear-gradient(90deg, var(--ff-500), var(--ff-300))" }}
                />
                <span
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-sm font-extrabold mb-5 transition-transform duration-300 group-hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))",
                    color: "#fff",
                    fontFamily: "var(--font-heading)",
                    boxShadow: "0 10px 20px -10px rgba(0,167,157,0.8)",
                  }}
                >
                  {r.num}
                </span>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                  {r.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>
                  {r.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Stats band */}
        <Reveal delay={0.1}>
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #003d38 0%, #005850 55%, #00706b 100%)",
              boxShadow: "0 28px 60px -28px rgba(0,61,56,0.6)",
            }}
          >
            {/* Glow accents */}
            <div aria-hidden="true" style={{ position: "absolute", top: "-6rem", right: "-4rem", width: "18rem", height: "18rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(79,205,196,0.4) 0%, transparent 70%)" }} />
            <div aria-hidden="true" style={{ position: "absolute", bottom: "-7rem", left: "-5rem", width: "20rem", height: "20rem", borderRadius: "50%", background: "radial-gradient(circle, rgba(24,186,175,0.28) 0%, transparent 70%)" }} />

            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-8">
              {STATS.map((item, i) => (
                <div
                  key={item.label}
                  className="rounded-2xl px-4 py-7 text-center flex flex-col items-center gap-2 bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.14)] transition-colors duration-300"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(6px)" }}
                >
                  <span
                    className="text-4xl sm:text-5xl font-extrabold leading-none tabular-nums"
                    style={{ color: STAT_ACCENTS[i], fontFamily: "var(--font-heading)" }}
                  >
                    <Counter target={item.stat} suffix={item.suffix} />
                  </span>
                  <span className="text-xs sm:text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.15} className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/apply" className="btn-brand group">
            Start Your Journey
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-white border-[1.5px] border-[var(--gray-100)] text-[var(--gray-700)] hover:-translate-y-0.5 hover:border-[var(--ff-400)] hover:text-[var(--ff-700)] transition-all duration-200"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Explore Programs
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Gallery + Lightbox ───────────────────────────────────────────
type GalleryItem = { label: string; color: string; img: string };

const GALLERY_ITEMS: GalleryItem[] = [
  { label: "Workshop Session",  color: "from-[#005850] to-[#00a79d]", img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop" },
  { label: "Coding Bootcamp",   color: "from-[#00706b] to-[#18baaf]", img: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1200&q=80&auto=format&fit=crop" },
  { label: "Team Projects",     color: "from-[#003d38] to-[#00706b]", img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80&auto=format&fit=crop" },
  { label: "Graduation Day",    color: "from-[#00a79d] to-[#4fcdc4]", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&auto=format&fit=crop" },
  { label: "Innovation Fair",   color: "from-[#005850] to-[#18baaf]", img: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1200&q=80&auto=format&fit=crop" },
  { label: "Guest Speakers",    color: "from-[#00706b] to-[#00a79d]", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80&auto=format&fit=crop" },
];

function Lightbox({
  index,
  items,
  onClose,
  onPrev,
  onNext,
  onJump,
}: {
  index: number;
  items: GalleryItem[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}) {
  const item = items[index];
  const reduced = useReducedMotion();
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard + swipe
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft")  onPrev();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  // Keep the active thumbnail in view inside the strip
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index, reduced]);

  // Touch swipe
  const touchStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) onNext();
    if (dx >  50) onPrev();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 sm:gap-4 px-4 py-5"
      style={{
        background: "rgba(4,12,11,0.93)",
        backdropFilter: "blur(14px) saturate(120%)",
        WebkitBackdropFilter: "blur(14px) saturate(120%)",
        animation: reduced ? "none" : "lightboxIn 0.25s ease",
      }}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`Lightbox: ${item.label}`}
    >
      <style>{`
        @keyframes lightboxIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lbImgIn { from { opacity:0; transform: scale(0.965) } to { opacity:1; transform: scale(1) } }
      `}</style>

      {/* ── Top bar: counter, label, actions ── */}
      <div
        className="w-full max-w-[880px] flex items-center justify-between gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums"
            style={{
              fontFamily: "var(--font-heading)",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            {index + 1} / {items.length}
          </span>
          <p className="truncate text-white text-sm sm:text-base font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            {item.label}
          </p>
          <span className="hidden sm:inline text-xs text-white/45 truncate" style={{ fontFamily: "var(--font-body)" }}>
            Future Focus Academy
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={item.img}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white/80 hover:text-white transition-colors duration-200"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", fontFamily: "var(--font-heading)" }}
          >
            Open original
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.2)", background: "none" }}
            aria-label="Close lightbox"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Stage: image + arrows ── */}
      <div className="relative w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* Prev */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-0 sm:left-4 z-10 h-11 w-11 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          style={{ border: "1px solid rgba(255,255,255,0.22)", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}
          aria-label="Previous"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>

        {/* Image — remounts on navigation for a fade/scale transition */}
        <div
          key={index}
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: "min(84vw, 880px)",
            height: "min(56vh, 520px)",
            maxWidth: "90vw",
            boxShadow: "0 44px 90px -40px rgba(0,0,0,0.9)",
            animation: reduced ? "none" : "lbImgIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
          <Image
            src={item.img}
            alt={item.label}
            fill
            priority
            sizes="(max-width: 900px) 92vw, 880px"
            style={{ objectFit: "cover" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.25) 100%)" }}
          />
        </div>

        {/* Next */}
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-0 sm:right-4 z-10 h-11 w-11 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          style={{ border: "1px solid rgba(255,255,255,0.22)", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}
          aria-label="Next"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* ── Thumbnail strip ── */}
      <div
        className="w-full max-w-[880px] flex items-center gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "thin" }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((t, i) => (
          <button
            key={`${t.img}-${i}`}
            ref={(el) => { thumbRefs.current[i] = el; }}
            onClick={() => onJump(i)}
            className="relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              border: i === index ? "2px solid var(--ff-400)" : "1px solid rgba(255,255,255,0.18)",
              opacity: i === index ? 1 : 0.45,
              transform: i === index ? "translateY(-2px)" : "none",
              boxShadow: i === index ? "0 8px 20px -8px rgba(0,167,157,0.8)" : "none",
            }}
            aria-label={`View ${t.label}`}
            aria-current={i === index}
            onMouseEnter={(e) => { if (i !== index) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { if (i !== index) e.currentTarget.style.opacity = "0.45"; }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${t.color}`} />
            <Image src={t.img} alt="" fill sizes="80px" style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>

      {/* ── Keyboard hints ── */}
      <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/45" onClick={(e) => e.stopPropagation()}>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>←</kbd>
          <kbd className="px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>→</kbd>
          Navigate
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>Esc</kbd>
          Close
        </span>
      </div>
    </div>
  );
}

export function GallerySection({ uploads = [] }: { uploads?: { label: string; url: string }[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex]   = useState<number | null>(null);
  const [query, setQuery]   = useState("");
  const [visible, setVisible] = useState(9);

  const items: GalleryItem[] = [
    ...uploads.map((u) => ({
      label: u.label,
      color: "from-[#005850] to-[#00a79d]",
      img: u.url,
    })),
    ...GALLERY_ITEMS,
  ];

  // Search + pagination
  const q = query.trim().toLowerCase();
  const filtered = q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items;
  const shown = filtered.slice(0, visible);

  const onSearch = (v: string) => { setQuery(v); setVisible(9); };

  const openLightbox  = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () => setLightboxIndex((i) => (i !== null && filtered.length ? (i - 1 + filtered.length) % filtered.length : null));
  const nextItem = () => setLightboxIndex((i) => (i !== null && filtered.length ? (i + 1) % filtered.length : null));

  // Mosaic layout: first tile is the hero, every 4th is a tall tile
  const wrapperCls = (i: number) =>
    i === 0 ? "col-span-2 md:col-span-2 md:row-span-2" : i % 4 === 3 ? "md:row-span-2" : "";

  return (
    <section id="gallery" className="ff-section relative overflow-hidden" style={{ background: "var(--ff-50)" }} data-nav-theme="light">
      {/* Ambient glow orbs */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-28 h-96 w-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,167,157,0.13), transparent 70%)" }} />
        <div className="absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full" style={{ background: "radial-gradient(circle, rgba(79,205,196,0.15), transparent 70%)" }} />
      </div>

      <div className="ff-container relative">
        {/* ── Header + search ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <Reveal className="max-w-xl">
            <span className="text-xs font-semibold tracking-[0.16em] uppercase mb-3 block" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>Moments & Memories</span>
            <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>Gallery</h2>
            <p style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
              A glimpse into the vibrant world of Future Focus Academy — learning, collaborating, and growing together.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
            {/* Photo count chip */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold"
              style={{
                fontFamily: "var(--font-heading)",
                background: "#fff",
                border: "1px solid var(--gray-100)",
                color: "var(--ff-700)",
                boxShadow: "0 14px 30px -22px rgba(0,43,39,0.6)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--ff-500)" }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
              <span className="tabular-nums">{items.length}</span> photos
            </span>

            {/* Search */}
            <label className="relative block w-full md:w-72">
              <span className="sr-only">Search photos</span>
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--gray-400, #9aa3a3)" }}
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search photos…"
                className="w-full rounded-full pl-11 pr-10 py-3 text-sm bg-white text-[var(--gray-900)] outline-none border-[1.5px] border-[var(--gray-100)] focus:border-[var(--ff-400)] focus:shadow-[0_0_0_4px_var(--ff-100)] transition-shadow duration-200"
                style={{ fontFamily: "var(--font-body)" }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-[var(--gray-400, #9aa3a3)] hover:text-[var(--gray-700)] hover:bg-[var(--gray-100)] transition-colors cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </label>
          </Reveal>
        </div>

        {/* ── Mosaic grid ── */}
        {shown.length === 0 ? (
          <div
            className="rounded-3xl bg-white px-6 py-16 flex flex-col items-center gap-3 text-center"
            style={{ border: "1px solid var(--gray-100)", boxShadow: "0 34px 70px -46px rgba(0,43,39,0.45)" }}
          >
            <span
              className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)", color: "var(--ff-500)" }}
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <p className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
              No photos match “{query.trim()}”
            </p>
            <p className="text-sm" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>
              Try a different word, or clear the search to see everything.
            </p>
            <button
              type="button"
              onClick={() => onSearch("")}
              className="mt-2 rounded-full px-6 py-2.5 text-sm font-bold bg-white border-[1.5px] border-[var(--gray-100)] text-[var(--gray-700)] hover:border-[var(--ff-400)] hover:text-[var(--ff-700)] transition-all duration-200 cursor-pointer"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:auto-rows-[210px]">
            {shown.map((item, i) => (
              <Reveal key={`${item.img}-${i}`} delay={Math.min(i * 0.06, 0.36)} className={wrapperCls(i)}>
                <button
                  onClick={() => openLightbox(i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`group relative overflow-hidden rounded-3xl w-full cursor-pointer ${i === 0 ? "aspect-[16/10]" : "aspect-square"} md:aspect-auto md:h-full`}
                  style={{
                    border: "none",
                    padding: 0,
                    background: "none",
                    display: "block",
                    // Expand hovered, compress neighbours
                    transform: hoveredIndex === i ? "scale(1.03)" : hoveredIndex !== null ? "scale(0.98)" : "scale(1)",
                    transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }}
                  aria-label={`Open ${item.label}`}
                >
                  {/* Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
                  {/* Photo */}
                  <Image
                    src={item.img}
                    alt=""
                    fill
                    sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-700 group-hover:scale-[1.07]"
                  />
                  {/* Contrast overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.2) 100%)" }}
                  />

                  {/* Badge — fresh uploads */}
                  {i < uploads.length && (
                    <span
                      className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
                      style={{
                        fontFamily: "var(--font-heading)",
                        background: "linear-gradient(135deg, var(--ff-500), var(--ff-700))",
                        boxShadow: "0 10px 22px -10px rgba(0,167,157,0.9)",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                      New
                    </span>
                  )}

                  {/* Label — always visible, hint reveals on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/65 via-black/25 to-transparent">
                    <p className="text-white text-sm font-semibold text-left" style={{ fontFamily: "var(--font-heading)" }}>{item.label}</p>
                    <p
                      className="text-white/60 text-xs mt-0.5 text-left translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Click to expand
                    </p>
                  </div>

                  {/* Expand icon */}
                  <div
                    className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                    style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}

        {/* ── Load more ── */}
        {shown.length < filtered.length && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => setVisible((v) => v + 6)}
              className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold bg-white border-[1.5px] border-[var(--gray-100)] text-[var(--gray-700)] hover:border-[var(--ff-400)] hover:text-[var(--ff-700)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              style={{ fontFamily: "var(--font-heading)", boxShadow: "0 20px 44px -30px rgba(0,43,39,0.55)" }}
            >
              Show more photos
              <span
                className="rounded-full px-2 py-0.5 text-[11px] tabular-nums"
                style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)", color: "var(--ff-700)" }}
              >
                {filtered.length - shown.length}
              </span>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:translate-y-0.5 transition-transform duration-200"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {lightboxIndex !== null && filtered.length > 0 && (
        <Lightbox
          index={Math.min(lightboxIndex, filtered.length - 1)}
          items={filtered}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
          onJump={setLightboxIndex}
        />
      )}
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────
export function ContactSection() {
  return (
    <section id="contact" className="ff-section bg-white" data-nav-theme="light">
      <div className="ff-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <Reveal>
              <span className="text-xs font-semibold tracking-[0.16em] uppercase mb-3 block" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>Get In Touch</span>
              <h2 className="text-4xl font-extrabold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
                Your Future Starts<br />
                <span style={{ color: "var(--ff-500)" }}>With a Conversation</span>
              </h2>
              <p className="mb-10 text-lg" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
                Have questions about our programs? Ready to apply? We&apos;d love to hear from you.
              </p>
            </Reveal>
            <div className="flex flex-col gap-5">
              {[
                {
                  icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>),
                  label: "Email Us", value: "hello@futurefocus.org",
                },
                {
                  icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>),
                  label: "Call Us", value: "+250 700 000 000",
                },
                {
                  icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>),
                  label: "Location", value: "Kigali, Rwanda",
                },
              ].map((c, i) => (
                <Reveal key={c.label} delay={i * 0.1}>
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110" style={{ background: "var(--ff-100)", color: "var(--ff-700)" }}>
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--gray-500)", fontFamily: "var(--font-heading)" }}>{c.label}</p>
                      <p className="font-medium" style={{ color: "var(--gray-900)", fontFamily: "var(--font-body)" }}>{c.value}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <Reveal delay={0.15}>
            <form
              className="rounded-2xl p-8"
              style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)" }}
              onSubmit={(e) => e.preventDefault()}
              aria-label="Contact form"
            >
              <h3 className="font-bold text-xl mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
                Send Us a Message
              </h3>
              <div className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {["First Name", "Last Name"].map((label, i) => (
                    <div key={label}>
                      <label htmlFor={`field-${i}`} className="block text-sm font-medium mb-1.5" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>{label}</label>
                      <input
                        id={`field-${i}`}
                        type="text"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                        style={{ background: "white", border: "1.5px solid var(--gray-100)", color: "var(--gray-900)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--ff-400)")}
                        onBlur={(e)  => (e.target.style.borderColor = "var(--gray-100)")}
                        placeholder={i === 0 ? "Jane" : "Doe"}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>Email Address</label>
                  <input
                    id="email" type="email" className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: "white", border: "1.5px solid var(--gray-100)", color: "var(--gray-900)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--ff-400)")}
                    onBlur={(e)  => (e.target.style.borderColor = "var(--gray-100)")}
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1.5" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>Subject</label>
                  <select
                    id="subject" className="w-full rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                    style={{ background: "white", border: "1.5px solid var(--gray-100)", color: "var(--gray-900)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--ff-400)")}
                    onBlur={(e)  => (e.target.style.borderColor = "var(--gray-100)")}
                  >
                    <option value="">Select a topic</option>
                    <option>Program Inquiry</option>
                    <option>Application</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5" style={{ color: "var(--gray-700)", fontFamily: "var(--font-heading)" }}>Message</label>
                  <textarea
                    id="message" rows={4} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                    style={{ background: "white", border: "1.5px solid var(--gray-100)", color: "var(--gray-900)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--ff-400)")}
                    onBlur={(e)  => (e.target.style.borderColor = "var(--gray-100)")}
                    placeholder="Tell us how we can help you…"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-brand justify-center w-full group"
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e)   => (e.currentTarget.style.transform = "")}
                >
                  Send Message
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
