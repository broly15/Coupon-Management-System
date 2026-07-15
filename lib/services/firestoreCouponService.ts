// lib/services/firestoreCouponService.ts
// Firestore service for coupon redemption state.
//
// Architecture:
//   - Display data (icon, title, descriptions) lives in couponService.ts (static)
//   - Mutable state (status, redeemedAt) lives in Firestore: coupons/{id}
//   - If no Firestore document exists, the coupon is in its static state
//   - Fallback: If Firebase is not configured, we gracefully use localStorage
//     so the application remains fully functional offline/locally.

import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { CouponStatus } from "@/types/coupon";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CouponFirestoreState {
  status: CouponStatus;
  /** ISO string derived from Firestore Timestamp */
  redeemedAt?: string;
}

// ── Local Storage Fallback Implementation ──────────────────────────────────────

const LOCAL_STORAGE_KEY = "khushi-os-coupons-state";

interface LocalStateMap {
  [id: string]: {
    status: CouponStatus;
    redeemedAt?: string;
  };
}

const localListeners = new Set<(id: string) => void>();

function getLocalState(id: string): CouponFirestoreState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalStateMap;
    return parsed[id] || null;
  } catch (e) {
    console.error("Failed to read local coupon state", e);
    return null;
  }
}

function setLocalState(id: string, status: CouponStatus, redeemedAt?: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as LocalStateMap) : {};
    parsed[id] = { status, redeemedAt };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    
    // Notify all active listeners
    localListeners.forEach((listener) => listener(id));
  } catch (e) {
    console.error("Failed to write local coupon state", e);
  }
}

// ── Subscription ──────────────────────────────────────────────────────────────

/**
 * Subscribes to live Firestore state for a coupon.
 * Falls back to localStorage if Firebase is not configured or fails to connect.
 *
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function subscribeToCouponStatus(
  id: string,
  callback: (state: CouponFirestoreState | null) => void
): () => void {
  // If Firebase is not configured, use local storage subscription
  if (!isFirebaseConfigured) {
    const handleUpdate = (updatedId: string) => {
      if (updatedId === id) {
        callback(getLocalState(id));
      }
    };
    
    // Push initial local state
    callback(getLocalState(id));
    
    localListeners.add(handleUpdate);
    return () => {
      localListeners.delete(handleUpdate);
    };
  }

  const ref = doc(db, "coupons", id);

  // Subscribe to real Firestore, fallback to local on error
  try {
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          callback(null);
          return;
        }

        const data = snap.data();
        callback({
          status: data.status as CouponStatus,
          redeemedAt:
            data.redeemedAt instanceof Timestamp
              ? data.redeemedAt.toDate().toISOString()
              : undefined,
        });
      },
      (error) => {
        console.warn("Firestore subscription failed, falling back to localStorage:", error);
        // On error, fall back to local storage
        callback(getLocalState(id));
      }
    );
    return unsub;
  } catch (e) {
    console.warn("Failed to set up Firestore snapshot listener, using localStorage fallback:", e);
    callback(getLocalState(id));
    return () => {};
  }
}

// ── Redemption ────────────────────────────────────────────────────────────────

/**
 * Redeems a coupon by writing to Firestore.
 * Falls back to localStorage if Firebase is not configured.
 */
export async function redeemCoupon(id: string): Promise<void> {
  const redeemedAtStr = new Date().toISOString();

  if (!isFirebaseConfigured) {
    setLocalState(id, "redeemed", redeemedAtStr);
    return;
  }

  try {
    const ref = doc(db, "coupons", id);
    await setDoc(
      ref,
      {
        status: "redeemed",
        redeemedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("Firestore setDoc failed, falling back to localStorage redemption:", e);
    setLocalState(id, "redeemed", redeemedAtStr);
  }
}

