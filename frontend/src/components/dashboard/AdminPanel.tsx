"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/app/dashboard/admin/page";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function adminFetch(path: string, method: string, body?: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res;
}

export default function AdminPanel({
  initialUsers,
}: {
  initialUsers: AdminUser[];
}) {
  const [tab, setTab] = useState<"users" | "sync">("users");
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [syncedUsers, setSyncedUsers] = useState<Set<number>>(new Set());
  const [syncing, setSyncing] = useState<Set<number>>(new Set());
  const [globalSyncState, setGlobalSyncState] = useState<
    "idle" | "queued" | "error"
  >("idle");

  const handleUserSync = async (userId: number) => {
    setSyncing((s) => new Set(s).add(userId));
    try {
      const res = await adminFetch(`/api/admin/users/${userId}/sync`, "POST");
      if (res.ok || res.status === 202) {
        setSyncedUsers((s) => new Set(s).add(userId));
      }
    } finally {
      setSyncing((s) => {
        const next = new Set(s);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleToggleAdmin = async (user: AdminUser) => {
    const newValue = !user.isAdmin;
    const res = await adminFetch(`/api/admin/users/${user.id}/admin`, "PATCH", {
      isAdmin: newValue,
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isAdmin: newValue } : u))
      );
    }
  };

  const handleGlobalSync = async () => {
    setGlobalSyncState("idle");
    const res = await adminFetch("/api/admin/sync", "POST");
    if (res.ok || res.status === 202) {
      setGlobalSyncState("queued");
    } else {
      setGlobalSyncState("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">
              {users.length} users registered
            </p>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Back to dashboard
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(["users", "sync"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "users" ? "Users" : "Sync"}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {tab === "users" && (
          <Card className="bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Admin</th>
                      <th className="px-4 py-3 text-right">Projects</th>
                      <th className="px-4 py-3 text-right">Channels</th>
                      <th className="px-4 py-3">Last Sync</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {user.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              user.isAdmin
                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {user.isAdmin ? "Admin" : "User"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {user.projectCount}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {user.channelCount}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs" suppressHydrationWarning>
                          {user.lastSyncedAt
                            ? new Date(user.lastSyncedAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs" suppressHydrationWarning>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              syncing.has(user.id) || syncedUsers.has(user.id)
                            }
                            onClick={() => handleUserSync(user.id)}
                          >
                            {syncing.has(user.id)
                              ? "..."
                              : syncedUsers.has(user.id)
                              ? "Queued ✓"
                              : "Sync"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync tab */}
        {tab === "sync" && (
          <Card className="bg-white max-w-md">
            <CardHeader>
              <CardTitle className="text-gray-900">Global Sync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Trigger a sync for all active channels across all users. This
                runs asynchronously in the background.
              </p>
              <Button
                onClick={handleGlobalSync}
                disabled={globalSyncState === "queued"}
              >
                {globalSyncState === "queued"
                  ? "Queued ✓"
                  : "Sync All Channels"}
              </Button>
              {globalSyncState === "error" && (
                <p className="text-sm text-red-600">
                  Sync failed. Check backend logs.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
