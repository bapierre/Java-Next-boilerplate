import { Check } from "lucide-react";
import type React from "react";

export default function PricingSection() {
  return (
    <div
      id="pricing"
      className="min-h-screen bg-[#0F0F0F] text-white px-4 py-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#FFBE18] font-medium mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Open Source & Free Forever
          </h2>
          <p className="text-green-500 flex items-center justify-center gap-2 text-lg">
            <span className="inline-block">🎉</span>
            MIT License - Use it for anything
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="rounded-xl bg-zinc-900 p-6 border border-green-500/50 relative">
            <div className="absolute -top-3 right-6 bg-green-500 text-black text-sm font-semibold px-3 py-1 rounded-full">
              FREE
            </div>
            <h3 className="text-xl font-semibold mb-4">Full Stack Boilerplate</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-zinc-500">USD</span>
              </div>
              <p className="text-green-500 text-sm mt-2">
                MIT Licensed, No Restrictions
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <Feature>Spring Boot 3 + Java 21 backend</Feature>
              <Feature>Next.js 16 + React 19 frontend</Feature>
              <Feature>Supabase authentication (JWT)</Feature>
              <Feature>PostgreSQL + Flyway migrations</Feature>
              <Feature>Stripe payment integration</Feature>
              <Feature>Mailgun email system</Feature>
              <Feature>Docker & Docker Compose</Feature>
              <Feature>TypeScript + Tailwind CSS v4</Feature>
              <Feature>Security best practices (CSP, CORS)</Feature>
              <Feature>Performance optimized (virtual threads)</Feature>
              <Feature>Comprehensive documentation</Feature>
              <Feature>Production-ready setup</Feature>
            </div>

            <a
              href="https://github.com/bapierre/Java-Next-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-400 transition-colors text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <span>⚡</span> Clone on GitHub
            </a>
            <p className="text-center text-zinc-500 text-sm mt-4">
              Star the repo if you find it useful!
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4 text-white">What's included?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
              <div>
                <p className="font-semibold text-white mb-2">Backend</p>
                <ul className="space-y-1">
                  <li>• Spring Boot REST API</li>
                  <li>• JWT authentication filter</li>
                  <li>• Stripe webhook handling</li>
                  <li>• Email service layer</li>
                  <li>• Database entities & repos</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Frontend</p>
                <ul className="space-y-1">
                  <li>• Auth pages (login, register)</li>
                  <li>• Dashboard with protected routes</li>
                  <li>• Checkout button component</li>
                  <li>• API client with timeout handling</li>
                  <li>• Responsive landing page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
      <span className="text-zinc-300">{children}</span>
    </div>
  );
}
