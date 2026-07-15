import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { ShellWrapper } from "@/components/common/ShellWrapper";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Khushi OS",
    template: "%s | Khushi OS",
  },
  description: "A handcrafted digital universe made especially for Khushi.",
};

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.className} min-h-screen bg-background text-foreground overflow-x-hidden`}
      >
        {/* Global animated background */}
        <AnimatedBackground />

        {/* Main application shell */}
        <ShellWrapper>
          {children}
        </ShellWrapper>
      </body>
    </html>
  );
}