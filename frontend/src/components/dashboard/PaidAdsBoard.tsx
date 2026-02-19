"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import AdSimulator from "./AdSimulator";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdCampaign {
  id: number;
  name: string;
  platform: string;
  createdAt: string;
  totalSpendCents: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
}

interface AdEntry {
  id: number;
  campaignId: number;
  date: string;
  spendCents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  notes: string | null;
}

interface DailyAdPoint {
  date: string;
  spendCents: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

interface AdStats {
  timeline: DailyAdPoint[];
  totalSpendCents: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  cpc: number;
  cpa: number;
  ctr: number;
  utmTotalClicks: number;
  utmUniqueClicks: number;
}

interface UtmLink {
  id: number;
  campaignId: number | null;
  name: string;
  destinationUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string | null;
  utmTerm: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  totalClicks: number;
  trackingUrl: string;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center ml-1 cursor-help">
      <span className="text-[9px] font-bold text-gray-400 hover:text-gray-600 w-3.5 h-3.5 rounded-full border border-gray-300 hover:border-gray-400 inline-flex items-center justify-center leading-none transition-colors">
        ?
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-relaxed shadow-lg">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}

// ── Platform badge colours ────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  GOOGLE:   "bg-blue-100 text-blue-700",
  META:     "bg-indigo-100 text-indigo-700",
  LINKEDIN: "bg-sky-100 text-sky-700",
  TWITTER:  "bg-slate-100 text-slate-700",
  TIKTOK:   "bg-pink-100 text-pink-700",
  OTHER:    "bg-gray-100 text-gray-600",
};

function PlatformBadge({ platform }: { platform: string }) {
  const cls = PLATFORM_COLORS[platform.toUpperCase()] ?? PLATFORM_COLORS.OTHER;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>
      {platform}
    </span>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <button onClick={handleCopy}
      className="shrink-0 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtUSD = (cents: number) =>
  cents === 0 ? "$0" : `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtPct = (v: number) => `${v.toFixed(2)}%`;

// ── SVG Spend line chart ───────────────────────────────────────────────────────

function SpendLineChart({ data }: { data: DailyAdPoint[] }) {
  if (data.length === 0) return null;
  const W = 560, H = 160, padL = 48, padR = 8, padT = 8, padB = 28;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const maxVal = Math.max(...data.map((p) => p.spendCents), 1);
  const xStep  = chartW / Math.max(data.length - 1, 1);
  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + chartH - (v / maxVal) * chartH;
  const spendPath = data.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.spendCents)}`).join(" ");
  const labelStep = Math.max(1, Math.floor(data.length / 6));
  const yTicks = [0, Math.round(maxVal / 2), maxVal];
  const fmtDate = (iso: string) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()}`; };
  const fmtY = (v: number) => v === 0 ? "$0" : `$${(v / 100).toFixed(0)}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padL - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{fmtY(v)}</text>
          </g>
        ))}
        <path d={spendPath} fill="none" stroke="#8b5cf6" strokeWidth="2" />
        {data.map((p, i) => i % labelStep === 0 && (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {fmtDate(p.date)}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Campaign expanded row ──────────────────────────────────────────────────────

function CampaignEntries({
  projectId,
  campaign,
}: {
  projectId: number;
  campaign: AdCampaign;
}) {
  const [entries, setEntries]   = useState<AdEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ date: new Date().toISOString().slice(0, 10), spendCents: 0, clicks: 0, impressions: 0, conversions: 0, notes: "" });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    apiClient
      .get<AdEntry[]>(`/api/projects/${projectId}/paid-ads/campaigns/${campaign.id}/entries`)
      .then((d) => { if (d) setEntries(d.slice().reverse()); })
      .finally(() => setLoading(false));
  }, [projectId, campaign.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await apiClient.post<AdEntry>(
        `/api/projects/${projectId}/paid-ads/campaigns/${campaign.id}/entries`,
        { ...form, spendCents: Math.round(form.spendCents * 100) }
      );
      setEntries((prev) => {
        const filtered = prev.filter((en) => en.date !== saved.date);
        return [saved, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
      });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this entry?")) return;
    await apiClient.delete(`/api/projects/${projectId}/paid-ads/campaigns/${campaign.id}/entries/${id}`);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <div className="py-4 text-center text-sm text-gray-400">Loading…</div>;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily Entries</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium">
          {showForm ? "Cancel" : "+ Add Entry"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                required className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Spend ($)</label>
              <input type="number" min="0" step="0.01" value={form.spendCents}
                onChange={(e) => setForm({ ...form, spendCents: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5 flex items-center">
                Clicks<Tooltip text="Total ad clicks from your platform's campaign report (e.g. Google Ads → Clicks column)." />
              </label>
              <input type="number" min="0" value={form.clicks}
                onChange={(e) => setForm({ ...form, clicks: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Impressions</label>
              <input type="number" min="0" value={form.impressions}
                onChange={(e) => setForm({ ...form, impressions: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5 flex items-center">
                Conversions<Tooltip text="Number of goals completed (purchases, sign-ups, etc.) attributed to your ads. Get this from your platform's conversion report." />
              </label>
              <input type="number" min="0" value={form.conversions}
                onChange={(e) => setForm({ ...form, conversions: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Notes</label>
              <input type="text" value={form.notes} placeholder="Optional"
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Save Entry"}</Button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3">No entries yet — add your first daily spend above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-1 pr-3">Date</th>
                <th className="pb-1 pr-3">Spend</th>
                <th className="pb-1 pr-3">Clicks</th>
                <th className="pb-1 pr-3">Impressions</th>
                <th className="pb-1 pr-3">Conv.</th>
                <th className="pb-1 pr-3">Notes</th>
                <th className="pb-1" />
              </tr>
            </thead>
            <tbody>
              {entries.map((en) => (
                <tr key={en.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-1.5 pr-3 font-medium text-gray-700">{en.date}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{fmtUSD(en.spendCents)}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{en.clicks.toLocaleString()}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{en.impressions.toLocaleString()}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{en.conversions}</td>
                  <td className="py-1.5 pr-3 text-gray-400 max-w-[100px] truncate">{en.notes ?? "—"}</td>
                  <td className="py-1.5">
                    <button onClick={() => handleDelete(en.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Analytics tab ──────────────────────────────────────────────────────────────

function AnalyticsTab({ projectId, campaigns }: { projectId: number; campaigns: AdCampaign[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(campaigns[0]?.id ?? null);
  const [days, setDays]             = useState(30);
  const [stats, setStats]           = useState<AdStats | null>(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (selectedId === null) return;
    setLoading(true);
    apiClient
      .get<AdStats>(`/api/projects/${projectId}/paid-ads/campaigns/${selectedId}/stats?days=${days}`)
      .then((d) => { if (d) setStats(d); })
      .finally(() => setLoading(false));
  }, [selectedId, days, projectId]);

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-gray-400">Create a campaign first to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign selector + days filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {campaigns.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                selectedId === c.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {([7, 30, 90] as const).map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                days === d ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Spend",    value: fmtUSD(stats.totalSpendCents), tip: "Sum of all spend entries in this period." },
              { label: "Manual Clicks",  value: stats.totalClicks.toLocaleString(), tip: "Clicks you entered manually from your ad platform reports. Does not include UTM-tracked clicks." },
              { label: "CPC",            value: fmtUSD(stats.cpc * 100), tip: "Cost Per Click — total spend ÷ total clicks. Lower is better. Google Search avg: $4.66, Meta avg: $1.72." },
              { label: "CPA",            value: fmtUSD(stats.cpa * 100), tip: "Cost Per Acquisition — total spend ÷ conversions. This is your most important metric. Compare against your customer LTV." },
              { label: "CTR",            value: fmtPct(stats.ctr), tip: "Click-Through Rate — clicks ÷ impressions × 100. Google Search benchmark: 6.4%. Meta: 0.9%. Low CTR usually means your ad copy needs improvement." },
              { label: "Impressions",    value: stats.totalImpressions.toLocaleString(), tip: "How many times your ad was shown. Use this with clicks to calculate CTR." },
              { label: "Conversions",    value: stats.totalConversions.toLocaleString(), tip: "Sign-ups, purchases, or any goal you track. Enter these from your ad platform's conversion report." },
            ].map(({ label, value, tip }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center">
                  {label}<Tooltip text={tip} />
                </p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* UTM tracked clicks (auto-populated from linked UTM links) */}
          {(stats.utmTotalClicks > 0 || stats.utmUniqueClicks > 0) && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">UTM Tracked Clicks</span>
                <span className="text-[10px] text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">auto</span>
                <Tooltip text="Clicks automatically counted when visitors use your tracking links (UTM Links tab). Unique clicks deduplicate by cookie — one visitor per day." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-violet-500 mb-0.5">Total Clicks</p>
                  <p className="text-2xl font-bold text-violet-900">{stats.utmTotalClicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-violet-500 mb-0.5">Unique Clicks</p>
                  <p className="text-2xl font-bold text-violet-900">{stats.utmUniqueClicks.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          {stats.utmTotalClicks === 0 && stats.utmUniqueClicks === 0 && (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <p className="text-xs text-gray-400">
                No UTM links linked to this campaign yet. Go to{" "}
                <strong>UTM Links</strong> and assign a link to see tracked clicks here automatically.
              </p>
            </div>
          )}

          {/* Spend chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Spend over time</h4>
            {stats.timeline.length > 0 ? (
              <SpendLineChart data={stats.timeline} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No data in this period</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ── UTM Links tab ─────────────────────────────────────────────────────────────

const UTM_PRESETS = [
  { label: "Google Ads",   source: "google",   medium: "cpc" },
  { label: "Meta Ads",     source: "meta",     medium: "paid_social" },
  { label: "LinkedIn Ads", source: "linkedin", medium: "paid_social" },
  { label: "Twitter Ads",  source: "twitter",  medium: "paid_social" },
  { label: "TikTok Ads",   source: "tiktok",   medium: "paid_social" },
];

function UtmLinksTab({ projectId, campaigns }: { projectId: number; campaigns: AdCampaign[] }) {
  const [links, setLinks]         = useState<UtmLink[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", destinationUrl: "", utmSource: "", utmMedium: "",
    utmCampaign: "", utmContent: "", utmTerm: "", campaignId: "" as string,
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    apiClient
      .get<UtmLink[]>(`/api/projects/${projectId}/utm/links`)
      .then((d) => { if (d) setLinks(d); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const applyPreset = (preset: typeof UTM_PRESETS[0]) => {
    setForm((f) => ({ ...f, utmSource: preset.source, utmMedium: preset.medium }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const created = await apiClient.post<UtmLink>(`/api/projects/${projectId}/utm/links`, {
        name: form.name.trim(),
        destinationUrl: form.destinationUrl.trim(),
        utmSource: form.utmSource.trim(),
        utmMedium: form.utmMedium.trim(),
        utmCampaign: form.utmCampaign.trim(),
        utmContent: form.utmContent.trim() || null,
        utmTerm: form.utmTerm.trim() || null,
        campaignId: form.campaignId ? parseInt(form.campaignId) : null,
      });
      setLinks((prev) => [created, ...prev]);
      setForm({ name: "", destinationUrl: "", utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", utmTerm: "", campaignId: "" });
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this UTM link? All click data will be lost.")) return;
    await apiClient.delete(`/api/projects/${projectId}/utm/links/${id}`);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAssignCampaign = async (linkId: number, campaignId: number | null) => {
    setAssigning(linkId);
    try {
      const updated = await apiClient.patch<UtmLink>(
        `/api/projects/${projectId}/utm/links/${linkId}/campaign`,
        { campaignId }
      );
      if (updated) setLinks((prev) => prev.map((l) => l.id === linkId ? updated : l));
    } finally {
      setAssigning(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New UTM Link"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          {formError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}

          {/* Platform presets */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Quick preset</p>
            <div className="flex flex-wrap gap-2">
              {UTM_PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => applyPreset(p)}
                  className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-gray-600 hover:text-purple-700 transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Link name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Google Ads – Homepage" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Destination URL</label>
              <input type="text" value={form.destinationUrl} onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
                placeholder="https://yoursite.com/page" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">utm_source</label>
              <input type="text" value={form.utmSource} onChange={(e) => setForm({ ...form, utmSource: e.target.value })}
                placeholder="google" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">utm_medium</label>
              <input type="text" value={form.utmMedium} onChange={(e) => setForm({ ...form, utmMedium: e.target.value })}
                placeholder="cpc" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">utm_campaign</label>
              <input type="text" value={form.utmCampaign} onChange={(e) => setForm({ ...form, utmCampaign: e.target.value })}
                placeholder="summer-promo" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">utm_content <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={form.utmContent} onChange={(e) => setForm({ ...form, utmContent: e.target.value })}
                placeholder="hero-banner"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">utm_term <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={form.utmTerm} onChange={(e) => setForm({ ...form, utmTerm: e.target.value })}
                placeholder="running+shoes"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          {campaigns.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Link to campaign <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                <option value="">— no campaign —</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Creating…" : "Create UTM Link"}</Button>
          </div>
        </form>
      )}

      {links.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-400 mb-3">No UTM links yet</p>
          <Button size="sm" onClick={() => setShowForm(true)}>+ New UTM Link</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((l) => {
            const trackingFull = `${apiBase}${l.trackingUrl}`;
            return (
              <div key={l.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">{l.name}</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">
                        {l.totalClicks} clicks
                      </span>
                      {l.campaignId && campaigns.find((c) => c.id === l.campaignId) && (
                        <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full shrink-0">
                          {campaigns.find((c) => c.id === l.campaignId)!.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded truncate max-w-xs">
                        {trackingFull}
                      </code>
                      <CopyButton text={trackingFull} />
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      → {l.destinationUrl}
                      <span className="text-gray-300 mx-1">·</span>
                      <span className="text-gray-400">
                        {[
                          `source=${l.utmSource}`,
                          `medium=${l.utmMedium}`,
                          `campaign=${l.utmCampaign}`,
                          l.utmContent && `content=${l.utmContent}`,
                          l.utmTerm && `term=${l.utmTerm}`,
                        ].filter(Boolean).join(", ")}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {campaigns.length > 0 && (
                      <select
                        value={l.campaignId ?? ""}
                        onChange={(e) => handleAssignCampaign(l.id, e.target.value ? parseInt(e.target.value) : null)}
                        disabled={assigning === l.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400"
                        title="Assign to campaign"
                      >
                        <option value="">no campaign</option>
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                    <button onClick={() => handleDelete(l.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main board ─────────────────────────────────────────────────────────────────

export default function PaidAdsBoard({ projectId }: { projectId: number }) {
  const [campaigns, setCampaigns]   = useState<AdCampaign[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<"campaigns" | "analytics" | "utm" | "simulator">("campaigns");
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [name, setName]             = useState("");
  const [platform, setPlatform]     = useState("GOOGLE");
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);

  const PLATFORMS = ["GOOGLE", "META", "LINKEDIN", "TWITTER", "TIKTOK", "OTHER"];

  useEffect(() => {
    apiClient
      .get<AdCampaign[]>(`/api/projects/${projectId}/paid-ads/campaigns`)
      .then((d) => { if (d) setCampaigns(d); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const created = await apiClient.post<AdCampaign>(
        `/api/projects/${projectId}/paid-ads/campaigns`,
        { name: name.trim(), platform }
      );
      setCampaigns((prev) => [created, ...prev]);
      setName("");
      setPlatform("GOOGLE");
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this campaign? All entries will be lost.")) return;
    await apiClient.delete(`/api/projects/${projectId}/paid-ads/campaigns/${id}`);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (expanded === id) setExpanded(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {(["campaigns", "analytics", "utm", "simulator"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t === "campaigns" ? "Ad Campaigns" : t === "analytics" ? "Analytics" : t === "utm" ? "UTM Links" : "Simulator"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/dashboard/guides/paid-ads"
            className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Ads Guide
          </Link>
          {tab === "campaigns" && (
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancel" : "+ New Campaign"}
            </Button>
          )}
        </div>
      </div>

      {/* New campaign form */}
      {tab === "campaigns" && showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          {formError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Campaign name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google Search — Brand" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Creating…" : "Create Campaign"}</Button>
          </div>
        </form>
      )}

      {/* Campaigns list */}
      {tab === "campaigns" && (
        <div className="space-y-3">
          {campaigns.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-400 mb-3">No ad campaigns yet</p>
              <Button size="sm" onClick={() => setShowForm(true)}>+ New Campaign</Button>
            </div>
          )}
          {campaigns.map((c) => {
            const isOpen = expanded === c.id;
            const cpc = c.totalClicks > 0 ? c.totalSpendCents / c.totalClicks / 100 : null;
            const cpa = c.totalConversions > 0 ? c.totalSpendCents / c.totalConversions / 100 : null;
            return (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl">
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : c.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <PlatformBadge platform={c.platform} />
                      <span className="font-medium text-gray-900 truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{fmtUSD(c.totalSpendCents)} spend</span>
                      <span>{c.totalClicks.toLocaleString()} clicks</span>
                      {cpc !== null && <span>CPC {fmtUSD(cpc * 100)}</span>}
                      {cpa !== null && <span>CPA {fmtUSD(cpa * 100)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <CampaignEntries projectId={projectId} campaign={c} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics tab */}
      {tab === "analytics" && <AnalyticsTab projectId={projectId} campaigns={campaigns} />}

      {/* UTM Links tab */}
      {tab === "utm" && <UtmLinksTab projectId={projectId} campaigns={campaigns} />}

      {/* Simulator tab */}
      {tab === "simulator" && <AdSimulator />}
    </div>
  );
}
