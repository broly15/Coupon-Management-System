// app/coupon/[id]/page.tsx
// Server component — resolves the coupon ID, generates metadata, and
// delegates all interactive logic to CouponDetailClient.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/services/couponService";
import { CouponDetailClient } from "@/app/coupon/[id]/CouponDetailClient";

// ── Types ──────────────────────────────────────────────────────────────────────

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