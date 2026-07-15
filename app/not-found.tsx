import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

// Next.js special not-found file — renders for 404 routes.
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md shadow-[0_0_40px_rgba(139,92,246,0.08)]">
        {/* Decorative number */}
        <p className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-8xl font-extrabold tracking-tight text-transparent">
          404
        </p>

        <h1 className="mb-2 text-xl font-bold text-white">
          Page not found
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          This page doesn&apos;t exist in Khushi OS yet. Head back home.
        </p>

        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-white/10"
        >
          <Home size={15} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
