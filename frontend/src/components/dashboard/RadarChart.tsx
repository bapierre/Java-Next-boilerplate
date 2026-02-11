"use client";

import { getPlatformInfo } from "./ChannelCatalog";

interface RadarDataPoint {
  platform: string;
  label: string;
  value: number;
  color: string;
}

interface RadarChartProps {
  channels: {
    id: number;
    platform: string;
    channelName: string;
    followerCount?: number | null;
  }[];
  visibleChannelIds?: Set<number>;
}

// Short labels to avoid clipping in the chart
const SHORT_LABELS: Record<string, string> = {
  twitter: "X",
};

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function RadarChart({ channels, visibleChannelIds }: RadarChartProps) {
  // Filter to visible channels if specified
  const filteredChannels = visibleChannelIds
    ? channels.filter((ch) => visibleChannelIds.has(ch.id))
    : channels;

  // Each connected channel gets its own axis
  const data: RadarDataPoint[] = filteredChannels
    .map((ch) => {
      const info = getPlatformInfo(ch.platform);
      if (!info) return null;
      return {
        platform: ch.platform,
        label: ch.channelName || (SHORT_LABELS[ch.platform] ?? info.label),
        value: ch.followerCount ?? 0,
        color: info.color,
      };
    })
    .filter((d): d is RadarDataPoint => d !== null);

  if (data.length < 3) {
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
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="22" y1="8.5" x2="2" y2="15.5" />
          <line x1="2" y1="8.5" x2="22" y2="15.5" />
        </svg>
        <p className="text-gray-400 text-sm">
          Connect at least 3 platforms to see the radar chart.
        </p>
      </div>
    );
  }

  const N = data.length;
  const cx = 300;
  const cy = 240;
  const maxRadius = 140;
  const labelRadius = maxRadius + 35;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const gridLevels = 4;

  // Angle for each axis (start from top, go clockwise)
  const angleFor = (i: number) => (i * 2 * Math.PI) / N - Math.PI / 2;

  // Point on axis at given fraction (0–1) of maxRadius
  const pointAt = (i: number, fraction: number) => ({
    x: cx + maxRadius * fraction * Math.cos(angleFor(i)),
    y: cy + maxRadius * fraction * Math.sin(angleFor(i)),
  });

  // Grid polygons
  const gridPolygons = Array.from({ length: gridLevels }, (_, level) => {
    const fraction = (level + 1) / gridLevels;
    const points = Array.from({ length: N }, (_, i) => {
      const p = pointAt(i, fraction);
      return `${p.x},${p.y}`;
    }).join(" ");
    return points;
  });

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const fraction = maxValue > 0 ? d.value / maxValue : 0;
    return pointAt(i, Math.max(fraction, 0.05)); // min 5% so zero isn't invisible
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Label positions
  const labels = data.map((d, i) => ({
    ...d,
    x: cx + labelRadius * Math.cos(angleFor(i)),
    y: cy + labelRadius * Math.sin(angleFor(i)),
  }));

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 600 480" className="w-full max-w-xl mx-auto">
        {/* Grid */}
        {gridPolygons.map((points, level) => (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={level === gridLevels - 1 ? 1.5 : 0.75}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const p = pointAt(i, 1);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#e5e7eb"
              strokeWidth={0.75}
            />
          );
        })}

        {/* Data polygon fill */}
        <polygon
          points={dataPolygon}
          fill="rgba(147, 51, 234, 0.15)"
          stroke="rgba(147, 51, 234, 0.8)"
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={data[i].color}
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Labels */}
        {labels.map((l, i) => {
          // Determine text anchor based on position
          const angle = angleFor(i);
          const cos = Math.cos(angle);
          let anchor: "start" | "middle" | "end" = "middle";
          if (cos > 0.3) anchor = "start";
          else if (cos < -0.3) anchor = "end";

          return (
            <g key={i}>
              <text
                x={l.x}
                y={l.y - 6}
                textAnchor={anchor}
                dominantBaseline="central"
                className="fill-gray-700"
                fontSize={13}
                fontWeight={600}
              >
                {l.label}
              </text>
              <text
                x={l.x}
                y={l.y + 10}
                textAnchor={anchor}
                dominantBaseline="central"
                className="fill-gray-400"
                fontSize={11}
              >
                {l.value > 0 ? formatFollowers(l.value) : "No data"}
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={2} fill="#d1d5db" />
      </svg>
    </div>
  );
}
