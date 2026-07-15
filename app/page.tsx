"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.4, // Delay so GlassPanel begins its scale-in first
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* 2. GlassPanel Entrance (fade-in & scale) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] as const }}
        className="w-full max-w-md"
      >
        <GlassPanel glow="pink" className="p-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* 3. Title */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl font-bold tracking-tight text-white mb-6 select-none"
            >
              Khushi OS{" "}
              <motion.span
                className="inline-block"
                animate={{
                  scale: [1, 1.12, 1.04, 1.12, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 1.8,
                  ease: [0.215, 0.61, 0.355, 1] as const,
                }}
              >
                ❤️
              </motion.span>
            </motion.h1>

            {/* 4. Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base text-zinc-400/70 font-medium tracking-wide mb-12 select-none"
            >
              Made just for Khushi.
            </motion.p>

            {/* 5. Enter Button */}
            <motion.div variants={itemVariants} className="w-full">
              <Link href="/wallet" className="w-full block">
                <PrimaryButton className="w-full py-4 text-base tracking-wide">
                  Enter
                  <ArrowRight size={18} />
                </PrimaryButton>
              </Link>
            </motion.div>
          </motion.div>
        </GlassPanel>
      </motion.div>
    </main>
  );
}