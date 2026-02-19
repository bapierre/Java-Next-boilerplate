"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import ProjectForm from "@/components/dashboard/ProjectForm";
import {
  ConnectedSources,
  ConnectPlatformModal,
} from "@/components/dashboard/ChannelCatalog";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import PostPerformanceChart from "@/components/dashboard/PostPerformanceChart";
import ColdOutreachBoard from "@/components/dashboard/ColdOutreachBoard";
import SeoBoard from "@/components/dashboard/SeoBoard";
import AffiliateBoard from "@/components/dashboard/AffiliateBoard";
import PaidAdsBoard from "@/components/dashboard/PaidAdsBoard";
import {
  Sparkline,
  PlatformBar,
  formatFollowers,
  type ProjectStatsData,
} from "@/components/dashboard/ProjectStatsCard";
import type { ProjectResponse } from "@/components/dashboard/ProjectList";

// ── Types ─────────────────────────────────────────────────────────────────────

type Segment = "social" | "outreach" | "seo" | "affiliate" | "paidads" | null;

interface SeoAuditSummary {
  score: number;
}

interface OutreachEntry {
  id: number;
  status: "ONGOING" | "SUCCESS" | "FAIL";
  contactedAt: string;
}

// ── Outreach mini donut chart ─────────────────────────────────────────────────

function OutreachDonut({
  ongoing,
  success,
  fail,
}: {
  ongoing: number;
  success: number;
  fail: number;
}) {
  const total = ongoing + success + fail;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="24" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        </svg>
        <p className="text-xs text-gray-400">No outreach yet</p>
      </div>
    );
  }

  const segments = [
    { count: ongoing, color: "#3b82f6", label: "Ongoing" },
    { count: success, color: "#22c55e", label: "Success" },
    { count: fail,    color: "#ef4444", label: "Fail" },
  ];

  const r = 22;
  const cx = 32;
  const cy = 32;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map(({ count, color }) => {
    const pct = count / total;
    const arc = {
      color,
      dasharray: `${pct * circumference} ${circumference}`,
      dashoffset: -offset * circumference,
    };
    offset += pct;
    return arc;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="10"
            strokeDasharray={arc.dasharray}
            strokeDashoffset={arc.dashoffset}
          />
        ))}
      </svg>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span className="text-gray-600">{ongoing} ongoing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span className="text-gray-600">{success} success</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="text-gray-600">{fail} failed</span>
        </div>
      </div>
    </div>
  );
}

// ── Coming-soon placeholder card ──────────────────────────────────────────────

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-5 bg-gray-50 border border-dashed border-gray-200 rounded-2xl opacity-60 cursor-not-allowed">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Segment</p>
          <h3 className="text-base font-bold text-gray-500">{title}</h3>
        </div>
        <span className="text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-1 rounded-full shrink-0">
          Coming soon
        </span>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

// ── Segment selector grid ─────────────────────────────────────────────────────

function SegmentSelector({
  onSelect,
  stats,
  outreaches,
  seoScore,
  affiliateClicks,
  adSpend,
}: {
  onSelect: (segment: Segment) => void;
  stats: ProjectStatsData | null;
  outreaches: OutreachEntry[];
  seoScore: number | null;
  affiliateClicks: number | null;
  adSpend: number | null;
}) {
  const now = new Date();
  const thisMonth = outreaches.filter((o) => {
    const d = new Date(o.contactedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const ongoing = thisMonth.filter((o) => o.status === "ONGOING").length;
  const success = thisMonth.filter((o) => o.status === "SUCCESS").length;
  const fail    = thisMonth.filter((o) => o.status === "FAIL").length;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Social Media — spans full width */}
      <button
        onClick={() => onSelect("social")}
        className="col-span-2 text-left p-5 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Segment
            </p>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
              Social Media
            </h3>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors mt-0.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
        {stats && stats.totalFollowers > 0 ? (
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatFollowers(stats.totalFollowers)}
                </span>
                {stats.growthPercent != null && (
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      stats.growthPercent >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {stats.growthPercent >= 0 ? "+" : ""}
                    {stats.growthPercent.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">total followers</p>
              {stats.timeline.length >= 2 && (
                <div className="mt-2">
                  <Sparkline data={stats.timeline} />
                </div>
              )}
            </div>
            {stats.platforms.length > 0 && (
              <div className="flex-1 min-w-0 pt-1">
                <PlatformBar platforms={stats.platforms} />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Connect your social accounts to see stats</p>
        )}
      </button>

      {/* Cold Outreach */}
      <button
        onClick={() => onSelect("outreach")}
        className="text-left p-5 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Segment
            </p>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
              Cold Outreach
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">This month</p>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors mt-0.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
        <OutreachDonut ongoing={ongoing} success={success} fail={fail} />
      </button>

      {/* Paid Ads — active */}
      <button
        onClick={() => onSelect("paidads")}
        className="text-left p-5 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Segment</p>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Paid Ads</h3>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
        {adSpend !== null && adSpend > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${(adSpend / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-xs text-gray-400">total ad spend</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Track ad spend, CPC, CPA and UTM link performance</p>
        )}
      </button>

      {/* SEO — active */}
      <button
        onClick={() => onSelect("seo")}
        className="text-left p-5 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Segment</p>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors">SEO</h3>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
        {seoScore !== null ? (
          <div className="flex items-center gap-3">
            <span
              className={`text-2xl font-bold ${
                seoScore >= 75 ? "text-green-600" : seoScore >= 50 ? "text-amber-500" : "text-red-500"
              }`}
            >
              {seoScore}
            </span>
            <div>
              <p className="text-xs font-medium text-gray-600">
                {seoScore >= 75 ? "Good" : seoScore >= 50 ? "Needs work" : "Poor"}
              </p>
              <p className="text-[10px] text-gray-400">SEO score / 100</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Audit your website for on-page SEO issues across 16 factors</p>
        )}
      </button>

      {/* Affiliate Marketing — active */}
      <button
        onClick={() => onSelect("affiliate")}
        className="text-left p-5 bg-white border border-gray-200 rounded-2xl hover:border-purple-400 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Segment</p>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Affiliate Marketing</h3>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
        {affiliateClicks !== null && affiliateClicks > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{affiliateClicks.toLocaleString()}</span>
            <p className="text-xs text-gray-400">total clicks</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Track affiliate link clicks and sources</p>
        )}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const projectId    = Number(params.id);

  const [project, setProject]               = useState<ProjectResponse | null>(null);
  const [loading, setLoading]               = useState(true);
  const [editing, setEditing]               = useState(false);
  const [deleting, setDeleting]             = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectedPlatform, setConnectedPlatform] = useState<string | null>(null);
  const [segment, setSegment]               = useState<Segment>(null);
  const [stats, setStats]                   = useState<ProjectStatsData | null>(null);
  const [outreaches, setOutreaches]         = useState<OutreachEntry[]>([]);
  const [seoScore, setSeoScore]             = useState<number | null>(null);
  const [affiliateClicks, setAffiliateClicks] = useState<number | null>(null);
  const [adSpend, setAdSpend]               = useState<number | null>(null);

  const fetchProject = async () => {
    try {
      const data = await apiClient.get<ProjectResponse>(`/api/projects/${projectId}`);
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // Prefetch stats for the social media segment preview
    apiClient.get<ProjectStatsData>(`/api/projects/${projectId}/stats`)
      .then((d) => { if (d) setStats(d); }).catch(() => {});
    // Prefetch latest SEO score for the segment card
    apiClient.get<SeoAuditSummary>(`/api/projects/${projectId}/seo/audit`)
      .then((d) => { if (d) setSeoScore(d.score); }).catch(() => {});
    // Prefetch affiliate click total for the segment card
    apiClient.get<{ id: number; totalClicks: number }[]>(`/api/projects/${projectId}/affiliate/campaigns`)
      .then((d) => {
        if (d) {
          const total = d.reduce((s, c) => s + c.totalClicks, 0);
          setAffiliateClicks(total);
        }
      }).catch(() => {});
    // Prefetch paid ads total spend for the segment card
    apiClient.get<{ totalSpendCents: number }>(`/api/projects/${projectId}/paid-ads/total-spend`)
      .then((d) => { if (d) setAdSpend(d.totalSpendCents); }).catch(() => {});
  }, [projectId]);

  // Personal brands only have social media — go straight to that view
  // Products need outreach data for the segment selector preview
  useEffect(() => {
    if (!project) return;
    if (project.type === "PERSONAL_BRAND") {
      setSegment("social");
    } else {
      apiClient.get<OutreachEntry[]>(`/api/projects/${projectId}/outreach`)
        .then((d) => { if (d) setOutreaches(d); }).catch(() => {});
    }
  }, [project?.type]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) {
      setConnectedPlatform(connected);
      const timeout = setTimeout(() => setConnectedPlatform(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  const isBrand = project?.type === "PERSONAL_BRAND";
  const label   = isBrand ? "personal brand" : "product";

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${label}? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      await apiClient.delete(`/api/projects/${projectId}`);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Failed to delete project:", err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500">Project not found.</p>
          <a href="/dashboard" className="text-purple-600 hover:underline text-sm mt-2 inline-block">
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <ProjectForm
            project={project}
            onSuccess={() => { setEditing(false); fetchProject(); }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Nav ── */}
        <a href="/dashboard" className="text-gray-500 hover:text-gray-900 text-sm mb-6 inline-block">
          &larr; Back to dashboard
        </a>

        {connectedPlatform && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Successfully connected {connectedPlatform}! Token exchange is pending — the channel will become active once platform API integration is complete.
          </div>
        )}

        {/* ── Project header ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  {project.category && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {project.category}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                )}
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline text-xs mt-1 inline-block"
                  >
                    {project.websiteUrl}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* MRR badge */}
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">MRR</p>
                <p className="text-xl font-bold text-gray-900">
                  {project.mrr != null
                    ? `$${Number(project.mrr).toLocaleString()}`
                    : <span className="text-gray-300 text-sm font-normal">—</span>}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Segment view ── */}
        {segment === null && !isBrand && (
          <SegmentSelector
            onSelect={setSegment}
            stats={stats}
            outreaches={outreaches}
            seoScore={seoScore}
            affiliateClicks={affiliateClicks}
            adSpend={adSpend}
          />
        )}

        {segment !== null && (
          <div>
            {!isBrand && (
              <button
                onClick={() => setSegment(null)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to segments
              </button>
            )}

            {segment === "social" && (
              <>
                {/* Connected sources */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Connected Sources
                  </h3>
                  <ConnectedSources
                    projectId={project.id}
                    channels={project.channels}
                    onOpenModal={() => setShowConnectModal(true)}
                    onChannelChange={fetchProject}
                  />
                </div>

                {/* Analytics */}
                <AnalyticsPanel projectId={project.id} channels={project.channels} />

                {/* Post performance */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Post Comparison
                  </h3>
                  <PostPerformanceChart projectId={project.id} />
                </div>
              </>
            )}

            {segment === "outreach" && (
              <ColdOutreachBoard projectId={project.id} />
            )}

            {segment === "seo" && (
              <SeoBoard
                projectId={project.id}
                websiteUrl={project.websiteUrl}
                onScoreChange={setSeoScore}
              />
            )}

            {segment === "affiliate" && (
              <AffiliateBoard projectId={project.id} />
            )}

            {segment === "paidads" && (
              <PaidAdsBoard projectId={project.id} />
            )}
          </div>
        )}

        {/* Connect platform modal */}
        {showConnectModal && (
          <ConnectPlatformModal
            projectId={project.id}
            connectedChannels={project.channels}
            onChannelChange={fetchProject}
            onClose={() => setShowConnectModal(false)}
          />
        )}
      </div>
    </div>
  );
}
