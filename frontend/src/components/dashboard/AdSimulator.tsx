"use client";

import { useState } from "react";

// ── Benchmark data ─────────────────────────────────────────────────────────────
// Sources: 2025 reports covering Apr 2024 – early 2026 measurement windows
// WordStream Google 2025:  https://www.wordstream.com/blog/2025-google-ads-benchmarks
// WordStream Meta 2025:    https://www.wordstream.com/blog/facebook-ads-benchmarks-2025
// LocaliQ Meta 2025:       https://localiq.com/blog/facebook-advertising-benchmarks/
// Affect Group Meta CPM:   https://affectgroup.com/blog/meta-ads-cpm-in-the-us-2025-benchmarks-for-facebook-and-instagram/
// NAV43 LinkedIn 2025:     https://nav43.com/blog/2025-linkedin-ads-benchmarks-every-saas-tech-marketer-needs/
// Speedwork LinkedIn 2026: https://speedworksocial.com/linkedin-ads-benchmarks/
// Circleboom Twitter 2025: https://circleboom.com/blog/how-much-do-twitter-ads-cost/
// WebFX Twitter 2026:      https://www.webfx.com/blog/social-media/x-twitter-marketing-benchmarks/
// Lebesgue TikTok 2025:    https://lebesgue.io/tiktok-ads/tiktok-ads-benchmarks-for-ctr-cr-and-cpm
// Quimby TikTok 2025:      https://quimbydigital.com/tiktok-ad-costs-2025-average-cpm-cpc-roi/
// Usermaven Display 2025:  https://usermaven.com/blog/google-ads-benchmarks

interface PlatformBenchmark {
  label: string;
  ctr: number;    // %
  cpc: number;    // $
  cpm: number;    // $ per 1000 impressions
  cvr: number;    // %
  cpa: number;    // $
  source: string;
  sourceUrl: string;
}

const BENCHMARKS: Record<string, PlatformBenchmark> = {
  GOOGLE: {
    // WordStream 2025 — 16,000+ campaigns, Apr 2024–Mar 2025
    label: "Google Ads (Search)",
    ctr: 6.66, cpc: 5.26, cpm: 38.00, cvr: 7.52, cpa: 70.11,
    source: "WordStream Google Ads 2025",
    sourceUrl: "https://www.wordstream.com/blog/2025-google-ads-benchmarks",
  },
  META: {
    // WordStream / LocaliQ 2025 — lead-gen campaign averages; CPM: Affect Group full-year 2025 US average
    label: "Meta / Facebook Ads",
    ctr: 2.59, cpc: 1.92, cpm: 19.81, cvr: 7.72, cpa: 27.66,
    source: "WordStream / LocaliQ Facebook Ads 2025",
    sourceUrl: "https://www.wordstream.com/blog/facebook-ads-benchmarks-2025",
  },
  LINKEDIN: {
    // NAV43 2025 (SaaS/Tech focus) + Speedwork Social 2026; CPM: US market $50 median
    label: "LinkedIn Ads",
    ctr: 0.56, cpc: 8.00, cpm: 50.00, cvr: 7.00, cpa: 100.00,
    source: "NAV43 / Speedwork Social 2025–2026",
    sourceUrl: "https://nav43.com/blog/2025-linkedin-ads-benchmarks-every-saas-tech-marketer-needs/",
  },
  TWITTER: {
    // Circleboom 2025 + WebFX 2026; CPA: Hootsuite median $21.55; CPC: website-click campaign avg
    label: "Twitter / X Ads",
    ctr: 0.86, cpc: 1.00, cpm: 5.00, cvr: 1.50, cpa: 21.55,
    source: "Circleboom / WebFX 2025–2026",
    sourceUrl: "https://circleboom.com/blog/how-much-do-twitter-ads-cost/",
  },
  TIKTOK: {
    // Lebesgue 2025 + Quimby Digital 2025; CPM: $4–$7 typical US in-feed; CPA: $5–$15 conversion campaigns
    label: "TikTok Ads",
    ctr: 0.84, cpc: 0.70, cpm: 6.00, cvr: 1.00, cpa: 10.00,
    source: "Lebesgue / Quimby Digital 2025",
    sourceUrl: "https://lebesgue.io/tiktok-ads/tiktok-ads-benchmarks-for-ctr-cr-and-cpm",
  },
  OTHER: {
    // Google Display Network — WordStream / Usermaven 2025
    label: "Display / Other",
    ctr: 0.46, cpc: 0.73, cpm: 3.00, cvr: 1.00, cpa: 75.00,
    source: "WordStream / Usermaven 2025",
    sourceUrl: "https://usermaven.com/blog/google-ads-benchmarks",
  },
};

// Industry multipliers derived from WordStream 2025 Google industry data (baseline: CTR 6.66%, CPA $70.11)
// Shopping/Gifts → eCommerce; Business Services → SaaS; Finance & Insurance; Health & Fitness → Healthcare
const INDUSTRY_MULTIPLIERS: Record<string, { ctr: number; cpa: number; label: string }> = {
  ECOMMERCE:  { ctr: 1.34, cpa: 0.68, label: "eCommerce / Retail" },   // CTR 8.92% / CPA $47.94
  SAAS:       { ctr: 0.85, cpa: 1.48, label: "SaaS / Technology" },    // CTR 5.65% / CPA $103.54
  B2B:        { ctr: 0.85, cpa: 1.60, label: "B2B / Enterprise" },     // Business Services + B2B premium
  FINANCE:    { ctr: 1.25, cpa: 1.20, label: "Finance / Insurance" },  // CTR 8.33% / CPA $83.93
  EDUCATION:  { ctr: 0.86, cpa: 1.28, label: "Education" },            // CTR 5.74% / CPA $90.02
  HEALTHCARE: { ctr: 1.08, cpa: 0.90, label: "Healthcare" },           // CTR 7.18% / CPA $62.80
  OTHER:      { ctr: 1.00, cpa: 1.00, label: "General / Other" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtN  = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d });
const fmtUSD = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n: number) => `${n.toFixed(2)}%`;

interface SimResult {
  totalBudget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  cpa: number;
  ctr: number;
  cvr: number;
  cpm: number;
}

function simulate(platform: string, industry: string, dailyBudget: number, days: number): SimResult {
  const b = BENCHMARKS[platform] ?? BENCHMARKS.OTHER;
  const m = INDUSTRY_MULTIPLIERS[industry] ?? INDUSTRY_MULTIPLIERS.OTHER;

  const adjCtr = b.ctr * m.ctr;
  const adjCpa = b.cpa * m.cpa;
  const totalBudget = dailyBudget * days;

  // Impressions from CPM
  const impressions = (totalBudget / b.cpm) * 1000;
  const clicks      = impressions * (adjCtr / 100);
  const conversions = clicks * (b.cvr / 100);
  const cpc         = clicks > 0 ? totalBudget / clicks : 0;
  const cpa         = conversions > 0 ? totalBudget / conversions : adjCpa;
  const ctr         = impressions > 0 ? (clicks / impressions) * 100 : adjCtr;
  const cvr         = clicks > 0 ? (conversions / clicks) * 100 : b.cvr;
  const cpm         = impressions > 0 ? (totalBudget / impressions) * 1000 : b.cpm;

  return { totalBudget, impressions, clicks, conversions, cpc, cpa, ctr, cvr, cpm };
}

// ── Performance bar ────────────────────────────────────────────────────────────

function PerfBar({ actual, benchmark, higherIsBetter = true, label, fmtVal }: {
  actual: number;
  benchmark: number;
  higherIsBetter?: boolean;
  label: string;
  fmtVal: (n: number) => string;
}) {
  const ratio = benchmark > 0 ? actual / benchmark : 1;
  const isBetter = higherIsBetter ? ratio >= 1 : ratio <= 1;
  const isWarning = higherIsBetter ? ratio >= 0.7 && ratio < 1 : ratio > 1 && ratio <= 1.3;
  const color = isBetter ? "bg-green-500" : isWarning ? "bg-amber-400" : "bg-red-400";
  const pct = Math.min(Math.max(ratio * 100, 5), 200);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">{label}</span>
        <span className={`font-semibold ${isBetter ? "text-green-700" : isWarning ? "text-amber-700" : "text-red-600"}`}>
          {fmtVal(actual)} <span className="font-normal text-gray-400">vs {fmtVal(benchmark)}</span>
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
        <div className="h-full bg-gray-300 rounded-full" style={{ width: "100%" }} />
        <div className={`h-full ${color} rounded-full absolute top-0 left-0 transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
        {/* Benchmark tick */}
        <div className="absolute top-0 h-full border-l-2 border-gray-500 opacity-60" style={{ left: "50%" }} />
      </div>
      <p className="text-[10px] text-gray-400">{isBetter ? "✓ Beating benchmark" : isWarning ? "⚠ Near benchmark" : "↓ Below benchmark"}</p>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, highlight = false }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-violet-50 border border-violet-100" : "bg-gray-50"}`}>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-violet-800" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface AdSimulatorProps {
  actualStats?: {
    totalSpendCents: number;
    totalClicks: number;
    totalImpressions: number;
    totalConversions: number;
    cpc: number;
    cpa: number;
    ctr: number;
  } | null;
  actualCampaignName?: string;
}

export default function AdSimulator({ actualStats, actualCampaignName }: AdSimulatorProps) {
  const [platform, setPlatform]   = useState("META");
  const [industry, setIndustry]   = useState("ECOMMERCE");
  const [dailyBudget, setDaily]   = useState(50);
  const [days, setDays]           = useState(30);
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  const result = simulate(platform, industry, dailyBudget, days);
  const benchmark = BENCHMARKS[platform] ?? BENCHMARKS.OTHER;

  const hasActual = actualStats != null && actualStats.totalSpendCents > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Ad Campaign Simulator</h3>
        <p className="text-sm text-gray-400">
          Model a campaign using industry benchmarks to set realistic expectations before spending.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign Parameters</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              {Object.entries(BENCHMARKS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              {Object.entries(INDUSTRY_MULTIPLIERS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Daily budget ($)</label>
            <input type="number" min="1" step="5" value={dailyBudget}
              onChange={(e) => setDaily(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Duration (days)</label>
            <input type="number" min="1" max="365" step="1" value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
      </div>

      {/* Projected results */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Projected Results — {benchmark.label}{INDUSTRY_MULTIPLIERS[industry]?.label !== "General / Other" ? ` · ${INDUSTRY_MULTIPLIERS[industry]?.label}` : ""}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Spend"   value={fmtUSD(result.totalBudget)} sub={`$${dailyBudget}/day × ${days} days`} highlight />
          <StatCard label="Impressions"   value={fmtN(Math.round(result.impressions))} sub={`CPM ${fmtUSD(benchmark.cpm)}`} />
          <StatCard label="Est. Clicks"   value={fmtN(Math.round(result.clicks))} sub={`CTR ${fmtPct(result.ctr)}`} />
          <StatCard label="Est. Conversions" value={fmtN(Math.round(result.conversions))} sub={`CVR ${fmtPct(result.cvr)}`} />
          <StatCard label="Est. CPC"      value={fmtUSD(result.cpc)} sub="Cost per click" />
          <StatCard label="Est. CPA"      value={fmtUSD(result.cpa)} sub="Cost per conversion" />
          <StatCard label="Est. CTR"      value={fmtPct(result.ctr)} sub="Click-through rate" />
          <StatCard label="Benchmark CPA" value={fmtUSD(benchmark.cpa * (INDUSTRY_MULTIPLIERS[industry]?.cpa ?? 1))} sub="Industry average" />
        </div>
      </div>

      {/* Compare with actual campaign */}
      {hasActual && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Your Campaign vs Benchmark
            {actualCampaignName && <span className="text-purple-600 ml-1">— {actualCampaignName}</span>}
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <PerfBar
              actual={actualStats!.ctr}
              benchmark={benchmark.ctr}
              higherIsBetter
              label="CTR (click-through rate)"
              fmtVal={fmtPct}
            />
            <PerfBar
              actual={actualStats!.cpc / 100}
              benchmark={benchmark.cpc}
              higherIsBetter={false}
              label="CPC (cost per click)"
              fmtVal={fmtUSD}
            />
            <PerfBar
              actual={actualStats!.cpa / 100}
              benchmark={benchmark.cpa * (INDUSTRY_MULTIPLIERS[industry]?.cpa ?? 1)}
              higherIsBetter={false}
              label="CPA (cost per acquisition)"
              fmtVal={fmtUSD}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Bar at 50% = at benchmark. Further right = beating benchmark (for CTR). Further left = beating benchmark (for CPC/CPA).
            Your CPC/CPA in cents are divided by 100 for display.
          </p>
        </div>
      )}

      {!hasActual && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Go to the <strong>Analytics</strong> tab, select a campaign, then come back here to compare your actual CPC/CPA/CTR against these benchmarks.
          </p>
        </div>
      )}

      {/* Benchmark reference table (collapsible) */}
      <div>
        <button onClick={() => setShowBenchmarks((v) => !v)}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`w-3.5 h-3.5 transition-transform ${showBenchmarks ? "rotate-90" : ""}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          {showBenchmarks ? "Hide" : "Show"} full benchmark table
        </button>

        {showBenchmarks && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 pr-4 font-semibold text-gray-600">Platform</th>
                  <th className="pb-2 pr-4 font-semibold text-gray-600">Avg CTR</th>
                  <th className="pb-2 pr-4 font-semibold text-gray-600">Avg CPC</th>
                  <th className="pb-2 pr-4 font-semibold text-gray-600">Avg CPM</th>
                  <th className="pb-2 pr-4 font-semibold text-gray-600">Avg CVR</th>
                  <th className="pb-2 font-semibold text-gray-600">Avg CPA</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(BENCHMARKS).map(([, b]) => (
                  <tr key={b.label} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-800">{b.label}</td>
                    <td className="py-2 pr-4 text-gray-600">{fmtPct(b.ctr)}</td>
                    <td className="py-2 pr-4 text-gray-600">{fmtUSD(b.cpc)}</td>
                    <td className="py-2 pr-4 text-gray-600">{fmtUSD(b.cpm)}</td>
                    <td className="py-2 pr-4 text-gray-600">{fmtPct(b.cvr)}</td>
                    <td className="py-2 text-gray-600">{fmtUSD(b.cpa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
              Sources (2025–2026 reports): <a href="https://www.wordstream.com/blog/2025-google-ads-benchmarks" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">WordStream Google Ads 2025</a>{" · "}
              <a href="https://www.wordstream.com/blog/facebook-ads-benchmarks-2025" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">WordStream Meta Ads 2025</a>{" · "}
              <a href="https://affectgroup.com/blog/meta-ads-cpm-in-the-us-2025-benchmarks-for-facebook-and-instagram/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Affect Group Meta CPM 2025</a>{" · "}
              <a href="https://nav43.com/blog/2025-linkedin-ads-benchmarks-every-saas-tech-marketer-needs/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">NAV43 LinkedIn 2025</a>{" · "}
              <a href="https://speedworksocial.com/linkedin-ads-benchmarks/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Speedwork LinkedIn 2026</a>{" · "}
              <a href="https://circleboom.com/blog/how-much-do-twitter-ads-cost/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Circleboom Twitter/X 2025</a>{" · "}
              <a href="https://lebesgue.io/tiktok-ads/tiktok-ads-benchmarks-for-ctr-cr-and-cpm" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Lebesgue TikTok 2025</a>{" · "}
              <a href="https://usermaven.com/blog/google-ads-benchmarks" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Usermaven Display 2025</a>.
              Industry multipliers derived from WordStream 2025 per-vertical data. Benchmarks are averages; actual results vary by ad quality, audience, landing page, and market conditions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
