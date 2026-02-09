import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import type React from "react"; // Import React
import { cn } from "@/lib/utils";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MarketiStats - Unified Marketing Analytics Dashboard",
  description:
    "Track all your marketing stats in one place. Connect TikTok, Instagram, YouTube Shorts and monitor performance across all your channels.",
  keywords: [
    "marketing analytics",
    "social media analytics",
    "tiktok analytics",
    "instagram analytics",
    "youtube analytics",
    "marketing dashboard",
    "saas analytics",
    "content marketing",
    "social media stats",
    "marketing metrics",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(bricolageGrotesque.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
