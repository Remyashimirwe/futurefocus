"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks";

export default function PageLoader() {
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setPhase("done");
      return;
    }

    // Ramp progress 0→100 over ~1.8s
    let frame: number;
    const start = performance.now();
    const duration = 1800;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(100, (elapsed / duration) * 100);
      // ease-out curve
      const eased = Math.round(100 * (1 - Math.pow(1 - p / 100, 2.5)));
      setProgress(eased);
      if (elapsed < duration) {
        frame = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => setPhase("exiting"), 300);
        setTimeout(() => setPhase("done"), 900);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ff-900)",
        transition: phase === "exiting" ? "opacity 0.6s ease, transform 0.6s ease" : "none",
        opacity: phase === "exiting" ? 0 : 1,
        transform: phase === "exiting" ? "scale(1.03)" : "scale(1)",
        pointerEvents: phase === "exiting" ? "none" : "all",
      }}
    >
      {/* Decorative background rings */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {[400, 600, 800].map((r, i) => (
          <div
            key={r}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: r,
              height: r,
              marginLeft: -r / 2,
              marginTop: -r / 2,
              borderRadius: "50%",
              border: `1px solid rgba(24,186,175,${0.06 - i * 0.015})`,
              animation: `loaderPulse ${2 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* SVG Logo mark with draw-in stroke */}
      <div
        style={{
          position: "relative",
          marginBottom: "2rem",
          animation: "loaderFadeUp 0.6s 0.1s ease both",
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          style={{ overflow: "visible" }}
        >
          {/* Outer circle — draws in */}
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="rgba(24,186,175,0.2)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="var(--ff-400)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="201"
            strokeDashoffset="201"
            strokeLinecap="round"
            style={{
              animation: "drawCircle 1s 0.2s cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          />
          {/* FF lettermark */}
          <rect x="18" y="20" width="16" height="32" rx="3" fill="var(--ff-700)" />
          <rect x="18" y="20" width="22" height="7" rx="3" fill="var(--ff-500)" />
          <rect x="18" y="32" width="18" height="6" rx="3" fill="var(--ff-400)" />
          <rect x="38" y="20" width="16" height="32" rx="3" fill="var(--ff-700)" />
          <rect x="38" y="20" width="22" height="7" rx="3" fill="var(--ff-500)" />
          <rect x="38" y="32" width="18" height="6" rx="3" fill="var(--ff-400)" />
        </svg>

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            inset: "-20px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(24,186,175,0.15) 0%, transparent 70%)",
            animation: "loaderGlow 1.5s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Brand name */}
      <div
        style={{
          animation: "loaderFadeUp 0.6s 0.3s ease both",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "1.5rem",
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Future
          <span style={{ color: "var(--ff-400)" }}>Focus</span>
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "0.65rem",
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "2.5rem",
          animation: "loaderFadeUp 0.6s 0.4s ease both",
        }}
      >
        Shaping the Future
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: "160px",
          height: "1px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "9999px",
          overflow: "hidden",
          animation: "loaderFadeUp 0.6s 0.5s ease both",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "9999px",
            background: "var(--ff-400)",
            width: `${progress}%`,
            transition: "width 0.12s linear",
          }}
        />
      </div>

      {/* Progress number */}
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.25)",
          marginTop: "0.75rem",
          tabularNums: "tabular-nums",
          animation: "loaderFadeUp 0.6s 0.5s ease both",
        } as React.CSSProperties}
      >
        {progress}%
      </p>

      <style>{`
        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes loaderFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loaderPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.02); }
        }
        @keyframes loaderGlow {
          from { opacity: 0.5; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
