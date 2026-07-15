// lib/utils/zipExporter.ts
// Utility to compile generated PNGs, SVGs, CSV link mapping, and a README into a ZIP file.
// Runs completely offline on the client side.

import JSZip from "jszip";
import { generatePNG, generateSVG, getCouponUrl } from "./qrGenerator";
import type { Coupon } from "@/types/coupon";

/**
 * Creates the complete Print Pack ZIP file containing:
 * - png/ directory with high-res PNG QR codes
 * - svg/ directory with vector SVG QR codes
 * - links.csv containing IDs, titles, and full redirect URLs
 * - README.txt with file structure details and instructions
 */
export async function exportPrintPackZip(coupons: Coupon[]): Promise<Blob> {
  const zip = new JSZip();

  // Create folder directories in zip
  const pngFolder = zip.folder("png")!;
  const svgFolder = zip.folder("svg")!;

  // Build links.csv content
  let csvContent = "Coupon ID,Title,URL\r\n";

  // Generate QR codes for all coupons
  for (const coupon of coupons) {
    const url = getCouponUrl(coupon.id);

    // Escape CSV values containing double quotes
    const cleanTitle = coupon.title.replace(/"/g, '""');
    csvContent += `"${coupon.id}","${cleanTitle}","${url}"\r\n`;

    // Generate both high-res PNG and vector SVG blobs
    const [pngBlob, svgBlob] = await Promise.all([
      generatePNG(url),
      generateSVG(url),
    ]);

    // Add to ZIP files
    pngFolder.file(`${coupon.id}.png`, pngBlob);
    svgFolder.file(`${coupon.id}.svg`, svgBlob);
  }

  // Add CSV to root
  zip.file("links.csv", csvContent);

  // Add README.txt instructions to root
  const readmeContent = `Khushi OS — Coupon Print Pack
====================================
Generated on: ${new Date().toLocaleString("en-IN")}
Total Coupons: ${coupons.length}

This archive contains everything needed to import QR codes into Canva, Figma,
or other graphic tools to print the physical coupon book.

Folder Structure:
-----------------
/png/
  Contains high-resolution (1024x1024px) square PNG QR codes on a solid white background.
  Perfect for pixel-perfect standard printing layout grids.

/svg/
  Contains scalable vector SVG format QR codes.
  Ideal for large layouts, high-quality vector scaling, and sharp print borders.

links.csv
  A CSV list mapping each coupon's ID, title, and target redirection URL.
  Use this for reference, manual verification, or automated mail-merge workflows.

Instructions:
-------------
1. Upload the contents of the /png/ or /svg/ folder to your graphics tool (Canva, Figma).
2. Map each file to the corresponding printed coupon page.
3. Test a few printed codes with a smartphone camera before sending to final print.
`;
  zip.file("README.txt", readmeContent);

  // Compile ZIP entirely in-memory
  return await zip.generateAsync({ type: "blob" });
}

/**
 * Triggers a browser file download using a Blob and an Object URL.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
