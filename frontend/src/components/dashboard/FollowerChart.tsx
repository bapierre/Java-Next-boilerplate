"use client";

import { useEffect, useState, useRef } from "react";
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

interface PostMarker {
  id: number;
  platform: string;
  channelName: string;
  title: string;
  postUrl: string | null;
  publishedAt: string;
  viewsCount: number;
  likesCount: number;
  color: string;
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
  const [posts, setPosts] = useState<PostMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPost, setHoveredPost] = useState<PostMarker | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      const results: ChannelLine[] = [];

      // Build a map of platform -> color for post markers
      const platformColorMap = new Map<string, { color: string; channelName: string }>();

      for (const ch of channels) {
        try {
          const data = await apiClient.get<StatsPoint[]>(
            `/api/projects/${projectId}/channels/${ch.id}/stats?days=${days}`
          );
          if (cancelled) return;

          const info = getPlatformInfo(ch.platform);
          const color = info?.color ?? "#6b7280";
          platformColorMap.set(ch.platform, { color, channelName: ch.channelName });

          if (data.length > 0) {
            results.push({
              channelId: ch.id,
              platform: ch.platform,
              channelName: ch.channelName,
              color,
              data,
            });
          }
        } catch {
          // skip channels that fail
        }
      }

      // Fetch posts for the project
      let postMarkers: PostMarker[] = [];
      try {
        const postData = await apiClient.get<{
          id: number;
          platform: string;
          channelName: string;
          title: string;
          postUrl: string | null;
          publishedAt: string;
          viewsCount: number;
          likesCount: number;
        }[]>(`/api/projects/${projectId}/posts?days=${days}`);
        if (cancelled) return;

        postMarkers = postData.map((p) => ({
          ...p,
          color: platformColorMap.get(p.platform)?.color ?? getPlatformInfo(p.platform)?.color ?? "#6b7280",
        }));
      } catch {
        // posts fetch failed — still show chart without markers
      }

      if (!cancelled) {
        setLines(results);
        setPosts(postMarkers);
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

  // Filter posts to only visible platforms
  const visiblePlatforms = new Set(visibleLines.map((l) => l.platform));
  const visiblePosts = posts.filter((p) => visiblePlatforms.has(p.platform));

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

  // Chart dimensions — increased bottom padding for post marker band
  const W = 600;
  const MARKER_BAND = visiblePosts.length > 0 ? 24 : 0;
  const H = 300 + MARKER_BAND;
  const PAD = { top: 20, right: 20, bottom: 40 + MARKER_BAND, left: 60 };
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

  // Marker band Y position (below plot, above x-axis labels)
  const markerY = PAD.top + plotH + 16;

  function handleMarkerHover(post: PostMarker, e: React.MouseEvent) {
    setHoveredPost(post);
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }

  function handleMarkerLeave() {
    setHoveredPost(null);
    setTooltipPos(null);
  }

  function handleMarkerClick(post: PostMarker) {
    if (post.postUrl) {
      window.open(post.postUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full">
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

          {/* Post markers */}
          {visiblePosts.map((post) => {
            const postTime = new Date(post.publishedAt).getTime();
            // Skip posts outside the time range
            if (postTime < minTime || postTime > maxTime) return null;

            const x = scaleX(postTime);
            const isHovered = hoveredPost?.id === post.id;

            return (
              <g
                key={`post-${post.id}`}
                style={{ cursor: post.postUrl ? "pointer" : "default" }}
                onMouseEnter={(e) => handleMarkerHover(post, e)}
                onMouseLeave={handleMarkerLeave}
                onClick={() => handleMarkerClick(post)}
              >
                {/* Vertical dashed line from marker up to plot area */}
                <line
                  x1={x}
                  y1={markerY}
                  x2={x}
                  y2={PAD.top + plotH}
                  stroke={post.color}
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  opacity={isHovered ? 0.6 : 0.25}
                />
                {/* Diamond marker (rotated square) */}
                <rect
                  x={x - 4}
                  y={markerY - 4}
                  width={8}
                  height={8}
                  fill={isHovered ? post.color : post.color}
                  fillOpacity={isHovered ? 1 : 0.8}
                  stroke="white"
                  strokeWidth={1.5}
                  transform={`rotate(45 ${x} ${markerY})`}
                />
                {/* Larger invisible hit area */}
                <rect
                  x={x - 8}
                  y={markerY - 8}
                  width={16}
                  height={16}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPost && tooltipPos && (
          <div
            className="absolute z-10 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[220px]"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 70}px`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-medium truncate">
              {hoveredPost.title || "Untitled post"}
            </div>
            <div className="flex items-center gap-2 mt-1 text-gray-300">
              <span className="capitalize">{hoveredPost.platform}</span>
              {hoveredPost.viewsCount > 0 && (
                <span>{formatCount(hoveredPost.viewsCount)} views</span>
              )}
              {hoveredPost.likesCount > 0 && (
                <span>{formatCount(hoveredPost.likesCount)} likes</span>
              )}
            </div>
          </div>
        )}
      </div>

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
