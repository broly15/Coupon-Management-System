"use client";

// components/wallet/CouponCard.tsx
// A premium Apple Wallet-inspired coupon card.
// Reuses GlassPanel and StatusBadge from the design system.
// Sprint 5: navigates to /coupon/[id] on tap and displays live redemption status.

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCouponStatus } from "@/components/common/CouponStatusProvider";
import type { Coupon, CouponStatus } from "@/types/coupon";

// ─── helpers ────────────────────────────────────────────────────────────────

function toStatusBadge(status: CouponStatus): {
  label: string;
  variant: "active" | "inactive" | "special";
} {
  switch (status) {
    case "available":
      return { label: "Available", variant: "active" };
    case "redeemed":
      return { label: "Redeemed", variant: "inactive" };
    case "special":
      return { label: "Special", variant: "special" };
  }
}

// ─── spring presets ─────────────────────────────────────────────────────────

const TAP_SPRING = { type: "spring", stiffness: 500, damping: 35 } as const;

// ─── component ──────────────────────────────────────────────────────────────

export interface CouponCardProps {
  coupon: Coupon;
  /** Called when the card is tapped — fires alongside Link navigation */
  onPress?: (coupon: Coupon) => void;
  /** Staggered entrance delay in seconds */
  delay?: number;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onPress,
  delay = 0,
}) => {
  // Reads from the single shared collection listener — no per-card subscription.
  const liveStatus = useCouponStatus(coupon.id, coupon.status);

  const { label, variant } = toStatusBadge(liveStatus);

  return (
    <Link
      href={`/coupon/${coupon.id}`}
      className="block w-full outline-none"
      onClick={() => onPress?.(coupon)}
      aria-label={`Open coupon: ${coupon.title}`}
    >
      <motion.div
        // ── Staggered entrance ──────────────────────────────────────────────
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        // ── Tap physics ─────────────────────────────────────────────────────
        whileTap={{ scale: 0.97 }}
        transition={{
          // Default transition covers entrance (opacity, y)
          duration: 0.55,
          delay,
          ease: [0.16, 1, 0.3, 1] as const,
          // Override for scale specifically (tap spring)
          scale: TAP_SPRING,
        }}
        className="cursor-pointer w-full"
      >
        <GlassPanel
          glow={liveStatus === "special" ? "pink" : "none"}
          className="flex items-center gap-4 px-5 py-4 transition-[background] duration-200 hover:bg-white/[0.06] active:bg-white/[0.02]"
        >
          {/* Icon */}
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl"
            aria-hidden="true"
          >
            {coupon.icon}
          </span>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground leading-tight truncate">
                {coupon.title}
              </span>
              {liveStatus === "special" && (
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                  ✦
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400/80 leading-snug line-clamp-1">
              {coupon.description}
            </p>
            <div className="mt-1.5">
              <StatusBadge label={label} status={variant} />
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight
            size={16}
            className="shrink-0 text-zinc-600"
            aria-hidden="true"
          />
        </GlassPanel>
      </motion.div>
    </Link>
  );
};
