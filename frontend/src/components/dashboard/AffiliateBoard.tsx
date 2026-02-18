"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Campaign {
  id: number;
  name: string;
  destinationUrl: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  totalClicks: number;
  trackingUrl: string;
}

interface DailyClickPoint {
  date: string;
  totalClicks: number;
  uniqueClicks: number;
}

interface CampaignStats {
  timeline: DailyClickPoint[];
  byReferer: Record<string, number>;
  byDevice: Record<string, number>;
  totalClicks: number;
  uniqueClicks: number;
}

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
      title="Copy tracking URL"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Horizontal bar chart ───────────────────────────────────────────────────────

function HBarChart({ data, color }: { data: Record<string, number>; color: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-24 text-xs text-gray-600 text-right shrink-0 truncate">{label}</span>
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max((count / max) * 100, 4)}%`, backgroundColor: color }}
            />
          </div>
          <span className="w-8 text-xs text-gray-500 text-right shrink-0">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Device donut ───────────────────────────────────────────────────────────────

const DEVICE_COLORS: Record<string, string> = {
  Mobile:  "#8b5cf6",
  Desktop: "#3b82f6",
  Tablet:  "#10b981",
};

function DeviceDonut({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const total   = entries.reduce((s, [, v]) => s + v, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="26" fill="none" stroke="#e5e7eb" strokeWidth="12" />
        </svg>
        <p className="text-xs text-gray-400">No data yet</p>
      </div>
    );
  }

  const r   = 26;
  const cx  = 36;
  const cy  = 36;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = entries.map(([label, count]) => {
    const pct = count / total;
    const arc = {
      label,
      count,
      color: DEVICE_COLORS[label] ?? "#9ca3af",
      dasharray: `${pct * circ} ${circ}`,
      dashoffset: -offset * circ,
    };
    offset += pct;
    return arc;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="12"
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.dashoffset}
          />
        ))}
      </svg>
      <div className="space-y-1">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-gray-600">{arc.label}</span>
            <span className="text-gray-400 ml-1">{arc.count} ({Math.round((arc.count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SVG line chart ────────────────────────────────────────────────────────────

function ClickLineChart({ data }: { data: DailyClickPoint[] }) {
  if (data.length === 0) return null;

  const W = 560;
  const H = 160;
  const padL = 36;
  const padR = 8;
  const padT = 8;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.map((p) => p.totalClicks), 1);
  const xStep  = chartW / Math.max(data.length - 1, 1);

  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const totalPath  = data.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.totalClicks)}`).join(" ");
  const uniquePath = data.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.uniqueClicks)}`).join(" ");

  // Show at most 6 date labels evenly
  const labelStep = Math.max(1, Math.floor(data.length / 6));
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {/* Y grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)}
              stroke="#f3f4f6" strokeWidth="1"
            />
            <text x={padL - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {v}
            </text>
          </g>
        ))}

        {/* Lines */}
        <path d={totalPath}  fill="none" stroke="#8b5cf6" strokeWidth="2" />
        <path d={uniquePath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />

        {/* X labels */}
        {data.map((p, i) => i % labelStep === 0 && (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {fmtDate(p.date.toString())}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-purple-500" /> Total
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-px border-t-2 border-dashed border-blue-500" /> Unique
        </span>
      </div>
    </div>
  );
}

// ── Analytics tab ──────────────────────────────────────────────────────────────

function AnalyticsTab({ projectId, campaigns }: { projectId: number; campaigns: Campaign[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(campaigns[0]?.id ?? null);
  const [days, setDays]             = useState(30);
  const [stats, setStats]           = useState<CampaignStats | null>(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (selectedId === null) return;
    setLoading(true);
    apiClient
      .get<CampaignStats>(`/api/projects/${projectId}/affiliate/campaigns/${selectedId}/stats?days=${days}`)
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
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                selectedId === c.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                days === d ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
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
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Unique Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueClicks.toLocaleString()}</p>
            </div>
          </div>

          {/* Timeline chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Clicks over time</h4>
            {stats.timeline.length > 0 ? (
              <ClickLineChart data={stats.timeline} />
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No clicks in this period</p>
            )}
          </div>

          {/* Referer + device side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">By source</h4>
              <HBarChart data={stats.byReferer} color="#8b5cf6" />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">By device</h4>
              <DeviceDonut data={stats.byDevice} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ── Main board ─────────────────────────────────────────────────────────────────

export default function AffiliateBoard({ projectId }: { projectId: number }) {
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<"campaigns" | "analytics">("campaigns");
  const [showForm, setShowForm]     = useState(false);
  const [name, setName]             = useState("");
  const [destUrl, setDestUrl]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    apiClient
      .get<Campaign[]>(`/api/projects/${projectId}/affiliate/campaigns`)
      .then((d) => { if (d) setCampaigns(d); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destUrl.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const created = await apiClient.post<Campaign>(
        `/api/projects/${projectId}/affiliate/campaigns`,
        { name: name.trim(), destinationUrl: destUrl.trim() }
      );
      setCampaigns((prev) => [created, ...prev]);
      setName("");
      setDestUrl("");
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this campaign? All click data will be lost.")) return;
    await apiClient.delete(`/api/projects/${projectId}/affiliate/campaigns/${id}`);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {(["campaigns", "analytics"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium capitalize transition-colors ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "campaigns" ? "Campaigns" : "Analytics"}
            </button>
          ))}
        </div>
        {tab === "campaigns" && (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ New Campaign"}
          </Button>
        )}
      </div>

      {/* New campaign inline form */}
      {tab === "campaigns" && showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3"
        >
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Campaign name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Twitter bio link"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Destination URL</label>
              <input
                type="url"
                value={destUrl}
                onChange={(e) => setDestUrl(e.target.value)}
                placeholder="https://yoursite.com/page"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      )}

      {/* Campaigns list */}
      {tab === "campaigns" && (
        <div className="space-y-3">
          {campaigns.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-400 mb-3">No campaigns yet</p>
              <Button size="sm" onClick={() => setShowForm(true)}>+ New Campaign</Button>
            </div>
          )}
          {campaigns.map((c) => {
            const trackingFull = `${apiBase}${c.trackingUrl}`;
            return (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">{c.name}</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">
                      {c.totalClicks} clicks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded truncate max-w-xs">
                      {trackingFull}
                    </code>
                    <CopyButton text={trackingFull} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">→ {c.destinationUrl}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics tab */}
      {tab === "analytics" && (
        <AnalyticsTab projectId={projectId} campaigns={campaigns} />
      )}
    </div>
  );
}
