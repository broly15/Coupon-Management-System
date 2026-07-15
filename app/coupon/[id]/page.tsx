// app/coupon/[id]/page.tsx
// Dynamic route: /coupon/[id]
//
// Server component — resolves the coupon ID, validates it exists,
// generates per-coupon metadata, and delegates all UI to CouponDetailClient.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCouponById } from "@/lib/services/couponService";
import { CouponDetailClient } from "./CouponDetailClient";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const coupon = getCouponById(id);

  if (!coupon) {
    return { title: "Coupon Not Found" };
  }

  return {
    title: coupon.title,
    description: coupon.longDescription ?? coupon.description,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CouponPage({ params }: PageProps) {
  const { id } = await params;
  const coupon = getCouponById(id);

  if (!coupon) {
    notFound();
  }

  return <CouponDetailClient id={id} />;
}
