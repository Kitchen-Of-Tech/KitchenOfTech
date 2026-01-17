"use client";

import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({
  children,
  hover = false,
  gradient = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl backdrop-blur-md",
        hover ? "glass-hover" : "glass",
        gradient && "gradient-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
