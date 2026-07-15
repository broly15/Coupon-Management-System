"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Next.js special error boundary file.
// Must be a Client Component.
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md shadow-[0_0_40px_rgba(236,72,153,0.08)]">
        <div className="mb-6 text-5xl">💔</div>

        <h1 className="mb-2 text-xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    </div>
  );
}
