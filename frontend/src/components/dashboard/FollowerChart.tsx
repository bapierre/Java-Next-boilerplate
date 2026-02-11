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
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10 text-gray-300 mb-3"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-400 text-sm">
          No channels selected — toggle platforms in the filter to see data.
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

  // Add 10% padding to Y range
  const countRange = maxCount - minCount || 1;
  const yMin = Math.max(0, minCount - countRange * 0.1);
  const yMax = maxCount + countRange * 0.1;
  const timeRange = maxTime - minTime || 1;

  const scaleX = (t: number) => PAD.left + ((t - minTime) / timeRange) * plotW;
  const scaleY = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  // Y-axis ticks (4 levels)
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);

  // X-axis ticks — pick ~5 evenly spaced dates
  const xTickCount = Math.min(5, allTimes.length);
  const xTicks = Array.from(
    { length: xTickCount },
    (_, i) => minTime + (timeRange * i) / (xTickCount - 1 || 1)
  );

  return (
    <div className="flex flex-col">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Y grid lines */}
        {yTicks.map((v, i) => (
          <g key={`y-${i}`}>
            <line
              x1={PAD.left}
              y1={scaleY(v)}
              x2={W - PAD.right}
              y2={scaleY(v)}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
            <text
              x={PAD.left - 8}
              y={scaleY(v)}
              textAnchor="end"
              dominantBaseline="central"
              className="fill-gray-400"
              fontSize={10}
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
            y={H - 8}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize={10}
          >
            {formatDate(new Date(t).toISOString())}
          </text>
        ))}

        {/* Lines */}
        {visibleLines.map((line) => {
          const points = line.data
            .map((p) => {
              const x = scaleX(new Date(p.recordedAt).getTime());
              const y = scaleY(p.followersCount);
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <g key={line.channelId}>
              <polyline
                points={points}
                fill="none"
                stroke={line.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {line.data.map((p, i) => (
                <circle
                  key={i}
                  cx={scaleX(new Date(p.recordedAt).getTime())}
                  cy={scaleY(p.followersCount)}
                  r={3}
                  fill={line.color}
                  stroke="white"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-3">
        {visibleLines.map((line) => (
          <div key={line.channelId} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: line.color }}
            />
            <span className="text-xs text-gray-600">{line.channelName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
