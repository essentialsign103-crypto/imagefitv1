"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Direction of entrance motion: left, right, up, or fade (opacity only) */
  direction?: "left" | "right" | "up" | "fade";
  /** Horizontal or vertical translation offset in pixels (default: 28px) */
  distance?: number;
  /** Stagger delay in milliseconds (default: 0ms) */
  delay?: number;
  /** Transition duration in milliseconds (default: 450ms) */
  duration?: number;
  /** IntersectionObserver threshold from 0 to 1 (default: 0.1) */
  threshold?: number;
  /** Additional CSS class names */
  className?: string;
  /** Semantic HTML element to render (default: 'div') */
  as?: React.ElementType;
}

// React 19 idiomatic store to detect client mount without synchronous setState in effect
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

// React 19 idiomatic store to subscribe to prefers-reduced-motion
function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

/**
 * ScrollReveal Component
 * Provides smooth, lightweight, hardware-accelerated scroll reveals.
 * Supports left-to-right, right-to-left, and upward motion with staggered delays.
 * Features automatic bidirectional scroll detection (downward entrance and upward re-entry).
 * Progressive enhancement: 100% visible before hydration or if JavaScript/IntersectionObserver is unavailable.
 * Respects prefers-reduced-motion accessibility preferences.
 */
export function ScrollReveal({
  children,
  direction = "up",
  distance = 28,
  delay = 0,
  duration = 450,
  threshold = 0.1,
  className,
  as: Component = "div",
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If reduced motion is requested or IntersectionObserver is not available, reveal immediately
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Bidirectional reveal: smooth entrance when entering, reset on complete exit
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: Math.min(Math.max(threshold, 0), 1),
        rootMargin: "0px 0px -30px 0px",
      }
    );

    const currentEl = ref.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold, prefersReducedMotion]);

  // Progressive enhancement fallback: fully visible before client mount or under reduced motion
  if (!isClient || prefersReducedMotion) {
    return (
      <Component ref={ref} className={className} style={style} {...props}>
        {children}
      </Component>
    );
  }

  // Calculate direction-specific offset
  let initialTransform = "none";
  switch (direction) {
    case "left":
      initialTransform = `translate3d(-${distance}px, 0, 0)`;
      break;
    case "right":
      initialTransform = `translate3d(${distance}px, 0, 0)`;
      break;
    case "up":
      initialTransform = `translate3d(0, ${distance}px, 0)`;
      break;
    case "fade":
    default:
      initialTransform = "translate3d(0, 0, 0)";
      break;
  }

  const transform = isVisible ? "translate3d(0, 0, 0)" : initialTransform;
  const opacity = isVisible ? 1 : 0;

  return (
    <Component
      ref={ref}
      className={cn(
        "transition-[transform,opacity] will-change-[transform,opacity]",
        className
      )}
      style={{
        ...style,
        transform,
        opacity,
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
