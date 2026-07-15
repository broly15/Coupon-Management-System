"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BottomDock } from "@/components/common/BottomDock";
import { CouponStatusProvider } from "@/components/common/CouponStatusProvider";

// ── Dock visibility config ────────────────────────────────────────────────────
// To hide the dock on a specific page, add its exact path to DOCK_HIDDEN_EXACT.
// To hide the dock for an entire route tree, add its path prefix to
// FULLSCREEN_ROUTE_PREFIXES. This keeps the matching logic stable — only the
// config arrays need to grow for future fullscreen routes.

/** Exact paths where the dock is always hidden. */
const DOCK_HIDDEN_EXACT: readonly string[] = ["/", "/admin"];

/**
 * Path prefixes whose entire subtree hides the dock.
 * Example: "/coupon/" hides the dock on /coupon/coupon-01, /coupon/coupon-02, …
 * To add a new fullscreen section, append its prefix here — no other changes needed.
 */
const FULLSCREEN_ROUTE_PREFIXES: readonly string[] = [
  "/coupon/", // Coupon detail & redemption pages
];

function isDockHidden(pathname: string): boolean {
  if (DOCK_HIDDEN_EXACT.includes(pathname)) return true;
  return FULLSCREEN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ShellWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const showDock = !isDockHidden(pathname);

  return (
    <CouponStatusProvider>
      <div className={showDock ? "pb-28" : undefined}>{children}</div>
      {showDock && <BottomDock />}
    </CouponStatusProvider>
  );
};
