// lib/services/firestoreCouponService.ts
// Coupon redemption state service — hybrid localStorage + Firestore.
//
// Architecture:
//   Primary store : localStorage  (instant, cross-tab via storage events, zero config)
//   Optional sync : Firestore      (real-time across devices when credentials are set)
//
// When Firebase credentials are NOT configured (no .env.local):
//   - All state is persisted to localStorage
//   - Changes broadcast across open tabs via the storage event
//   - Everything works without a backend
//
// When Firebase credentials ARE configured:
//   - Firestore is used as the source of truth
//   - localStorage acts as an instant-read cache layer
//
// The public API surface (subscribeToCouponStatus, redeemCoupon, etc.) is
// identical in both modes so no calling code needs to change.

import type { CouponStatus, Coupon } from "@/types/coupon";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CouponFirestoreState {
  status: CouponStatus;
  /** ISO string derived from Firestore Timestamp or Date.now() */
  redeemedAt?: string;
}

export interface AllCouponsLiveState {
  [id: string]: CouponFirestoreState;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "cms_coupon_states";

function readLocalStates(): AllCouponsLiveState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AllCouponsLiveState) : {};
  } catch {
    return {};
  }
}

function writeLocalStates(states: AllCouponsLiveState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(states));
    // Dispatch a custom event so same-tab listeners update immediately
    // (storage event only fires in OTHER tabs, not the current one)
    window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY }));
  } catch {
    // Storage quota exceeded — silently skip
  }
}

function patchLocalState(id: string, patch: CouponFirestoreState): void {
  const states = readLocalStates();
  states[id] = patch;
  writeLocalStates(states);
}

// ── Subscriber registry (same-tab fan-out) ────────────────────────────────────
// When the storage event fires we update all active listeners so both
// the wallet cards and the admin dashboard update in the same render cycle.

type AllStatesCallback = (states: AllCouponsLiveState) => void;
type SingleCallback = (state: CouponFirestoreState | null) => void;

const allListeners = new Set<AllStatesCallback>();
const singleListeners = new Map<string, Set<SingleCallback>>();

function notifyAll(): void {
  const states = readLocalStates();
  allListeners.forEach((cb) => cb(states));
  singleListeners.forEach((cbs, id) => {
    const state = states[id] ?? null;
    cbs.forEach((cb) => cb(state));
  });
}

// ── Firestore (optional, lazy) ────────────────────────────────────────────────

let firestoreSetup = false;
let isFirebaseReady = false;

async function maybeSetupFirestore(): Promise<void> {
  if (firestoreSetup) return;
  firestoreSetup = true;

  try {
    // firebase.ts now always has real credentials baked in as fallbacks,
    // so we can import db directly without checking env vars.
    console.info("[CMS] Connecting to Firestore (khushi-os)…");

    // Dynamically import so the SDK is only loaded when actually needed
    const [
      { collection, onSnapshot, doc, setDoc, serverTimestamp, Timestamp, deleteField, writeBatch },
      { db },
    ] = await Promise.all([
      import("firebase/firestore"),
      import("@/lib/firebase"),
    ]);

    isFirebaseReady = true;

    // Mirror Firestore collection into localStorage and notify all listeners
    const ref = collection(db, "coupons");
    onSnapshot(ref, (snap) => {
      const states: AllCouponsLiveState = readLocalStates();
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        states[docSnap.id] = {
          status: data.status as CouponStatus,
          redeemedAt:
            data.redeemedAt instanceof Timestamp
              ? data.redeemedAt.toDate().toISOString()
              : undefined,
        };
      });
      writeLocalStates(states);
      notifyAll();
    });

  } catch (err) {
    console.warn("[CMS] Firestore setup failed, staying in localStorage mode:", err);
  }
}

// ── Global storage event bridge ───────────────────────────────────────────────
// Set up once on the client to propagate changes across tabs AND within this tab.

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === LS_KEY || e.key === null) {
      notifyAll();
    }
  });
  // Kick off Firestore setup (non-blocking)
  maybeSetupFirestore().catch(console.warn);
}

// ── Subscription (Single Coupon) ──────────────────────────────────────────────

/**
 * Subscribes to live state for a single coupon.
 * Fires immediately with the current localStorage value, then on every change.
 * Returns an unsubscribe function.
 */
export function subscribeToCouponStatus(
  id: string,
  callback: (state: CouponFirestoreState | null) => void
): () => void {
  // Immediate call with current state
  const current = readLocalStates();
  callback(current[id] ?? null);

  // Register listener for future changes
  if (!singleListeners.has(id)) {
    singleListeners.set(id, new Set());
  }
  singleListeners.get(id)!.add(callback);

  return () => {
    singleListeners.get(id)?.delete(callback);
  };
}

// ── Subscription (All Coupons) ────────────────────────────────────────────────

/**
 * Subscribes to live state for all coupons.
 * Fires immediately with current localStorage values, then on every change.
 * Returns an unsubscribe function.
 */
export function subscribeToAllCouponsStatus(
  callback: (states: AllCouponsLiveState) => void
): () => void {
  // Immediate call with current state
  callback(readLocalStates());

  allListeners.add(callback);

  return () => {
    allListeners.delete(callback);
  };
}

// ── Mutation Actions ──────────────────────────────────────────────────────────

/**
 * Redeems a coupon. Updates localStorage immediately (cross-tab via storage event),
 * and syncs to Firestore in the background when credentials are configured.
 */
export async function redeemCoupon(id: string): Promise<void> {
  const redeemedAt = new Date().toISOString();
  patchLocalState(id, { status: "redeemed", redeemedAt });

  if (isFirebaseReady) {
    try {
      const [{ doc, setDoc, serverTimestamp }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase"),
      ]);
      const ref = doc(db, "coupons", id);
      await setDoc(ref, { status: "redeemed", redeemedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn("[CMS] Firestore sync failed for redeemCoupon:", err);
    }
  }
}

/**
 * Updates a coupon to a specific status. Updates localStorage immediately.
 */
export async function updateCouponStatus(
  id: string,
  status: CouponStatus
): Promise<void> {
  const patch: CouponFirestoreState =
    status === "redeemed"
      ? { status, redeemedAt: new Date().toISOString() }
      : { status };
  patchLocalState(id, patch);

  if (isFirebaseReady) {
    try {
      const [{ doc, setDoc, serverTimestamp, deleteField }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase"),
      ]);
      const ref = doc(db, "coupons", id);
      await setDoc(
        ref,
        {
          status,
          redeemedAt: status === "redeemed" ? serverTimestamp() : deleteField(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("[CMS] Firestore sync failed for updateCouponStatus:", err);
    }
  }
}

/**
 * Resets all coupons to their default static statuses.
 */
export async function resetAllCoupons(coupons: Coupon[]): Promise<void> {
  const states = readLocalStates();
  coupons.forEach((coupon) => {
    states[coupon.id] = { status: coupon.status };
  });
  writeLocalStates(states);

  if (isFirebaseReady) {
    try {
      const [{ doc, writeBatch, deleteField }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase"),
      ]);
      const batch = writeBatch(db);
      coupons.forEach((coupon) => {
        const ref = doc(db, "coupons", coupon.id);
        batch.set(ref, { status: coupon.status, redeemedAt: deleteField() }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn("[CMS] Firestore sync failed for resetAllCoupons:", err);
    }
  }
}

/**
 * Marks all coupons as available.
 */
export async function markAllAvailable(coupons: Coupon[]): Promise<void> {
  const states = readLocalStates();
  coupons.forEach((coupon) => {
    states[coupon.id] = { status: "available" };
  });
  writeLocalStates(states);

  if (isFirebaseReady) {
    try {
      const [{ doc, writeBatch, deleteField }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("@/lib/firebase"),
      ]);
      const batch = writeBatch(db);
      coupons.forEach((coupon) => {
        const ref = doc(db, "coupons", coupon.id);
        batch.set(ref, { status: "available", redeemedAt: deleteField() }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn("[CMS] Firestore sync failed for markAllAvailable:", err);
    }
  }
}
