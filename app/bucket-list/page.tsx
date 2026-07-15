"use client";

// app/bucket-list/page.tsx
// Module placeholder for Sprint 9 — Bucket List.
// Fully designed, accessible from navigation, no backend required.

import React from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function BucketListPage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-32"
      aria-label="Bucket List"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as const }}
        className="w-full max-w-md"
      >
        <GlassPanel glow="purple" className="p-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Icon */}
            <motion.div
              variants={itemVariants}
              className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.06] text-4xl"
              aria-hidden="true"
            >
              🗺️
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Bucket List
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm text-zinc-400/70 leading-relaxed max-w-xs"
            >
              All the things we will do, the places we will go, the dreams we
              will chase.
            </motion.p>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="my-2 h-px w-16 bg-white/[0.08]"
              aria-hidden="true"
            />

            {/* Coming Soon */}
            <motion.p
              variants={itemVariants}
              className="text-xs font-semibold tracking-[0.2em] text-secondary/60 uppercase"
            >
              Coming Soon
            </motion.p>
          </motion.div>
        </GlassPanel>
      </motion.div>
    </main>
  );
}
