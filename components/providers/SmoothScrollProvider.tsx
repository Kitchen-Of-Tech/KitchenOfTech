"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Disable smooth scroll for Sanity Studio
  const isStudioRoute = pathname?.startsWith('/studio');

  useEffect(() => {
    // Don't initialize Lenis in Sanity Studio
    if (isStudioRoute) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isStudioRoute]);

  return <>{children}</>;
}
