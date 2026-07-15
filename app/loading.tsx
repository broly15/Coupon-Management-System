import React from "react";

// Next.js special loading file — renders while route segments are loading.
// Kept as server-safe (no "use client") — framer-motion works in RSC context here
// because this module only uses animation props that are serialisable.
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing glow ring */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute h-20 w-20 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.15)]">
            ❤️
          </div>
        </div>

        {/* Label */}
        <p className="text-sm font-medium tracking-widest text-muted uppercase animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
