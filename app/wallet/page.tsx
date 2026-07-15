"use client";

// app/wallet/page.tsx
// Sprint 4 — Wallet screen
// Displays the full coupon list with staggered entrance animations.
// Uses the synchronous coupon service (Firestore-ready).

import React from "react";
import { motion } from "framer-motion";
import { getCoupons } from "@/lib/services/couponService";
import { CouponCard } from "@/components/wallet/CouponCard";

// ── constants ─────────────────────────────────────────────────────────────

// Delay between each card's entrance animation (seconds)
const CARD_STAGGER = 0.06;

// Starting delay for the list — gives the header time to settle
const LIST_DELAY = 0.3;

// ── page ──────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const coupons = getCoupons();

  return (
    <main
      className="relative min-h-screen px-4 pb-10 pt-safe"
      aria-label="Wallet"
    >
      {/* ── Safe-area top spacer ─────────────────────────────────────────── */}
      <div className="h-14" aria-hidden="true" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        className="mb-8 px-1"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          ❤️ Little Coupons
        </h1>
        <p className="mt-2 text-sm text-zinc-400/70 font-medium tracking-wide">
          A collection of cards waiting for u get redeemed.
        </p>
      </motion.header>

      {/* ── Coupon List ──────────────────────────────────────────────────── */}
      <section
        className="flex flex-col gap-3"
        aria-label="Coupon list"
      >
        {coupons.map((coupon, index) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            delay={LIST_DELAY + index * CARD_STAGGER}
          />
        ))}
      </section>
    </main>
  );
}
