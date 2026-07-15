import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface StatusBadgeProps {
  label: string;
  status?: "active" | "inactive" | "special";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  status = "active",
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border-custom bg-surface px-3 py-1.5 text-xs font-semibold tracking-wider text-foreground backdrop-blur-md uppercase",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <motion.span
          className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", {
            "bg-green-500": status === "active",
            "bg-zinc-500": status === "inactive",
            "bg-primary": status === "special",
          })}
          animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span
          className={cn("relative inline-flex h-2 w-2 rounded-full", {
            "bg-green-500": status === "active",
            "bg-zinc-500": status === "inactive",
            "bg-primary": status === "special",
          })}
        />
      </span>
      {label}
    </div>
  );
};
