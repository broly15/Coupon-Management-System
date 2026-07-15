// types/coupon.ts
// Central type definition for the Wallet feature.
// Designed to map cleanly onto a future Firestore document.

export type CouponStatus = "available" | "redeemed" | "special";

export interface Coupon {
  /** Firestore document ID (or mock ID) */
  id: string;

  /** Display icon (emoji) */
  icon: string;

  /** Short card title */
  title: string;

  /** One-line description shown on the Wallet card */
  description: string;

  /** Full emotional description shown on the Coupon Detail page */
  longDescription?: string;

  /** Broad category for future filtering */
  category:
    | "date"
    | "food"
    | "adventure"
    | "self-care"
    | "cozy"
    | "romantic"
    | "gift"
    | "fun"
    | "power"
    | "surprise";

  /** Current redemption state */
  status: CouponStatus;

  /** ISO timestamp — kept for future Firestore ordering */
  createdAt: string;

  /** ISO timestamp — set when the coupon is redeemed (from Firestore) */
  redeemedAt?: string;
}
