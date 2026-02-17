"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface TimelinePoint {
  date: string;
  totalFollowers: number;
}

interface PlatformBreakdown {
  platform: string;
  followers: number;
}

interface ProjectStatsData {
  totalFollowers: number;
  growthPercent: number | null;
  timeline: TimelinePoint[];
  platforms: PlatformBreakdown[];
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#00f2ea",
  instagram: "#E4405F",
  youtube: "#FF0000",
  twitter: "#000000",
  facebook: "#1877F2",
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function Sparkline({ data }: { data: TimelinePoint[] }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.totalFollowers);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const w = 80;
  const h = 24;
  const padding = 2;

  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (w - padding * 2);
      const y = h - padding - ((v - min) / range) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const isPositive = values[values.length - 1] >= values[0];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function PlatformBar({ platforms }: { platforms: PlatformBreakdown[] }) {
  const total = platforms.reduce((sum, p) => sum + p.followers, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        {platforms.map((p) => {
          const pct = (p.followers / total) * 100;
          if (pct < 1) return null;
          return (
            <div
              key={p.platform}
              style={{
                width: `${pct}%`,
                backgroundColor: PLATFORM_COLORS[p.platform] ?? "#9ca3af",
              }}
            />
          );
        })}
      </div>
      <div className="flex gap-2 mt-1.5 flex-wrap">
        {platforms.map((p) => (
          <div key={p.platform} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: PLATFORM_COLORS[p.platform] ?? "#9ca3af",
              }}
            />
            <span className="text-[10px] text-gray-500 capitalize">
              {p.platform}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProjectStatsCardProps {
  projectId: number;
  variant?: "full" | "inline";
}

export default function ProjectStatsCard({
  projectId,
  variant = "full",
}: ProjectStatsCardProps) {
  const [stats, setStats] = useState<ProjectStatsData | null>(null);

  useEffect(() => {
    apiClient
      .get<ProjectStatsData>(`/api/projects/${projectId}/stats`)
      .then(setStats)
      .catch(() => {});
  }, [projectId]);

  if (!stats) return null;

  if (stats.totalFollowers === 0 && stats.platforms.length === 0) {
    return (
      <p className="text-xs text-gray-400 mt-1">No follower data yet</p>
    );
  }

  // Inline variant: just total + growth (for personal brand header)
  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-gray-500">
        <span className="font-semibold text-gray-900">
          {formatFollowers(stats.totalFollowers)}
        </span>
        <span>followers</span>
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
      </span>
    );
  }

  // Full variant: total + sparkline + platform bar
  return (
    <div className="flex items-start gap-4 mt-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
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
        <p className="text-[11px] text-gray-400">followers</p>
        {stats.timeline.length >= 2 && (
          <div className="mt-1">
            <Sparkline data={stats.timeline} />
          </div>
        )}
      </div>
      {stats.platforms.length > 0 && (
        <div className="flex-1 min-w-0">
          <PlatformBar platforms={stats.platforms} />
        </div>
      )}
    </div>
  );
}
