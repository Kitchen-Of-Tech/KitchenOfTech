"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Curtain variants - Multiple curtains sliding in
const curtainVariants = {
  initial: {
    scaleY: 1,
  },
  animate: {
    scaleY: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: 0.2,
    },
  },
  exit: {
    scaleY: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// Page content variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <div key={pathname}>
        {/* Animated Curtains Overlay */}
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              className="absolute top-0 h-full bg-gradient-to-b from-blue-600 via-purple-600 to-indigo-700"
              style={{
                left: `${index * 20}%`,
                width: "20%",
                originY: 0,
              }}
              variants={curtainVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                ...curtainVariants.animate.transition,
                delay: index * 0.08 + 0.1,
              }}
            />
          ))}
        </div>

        {/* Page Content with Fade & Slide */}
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
