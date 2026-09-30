"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
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
const PROGRAMS = [
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>),
    title: "Digital Skills", desc: "Coding, design, and digital literacy for the modern world.", tag: "Technology",
    img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80&auto=format&fit=crop",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>),
    title: "Career Readiness", desc: "CV writing, interview skills, and professional networking.", tag: "Career",
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&q=80&auto=format&fit=crop",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>),
    title: "Global Perspectives", desc: "Expand your worldview with international learning and exchange.", tag: "Global",
    img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=900&q=80&auto=format&fit=crop",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>),
    title: "Creative Arts & Media", desc: "Video, storytelling, design, and creative expression.", tag: "Creative",
    img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900&q=80&auto=format&fit=crop",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" /></svg>),
    title: "Coding & Software Development", desc: "Learn web development, Python, and problem-solving by building real apps from scratch.", tag: "Technology",
    img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80&auto=format&fit=crop",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>),
    title: "Music Production", desc: "Compose, record, and mix your own tracks with modern production tools and studio techniques.", tag: "Music",
    img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&q=80&auto=format&fit=crop",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>),
    title: "Photography", desc: "Master camera fundamentals, lighting, and editing to tell powerful visual stories.", tag: "Creative",
    img: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=900&q=80&auto=format&fit=crop",
  },
];

export function ProgramsSection() {
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
          {PROGRAMS.map((p, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <TiltCard className="relative group bg-white rounded-2xl p-7 border h-full cursor-pointer" style={{ borderColor: "var(--gray-100)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                {/* Photo + icon badge */}
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
                  <div
                    className="absolute top-3 left-3 inline-flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.94)", color: "var(--ff-700)" }}
                  >
                    {p.icon}
                  </div>
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
                {/* Learn more */}
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>
                  Learn more
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
            </Reveal>
          ))}
        </div>
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
  { stat: 500, suffix: "+", label: "Students Enrolled",  color: "var(--ff-800)" },
  { stat: 12,  suffix: "+", label: "Programs Available", color: "var(--ff-700)" },
  { stat: 95,  suffix: "%", label: "Satisfaction Rate",  color: "var(--ff-500)" },
  { stat: 30,  suffix: "+", label: "Expert Mentors",     color: "var(--ff-400)" },
];

export function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="ff-section bg-white" data-nav-theme="light">
      <div className="ff-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <Reveal>
              <span className="text-xs font-semibold tracking-[0.16em] uppercase mb-3 block" style={{ color: "var(--ff-500)", fontFamily: "var(--font-heading)" }}>Why Future Focus Academy</span>
              <h2 className="text-4xl font-extrabold mb-6 leading-tight" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-950)" }}>
                Built for the Next Generation
              </h2>
              <p className="mb-10 text-lg" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}>
                Future Focus Academy is more than a program—it&apos;s a movement. We believe every young person deserves the tools, guidance, and community to shape their own future.
              </p>
            </Reveal>
            <div className="flex flex-col gap-7">
              {REASONS.map((r, i) => (
                <Reveal key={r.num} delay={i * 0.1}>
                  <div className="flex gap-5 group">
                    <span className="text-2xl font-extrabold shrink-0 leading-none mt-0.5 transition-colors duration-300 group-hover:text-[var(--ff-400)]" style={{ color: "var(--ff-200)", fontFamily: "var(--font-heading)" }}>
                      {r.num}
                    </span>
                    <div>
                      <h3 className="font-bold text-base mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--gray-900)" }}>{r.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--gray-500)", fontFamily: "var(--font-body)" }}>{r.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: stat cards */}
          <div className="grid grid-cols-2 gap-5">
            {STATS.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-7 flex flex-col justify-between group hover:shadow-lg transition-shadow duration-300"
                  style={{ background: "var(--ff-50)", border: "1px solid var(--ff-100)", minHeight: 140 }}
                >
                  <span className="text-4xl font-extrabold leading-none mb-3 tabular-nums" style={{ color: item.color, fontFamily: "var(--font-heading)" }}>
                    <Counter target={item.stat} suffix={item.suffix} />
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--gray-700)", fontFamily: "var(--font-body)" }}>
                    {item.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
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
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = GALLERY_ITEMS[index];
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
            {index + 1} / {GALLERY_ITEMS.length}
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

export function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex]   = useState<number | null>(null);

  const openLightbox  = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () => setLightboxIndex((i) => i !== null ? (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length : null);
  const nextItem = () => setLightboxIndex((i) => i !== null ? (i + 1) % GALLERY_ITEMS.length : null);

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
          {GALLERY_ITEMS.map((item, i) => (
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
