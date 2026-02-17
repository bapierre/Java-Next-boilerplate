"use client";

import { useEffect, useState } from "react";
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

export default function PostPerformanceChart({
  projectId,
}: PostPerformanceChartProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<Metric>("likes");
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiClient
      .get<PostData[]>(`/api/projects/${projectId}/posts?days=${days}`)
      .then((data) => {
        if (!cancelled) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-gray-300"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">
            No posts found in the last {days} days.
          </p>
        </div>
      </div>
    );
  }

  // Sort posts by selected metric, descending
  const getValue = (p: PostData) =>
    metric === "likes" ? p.likesCount : p.viewsCount;

  const sorted = [...posts]
    .sort((a, b) => getValue(b) - getValue(a))
    .slice(0, 15); // Top 15

  const maxValue = Math.max(...sorted.map(getValue), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PostIcon />
          <span className="text-sm font-medium text-gray-700">
            Post Performance
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex gap-1">
            {([7, 14, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  days === d
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {/* Metric toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setMetric("likes")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                metric === "likes"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Likes
            </button>
            <button
              onClick={() => setMetric("reach")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                metric === "reach"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Reach
            </button>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="p-6">
        <div className="space-y-2.5">
          {sorted.map((post) => {
            const value = getValue(post);
            const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const info = getPlatformInfo(post.platform);
            const color = info?.color ?? "#6b7280";

            return (
              <div key={post.id} className="group">
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )}
                  </div>

                  {/* Post info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-800 truncate font-medium">
                          {post.title || "Untitled post"}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatCount(value)}
                        </span>
                        {post.postUrl && (
                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-purple-600"
                            title="View post"
                          >
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M6 3H3v10h10v-3" />
                              <path d="M9 2h5v5" />
                              <path d="M14 2L7 9" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(pct, 1)}%`,
                          backgroundColor: color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {posts.length > 15 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Showing top 15 of {posts.length} posts
          </p>
        )}
      </div>
    </div>
  );
}

function PostIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4 text-purple-600"
    >
      <rect
        x="2"
        y="3"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 8h8M6 11h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
