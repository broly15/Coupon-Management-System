// lib/utils/qrGenerator.ts
// Handles QR generation for both PNG and SVG formats.
// Business logic is completely separated from React components.

import QRCode from "qrcode";

export interface QRGeneratorOptions {
  /** Size in pixels for PNG output. Defaults to 1024 for high resolution print. */
  width?: number;
  /** Margin around the QR code in modules. Defaults to 4. */
  margin?: number;
  /** Error correction level. Defaults to 'H' (high) to withstand print wear/tear. */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Resolves the full URL for a given coupon ID.
 * Uses NEXT_PUBLIC_APP_URL with a fallback to localhost:3000.
 */
export function getCouponUrl(id: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not defined');
  }
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/coupon/${id}`;
}

/**
 * Converts a data URL string to a Blob.
 */
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Generates a high-quality PNG Blob for the specified text.
 */
export async function generatePNG(
  text: string,
  options: QRGeneratorOptions = {}
): Promise<Blob> {
  const { width = 1024, margin = 4, errorCorrectionLevel = "H" } = options;
  
  const dataUrl = await QRCode.toDataURL(text, {
    width,
    margin,
    errorCorrectionLevel,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return dataURLtoBlob(dataUrl);
}

/**
 * Generates a scalable SVG Blob for the specified text.
 */
export async function generateSVG(
  text: string,
  options: QRGeneratorOptions = {}
): Promise<Blob> {
  const { margin = 4, errorCorrectionLevel = "H" } = options;

  const svgString = await QRCode.toString(text, {
    type: "svg",
    margin,
    errorCorrectionLevel,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return new Blob([svgString], { type: "image/svg+xml" });
}
