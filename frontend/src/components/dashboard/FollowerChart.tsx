"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { getPlatformInfo } from "./ChannelCatalog";

interface StatsPoint {
  recordedAt: string;
  followersCount: number;
}

interface ChannelLine {
  channelId: number;
  platform: string;
  channelName: string;
  color: string;
  data: StatsPoint[];
}

interface FollowerChartProps {
  projectId: number;
  channels: {
    id: number;
    platform: string;
    channelName: string;
    isActive: boolean;
  }[];
  days?: number;
  visibleChannelIds?: Set<number>;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export default function FollowerChart({
  projectId,
  channels,
  days = 30,
  visibleChannelIds,
}: FollowerChartProps) {
  const [lines, setLines] = useState<ChannelLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      const results: ChannelLine[] = [];

      for (const ch of channels) {
        try {
          const data = await apiClient.get<StatsPoint[]>(
            `/api/projects/${projectId}/channels/${ch.id}/stats?days=${days}`
          );
          if (cancelled) return;

          if (data.length > 0) {
            const info = getPlatformInfo(ch.platform);
            results.push({
              channelId: ch.id,
              platform: ch.platform,
              channelName: ch.channelName,
              color: info?.color ?? "#6b7280",
              data,
            });
          }
        } catch {
          // skip channels that fail
        }
      }

      if (!cancelled) {
        setLines(results);
        setLoading(false);
      }
    }

    if (channels.length > 0) {
      fetchAll();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [projectId, channels, days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-gray-300"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">
          No snapshot data yet — data is collected daily.
        </p>
      </div>
    );
  }

  // Filter to visible channels
  const visibleLines = visibleChannelIds
    ? lines.filter((l) => visibleChannelIds.has(l.channelId))
    : lines;

  if (visibleLines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-300">
            <path d="M3 3l18 18M10.5 10.5a3 3 0 004.24 4.24M2 12s3.5-7 10-7c1.66 0 3.15.4 4.44 1.05M22 12s-3.5 7-10 7a9.94 9.94 0 01-4.44-1.05" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">
          No channels selected — toggle platforms in the filter.
        </p>
      </div>
    );
  }

  // Chart dimensions
  const W = 600;
  const H = 300;
  const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // Compute global min/max across visible lines
  const allPoints = visibleLines.flatMap((l) => l.data);
  const allTimes = allPoints.map((p) => new Date(p.recordedAt).getTime());
  const allCounts = allPoints.map((p) => p.followersCount);

  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);
  const minCount = Math.min(...allCounts);
  const maxCount = Math.max(...allCounts);

  const countRange = maxCount - minCount || 1;
  const yMin = Math.max(0, minCount - countRange * 0.1);
  const yMax = maxCount + countRange * 0.1;
  const timeRange = maxTime - minTime || 1;

  const scaleX = (t: number) => PAD.left + ((t - minTime) / timeRange) * plotW;
  const scaleY = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);

  const xTickCount = Math.min(5, allTimes.length);
  const xTicks = Array.from(
    { length: xTickCount },
    (_, i) => minTime + (timeRange * i) / (xTickCount - 1 || 1)
  );

  return (
    <div className="flex flex-col">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          {visibleLines.map((line) => {
            const rgb = hexToRgb(line.color);
            return (
              <linearGradient
                key={`grad-${line.channelId}`}
                id={`area-gradient-${line.channelId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={`rgb(${rgb.r},${rgb.g},${rgb.b})`}
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor={`rgb(${rgb.r},${rgb.g},${rgb.b})`}
                  stopOpacity="0.02"
                />
              </linearGradient>
            );
          })}
        </defs>

        {/* Y grid lines */}
        {yTicks.map((v, i) => (
          <g key={`y-${i}`}>
            <line
              x1={PAD.left}
              y1={scaleY(v)}
              x2={W - PAD.right}
              y2={scaleY(v)}
              stroke="#f3f4f6"
              strokeWidth={1}
              strokeDasharray={i === 0 ? undefined : "4 4"}
            />
            <text
              x={PAD.left - 10}
              y={scaleY(v)}
              textAnchor="end"
              dominantBaseline="central"
              className="fill-gray-400"
              fontSize={9}
            >
              {formatCount(Math.round(v))}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xTicks.map((t, i) => (
          <text
            key={`x-${i}`}
            x={scaleX(t)}
            y={H - 6}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize={9}
          >
            {formatDate(new Date(t).toISOString())}
          </text>
        ))}

        {/* Area fills + lines */}
        {visibleLines.map((line) => {
          const sortedData = [...line.data].sort(
            (a, b) =>
              new Date(a.recordedAt).getTime() -
              new Date(b.recordedAt).getTime()
          );

          // Area path
          const areaPath =
            `M${scaleX(new Date(sortedData[0].recordedAt).getTime())},${scaleY(sortedData[0].followersCount)}` +
            sortedData
              .slice(1)
              .map(
                (p) =>
                  `L${scaleX(new Date(p.recordedAt).getTime())},${scaleY(p.followersCount)}`
              )
              .join("") +
            `L${scaleX(new Date(sortedData[sortedData.length - 1].recordedAt).getTime())},${PAD.top + plotH}` +
            `L${scaleX(new Date(sortedData[0].recordedAt).getTime())},${PAD.top + plotH}Z`;

          // Line path
          const linePath =
            `M${scaleX(new Date(sortedData[0].recordedAt).getTime())},${scaleY(sortedData[0].followersCount)}` +
            sortedData
              .slice(1)
              .map(
                (p) =>
                  `L${scaleX(new Date(p.recordedAt).getTime())},${scaleY(p.followersCount)}`
              )
              .join("");

          return (
            <g key={line.channelId}>
              {/* Gradient area fill */}
              <path
                d={areaPath}
                fill={`url(#area-gradient-${line.channelId})`}
              />
              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke={line.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Data points */}
              {sortedData.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={scaleX(new Date(p.recordedAt).getTime())}
                    cy={scaleY(p.followersCount)}
                    r={6}
                    fill={line.color}
                    fillOpacity={0.1}
                  />
                  <circle
                    cx={scaleX(new Date(p.recordedAt).getTime())}
                    cy={scaleY(p.followersCount)}
                    r={3.5}
                    fill="white"
                    stroke={line.color}
                    strokeWidth={2}
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 justify-center mt-4 pt-3 border-t border-gray-100">
        {visibleLines.map((line) => (
          <div key={line.channelId} className="flex items-center gap-2">
            <span
              className="w-3 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: line.color }}
            />
            <span className="text-xs text-gray-500 font-medium">
              {line.channelName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
