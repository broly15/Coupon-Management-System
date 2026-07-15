import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface FloatingCardProps {
  children?: React.ReactNode;
  className?: string;
  glow?: "pink" | "purple" | "none";
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className,
  glow = "none",
}) => {
  return (
    <motion.div
      className={cn(
        "rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300",
        {
          "shadow-[0_0_20px_rgba(236,72,153,0.15)]": glow === "pink",
          "shadow-[0_0_20px_rgba(139,92,246,0.15)]": glow === "purple",
        },
        className
      )}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};
