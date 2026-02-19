"use client";

import Link from "next/link";

// ── Section components ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </section>
  );
}

function MetricCard({ name, formula, description, good }: {
  name: string; formula: string; description: string; good: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <code className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-mono shrink-0">{formula}</code>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">{good}</p>
    </div>
  );
}

function PlatformCard({ name, color, pros, cons, bestFor, minBudget }: {
  name: string; color: string; pros: string[]; cons: string[]; bestFor: string; minBudget: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-900">{name}</h4>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: color + "20", color }}>{minBudget}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">Best for: <strong>{bestFor}</strong></p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold text-green-700 uppercase mb-1">Pros</p>
          <ul className="space-y-1">
            {pros.map((p) => <li key={p} className="text-xs text-gray-600 flex gap-1.5"><span className="text-green-500 mt-0.5">✓</span>{p}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-red-600 uppercase mb-1">Cons</p>
          <ul className="space-y-1">
            {cons.map((c) => <li key={c} className="text-xs text-gray-600 flex gap-1.5"><span className="text-red-400 mt-0.5">✗</span>{c}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-none w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
        {n}
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <div className="text-sm text-gray-600 space-y-1">{children}</div>
      </div>
    </div>
  );
}

function CalloutBox({ type, children }: { type: "tip" | "warning" | "info"; children: React.ReactNode }) {
  const styles = {
    tip:     { bg: "bg-green-50",  border: "border-green-200",  icon: "💡", text: "text-green-800" },
    warning: { bg: "bg-amber-50",  border: "border-amber-200",  icon: "⚠️", text: "text-amber-800" },
    info:    { bg: "bg-blue-50",   border: "border-blue-200",   icon: "ℹ️", text: "text-blue-800" },
  };
  const s = styles[type];
  return (
    <div className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 flex gap-3`}>
      <span className="shrink-0 text-base leading-5 mt-0.5">{s.icon}</span>
      <p className={`text-sm ${s.text}`}>{children}</p>
    </div>
  );
}

// ── Benchmark table ────────────────────────────────────────────────────────────

// Sources: WordStream 2025, WordStream/LocaliQ Meta 2025, NAV43/Speedwork LinkedIn 2025-2026,
// Circleboom/WebFX Twitter 2025-2026, Lebesgue/Quimby TikTok 2025, Usermaven Display 2025
const BENCH_ROWS = [
  { platform: "Google Ads (Search)", ctr: "6.66%", cpc: "$5.26", cpm: "~$38",   cvr: "7.52%", cpa: "$70.11" },
  { platform: "Meta / Facebook Ads", ctr: "2.59%", cpc: "$1.92", cpm: "$19.81", cvr: "7.72%", cpa: "$27.66" },
  { platform: "LinkedIn Ads",        ctr: "0.56%", cpc: "$8.00", cpm: "~$50",   cvr: "7.00%", cpa: "$100+" },
  { platform: "Twitter / X Ads",     ctr: "0.86%", cpc: "$1.00", cpm: "~$5",    cvr: "1.50%", cpa: "$21.55" },
  { platform: "TikTok Ads",          ctr: "0.84%", cpc: "$0.70", cpm: "~$6",    cvr: "1.00%", cpa: "$5–15" },
  { platform: "Display / Other",     ctr: "0.46%", cpc: "$0.73", cpm: "~$3",    cvr: "1.00%", cpa: "~$75" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PaidAdsGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <span className="text-sm font-medium text-gray-700">Paid Ads Guide</span>
          </div>
          <span className="text-xs text-gray-400">Updated Feb 2025</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">

        {/* Hero */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-full uppercase tracking-wide">Guide</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Paid Advertising 101</h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Everything you need to launch, track, and optimise paid campaigns — from choosing the right platform to understanding your CPA.
          </p>
        </div>

        {/* What are paid ads */}
        <Section title="What is Paid Advertising?">
          <p className="text-sm text-gray-600 leading-relaxed">
            Paid advertising (also called PPC — Pay-Per-Click — or SEM — Search Engine Marketing) means paying a platform to show your message to a targeted audience. Unlike organic marketing where you earn visibility, paid ads <strong>rent attention</strong> and can generate results from day one.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            You typically pay in one of three ways:
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { model: "CPC", name: "Cost Per Click", desc: "Pay only when someone clicks your ad. Common on Google Search, Meta." },
              { model: "CPM", name: "Cost Per 1000 Impressions", desc: "Pay for visibility regardless of clicks. Common on display and video." },
              { model: "CPA", name: "Cost Per Acquisition", desc: "Pay only when a conversion happens. Requires tracking setup." },
            ].map((m) => (
              <div key={m.model} className="bg-white border border-gray-200 rounded-xl p-4">
                <code className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">{m.model}</code>
                <p className="text-sm font-semibold text-gray-900 mt-2 mb-1">{m.name}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Platform overview */}
        <Section title="Platform Overview">
          <p className="text-sm text-gray-500 mb-4">Choose the platform that matches where your audience spends time and your budget constraints.</p>
          <div className="space-y-4">
            <PlatformCard
              name="Google Ads (Search)"
              color="#4285F4"
              bestFor="High-intent buyers, any industry"
              minBudget="From $10/day"
              pros={["Highest purchase intent", "Massive reach (8.5B searches/day)", "Precise keyword targeting", "Best for direct response"]}
              cons={["Highest CPCs ($4.66 avg)", "Steep learning curve", "Competitive keywords costly", "Needs strong landing page"]}
            />
            <PlatformCard
              name="Meta / Facebook & Instagram Ads"
              color="#1877F2"
              bestFor="B2C, eCommerce, brand awareness"
              minBudget="From $1/day"
              pros={["Massive audience (3.2B MAU)", "Richest demographic targeting", "Lowest CPC ($1.72 avg)", "Visual formats (Stories, Reels)"]}
              cons={["Lower purchase intent than Google", "iOS 14+ tracking limitations", "Creative fatigue — needs refresh", "Less effective for B2B"]}
            />
            <PlatformCard
              name="LinkedIn Ads"
              color="#0A66C2"
              bestFor="B2B, enterprise software, recruitment"
              minBudget="From $10/day"
              pros={["Best B2B targeting (job title, company)", "High-quality leads", "Lead Gen Forms (13% CVR)", "Thought leadership content"]}
              cons={["Highest CPC ($7 avg)", "Small audience vs Facebook", "Poor for B2C / impulse buys", "Limited creative formats"]}
            />
            <PlatformCard
              name="TikTok Ads"
              color="#010101"
              bestFor="Gen Z, eCommerce, brand discovery"
              minBudget="$20/ad group per day"
              pros={["High organic-feel engagement", "Cheap CPM ($9.16 avg)", "Spark Ads boost organic posts", "Rapid brand awareness"]}
              cons={["Skews 18–34 demographic", "Video-only (production cost)", "B2B performs poorly", "Attribution less reliable"]}
            />
            <PlatformCard
              name="Twitter / X Ads"
              color="#000000"
              bestFor="Tech, news, real-time events"
              minBudget="No minimum"
              pros={["Real-time audience", "Low CPM ($6.46 avg)", "Good for tech/SaaS brands", "Follower campaigns available"]}
              cons={["Platform instability post-2022", "Lower conversion rates (1.5% CVR)", "Ad revenue declining", "Small advertiser base"]}
            />
          </div>
        </Section>

        {/* Key metrics */}
        <Section title="Key Metrics Explained">
          <p className="text-sm text-gray-500 mb-2">You'll see these metrics in your dashboard. Here's what each one means and what "good" looks like.</p>
          <div className="grid gap-3">
            <MetricCard
              name="CTR — Click-Through Rate"
              formula="Clicks ÷ Impressions × 100"
              description="The percentage of people who see your ad and click on it. A high CTR means your ad copy and targeting are well aligned. Low CTR suggests your headline or creative isn't resonating."
              good="Good: Google Search ≥ 6%, Meta ≥ 0.9%, LinkedIn ≥ 0.5%"
            />
            <MetricCard
              name="CPC — Cost Per Click"
              formula="Total Spend ÷ Total Clicks"
              description="How much you pay on average every time someone clicks your ad. Lower is better, but a high CPC can still be profitable if your conversion rate is strong."
              good="Good: Google Search ≤ $4.66, Meta ≤ $1.72, LinkedIn ≤ $7.00"
            />
            <MetricCard
              name="CPM — Cost Per Mille"
              formula="(Total Spend ÷ Impressions) × 1000"
              description="The cost to show your ad to 1,000 people. Key for awareness campaigns where you care about reach more than clicks. Lower CPM = more visibility for your budget."
              good="Good: Meta ≤ $14.90, TikTok ≤ $9.16, Google Display ≤ $2.80"
            />
            <MetricCard
              name="CVR — Conversion Rate"
              formula="Conversions ÷ Clicks × 100"
              description="The percentage of ad clickers who complete your goal (purchase, sign-up, form fill). This depends heavily on your landing page quality, not just the ad itself."
              good="Good: Meta ≥ 9.2%, Google Search ≥ 7%, LinkedIn ≥ 6% (lead gen form)"
            />
            <MetricCard
              name="CPA — Cost Per Acquisition"
              formula="Total Spend ÷ Total Conversions"
              description="How much you spend to get one customer or lead. The most important metric for profitability. Compare against your average order value or customer LTV to check viability."
              good="Good: Meta ≤ $18.68, Google ≤ $66.17. Target CPA < 30% of LTV for SaaS"
            />
            <MetricCard
              name="ROAS — Return on Ad Spend"
              formula="Revenue from Ads ÷ Ad Spend"
              description="For every $1 spent on ads, how much revenue did you generate? A ROAS of 3× means $3 revenue per $1 spent. Essential for eCommerce where revenue is directly attributable."
              good="Good: eCommerce ROAS ≥ 3–4×, SaaS varies (depends on CAC:LTV ratio)"
            />
          </div>
        </Section>

        {/* Benchmark table */}
        <Section title="Industry Benchmarks (2025–2026)">
          <p className="text-sm text-gray-500 mb-3">
            Use these numbers to set expectations and benchmark your campaign performance. All figures are platform-wide averages from 2025–2026 research reports.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 rounded-t-lg">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Platform</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">CTR</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">CPC</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">CPM</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">CVR</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">CPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {BENCH_ROWS.map((r) => (
                  <tr key={r.platform} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.platform}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.ctr}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.cpc}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.cpm}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.cvr}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.cpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mt-2">
            Sources:{" "}
            <a href="https://www.wordstream.com/blog/2025-google-ads-benchmarks" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">WordStream Google Ads 2025</a>,{" "}
            <a href="https://www.wordstream.com/blog/facebook-ads-benchmarks-2025" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">WordStream Meta Ads 2025</a>,{" "}
            <a href="https://affectgroup.com/blog/meta-ads-cpm-in-the-us-2025-benchmarks-for-facebook-and-instagram/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Affect Group Meta CPM 2025</a>,{" "}
            <a href="https://nav43.com/blog/2025-linkedin-ads-benchmarks-every-saas-tech-marketer-needs/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">NAV43 LinkedIn 2025</a>,{" "}
            <a href="https://speedworksocial.com/linkedin-ads-benchmarks/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Speedwork LinkedIn 2026</a>,{" "}
            <a href="https://circleboom.com/blog/how-much-do-twitter-ads-cost/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Circleboom Twitter/X 2025</a>,{" "}
            <a href="https://lebesgue.io/tiktok-ads/tiktok-ads-benchmarks-for-ctr-cr-and-cpm" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Lebesgue TikTok 2025</a>,{" "}
            <a href="https://usermaven.com/blog/google-ads-benchmarks" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Usermaven Display 2025</a>.
            Meta CVR/CPA reflects lead-gen campaign averages; LinkedIn CPM reflects US market. Actual results vary by ad creative, audience, and landing page quality.
          </p>
        </Section>

        {/* Setting up */}
        <Section title="Setting Up Your First Campaign (Step-by-Step)">
          <div className="space-y-6">
            <Step n={1} title="Define your goal before touching the platform">
              <p>Know your goal before you open any ad platform. Common goals:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-500">
                <li><strong>Awareness</strong> — maximise impressions. Optimise for CPM.</li>
                <li><strong>Traffic</strong> — drive clicks to a page. Optimise for CPC/CTR.</li>
                <li><strong>Conversions</strong> — sign-ups, purchases. Optimise for CPA/ROAS.</li>
              </ul>
            </Step>
            <Step n={2} title="Set your budget using the CPA formula">
              <p>Work backwards from your economics:</p>
              <code className="block bg-gray-100 rounded-lg px-3 py-2 text-xs mt-1 font-mono">
                Max CPA = Customer LTV × Target margin<br />
                Daily budget = (Target conversions/month ÷ 30) × Max CPA
              </code>
              <p className="mt-1 text-gray-500">Example: LTV $200, target 30% margin → Max CPA $60. Need 10 conversions/month → $20/day budget minimum.</p>
            </Step>
            <Step n={3} title="Build your targeting audience">
              <p>Narrow targeting gets cheaper clicks but smaller reach. Start broad, then refine based on data:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-500">
                <li>Google: use Broad Match keywords + Smart Bidding for discovery; Exact Match for control</li>
                <li>Meta: start with interest + demographic targeting; then use Lookalike Audiences once you have 1,000+ conversions</li>
                <li>LinkedIn: target by job title + company size for B2B; avoid too many layers (raises CPM)</li>
              </ul>
            </Step>
            <Step n={4} title="Write high-converting ad copy">
              <p>The formula that works consistently:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-500">
                <li><strong>Headline:</strong> State the benefit or problem solved, not the feature</li>
                <li><strong>Body:</strong> Proof + urgency ("10,000 businesses use…", "Offer ends Friday")</li>
                <li><strong>CTA:</strong> Action verb + benefit ("Get Free Trial", "See Pricing")</li>
              </ul>
              <p className="mt-1 text-gray-500">Always test 2–3 variations (A/B test). Let each run for at least 50–100 clicks before judging.</p>
            </Step>
            <Step n={5} title="Install conversion tracking before going live">
              <p>Without conversion tracking you're flying blind. Set up:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-500">
                <li>Google Tag Manager + Google Ads conversion tag on thank-you page</li>
                <li>Meta Pixel + Events (PageView, Lead, Purchase) on your site</li>
                <li>UTM parameters on all ad URLs → use the UTM Links tab to track with MarketiStats</li>
              </ul>
            </Step>
            <Step n={6} title="Log your daily spend in MarketiStats">
              <p>After your campaign runs, come to the <strong>Ad Campaigns tab</strong> and add daily entries for spend, clicks, impressions, and conversions. This unlocks your CPC, CPA, and CTR charts — and lets you compare against benchmarks in the Simulator.</p>
            </Step>
          </div>
        </Section>

        {/* Budget tips */}
        <Section title="Budget Planning & Optimisation">
          <div className="space-y-3">
            <CalloutBox type="tip">
              <strong>The 70/20/10 rule:</strong> Spend 70% of budget on proven campaigns, 20% on scale tests of winners, 10% on experiments. Don&apos;t bet everything on one ad.
            </CalloutBox>
            <CalloutBox type="info">
              <strong>Learning phase:</strong> Most ad platforms need 50 conversions per week to exit the learning phase and optimise bidding. Budget accordingly — underfunding kills performance.
            </CalloutBox>
            <CalloutBox type="warning">
              <strong>Don&apos;t optimise too early.</strong> Wait until each ad variation has received at least 50–100 clicks before pausing it. Statistical significance matters.
            </CalloutBox>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "Start small", desc: "$20–50/day for 1–2 weeks to gather data before scaling" },
                { title: "Day-part bids", desc: "Analyse by hour/day — many B2B ads perform 2× better Tuesday–Thursday 9am–6pm" },
                { title: "Negative keywords", desc: "On Google: block irrelevant searches immediately. Saves 10–30% of wasted spend" },
                { title: "Quality Score", desc: "On Google, a higher Quality Score reduces your CPC. Improve landing page relevance to cut costs" },
                { title: "Frequency cap", desc: "On social: cap impressions per user at 3–5/week to avoid creative fatigue" },
                { title: "Retargeting", desc: "Audiences who visited your site convert 3–5× better. Always run a retargeting campaign" },
              ].map((t) => (
                <div key={t.title} className="bg-white border border-gray-200 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">{t.title}</h5>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Common mistakes */}
        <Section title="Common Mistakes to Avoid">
          <div className="space-y-2">
            {[
              ["Sending traffic to your homepage", "Always send ad traffic to a dedicated, relevant landing page. Homepages convert at 1–2%; focused landing pages at 5–15%."],
              ["No conversion tracking", "If you can't measure CPA, you can't optimise. Set up tracking on day 1."],
              ["Changing campaigns too frequently", "The algorithm needs time to learn. Wait 7–14 days before making significant changes."],
              ["Ignoring search terms report (Google)", "Review your actual search terms weekly. Add negatives to stop wasted spend on irrelevant queries."],
              ["Broad audience + no data", "Without Pixel data or prior conversions, Meta's algorithm can't find buyers. Start with narrow, targeted audiences."],
              ["Comparing platforms directly", "A $50 CPA on LinkedIn for a $5,000 B2B contract is excellent. A $50 CPA on Meta for a $60 product isn't. Always evaluate relative to revenue."],
            ].map(([mistake, fix]) => (
              <div key={mistake} className="flex gap-3 bg-white border border-red-100 rounded-xl p-4">
                <span className="text-red-400 shrink-0 text-base leading-5 mt-0.5">✗</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{mistake}</p>
                  <p className="text-sm text-gray-500">{fix}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA back to dashboard */}
        <div className="bg-purple-600 text-white rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-lg font-bold">Ready to track your campaigns?</h3>
          <p className="text-purple-200 text-sm">Use the Paid Ads board to log your daily spend, compute CPC/CPA, link UTM tracking, and run the simulator to benchmark your results.</p>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors">
            Go to Dashboard →
          </Link>
        </div>

      </div>
    </div>
  );
}
