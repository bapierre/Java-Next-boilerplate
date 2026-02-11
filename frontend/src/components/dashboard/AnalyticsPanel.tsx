"use client";

import { useState } from "react";
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
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header with tabs */}
        <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-b border-gray-100">
          <div className="flex">
            {(
              [
                { key: "growth", label: "Follower Growth", icon: GrowthIcon },
                { key: "radar", label: "Platform Reach", icon: RadarIcon },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-purple-700"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.icon active={activeTab === tab.key} />
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Left filter sidebar */}
          <div className="w-52 shrink-0 border-r border-gray-100 bg-gray-50/50 p-5 space-y-6">
            {/* Time range — growth tab only */}
            {activeTab === "growth" && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Time Range
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {TIME_RANGES.map((r) => (
                    <button
                      key={r.days}
                      onClick={() => setDays(r.days)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        days === r.days
                          ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                          : "bg-white text-gray-500 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
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
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Platforms
              </p>
              <div className="space-y-1">
                {/* All toggle */}
                <button
                  onClick={toggleAll}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    allVisible
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                      allVisible
                        ? "bg-purple-600 border-purple-600"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {allVisible && (
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  Select all
                </button>

                {channels.map((ch) => {
                  const info = getPlatformInfo(ch.platform);
                  const active = visibleIds.has(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                        active
                          ? "bg-white shadow-sm text-gray-700 border border-gray-100"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded border transition-colors`}
                        style={{
                          backgroundColor: active ? (info?.color ?? "#6b7280") : "white",
                          borderColor: active
                            ? (info?.color ?? "#6b7280")
                            : "#d1d5db",
                        }}
                      >
                        {active && (
                          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-opacity"
                        style={{
                          backgroundColor: info?.color ?? "#6b7280",
                          opacity: active ? 1 : 0.3,
                        }}
                      />
                      <span className="truncate">
                        {ch.channelName || info?.label || ch.platform}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart area */}
          <div className="flex-1 min-w-0 p-6">
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
      </div>
    </div>
  );
}

function GrowthIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`w-4 h-4 transition-colors ${active ? "text-purple-600" : "text-gray-400"}`}
    >
      <path
        d="M3 17l4-4 3 2 7-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7h3v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RadarIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`w-4 h-4 transition-colors ${active ? "text-purple-600" : "text-gray-400"}`}
    >
      <polygon
        points="10,2 17.66,6 17.66,14 10,18 2.34,14 2.34,6"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={active ? "currentColor" : "none"}
        fillOpacity={0.1}
      />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}
