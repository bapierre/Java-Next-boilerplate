"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConnectedChannel {
  id: number;
  platform: string;
  channelName: string;
  isActive: boolean;
  followerCount?: number | null;
  linked?: boolean;
  sourceProjectName?: string | null;
}

interface LinkableChannel {
  id: number;
  platform: string;
  channelName: string;
  followerCount?: number | null;
  sourceProjectName?: string | null;
}

interface PlatformInfo {
  key: string;
  label: string;
  color: string;
  icon: (className?: string) => React.ReactNode;
}

const PLATFORMS: PlatformInfo[] = [
  {
    key: "tiktok",
    label: "TikTok",
    color: "#00f2ea",
    icon: (cls = "w-8 h-8") => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.18 8.18 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    color: "#E4405F",
    icon: (cls = "w-8 h-8") => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    color: "#FF0000",
    icon: (cls = "w-8 h-8") => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    color: "#000000",
    icon: (cls = "w-8 h-8") => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: (cls = "w-8 h-8") => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export function getPlatformInfo(key: string) {
  return PLATFORMS.find((p) => p.key === key);
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

// ─── Connected sources strip (shown at top of project page) ───

interface ConnectedSourcesProps {
  projectId: number;
  channels: ConnectedChannel[];
  onOpenModal: () => void;
  onChannelChange: () => void;
}

export function ConnectedSources({
  channels,
  onOpenModal,
  onChannelChange,
}: ConnectedSourcesProps) {
  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-white px-5 py-4">
        <p className="text-gray-400 text-sm">No channels connected yet.</p>
        <Button size="sm" onClick={onOpenModal}>
          Connect a platform
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {channels.map((ch) => {
        const platform = getPlatformInfo(ch.platform);
        if (!platform) return null;
        return (
          <div
            key={ch.id}
            className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5"
          >
            <div style={{ color: platform.color }}>
              {platform.icon("w-5 h-5")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                {ch.channelName}
                {ch.linked && (
                  <span className="text-blue-500 font-normal ml-1 text-xs">
                    (linked)
                  </span>
                )}
                {!ch.isActive && !ch.linked && (
                  <span className="text-gray-400 font-normal ml-1 text-xs">
                    (pending)
                  </span>
                )}
              </p>
              {ch.followerCount != null ? (
                <p className="text-xs text-gray-500">
                  {formatFollowers(ch.followerCount)} followers
                </p>
              ) : (
                <p className="text-xs text-gray-400">{platform.label}</p>
              )}
            </div>
          </div>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenModal}
        className="shrink-0"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 mr-1.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Connect platform
      </Button>
    </div>
  );
}

// ─── Connect platform modal ───

interface ConnectModalProps {
  projectId: number;
  connectedChannels: ConnectedChannel[];
  onChannelChange: () => void;
  onClose: () => void;
}

export function ConnectPlatformModal({
  projectId,
  connectedChannels,
  onChannelChange,
  onClose,
}: ConnectModalProps) {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(
    null
  );
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
  const [linkableChannels, setLinkableChannels] = useState<LinkableChannel[]>([]);
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [linkableLoading, setLinkableLoading] = useState(true);

  // Fetch linkable channels on mount
  useEffect(() => {
    setLinkableLoading(true);
    apiClient
      .get<LinkableChannel[]>(`/api/projects/${projectId}/linkable-channels`)
      .then((d) => { if (d) setLinkableChannels(d); })
      .catch((err) => console.error("Failed to fetch linkable channels:", err))
      .finally(() => setLinkableLoading(false));
  }, [projectId]);

  const getConnectedChannels = (platformKey: string) =>
    connectedChannels.filter((ch) => ch.platform === platformKey);

  const handleConnect = async (platformKey: string) => {
    setConnectingPlatform(platformKey);
    try {
      const data = await apiClient.get<{ authorizationUrl: string }>(
        `/api/channels/oauth/${platformKey}/authorize?projectId=${projectId}`
      );
      if (data) window.location.href = data.authorizationUrl;
    } catch (err) {
      console.error("Failed to start OAuth flow:", err);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (channelId: number, isLinked: boolean) => {
    setDisconnectingId(channelId);
    try {
      if (isLinked) {
        await apiClient.delete(
          `/api/projects/${projectId}/linked-channels/${channelId}`
        );
      } else {
        await apiClient.delete(
          `/api/projects/${projectId}/channels/${channelId}`
        );
      }
      onChannelChange();
    } catch (err) {
      console.error("Failed to disconnect channel:", err);
    } finally {
      setDisconnectingId(null);
    }
  };

  const refreshLinkable = async () => {
    const updated = await apiClient.get<LinkableChannel[]>(
      `/api/projects/${projectId}/linkable-channels`
    );
    if (updated) setLinkableChannels(updated);
  };

  const handleLink = async (channelId: number) => {
    setLinkingId(channelId);
    try {
      await apiClient.post(`/api/projects/${projectId}/channels/link`, {
        channelId,
      });
      onChannelChange();
      await refreshLinkable();
    } catch (err) {
      console.error("Failed to link channel:", err);
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Connect a platform
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
          {PLATFORMS.map((platform) => {
            const channels = getConnectedChannels(platform.key);
            const hasChannels = channels.length > 0;
            return (
              <div
                key={platform.key}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-4">
                  <div style={{ color: platform.color }}>
                    {platform.icon("w-8 h-8")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">
                      {platform.label}
                    </p>
                    {!hasChannels && (
                      <p className="text-xs text-gray-400">Not connected</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={hasChannels ? "outline" : "default"}
                    onClick={() => handleConnect(platform.key)}
                    disabled={connectingPlatform === platform.key}
                    className="shrink-0"
                  >
                    {connectingPlatform === platform.key
                      ? "Connecting..."
                      : hasChannels
                        ? "Add Account"
                        : "Connect"}
                  </Button>
                </div>
                {hasChannels && (
                  <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                    {channels.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600 truncate">
                          {ch.channelName}
                          {ch.linked && (
                            <span className="text-blue-500 ml-1 text-xs">
                              (linked)
                            </span>
                          )}
                          {!ch.isActive && !ch.linked && (
                            <span className="text-gray-400 ml-1">
                              (pending)
                            </span>
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(ch.id, !!ch.linked)}
                          disabled={disconnectingId === ch.id}
                          className="text-gray-400 hover:text-red-600 h-7 px-2 text-xs"
                        >
                          {disconnectingId === ch.id
                            ? "..."
                            : ch.linked
                              ? "Unlink"
                              : "Disconnect"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {/* Link from other projects */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Link from your other projects
            </p>
            {linkableLoading ? (
              <p className="text-xs text-gray-400 py-2">Loading…</p>
            ) : linkableChannels.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                No other channels available to link. Connect a platform to
                another project first.
              </p>
            ) : (
              <div className="space-y-2">
                {linkableChannels.map((ch) => {
                  const platform = getPlatformInfo(ch.platform);
                  return (
                    <div
                      key={ch.id}
                      className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-3"
                    >
                      {platform && (
                        <div style={{ color: platform.color }}>
                          {platform.icon("w-6 h-6")}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">
                          {ch.channelName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {ch.sourceProjectName
                            ? `from ${ch.sourceProjectName}`
                            : platform?.label}
                          {ch.followerCount != null &&
                            ` · ${formatFollowers(ch.followerCount)} followers`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLink(ch.id)}
                        disabled={linkingId === ch.id}
                        className="shrink-0 text-xs h-7 px-3"
                      >
                        {linkingId === ch.id ? "..." : "Link"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Legacy default export for backwards compat ───

interface ChannelCatalogProps {
  projectId: number;
  connectedChannels: ConnectedChannel[];
  onChannelChange: () => void;
}

export default function ChannelCatalog(props: ChannelCatalogProps) {
  return (
    <ConnectPlatformModal
      {...props}
      onClose={() => {}}
    />
  );
}
