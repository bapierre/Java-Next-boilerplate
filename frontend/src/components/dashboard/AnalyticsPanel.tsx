"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getPlatformInfo } from "./ChannelCatalog";
import RadarChart from "./RadarChart";
import FollowerChart from "./FollowerChart";

interface Channel {
  id: number;
  platform: string;
  channelName: string;
  channelUrl: string | null;
  isActive: boolean;
  followerCount?: number | null;
  lastSyncedAt: string | null;
}

interface AnalyticsPanelProps {
  projectId: number;
  channels: Channel[];
}

type Tab = "growth" | "radar";

const TIME_RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

export default function AnalyticsPanel({
  projectId,
  channels,
}: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("growth");
  const [days, setDays] = useState(30);
  const [visibleIds, setVisibleIds] = useState<Set<number>>(
    () => new Set(channels.map((ch) => ch.id))
  );

  const toggleChannel = (id: number) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allVisible = visibleIds.size === channels.length;
  const toggleAll = () => {
    if (allVisible) {
      setVisibleIds(new Set());
    } else {
      setVisibleIds(new Set(channels.map((ch) => ch.id)));
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        Analytics
      </h3>
      <Card className="bg-white border-gray-200">
        <CardContent className="py-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("growth")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "growth"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Follower Growth
            </button>
            <button
              onClick={() => setActiveTab("radar")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "radar"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Platform Reach
            </button>
          </div>

          <div className="flex gap-6">
            {/* Left filters */}
            <div className="w-48 shrink-0 space-y-5">
              {/* Time range (growth tab only) */}
              {activeTab === "growth" && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Time Range
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_RANGES.map((r) => (
                      <button
                        key={r.days}
                        onClick={() => setDays(r.days)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          days === r.days
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform toggles */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Platforms
                </p>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={allVisible}
                      onChange={toggleAll}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-500 group-hover:text-gray-700">
                      All
                    </span>
                  </label>
                  {channels.map((ch) => {
                    const info = getPlatformInfo(ch.platform);
                    return (
                      <label
                        key={ch.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={visibleIds.has(ch.id)}
                          onChange={() => toggleChannel(ch.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: info?.color ?? "#6b7280" }}
                        />
                        <span className="text-xs text-gray-600 group-hover:text-gray-900 truncate">
                          {ch.channelName || info?.label || ch.platform}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart area */}
            <div className="flex-1 min-w-0">
              {activeTab === "growth" ? (
                <FollowerChart
                  projectId={projectId}
                  channels={channels}
                  days={days}
                  visibleChannelIds={visibleIds}
                />
              ) : (
                <RadarChart
                  channels={channels}
                  visibleChannelIds={visibleIds}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
