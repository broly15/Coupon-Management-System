"use client";

// components/wallet/ConfirmDialog.tsx
// Glassmorphism confirmation modal for coupon redemption.
// Animates in/out with framer-motion scale + fade.

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-dialog-overlay"
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-10 sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop — clicking it cancels */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={!isLoading ? onCancel : undefined}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <GlassPanel
              glow="pink"
              className="flex flex-col items-center gap-6 px-6 py-8"
            >
              {/* Decorative icon */}
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl"
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 25 }}
              >
                ❤️
              </motion.div>

              {/* Copy */}
              <div className="space-y-2 text-center">
                <h2 className="text-lg font-bold text-foreground">
                  Redeem this coupon?
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full flex-col gap-3">
                <PrimaryButton
                  id="confirm-redeem-btn"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full justify-center"
                  aria-label="Confirm coupon redemption"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Redeeming…
                    </span>
                  ) : (
                    "Redeem ❤️"
                  )}
                </PrimaryButton>

                <SecondaryButton
                  id="cancel-redeem-btn"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="w-full justify-center"
                  aria-label="Cancel redemption"
                >
                  Cancel
                </SecondaryButton>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
