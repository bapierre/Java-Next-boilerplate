"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getPlatformInfo } from "./ChannelCatalog";

interface RadarDataPoint {
  platform: string;
  label: string;
  value: number;
  targetFraction: number;
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

const SHORT_LABELS: Record<string, string> = {
  twitter: "X",
};

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

const ANIM_DURATION = 400;

export default function RadarChart({ channels, visibleChannelIds }: RadarChartProps) {
  // Build data for all channels (axes always visible)
  const allData = channels
    .map((ch) => {
      const info = getPlatformInfo(ch.platform);
      if (!info) return null;
      const visible = !visibleChannelIds || visibleChannelIds.has(ch.id);
      return {
        platform: ch.platform,
        label: ch.channelName || (SHORT_LABELS[ch.platform] ?? info.label),
        value: ch.followerCount ?? 0,
        targetFraction: visible ? 1 : 0,
        color: info.color,
      };
    })
    .filter((d): d is RadarDataPoint => d !== null);

  if (allData.length < 3) {
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
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="22" y1="8.5" x2="2" y2="15.5" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">
          Connect at least 3 platforms to see the radar chart.
        </p>
      </div>
    );
  }

  return <AnimatedRadar data={allData} />;
}

function AnimatedRadar({ data }: { data: RadarDataPoint[] }) {
  const N = data.length;
  const cx = 300;
  const cy = 240;
  const maxRadius = 140;
  const labelRadius = maxRadius + 40;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const gridLevels = 4;

  // Animated fractions (0 = collapsed to center, 1 = full value)
  const [fractions, setFractions] = useState<number[]>(() =>
    data.map((d) => d.targetFraction)
  );
  const animRef = useRef<number | null>(null);
  const startFractionsRef = useRef<number[]>(fractions);
  const startTimeRef = useRef<number>(0);

  const targetFractions = data.map((d) => d.targetFraction);

  const animate = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const t = Math.min(elapsed / ANIM_DURATION, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    const next = startFractionsRef.current.map(
      (from, i) => from + (targetFractions[i] - from) * ease
    );
    setFractions(next);

    if (t < 1) {
      animRef.current = requestAnimationFrame(animate);
    }
  }, [targetFractions]);

  useEffect(() => {
    startFractionsRef.current = fractions;
    startTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFractions.join(",")]);

  const angleFor = (i: number) => (i * 2 * Math.PI) / N - Math.PI / 2;

  const pointAt = (i: number, fraction: number) => ({
    x: cx + maxRadius * fraction * Math.cos(angleFor(i)),
    y: cy + maxRadius * fraction * Math.sin(angleFor(i)),
  });

  // Grid polygons
  const gridPolygons = Array.from({ length: gridLevels }, (_, level) => {
    const fraction = (level + 1) / gridLevels;
    return Array.from({ length: N }, (_, i) => {
      const p = pointAt(i, fraction);
      return `${p.x},${p.y}`;
    }).join(" ");
  });

  // Data polygon using animated fractions
  const dataPoints = data.map((d, i) => {
    const valueFraction = maxValue > 0 ? d.value / maxValue : 0;
    const animatedFraction = Math.max(valueFraction * fractions[i], 0.02);
    return pointAt(i, animatedFraction);
  });
  const dataPath =
    "M" +
    dataPoints.map((p) => `${p.x},${p.y}`).join("L") +
    "Z";

  // Label positions
  const labels = data.map((d, i) => ({
    ...d,
    x: cx + labelRadius * Math.cos(angleFor(i)),
    y: cy + labelRadius * Math.sin(angleFor(i)),
    dimmed: fractions[i] < 0.5,
  }));

  // Grid level labels
  const gridLabels = Array.from({ length: gridLevels }, (_, level) => {
    const fraction = (level + 1) / gridLevels;
    return {
      value: Math.round(maxValue * fraction),
      y: cy - maxRadius * fraction,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 600 480" className="w-full max-w-xl mx-auto">
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.05" />
          </radialGradient>
          <filter id="radar-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {gridPolygons.map((points, level) => (
          <polygon
            key={level}
            points={points}
            fill={level === 0 ? "rgba(249,250,251,0.5)" : "none"}
            stroke={level === gridLevels - 1 ? "#d1d5db" : "#e5e7eb"}
            strokeWidth={level === gridLevels - 1 ? 1 : 0.5}
            strokeDasharray={level < gridLevels - 1 ? "4 4" : undefined}
          />
        ))}

        {/* Grid level labels */}
        {gridLabels.map((g, i) => (
          <text
            key={i}
            x={cx + 4}
            y={g.y - 4}
            className="fill-gray-300"
            fontSize={9}
          >
            {formatFollowers(g.value)}
          </text>
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
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon fill + stroke */}
        <path
          d={dataPath}
          fill="url(#radar-fill)"
          stroke="rgba(147, 51, 234, 0.7)"
          strokeWidth={2}
          strokeLinejoin="round"
          filter="url(#radar-glow)"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => {
          const opacity = fractions[i];
          return (
            <g key={i}>
              {/* Outer glow ring */}
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                fill={data[i].color}
                fillOpacity={opacity * 0.15}
              />
              {/* Inner dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill={data[i].color}
                fillOpacity={Math.max(opacity, 0.2)}
                stroke="white"
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* Labels */}
        {labels.map((l, i) => {
          const angle = angleFor(i);
          const cos = Math.cos(angle);
          let anchor: "start" | "middle" | "end" = "middle";
          if (cos > 0.3) anchor = "start";
          else if (cos < -0.3) anchor = "end";

          return (
            <g
              key={i}
              opacity={l.dimmed ? 0.35 : 1}
              style={{ transition: "opacity 0.3s ease" }}
            >
              <text
                x={l.x}
                y={l.y - 7}
                textAnchor={anchor}
                dominantBaseline="central"
                className="fill-gray-700"
                fontSize={12}
                fontWeight={600}
              >
                {l.label}
              </text>
              <text
                x={l.x}
                y={l.y + 9}
                textAnchor={anchor}
                dominantBaseline="central"
                className="fill-gray-400"
                fontSize={10}
              >
                {l.value > 0 ? formatFollowers(l.value) : "No data"}
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={2.5} fill="#d1d5db" />
        <circle cx={cx} cy={cy} r={1} fill="white" />
      </svg>
    </div>
  );
}
