"use client";

// app/admin/AdminClient.tsx
// Sprint 6 — Admin Control Center client component.
// Reuses the GlassPanel and existing UI buttons.
// Streamlined dashboard with stats, search/filter controls, bulk actions,
// and a responsive coupon grid/table for individual updates.

import React, { useState, useMemo } from "react";
import {
  Search,
  Copy,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Check,
  AlertTriangle,
  QrCode,
  Download,
} from "lucide-react";
import { getCoupons } from "@/lib/services/couponService";
import {
  updateCouponStatus,
  resetAllCoupons,
  markAllAvailable,
} from "@/lib/services/firestoreCouponService";
import { useCouponStatusContext } from "@/components/common/CouponStatusProvider";
import { getCouponUrl, generatePNG, generateSVG } from "@/lib/utils/qrGenerator";
import { exportPrintPackZip, triggerBlobDownload } from "@/lib/utils/zipExporter";
import { QRPreviewModal } from "@/components/admin/QRPreviewModal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Coupon, CouponStatus } from "@/types/coupon";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRedeemedAt(isoString?: string): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminClient() {
  const staticCoupons = useMemo(() => getCoupons(), []);
  
  // Use the shared context listener — same Firestore snapshot that drives the
  // wallet cards, so the admin always reflects the latest committed state.
  const { liveStates, isReady } = useCouponStatusContext();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");

  // Confirmation dialog modal states
  const [confirmType, setConfirmType] = useState<"reset" | "all-available" | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Copied indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // QR Modal State
  const [previewCoupon, setPreviewCoupon] = useState<Coupon | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Merge static display data with live statuses
  const coupons: Coupon[] = useMemo(() => {
    return staticCoupons.map((coupon) => {
      const live = liveStates[coupon.id];
      return {
        ...coupon,
        status: (live?.status ?? coupon.status) as CouponStatus,
        redeemedAt: live?.redeemedAt,
      };
    });
  }, [staticCoupons, liveStates]);

  // Compute metrics/counters
  const stats = useMemo(() => {
    const total = coupons.length;
    let available = 0;
    let redeemed = 0;
    let special = 0;

    coupons.forEach((c) => {
      if (c.status === "available") available++;
      else if (c.status === "redeemed") redeemed++;
      else if (c.status === "special") special++;
    });

    return { total, available, redeemed, special };
  }, [coupons]);

  // Filter & Search coupon list
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchQuery, statusFilter]);

  // Copy Configured URL to Clipboard
  const handleCopyLink = (id: string) => {
    const absoluteLink = getCouponUrl(id);
    navigator.clipboard.writeText(absoluteLink).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // Preview QR Modal
  const handlePreviewQR = (coupon: Coupon) => {
    setPreviewCoupon(coupon);
    setIsPreviewOpen(true);
  };

  // Direct PNG download
  const handleDownloadPNG = async (coupon: Coupon) => {
    try {
      const targetUrl = getCouponUrl(coupon.id);
      const blob = await generatePNG(targetUrl);
      triggerBlobDownload(blob, `${coupon.id}.png`);
    } catch (err) {
      console.error("Failed to download PNG:", err);
    }
  };

  // Direct SVG download
  const handleDownloadSVG = async (coupon: Coupon) => {
    try {
      const targetUrl = getCouponUrl(coupon.id);
      const blob = await generateSVG(targetUrl);
      triggerBlobDownload(blob, `${coupon.id}.svg`);
    } catch (err) {
      console.error("Failed to download SVG:", err);
    }
  };

  // Compile and download bulk print pack ZIP
  const handleDownloadPrintPack = async () => {
    setIsZipping(true);
    try {
      const zipBlob = await exportPrintPackZip(staticCoupons);
      triggerBlobDownload(zipBlob, "khushi-os-printpack.zip");
    } catch (err) {
      console.error("Failed to generate bulk ZIP Print Pack:", err);
    } finally {
      setIsZipping(false);
    }
  };

  // Mutate single status
  const handleStatusChange = async (id: string, newStatus: CouponStatus) => {
    try {
      await updateCouponStatus(id, newStatus);
    } catch (err) {
      console.error(`Failed to update status for ${id}:`, err);
    }
  };

  // Execute bulk operations
  const handleBulkAction = async () => {
    if (!confirmType) return;
    setIsBulkProcessing(true);
    try {
      if (confirmType === "reset") {
        await resetAllCoupons(staticCoupons);
      } else if (confirmType === "all-available") {
        await markAllAvailable(staticCoupons);
      }
      setConfirmType(null);
    } catch (err) {
      console.error("Bulk action failed:", err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-safe text-foreground">
      {/* Spacer top */}
      <div className="h-10" aria-hidden="true" />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          🛠️ Admin Control Center
        </h1>
        <p className="mt-2 text-sm text-zinc-400 font-medium">
          Manage system states, copy layout links, and trigger system-wide bulk resets.
        </p>
      </header>

      {/* Stats Dashboard Summary */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Dashboard Stats">
        {[
          { label: "Total Coupons", value: stats.total, color: "text-white" },
          { label: "Available", value: stats.available, color: "text-green-400" },
          { label: "Redeemed", value: stats.redeemed, color: "text-zinc-400" },
          { label: "Special", value: stats.special, color: "text-primary" },
        ].map((stat, idx) => (
          <GlassPanel key={idx} className="flex flex-col items-start gap-1 px-5 py-4">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </span>
            {isReady ? (
              <span className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                {stat.value}
              </span>
            ) : (
              <span className="h-8 w-12 animate-pulse rounded bg-white/5" />
            )}
          </GlassPanel>
        ))}
      </section>

      {/* Search, Filter & Bulk Actions Controls */}
      <section className="mb-6 flex flex-col gap-4">
        {/* Bulk action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <SecondaryButton
            id="bulk-reset-btn"
            onClick={() => setConfirmType("reset")}
            className="flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 border-red-500/20 hover:bg-red-950/20"
            disabled={!isReady}
          >
            <RotateCcw size={14} />
            Reset All to Default
          </SecondaryButton>
          <SecondaryButton
            id="bulk-available-btn"
            onClick={() => setConfirmType("all-available")}
            className="flex items-center gap-2 px-4 py-2.5 text-xs text-green-400 border-green-500/20 hover:bg-green-950/20"
            disabled={!isReady}
          >
            <CheckCircle size={14} />
            Mark All Available
          </SecondaryButton>
          <PrimaryButton
            id="bulk-printpack-btn"
            onClick={handleDownloadPrintPack}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-violet-600 shadow-pink-500/10 text-white cursor-pointer"
            disabled={!isReady || isZipping}
          >
            {isZipping ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                Zipping Pack…
              </>
            ) : (
              <>
                <Download size={14} />
                Download Print Pack (ZIP)
              </>
            )}
          </PrimaryButton>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Filter controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-button border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder-zinc-500 outline-none transition-all focus:border-primary/40 focus:bg-white/[0.06]"
              aria-label="Search coupons"
            />
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Status filters">
            {(["all", "available", "redeemed", "special"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-black font-bold shadow-sm"
                    : "border border-white/[0.08] bg-transparent text-zinc-400 hover:text-foreground hover:bg-white/5"
                }`}
                role="tab"
                aria-selected={statusFilter === status}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Coupon List/Table */}
      <section className="space-y-3" aria-label="Coupon list">
        {!isReady ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-xs text-zinc-500">Connecting to Firestore...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-card">
            <p className="text-sm text-zinc-500">No coupons match your filter or search criteria.</p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <GlassPanel
              key={coupon.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left Column: Icon & Basic Info */}
              <div className="flex items-center gap-4 min-w-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
                  {coupon.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white leading-tight truncate">
                      {coupon.title}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded uppercase">
                      {coupon.category}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Redeemed: {formatRedeemedAt(coupon.redeemedAt)}
                  </p>
                </div>
              </div>

              {/* Status Badge column */}
              <div className="flex items-center gap-2 sm:justify-center">
                <StatusBadge
                  label={coupon.status}
                  status={
                    coupon.status === "available"
                      ? "active"
                      : coupon.status === "redeemed"
                      ? "inactive"
                      : "special"
                  }
                  className="py-1"
                />
              </div>

              {/* Actions Button Columns */}
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {/* View coupon detail */}
                <a
                  href={`/coupon/${coupon.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-button border border-white/[0.08] bg-transparent px-3 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
                  title="View coupon in new tab"
                >
                  <ExternalLink size={12} />
                  View
                </a>

                {/* Copy link to clipboard */}
                <button
                  onClick={() => handleCopyLink(coupon.id)}
                  className={`inline-flex items-center gap-1.5 rounded-button border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    copiedId === coupon.id
                      ? "border-green-500/20 bg-green-950/20 text-green-400"
                      : "border-white/[0.08] bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                  title="Copy direct coupon link"
                >
                  {copiedId === coupon.id ? <Check size={12} /> : <Copy size={12} />}
                  {copiedId === coupon.id ? "Copied" : "Copy Link"}
                </button>

                {/* Preview QR */}
                <button
                  onClick={() => handlePreviewQR(coupon)}
                  className="inline-flex items-center gap-1.5 rounded-button border border-white/[0.08] bg-transparent px-3 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-white/5 hover:text-white cursor-pointer"
                  title="Preview QR Code"
                >
                  <QrCode size={12} />
                  Preview QR
                </button>

                {/* Download PNG */}
                <button
                  onClick={() => handleDownloadPNG(coupon)}
                  className="inline-flex items-center gap-1.5 rounded-button border border-white/[0.08] bg-transparent px-3 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-white/5 hover:text-white cursor-pointer"
                  title="Download PNG format QR"
                >
                  <Download size={12} />
                  PNG
                </button>

                {/* Download SVG */}
                <button
                  onClick={() => handleDownloadSVG(coupon)}
                  className="inline-flex items-center gap-1.5 rounded-button border border-white/[0.08] bg-transparent px-3 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-white/5 hover:text-white cursor-pointer"
                  title="Download SVG format QR"
                >
                  <Download size={12} />
                  SVG
                </button>

                {/* Status operations */}
                {coupon.status === "redeemed" ? (
                  <button
                    onClick={() => handleStatusChange(coupon.id, "available")}
                    className="inline-flex items-center gap-1.5 rounded-button border border-zinc-500/20 bg-zinc-500/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/5 cursor-pointer"
                  >
                    Reset to Available
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(coupon.id, "redeemed")}
                    className="inline-flex items-center gap-1.5 rounded-button border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/10 cursor-pointer"
                  >
                    Mark Redeemed
                  </button>
                )}
              </div>
            </GlassPanel>
          ))
        )}
      </section>

      {/* Confirmation Dialog Overlay */}
      {confirmType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isBulkProcessing && setConfirmType(null)}
          />
          <div className="relative z-10 w-full max-w-sm">
            <GlassPanel glow="pink" className="flex flex-col items-center gap-6 px-6 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-3xl">
                <AlertTriangle size={28} />
              </div>
              <div className="space-y-2 text-center">
                <h2 className="text-lg font-bold text-white">Confirm Bulk Action</h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {confirmType === "reset"
                    ? "Are you sure you want to reset all coupons back to their static default statuses? This will remove all redemption records."
                    : "Are you sure you want to mark all coupons as Available? This will wipe out all redeemed timestamps."}
                </p>
              </div>
              <div className="flex w-full flex-col gap-3">
                <PrimaryButton
                  onClick={handleBulkAction}
                  disabled={isBulkProcessing}
                  className="w-full justify-center text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/20"
                >
                  {isBulkProcessing ? "Processing..." : "Confirm Action"}
                </PrimaryButton>
                <SecondaryButton
                  onClick={() => setConfirmType(null)}
                  disabled={isBulkProcessing}
                  className="w-full justify-center text-sm font-bold"
                >
                  Cancel
                </SecondaryButton>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}
      {/* QR Code Preview Modal */}
      <QRPreviewModal
        coupon={previewCoupon}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </main>
  );
}
