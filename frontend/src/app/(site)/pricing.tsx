import { Check } from "lucide-react";
import type React from "react";

export default function PricingSection() {
  return (
    <div
      id="pricing"
      className="min-h-screen bg-white py-24 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-purple-700 font-bold mb-4 uppercase tracking-wider text-sm">Pricing</p>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-purple-700 flex items-center justify-center gap-2 text-xl font-bold">
            <span className="inline-block">🎉</span>
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-2xl bg-white p-8 border-2 border-gray-300 hover:border-purple-400 hover:shadow-xl transition-all">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-600 font-semibold text-lg">/ month</span>
              </div>
              <p className="text-gray-600 text-base font-medium">
                Perfect for solo founders testing the waters
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <Feature>1 SaaS project</Feature>
              <Feature>3 connected channels</Feature>
              <Feature>Basic analytics</Feature>
              <Feature>7-day data history</Feature>
              <Feature>Daily sync updates</Feature>
            </div>

            <a
              href="/auth/register"
              className="w-full block text-center bg-gray-200 hover:bg-gray-300 transition-all text-gray-900 font-bold py-4 px-4 rounded-xl text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </a>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 p-8 relative shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
            <div className="absolute -top-4 right-8 bg-yellow-400 text-gray-900 text-sm font-extrabold px-5 py-2 rounded-full shadow-lg">
              POPULAR
            </div>

            <div className="mb-6">
              <h3 className="text-3xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-extrabold text-white">$29</span>
                <span className="text-purple-200 font-semibold text-lg">/ month</span>
              </div>
              <p className="text-purple-100 text-base font-medium">
                For growing teams managing multiple products
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <FeatureWhite>Unlimited projects</FeatureWhite>
              <FeatureWhite>Unlimited channels</FeatureWhite>
              <FeatureWhite>Advanced analytics & insights</FeatureWhite>
              <FeatureWhite>90-day data history</FeatureWhite>
              <FeatureWhite>Hourly sync updates</FeatureWhite>
              <FeatureWhite>Post performance comparisons</FeatureWhite>
              <FeatureWhite>Export data (CSV, PDF)</FeatureWhite>
              <FeatureWhite>Priority support</FeatureWhite>
            </div>

            <a
              href="/auth/register?plan=pro"
              className="w-full block text-center bg-white hover:bg-gray-50 transition-all text-purple-700 font-extrabold py-4 px-4 rounded-xl shadow-2xl text-lg hover:shadow-3xl"
            >
              Start Pro Trial
            </a>
            <p className="text-center text-purple-100 text-base font-semibold mt-4">
              14-day free trial, no credit card required
            </p>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Have questions about pricing?{" "}
            <a href="#faq" className="text-purple-600 hover:text-purple-700 font-semibold underline">
              Check our FAQ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5 stroke-[3]" />
      <span className="text-gray-700 font-medium text-base">{children}</span>
    </div>
  );
}

function FeatureWhite({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="w-6 h-6 text-white flex-shrink-0 mt-0.5 stroke-[3]" />
      <span className="text-white font-medium text-base">{children}</span>
    </div>
  );
}
