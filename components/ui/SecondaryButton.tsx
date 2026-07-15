import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface SecondaryButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center gap-2 rounded-button border border-border-custom bg-transparent px-6 py-4 font-semibold text-muted transition-all duration-300 hover:bg-surface hover:text-foreground outline-none active:scale-95 cursor-pointer",
          className
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

SecondaryButton.displayName = "SecondaryButton";
