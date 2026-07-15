"use client";

// components/wallet/RedeemSection.tsx
// Manages the full coupon redemption state machine:
//
//   idle → confirming → redeeming → celebrating → redeemed
//
// The "celebrating" state renders a full-screen premium coupon animation
// overlay before settling into the final redeemed UI.

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmDialog } from "@/components/wallet/ConfirmDialog";
import type { Coupon, CouponStatus } from "@/types/coupon";

// ── Particle config ───────────────────────────────────────────────────────────

const PARTICLE_EMOJIS = ["❤️", "✨", "💫", "💕", "⭐", "🌟", "💝", "✦"] as const;

/** Stable set of particles — defined once to avoid re-creation on render. */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  // Spread particles evenly around 360°, with a small zigzag offset for variety
  angle: (360 / 24) * i + (i % 2 === 0 ? 6 : -6),
  // Vary distance in two bands: inner and outer ring
  distance: i % 2 === 0 ? 100 + (i % 4) * 18 : 140 + (i % 3) * 20,
  emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
  delay: (i % 6) * 0.04,
  fontSize: i % 3 === 0 ? "1.5rem" : i % 3 === 1 ? "1rem" : "0.75rem",
  rotation: i % 2 === 0 ? 45 : -45,
}));

// ── State machine type ────────────────────────────────────────────────────────

type RedeemState = "idle" | "confirming" | "redeeming" | "celebrating" | "redeemed";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRedeemedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Celebration overlay ───────────────────────────────────────────────────────

interface CelebrationOverlayProps {
  icon: string;
  title: string;
  onComplete: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  icon,
  title,
  onComplete,
}) => {
  // Auto-dismiss after 2.8 s
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-black/92"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      // Tapping anywhere also dismisses
      onClick={onComplete}
      role="dialog"
      aria-label="Coupon redeemed"
    >
      {/* ── Radial background glow ─────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0.35] }}
        transition={{ duration: 1.4, times: [0, 0.35, 1] }}
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(236,72,153,0.38) 0%, rgba(139,92,246,0.12) 50%, transparent 75%)",
        }}
      />

      {/* ── Particle burst ─────────────────────────────────────────────────── */}
      {PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute select-none"
            style={{ fontSize: p.fontSize }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [0, tx * 0.4, tx],
              y: [0, ty * 0.4, ty],
              scale: [0, 1.4, 1, 0],
              rotate: [0, p.rotation],
            }}
            transition={{
              duration: 1.5,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
              opacity: { times: [0, 0.15, 0.6, 1] },
            }}
          >
            {p.emoji}
          </motion.span>
        );
      })}

      {/* ── Icon hero ──────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ scale: 0.25, opacity: 0 }}
        animate={{ scale: [0.25, 1.3, 1], opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Pulsing glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "0 0 80px 28px rgba(236,72,153,0.55)",
          }}
          animate={{ opacity: [0.9, 0.35, 0.9], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Secondary purple ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "0 0 120px 40px rgba(139,92,246,0.25)",
          }}
          animate={{ opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />

        {/* Icon container */}
        <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-7xl backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          {icon}
        </div>
      </motion.div>

      {/* ── Text ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 space-y-3 px-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-4xl font-bold tracking-tight text-foreground">
          ❤️ Redeemed
        </p>
        <p className="text-sm font-medium text-zinc-400">{title}</p>
      </motion.div>

      {/* ── Bottom shimmer bar ─────────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(236,72,153,0.7) 50%, transparent 100%)",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.9, ease: "easeOut" }}
      />

      {/* ── Tap-to-dismiss hint ────────────────────────────────────────────── */}
      <motion.p
        className="pointer-events-none absolute bottom-8 text-[11px] font-medium tracking-widest text-zinc-600 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Tap to continue
      </motion.p>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export interface RedeemSectionProps {
  coupon: Coupon;
  liveStatus: CouponStatus;
  redeemedAt?: string | null;
  onRedeem: () => Promise<void>;
}

export const RedeemSection: React.FC<RedeemSectionProps> = ({
  coupon,
  liveStatus,
  redeemedAt,
  onRedeem,
}) => {
  const [state, setState] = useState<RedeemState>(
    liveStatus === "redeemed" ? "redeemed" : "idle"
  );

  // Sync state if Firestore updates on another device
  if (
    liveStatus === "redeemed" &&
    state !== "celebrating" &&
    state !== "redeeming" &&
    state !== "redeemed"
  ) {
    setState("redeemed");
  }

  const handleRedeemClick = () => setState("confirming");
  const handleCancel = () => setState("idle");

  const handleConfirm = async () => {
    setState("redeeming");
    try {
      await onRedeem();
      setState("celebrating");
    } catch (err) {
      console.error("[RedeemSection] Redemption failed:", err);
      setState("idle");
    }
  };

  const handleCelebrationComplete = useCallback(() => {
    setState("redeemed");
  }, []);

  const isAvailableOrSpecial =
    liveStatus === "available" || liveStatus === "special";

  return (
    <>
      {/* ── Confirmation dialog ────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={state === "confirming"}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={state === "redeeming"}
      />

      {/* ── Premium celebration overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {state === "celebrating" && (
          <CelebrationOverlay
            key="celebration"
            icon={coupon.icon}
            title={coupon.title}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      {/* ── Bottom action area ─────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {/* Redeem button — shown when available/special and not yet redeemed */}
        <AnimatePresence mode="wait">
          {isAvailableOrSpecial && state !== "redeemed" && (
            <motion.div
              key="redeem-btn"
              className="w-full max-w-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <PrimaryButton
                id="redeem-coupon-btn"
                onClick={handleRedeemClick}
                disabled={state === "redeeming"}
                className="w-full justify-center text-base"
                aria-label="Redeem this coupon"
              >
                {state === "redeeming" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Redeeming…
                  </span>
                ) : (
                  "Redeem Coupon"
                )}
              </PrimaryButton>
            </motion.div>
          )}

          {/* Redeemed state — shown after celebration completes */}
          {state === "redeemed" && (
            <motion.div
              key="redeemed-badge"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <div className="flex items-center gap-2.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm">
                <span>❤️</span>
                <span>Redeemed</span>
              </div>
              {redeemedAt && (
                <p className="text-xs text-zinc-500">
                  {formatRedeemedAt(redeemedAt)}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
