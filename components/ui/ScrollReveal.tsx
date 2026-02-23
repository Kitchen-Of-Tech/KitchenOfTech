"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-in";
  delay?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  className,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Fallback: if the element is never intersected (e.g. JS disabled or observer blocked),
    // make it visible after a generous timeout so content is never permanently hidden
    const fallbackTimer = setTimeout(() => setIsVisible(true), 2000 + delay);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      clearTimeout(fallbackTimer);
    };
  }, [delay]);

  const animations = {
    "fade-up": "animate-fade-up",
    "fade-down": "animate-fade-down",
    "fade-left": "animate-slide-in-left",
    "fade-right": "animate-slide-in-right",
    "scale-in": "animate-scale-in",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        !isVisible && "opacity-0 translate-y-4",
        isVisible && animations[animation],
        className
      )}
    >
      {children}
    </div>
  );
}
