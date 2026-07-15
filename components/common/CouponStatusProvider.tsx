"use client";

// components/common/CouponStatusProvider.tsx
// Provides a single shared Firestore collection listener for all coupon statuses.
//
// Architecture:
//   Instead of N individual onSnapshot listeners (one per CouponCard),
//   this context opens ONE collection-level listener and fans out the results.
//   This dramatically reduces WebSocket connections and ensures all components
//   see consistent, real-time state — including the admin dashboard.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  subscribeToAllCouponsStatus,
  type AllCouponsLiveState,
} from "@/lib/services/firestoreCouponService";
import type { CouponStatus } from "@/types/coupon";

// ── Context types ─────────────────────────────────────────────────────────────

interface CouponStatusContextValue {
  /** Live states keyed by coupon ID. Empty object until Firestore responds. */
  liveStates: AllCouponsLiveState;
  /** True once the first Firestore snapshot has arrived. */
  isReady: boolean;
  /** Helper: resolve the live status for a given coupon ID + fallback status. */
  getLiveStatus: (id: string, fallback: CouponStatus) => CouponStatus;
}

const CouponStatusContext = createContext<CouponStatusContextValue>({
  liveStates: {},
  isReady: false,
  getLiveStatus: (_id, fallback) => fallback,
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function CouponStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [liveStates, setLiveStates] = useState<AllCouponsLiveState>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Single collection-level listener — replaces N individual card listeners.
    const unsub = subscribeToAllCouponsStatus((states) => {
      setLiveStates(states);
      setIsReady(true);
    });
    return unsub;
  }, []);

  const value = useMemo<CouponStatusContextValue>(
    () => ({
      liveStates,
      isReady,
      getLiveStatus: (id, fallback) =>
        liveStates[id]?.status ?? fallback,
    }),
    [liveStates, isReady]
  );

  return (
    <CouponStatusContext.Provider value={value}>
      {children}
    </CouponStatusContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCouponStatus(
  id: string,
  fallback: CouponStatus
): CouponStatus {
  const { getLiveStatus } = useContext(CouponStatusContext);
  return getLiveStatus(id, fallback);
}

export function useCouponStatusContext(): CouponStatusContextValue {
  return useContext(CouponStatusContext);
}
