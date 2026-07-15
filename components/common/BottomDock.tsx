"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  MailOpen,
  Image as ImageIcon,
  Sparkles,
  ListTodo,
} from "lucide-react";

export interface DockItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const DEFAULT_DOCK_ITEMS: DockItem[] = [
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Letters", href: "/letters", icon: MailOpen },
  { label: "Gallery", href: "/gallery", icon: ImageIcon },
  { label: "Memories", href: "/memories", icon: Sparkles },
  { label: "Bucket", href: "/bucket-list", icon: ListTodo },
];

export const BottomDock: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-[360px] -translate-x-1/2 px-4 sm:max-w-[390px]">
      <div className="flex h-16 items-center justify-around rounded-full border border-border-custom bg-black/60 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {DEFAULT_DOCK_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 text-zinc-400 outline-none transition-colors hover:text-foreground"
            >
              <span className={cn("relative z-10 transition-transform duration-300", isActive && "text-primary scale-110")}>
                <Icon size={20} className="text-inherit" />
              </span>
              
              {isActive && (
                <motion.span
                  layoutId="active-dock-indicator"
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
