"use client";

// app/coupon/[id]/CouponDetailClient.tsx
// Interactive coupon detail page.
//
// Data strategy:
//   - Static display data (icon, title, descriptions) → getCouponById() — instant, no loading
//   - Live mutable state (status, redeemedAt)         → Firestore onSnapshot subscription
//   - Merge rule: Firestore state wins; fall back to static status when no doc exists

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getCouponById } from "@/lib/services/couponService";
import {
  subscribeToCouponStatus,
  redeemCoupon,
  type CouponFirestoreState,
} from "@/lib/services/firestoreCouponService";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageTransition } from "@/components/common/PageTransition";
import { RedeemSection } from "@/components/wallet/RedeemSection";
import type { CouponStatus } from "@/types/coupon";

// ── Status → badge config ─────────────────────────────────────────────────────

const BADGE_MAP: Record<
  CouponStatus,
  { label: string; variant: "active" | "inactive" | "special" }
> = {
  available: { label: "Available", variant: "active" },
  redeemed:  { label: "Redeemed",  variant: "inactive" },
  special:   { label: "Special ✦", variant: "special" },
};

// ── Category display labels ───────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  date:       "📅 Date",
  food:       "🍽️ Food",
  adventure:  "🗺️ Adventure",
  "self-care":"💆 Self-care",
  cozy:       "🛋️ Cozy",
  romantic:   "💕 Romantic",
  gift:       "🎁 Gift",
  fun:        "🎉 Fun",
  power:      "👑 Power",
  surprise:   "🎲 Surprise",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CouponDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const coupon = getCouponById(id); // synchronous — available immediately

  const [firestoreState, setFirestoreState] =
    useState<CouponFirestoreState | null>(null);
  const [isFirestoreReady, setIsFirestoreReady] = useState(false);

  useEffect(() => {
    if (!coupon) return;
    const unsub = subscribeToCouponStatus(id, (state) => {
      setFirestoreState(state);
      setIsFirestoreReady(true);
    });
    return unsub;
  }, [id, coupon]);

  // page.tsx already calls notFound() — this is a safety guard for the client
  if (!coupon) return null;

  // Firestore overrides static status; fall back when no doc exists yet
  const liveStatus: CouponStatus = firestoreState?.status ?? coupon.status;
  const redeemedAt = firestoreState?.redeemedAt;

  const { label, variant } = BADGE_MAP[liveStatus];
  const categoryLabel = CATEGORY_LABELS[coupon.category] ?? coupon.category;
  const displayDescription = coupon.longDescription ?? coupon.description;

  const glowVariant: "pink" | "purple" | "none" =
    liveStatus === "special" ? "pink" : "none";

  return (
    <PageTransition className="relative min-h-screen px-4 pb-16">
      {/* Safe-area top spacer */}
      <div className="h-14" aria-hidden="true" />

      {/* ── Back button ──────────────────────────────────────────────────── */}
      <motion.button
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-zinc-400 outline-none transition-colors hover:text-foreground"
        onClick={() => router.back()}
        whileTap={{ scale: 0.97 }}
        aria-label="Go back to wallet"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back
      </motion.button>

      {/* ── Hero icon ─────────────────────────────────────────────────────── */}
      <motion.div
        className="mb-8 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Icon with optional glow for special coupons */}
        <div className="relative">
          {liveStatus === "special" && (
            <div
              className="pointer-events-none absolute inset-0 rounded-full blur-2xl"
              style={{
                background: "rgba(236,72,153,0.28)",
                transform: "scale(1.5)",
              }}
              aria-hidden="true"
            />
          )}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06] text-5xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm">
            {coupon.icon}
          </div>
        </div>

        {/* Live status badge */}
        <StatusBadge label={label} status={variant} />
      </motion.div>

      {/* ── Main detail card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassPanel glow={glowVariant} className="space-y-4 px-6 py-7">
          {/* Category pill */}
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {categoryLabel}
          </p>

          {/* Title */}
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-foreground">
            {coupon.title}
          </h1>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" role="separator" />

          {/* Long description */}
          <p className="text-sm leading-relaxed text-zinc-300">
            {displayDescription}
          </p>
        </GlassPanel>
      </motion.div>

      {/* ── Redemption section ────────────────────────────────────────────── */}
      {isFirestoreReady ? (
        <RedeemSection
          coupon={coupon}
          liveStatus={liveStatus}
          redeemedAt={redeemedAt}
          onRedeem={() => redeemCoupon(id)}
        />
      ) : (
        /* Skeleton while Firestore resolves (usually < 500 ms) */
        <div className="mt-10 flex justify-center" aria-label="Loading status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        </div>
      )}
    </PageTransition>
  );
}
