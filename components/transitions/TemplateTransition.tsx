"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface TemplateTransitionProps {
  children: ReactNode;
}

export function TemplateTransition({ children }: TemplateTransitionProps) {
  const pathname = usePathname();
  
  // Disable transitions for Sanity Studio
  const isStudioRoute = pathname?.startsWith('/studio');

  // If in Studio, just return children without transitions
  if (isStudioRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Animated Overlay - Sliding panels effect */}
      <motion.div
        key={pathname}
        className="fixed inset-0 z-[100] pointer-events-none flex"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            className="flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
            initial={{ scaleY: 1, originY: 0 }}
            animate={{ scaleY: 0 }}
            transition={{
              duration: 0.7,
              delay: index * 0.08,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          />
        ))}
      </motion.div>

      {/* Page content with smooth fade */}
      <motion.div
        key={`${pathname}-content`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        }}
      >
        {children}
      </motion.div>

      {/* Circular reveal effect overlay */}
      <motion.div
        key={`${pathname}-circle`}
        className="fixed inset-0 z-[99] pointer-events-none bg-gradient-to-br from-blue-900 to-purple-900"
        initial={{ clipPath: "circle(150% at 50% 50%)" }}
        animate={{ clipPath: "circle(0% at 50% 50%)" }}
        transition={{
          duration: 0.8,
          delay: 0.1,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        }}
      />
    </>
  );
}
