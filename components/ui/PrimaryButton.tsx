"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface PrimaryButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center gap-2 rounded-button bg-gradient-to-r from-primary to-secondary px-6 py-4 font-semibold text-foreground shadow-pink-glow outline-none cursor-pointer",
          className
        )}
        whileHover={{ scale: 1.015, boxShadow: "0 0 30px rgba(236, 72, 153, 0.4)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";
