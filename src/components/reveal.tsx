"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Milliseconds for staggered reveal (e.g. 50, 100)
  threshold?: number;
  rootMargin?: string;
  as?: React.ElementType;
}

/**
 * Lightweight, accessible scroll-reveal component using IntersectionObserver.
 * - Zero external animation libraries (no Framer Motion / GSAP).
 * - Preserves server-rendered text for SEO & accessibility.
 * - Respects prefers-reduced-motion natively.
 * - GPU-accelerated: only animates opacity and translateY.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.08,
  rootMargin = "0px 0px -40px 0px",
  as: Component = "div",
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [effectiveDelay, setEffectiveDelay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Immediately reveal if user prefers reduced motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }

    // 2. Suppress stagger delay on mobile devices to prevent scroll stutter
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setEffectiveDelay(0);
    } else {
      setEffectiveDelay(delay);
    }

    const node = ref.current;
    if (!node) return;

    // 3. Fallback if IntersectionObserver is unsupported
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay]);

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: "400ms",
        transitionDelay: effectiveDelay ? `${effectiveDelay}ms` : undefined,
      }}
      className={`transition-[opacity,transform] ease-out will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 sm:translate-y-4"
      } ${className}`}
    >
      {children}
    </Component>
  );
}
