"use client";

// components/admin/QRPreviewModal.tsx
// Glassmorphism premium modal displaying a large QR Code preview and actions.
// Cleanly handles Object URLs to avoid memory leaks.

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { generatePNG, generateSVG, getCouponUrl } from "@/lib/utils/qrGenerator";
import { triggerBlobDownload } from "@/lib/utils/zipExporter";
import { Copy, ExternalLink, Download, X, Check } from "lucide-react";
import type { Coupon } from "@/types/coupon";

export interface QRPreviewModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRPreviewModal: React.FC<QRPreviewModalProps> = ({
  coupon,
  isOpen,
  onClose,
}) => {
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [svgBlob, setSvgBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);

  const couponUrl = coupon ? getCouponUrl(coupon.id) : "";

  // Generate QR blobs and object URLs when coupon changes
  useEffect(() => {
    if (!coupon) return;

    let active = true;
    let localPngUrl: string | null = null;
    let localSvgUrl: string | null = null;

    async function loadQR() {
      try {
        const [png, svg] = await Promise.all([
          generatePNG(couponUrl),
          generateSVG(couponUrl),
        ]);

        if (!active) return;

        localPngUrl = URL.createObjectURL(png);
        localSvgUrl = URL.createObjectURL(svg);

        setPngBlob(png);
        setSvgBlob(svg);
        setPngUrl(localPngUrl);
        setSvgUrl(localSvgUrl);
      } catch (err) {
        console.error("Failed to generate QR Code preview:", err);
      }
    }

    loadQR();

    return () => {
      active = false;
      // Clean up object URLs to prevent memory leaks
      if (localPngUrl) URL.revokeObjectURL(localPngUrl);
      if (localSvgUrl) URL.revokeObjectURL(localSvgUrl);
      setPngUrl(null);
      setSvgUrl(null);
      setPngBlob(null);
      setSvgBlob(null);
    };
  }, [coupon, couponUrl]);

  // Copy target link helper
  const handleCopyLink = () => {
    if (!couponUrl) return;
    navigator.clipboard.writeText(couponUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download action helpers
  const handleDownloadPNG = () => {
    if (!pngBlob || !coupon) return;
    triggerBlobDownload(pngBlob, `${coupon.id}.png`);
  };

  const handleDownloadSVG = () => {
    if (!svgBlob || !coupon) return;
    triggerBlobDownload(svgBlob, `${coupon.id}.svg`);
  };

  return (
    <AnimatePresence>
      {isOpen && coupon && (
        <motion.div
          key="qr-preview-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.94, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <GlassPanel glow="pink" className="flex flex-col items-center p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5 text-zinc-400 outline-none transition-all hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              {/* Title Header */}
              <div className="mb-6 text-center">
                <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
                  {coupon.icon}
                </span>
                <h2 className="text-xl font-bold text-white leading-tight">
                  QR Code Preview
                </h2>
                <p className="mt-1 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                  {coupon.title}
                </p>
              </div>

              {/* QR Preview Area */}
              <div className="relative mb-6 flex h-52 w-52 items-center justify-center rounded-card bg-white p-4 shadow-[0_0_30px_rgba(255,255,255,0.06)]">
                {pngUrl ? (
                  // Renders using the SVG object URL for crisp vector visual rendering inside the modal
                  <img
                    src={svgUrl || pngUrl}
                    alt={`QR Code redirecting to ${coupon.title}`}
                    className="h-full w-full select-none"
                  />
                ) : (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                )}
              </div>

              {/* Target Link Display */}
              <div className="mb-6 w-full rounded-button border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-center">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                  Destination URL
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-zinc-300">
                  {couponUrl}
                </p>
              </div>

              {/* Action Grid */}
              <div className="flex w-full flex-col gap-3">
                {/* Downloads Row */}
                <div className="grid grid-cols-2 gap-3">
                  <PrimaryButton
                    onClick={handleDownloadPNG}
                    disabled={!pngBlob}
                    className="justify-center text-xs font-bold py-2.5"
                    aria-label="Download PNG format"
                  >
                    <Download size={14} className="mr-1.5" />
                    Download PNG
                  </PrimaryButton>
                  <PrimaryButton
                    onClick={handleDownloadSVG}
                    disabled={!svgBlob}
                    className="justify-center text-xs font-bold py-2.5"
                    aria-label="Download SVG format"
                  >
                    <Download size={14} className="mr-1.5" />
                    Download SVG
                  </PrimaryButton>
                </div>

                <div className="h-px bg-white/[0.06] my-1" />

                {/* Utility Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Test Link Button */}
                  <a
                    href={couponUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-button border border-white/[0.08] bg-transparent py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <ExternalLink size={14} />
                    Test Link
                  </a>

                  {/* Copy Link Button */}
                  <SecondaryButton
                    onClick={handleCopyLink}
                    className={`justify-center text-xs py-2.5 ${
                      copied ? "border-green-500/20 bg-green-950/20 text-green-400" : ""
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="mr-1.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="mr-1.5" />
                        Copy Link
                      </>
                    )}
                  </SecondaryButton>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
