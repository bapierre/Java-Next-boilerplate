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
  title: "Java-Next Boilerplate",
  description:
    "Open-source full-stack SaaS boilerplate with Spring Boot 3, Next.js 16, Supabase Auth, Stripe payments, and production-ready features. Launch your startup fast.",
  keywords: [
    "java",
    "spring boot",
    "next.js",
    "saas",
    "boilerplate",
    "open source",
    "supabase",
    "stripe",
    "full-stack",
    "typescript",
    "react",
    "postgresql",
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
