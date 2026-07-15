import React from "react";
import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  align = "left",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        {
          "items-start text-left": align === "left",
          "items-center text-center": align === "center",
          "items-end text-right": align === "right",
        },
        className
      )}
    >
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-md text-sm text-muted leading-relaxed sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
};
