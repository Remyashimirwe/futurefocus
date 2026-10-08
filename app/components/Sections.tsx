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
      <div className="tilt-glow absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300" style={{ opacity: 0, zIndex: 1 }} />
      {children}
    </div>
  );
}

// ─── Programs Section ─────────────────────────────────────────────
import { PROGRAMS, type Program } from "@/lib/program-data";

function ProgramCard({ p }: { p: Program }) {
  return (
    <Link href="/apply" className="block h-full" style={{ textDecoration: "none" }}>
      <TiltCard className="relative group bg-white rounded-2xl p-7 border h-full cursor-pointer" style={{ borderColor: "var(--gray-100)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        {/* Photo */}
        <div
          className="relative rounded-xl overflow-hidden mb-5"
          style={{ height: 148, background: "var(--ff-100)", zIndex: 2 }}
        >
          <Image
            src={p.img}
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {/* Tag */}
        <span className="text-[11px] font-semibold tracking-widest uppercase mb-2 block" style={{ color: "var(--ff-400)", fontFamily: "var(--font-heading)" }}>
          {p.tag}
        </span>
        {/* Title */}
        <h3 className="font-bold text-lg mb-2 transition-colors duration-200 group-hover:text-[var(--ff-700)]" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>
          {p.title}
        </h3>
        {/* Desc */}
        <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>
          {p.desc}
        </p>
        {/* Apply now */}
        <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>
          Apply Now
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        {/* Bottom border reveal on hover */}
        <div
          className="absolute bottom-0 left-6 right-6 h-px rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-400"
          style={{ background: "var(--ff-400)" }}
          aria-hidden="true"
        />
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
            <Reveal key={i} delay={i * 0.07}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.slice(0, 6).map((p, i) => (
            <Reveal key={i} delay={i * 0.07}>
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
const GALLERY_ITEMS = [
  { label: "Workshop Session",  color: "from-[#005850] to-[#00a79d]", size: "lg" as const, img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop" },
  { label: "Coding Bootcamp",   color: "from-[#00706b] to-[#18baaf]", size: "sm" as const, img: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1200&q=80&auto=format&fit=crop" },
  { label: "Team Projects",     color: "from-[#003d38] to-[#00706b]", size: "sm" as const, img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80&auto=format&fit=crop" },
  { label: "Graduation Day",    color: "from-[#00a79d] to-[#4fcdc4]", size: "md" as const, img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&auto=format&fit=crop" },
  { label: "Innovation Fair",   color: "from-[#005850] to-[#18baaf]", size: "md" as const, img: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1200&q=80&auto=format&fit=crop" },
  { label: "Guest Speakers",    color: "from-[#00706b] to-[#00a79d]", size: "sm" as const, img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80&auto=format&fit=crop" },
];

function Lightbox({
  index,
  items,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  items: typeof GALLERY_ITEMS;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const reduced = useReducedMotion();

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
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.92)",
        animation: reduced ? "none" : "lightboxIn 0.25s ease",
      }}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`Lightbox: ${item.label}`}
    >
      <style>{`@keyframes lightboxIn { from { opacity:0 } to { opacity:1 } }`}</style>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 h-10 w-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        style={{ border: "1px solid rgba(255,255,255,0.2)", background: "none" }}
        aria-label="Close lightbox"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 h-12 w-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        style={{ border: "1px solid rgba(255,255,255,0.2)", background: "none" }}
        aria-label="Previous"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
      </button>

      {/* Image */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ width: "min(80vw, 860px)", height: "min(70vh, 560px)", maxWidth: "90vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
        <Image
          src={item.img}
          alt={item.label}
          fill
          sizes="(max-width: 900px) 90vw, 860px"
          style={{ objectFit: "cover" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.3) 100%)" }}
        />
        <div className="absolute bottom-4 left-4 pr-16">
          <p className="text-white font-semibold text-lg" style={{ fontFamily: "var(--font-heading)" }}>{item.label}</p>
          <p className="text-white/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>Future Focus Academy</p>
        </div>
        {/* Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.4)" }}>
          <span className="text-white/80 text-xs font-medium" style={{ fontFamily: "var(--font-heading)" }}>
            {index + 1} / {items.length}
          </span>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 h-12 w-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        style={{ border: "1px solid rgba(255,255,255,0.2)", background: "none" }}
        aria-label="Next"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

export function GallerySection({ uploads = [] }: { uploads?: { label: string; url: string }[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex]   = useState<number | null>(null);

  const items: typeof GALLERY_ITEMS = [
    ...uploads.map((u) => ({
      label: u.label,
      color: "from-[#005850] to-[#00a79d]",
      size: "md" as const,
      img: u.url,
    })),
    ...GALLERY_ITEMS,
  ];

  const openLightbox  = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () => setLightboxIndex((i) => i !== null ? (i - 1 + items.length) % items.length : null);
  const nextItem = () => setLightboxIndex((i) => i !== null ? (i + 1) % items.length : null);

  return (
    <section id="gallery" className="ff-section" style={{ background: "var(--ff-50)" }} data-nav-theme="light">
      <div className="ff-container">
        <Reveal className="max-w-xl mb-14">
          <span className="text-xs font-semibold tracking-[0.16em] uppercase mb-3 block" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>Moments & Memories</span>
          <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>Gallery</h2>
          <p style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
            A glimpse into the vibrant world of Future Focus Academy — learning, collaborating, and growing together.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <button
                onClick={() => openLightbox(i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative overflow-hidden rounded-2xl w-full cursor-pointer"
                style={{
                  minHeight: item.size === "lg" ? 360 : item.size === "md" ? 220 : 180,
                  border: "none",
                  padding: 0,
                  background: "none",
                  // Expand hovered, compress neighbours
                  transform: hoveredIndex === i ? "scale(1.03)" : hoveredIndex !== null ? "scale(0.98)" : "scale(1)",
                  transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                  display: "block",
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
                  sizes="(max-width: 768px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                {/* Contrast overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.18) 100%)" }}
                />
                {/* Label reveal on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/55 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold text-left" style={{ fontFamily: "var(--font-heading)" }}>{item.label}</p>
                  <p className="text-white/50 text-xs mt-0.5 text-left" style={{ fontFamily: "var(--font-body)" }}>Click to expand</p>
                </div>
                {/* Expand icon */}
                <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          index={lightboxIndex}
          items={items}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
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
