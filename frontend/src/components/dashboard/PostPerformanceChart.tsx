"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { getPlatformInfo } from "./ChannelCatalog";

interface PostData {
  id: number;
  platform: string;
  channelName: string;
  title: string;
  postUrl: string | null;
  thumbnailUrl: string | null;
  publishedAt: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

type Metric = "likes" | "reach";
type ChartTab = "top" | "time" | "calendar";

interface PostPerformanceChartProps {
  projectId: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

export default function PostPerformanceChart({ projectId }: PostPerformanceChartProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<Metric>("likes");
  const [tab, setTab] = useState<ChartTab>("top");
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get<PostData[]>(`/api/projects/${projectId}/posts?days=${days}`)
      .then((data) => { if (!cancelled) { setPosts(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectId, days]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Post Performance
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-300">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No posts found in the last {days} days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        {/* Tab switcher */}
        <div className="flex items-center gap-1">
          {(
            [
              { key: "top" as const, label: "Top Posts" },
              { key: "time" as const, label: "Time of Day" },
              { key: "calendar" as const, label: "Calendar" },
            ]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                tab === t.key
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Time range */}
          <div className="flex gap-1">
            {([7, 14, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  days === d
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          {/* Metric toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["likes", "reach"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                  metric === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "reach" ? "Views" : "Likes"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {tab === "top" && <TopPostsChart posts={posts} metric={metric} />}
        {tab === "time" && <TimeOfDayChart posts={posts} metric={metric} />}
        {tab === "calendar" && <CalendarHeatmap posts={posts} metric={metric} days={days} />}
      </div>
    </div>
  );
}

// ─── Top Posts bar chart ─────────────────────────────────────────────────────

function TopPostsChart({ posts, metric }: { posts: PostData[]; metric: Metric }) {
  const getValue = (p: PostData) => (metric === "likes" ? p.likesCount : p.viewsCount);
  const sorted = [...posts].sort((a, b) => getValue(b) - getValue(a)).slice(0, 15);
  const maxValue = Math.max(...sorted.map(getValue), 1);

  return (
    <div className="space-y-2.5">
      {sorted.map((post) => {
        const value = getValue(post);
        const pct = (value / maxValue) * 100;
        const info = getPlatformInfo(post.platform);
        const color = info?.color ?? "#6b7280";

        return (
          <div key={post.id} className="group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm text-gray-800 truncate font-medium">
                      {post.title || "Untitled post"}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{formatDate(post.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {formatCount(value)}
                    </span>
                    {post.postUrl && (
                      <a href={post.postUrl} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-purple-600">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <path d="M6 3H3v10h10v-3" /><path d="M9 2h5v5" /><path d="M14 2L7 9" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: color, opacity: 0.7 }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {posts.length > 15 && (
        <p className="text-xs text-gray-400 text-center mt-4">Showing top 15 of {posts.length} posts</p>
      )}
    </div>
  );
}

// ─── Time of Day scatter chart ────────────────────────────────────────────────

function TimeOfDayChart({ posts, metric }: { posts: PostData[]; metric: Metric }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ post: PostData; px: number; py: number } | null>(null);

  const getValue = (p: PostData) => (metric === "likes" ? p.likesCount : p.viewsCount);

  const W = 560, H = 240;
  const PAD = { top: 20, right: 16, bottom: 36, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxValue = Math.max(...posts.map(getValue), 1);

  // Average per hour for background bars
  const hourBuckets: number[][] = Array.from({ length: 24 }, () => []);
  posts.forEach((p) => {
    hourBuckets[new Date(p.publishedAt).getHours()].push(getValue(p));
  });
  const hourAvg = hourBuckets.map((vals) =>
    vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  );

  const slotW = plotW / 24;
  const scaleX = (h: number, m = 0) => PAD.left + (h + m / 60) * slotW;
  const scaleY = (v: number) => PAD.top + plotH - (v / maxValue) * plotH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * maxValue));
  const platforms = [...new Set(posts.map((p) => p.platform))];

  function onHover(p: PostData) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const h = new Date(p.publishedAt).getHours();
    const m = new Date(p.publishedAt).getMinutes();
    const px = (scaleX(h, m) / W) * rect.width;
    const py = (scaleY(getValue(p)) / H) * rect.height;
    setTooltip({ post: p, px, py });
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        Each dot is a post. Bars show the average {metric === "likes" ? "likes" : "views"} per hour slot.
      </p>
      <div className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* Y grid + labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={scaleY(v)} x2={W - PAD.right} y2={scaleY(v)}
                stroke="#f3f4f6" strokeWidth={1} strokeDasharray={i === 0 ? undefined : "3 3"} />
              <text x={PAD.left - 8} y={scaleY(v)} textAnchor="end" dominantBaseline="central"
                fontSize={9} fill="#9ca3af">
                {formatCount(v)}
              </text>
            </g>
          ))}

          {/* Average bars */}
          {hourAvg.map((avg, h) =>
            avg === 0 ? null : (
              <rect key={h}
                x={scaleX(h) + 1} y={scaleY(avg)}
                width={slotW - 2} height={(avg / maxValue) * plotH}
                fill="#ddd6fe" fillOpacity={0.55} rx={2}
              />
            )
          )}

          {/* Baseline */}
          <line x1={PAD.left} y1={PAD.top + plotH} x2={W - PAD.right} y2={PAD.top + plotH}
            stroke="#e5e7eb" strokeWidth={1} />

          {/* Post dots */}
          {posts.map((p) => {
            const d = new Date(p.publishedAt);
            const cx = scaleX(d.getHours(), d.getMinutes());
            const cy = scaleY(getValue(p));
            const color = getPlatformInfo(p.platform)?.color ?? "#6b7280";
            const hovered = tooltip?.post.id === p.id;
            return (
              <g key={p.id}
                onMouseEnter={() => onHover(p)}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: p.postUrl ? "pointer" : "default" }}
                onClick={() => p.postUrl && window.open(p.postUrl, "_blank", "noopener,noreferrer")}
              >
                {/* Invisible hit area */}
                <circle cx={cx} cy={cy} r={10} fill="transparent" />
                {/* Glow ring on hover */}
                {hovered && <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.15} />}
                <circle cx={cx} cy={cy} r={hovered ? 5.5 : 4.5}
                  fill={color} stroke="white" strokeWidth={1.5} fillOpacity={hovered ? 1 : 0.82} />
              </g>
            );
          })}

          {/* X labels every 3 hours */}
          {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
            <text key={h} x={scaleX(h)} y={H - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {formatHour(h)}
            </text>
          ))}
        </svg>

        {tooltip && (
          <div className="absolute z-10 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[210px]"
            style={{ left: tooltip.px, top: tooltip.py - 58, transform: "translateX(-50%)" }}>
            <div className="font-medium truncate">{tooltip.post.title || "Untitled"}</div>
            <div className="text-gray-300 mt-0.5">
              {new Date(tooltip.post.publishedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              {" · "}
              {formatCount(getValue(tooltip.post))} {metric === "likes" ? "likes" : "views"}
            </div>
          </div>
        )}
      </div>

      {/* Platform legend */}
      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
        {platforms.map((platform) => {
          const info = getPlatformInfo(platform);
          return (
            <div key={platform} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info?.color ?? "#6b7280" }} />
              <span className="text-xs text-gray-500">{info?.label ?? platform}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Calendar heatmap ─────────────────────────────────────────────────────────

function CalendarHeatmap({ posts, metric, days }: { posts: PostData[]; metric: Metric; days: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ date: string; value: number; px: number; py: number } | null>(null);

  const getValue = (p: PostData) => (metric === "likes" ? p.likesCount : p.viewsCount);

  // Total metric per day
  const dayTotals: Record<string, number> = {};
  posts.forEach((p) => {
    const day = p.publishedAt.substring(0, 10);
    dayTotals[day] = (dayTotals[day] ?? 0) + getValue(p);
  });
  const maxDay = Math.max(...Object.values(dayTotals), 1);

  // Date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - (days - 1));

  // Align grid start to Monday
  const dow = rangeStart.getDay(); // 0=Sun
  const toMonday = (dow + 6) % 7;
  const gridStart = new Date(rangeStart);
  gridStart.setDate(rangeStart.getDate() - toMonday);

  function toKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // Build weeks (column = week, row = day Mon…Sun)
  type Cell = { date: Date; key: string; inRange: boolean };
  const weeks: Cell[][] = [];
  const cur = new Date(gridStart);
  while (cur <= today) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cur);
      week.push({ date, key: toKey(date), inRange: date >= rangeStart && date <= today });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const CELL = 28, GAP = 4, LEFT = 30, TOP = 22;
  const svgW = LEFT + weeks.length * (CELL + GAP) - GAP;
  const svgH = TOP + 7 * (CELL + GAP) - GAP;
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Month labels where the month changes
  const monthLabels: { x: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      monthLabels.push({
        x: LEFT + wi * (CELL + GAP),
        label: week[0].date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
  });

  function cellColor(key: string, inRange: boolean): string {
    if (!inRange) return "#f9fafb";
    const val = dayTotals[key] ?? 0;
    if (val === 0) return "#f3f4f6";
    const t = val / maxDay;
    // #ede9fe → #6d28d9
    const r = Math.round(237 - t * (237 - 109));
    const g = Math.round(233 - t * (233 - 40));
    const b = Math.round(254 - t * (254 - 217));
    return `rgb(${r},${g},${b})`;
  }

  const todayKey = toKey(today);

  function onCellHover(cell: Cell, wi: number, di: number) {
    if (!cell.inRange || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cellX = LEFT + wi * (CELL + GAP) + CELL / 2;
    const cellY = TOP + di * (CELL + GAP);
    const px = (cellX / svgW) * rect.width;
    const py = (cellY / svgH) * rect.height;
    setTooltip({ date: cell.key, value: dayTotals[cell.key] ?? 0, px, py });
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        Total {metric === "likes" ? "likes" : "views"} per day — darker = more engagement.
      </p>
      <div className="relative overflow-x-auto">
        <svg ref={svgRef} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full"
          style={{ minWidth: `${Math.min(svgW, 480)}px` }}>
          {/* Day labels (Mon, Wed, Fri only to avoid crowding) */}
          {DAY_NAMES.map((name, di) =>
            di % 2 === 0 ? (
              <text key={di} x={LEFT - 4} y={TOP + di * (CELL + GAP) + CELL / 2}
                textAnchor="end" dominantBaseline="central" fontSize={9} fill="#9ca3af">
                {name}
              </text>
            ) : null
          )}

          {/* Month labels */}
          {monthLabels.map((ml, i) => (
            <text key={i} x={ml.x} y={12} textAnchor="start" fontSize={9} fontWeight={500} fill="#6b7280">
              {ml.label}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((cell, di) => {
              const x = LEFT + wi * (CELL + GAP);
              const y = TOP + di * (CELL + GAP);
              const val = dayTotals[cell.key] ?? 0;
              const isToday = cell.key === todayKey;
              const textDark = val > maxDay * 0.5;

              return (
                <g key={`${wi}-${di}`}>
                  <rect x={x} y={y} width={CELL} height={CELL} rx={4}
                    fill={cellColor(cell.key, cell.inRange)}
                    stroke={isToday ? "#7c3aed" : cell.inRange ? "#e5e7eb" : "none"}
                    strokeWidth={isToday ? 1.5 : 0.5}
                    onMouseEnter={() => onCellHover(cell, wi, di)}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: cell.inRange ? "default" : "default" }}
                  />
                  {cell.inRange && (
                    <text x={x + CELL / 2} y={y + CELL / 2}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={9} fill={textDark ? "white" : "#9ca3af"}
                      style={{ pointerEvents: "none" }}>
                      {cell.date.getDate()}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>

        {tooltip && (
          <div className="absolute z-10 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
            style={{ left: tooltip.px, top: tooltip.py - 8, transform: "translate(-50%, -100%)" }}>
            <div className="font-medium">
              {new Date(tooltip.date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
              })}
            </div>
            <div className="text-gray-300 mt-0.5">
              {tooltip.value > 0
                ? `${formatCount(tooltip.value)} ${metric === "likes" ? "likes" : "views"}`
                : "No posts"}
            </div>
          </div>
        )}
      </div>

      {/* Color scale */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Less</span>
        <div className="flex gap-0.5">
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((t, i) => {
            const r = Math.round(237 - t * (237 - 109));
            const g = Math.round(233 - t * (233 - 40));
            const b = Math.round(254 - t * (254 - 217));
            return (
              <div key={i} className="w-4 h-4 rounded-sm border border-gray-100"
                style={{ backgroundColor: t === 0 ? "#f3f4f6" : `rgb(${r},${g},${b})` }} />
            );
          })}
        </div>
        <span className="text-xs text-gray-400">More</span>
        <span className="ml-auto text-xs text-gray-400 tabular-nums">
          max {formatCount(maxDay)} / day
        </span>
      </div>
    </div>
  );
}
