"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface GlassPanelProps {
  children?: React.ReactNode;
  className?: string;
  glow?: "pink" | "purple" | "none";
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  glow = "none",
  onClick,
  style,
}) => {
  return (
    <motion.div
      className={cn(
        "rounded-[32px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-[24px]",
        {
          "shadow-[0_0_40px_rgba(236,72,153,0.08),_0_0_80px_rgba(236,72,153,0.03),_inset_0_1px_0_0_rgba(255,255,255,0.16)]": glow === "pink",
          "shadow-[0_0_40px_rgba(139,92,246,0.08),_0_0_80px_rgba(139,92,246,0.03),_inset_0_1px_0_0_rgba(255,255,255,0.16)]": glow === "purple",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]": glow === "none",
        },
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
};
