"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── useReducedMotion ─────────────────────────────────────────────
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── useInView ────────────────────────────────────────────────────
// Returns [ref, isVisible]. Once visible it stays visible (one-shot).
export function useInView<T extends Element>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect(); // one-shot
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return [ref, inView];
}

// ─── useMagnetic ──────────────────────────────────────────────────
// Returns handlers + ref. Applies a gentle magnetic pull toward cursor.
export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 0.1s ease";
    },
    [reduced, strength]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
