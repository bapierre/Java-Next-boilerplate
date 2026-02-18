"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OutreachTemplate {
  id: number;
  name: string;
  content: string;
}

interface ColdOutreach {
  id: number;
  platform: string;
  handle: string;
  profileUrl: string | null;
  templateId: number | null;
  messageSent: string | null;
  notes: string | null;
  status: "ONGOING" | "SUCCESS" | "FAIL";
  type: "WARM" | "COLD";
  contactedAt: string;
}

const PLATFORMS = ["TWITTER", "LINKEDIN", "INSTAGRAM", "TIKTOK", "OTHER"];

const PLATFORM_LABELS: Record<string, string> = {
  TWITTER: "X / Twitter",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  OTHER: "Other",
};

const PLATFORM_COLORS: Record<string, string> = {
  TWITTER: "bg-black text-white",
  LINKEDIN: "bg-blue-600 text-white",
  INSTAGRAM: "bg-pink-500 text-white",
  TIKTOK: "bg-gray-900 text-white",
  YOUTUBE: "bg-red-600 text-white",
  OTHER: "bg-gray-500 text-white",
};

// ── Kanban column ─────────────────────────────────────────────────────────────

const KanbanColumn = memo(function KanbanColumn({
  title,
  cards,
  onMove,
  onDelete,
  onCardClick,
  color,
}: {
  title: string;
  status: "ONGOING" | "SUCCESS" | "FAIL";
  cards: ColdOutreach[];
  onMove: (id: number, status: "ONGOING" | "SUCCESS" | "FAIL") => void;
  onDelete: (id: number) => void;
  onCardClick: (card: ColdOutreach) => void;
  color: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-3 px-1`}>
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[120px]">
        {cards.map((card) => (
          <OutreachCard
            key={card.id}
            card={card}
            onMove={onMove}
            onDelete={onDelete}
            onClick={() => onCardClick(card)}
          />
        ))}
        {cards.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg h-20 flex items-center justify-center">
            <span className="text-xs text-gray-400">Empty</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Outreach card ─────────────────────────────────────────────────────────────

const OutreachCard = memo(function OutreachCard({
  card,
  onMove,
  onDelete,
  onClick,
}: {
  card: ColdOutreach;
  onMove: (id: number, status: "ONGOING" | "SUCCESS" | "FAIL") => void;
  onDelete: (id: number) => void;
  onClick: () => void;
}) {
  const date = new Date(card.contactedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className="bg-white border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PLATFORM_COLORS[card.platform] ?? "bg-gray-500 text-white"}`}
            >
              {card.platform === "TWITTER" ? "X" : card.platform.charAt(0) + card.platform.slice(1).toLowerCase()}
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                card.type === "WARM"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {card.type === "WARM" ? "Warm" : "Cold"}
            </span>
            <span className="text-sm font-medium text-gray-900 truncate">
              @{card.handle}
            </span>
          </div>
          <span className="text-xs text-gray-400 shrink-0">{date}</span>
        </div>
        {card.notes && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{card.notes}</p>
        )}
        {card.status === "ONGOING" && (
          <div className="flex gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onMove(card.id, "SUCCESS")}
              className="flex-1 text-xs py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
            >
              ✓ Success
            </button>
            <button
              onClick={() => onMove(card.id, "FAIL")}
              className="flex-1 text-xs py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
            >
              ✗ Fail
            </button>
          </div>
        )}
        {card.status !== "ONGOING" && (
          <div className="flex justify-end mt-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onMove(card.id, "ONGOING")}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Reopen
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ── New outreach modal ────────────────────────────────────────────────────────

function NewContactModal({
  projectId,
  templates,
  outreaches,
  onSave,
  onClose,
}: {
  projectId: number;
  templates: OutreachTemplate[];
  outreaches: ColdOutreach[];
  onSave: (outreach: ColdOutreach) => void;
  onClose: () => void;
}) {
  const [outreachType, setOutreachType] = useState<"COLD" | "WARM">("COLD");
  const [platform, setPlatform] = useState("TWITTER");
  const [handle, setHandle] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [templateId, setTemplateId] = useState<number | "">("");
  const [messageSent, setMessageSent] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateChange = (id: number | "") => {
    setTemplateId(id);
    if (id !== "") {
      const t = templates.find((t) => t.id === id);
      if (t) setMessageSent(t.content);
    }
  };

  // Precompute success rates for all templates in one pass over outreaches
  const successRateMap = useMemo(() => {
    const counts = new Map<number, { success: number; resolved: number }>();
    for (const o of outreaches) {
      if (o.templateId == null || o.status === "ONGOING") continue;
      const entry = counts.get(o.templateId) ?? { success: 0, resolved: 0 };
      entry.resolved++;
      if (o.status === "SUCCESS") entry.success++;
      counts.set(o.templateId, entry);
    }
    const result = new Map<number, { resolved: number; rate: number | null }>();
    for (const t of templates) {
      const c = counts.get(t.id);
      if (!c || c.resolved === 0) {
        result.set(t.id, { resolved: 0, rate: null });
      } else {
        result.set(t.id, { resolved: c.resolved, rate: Math.round((c.success / c.resolved) * 100) });
      }
    }
    return result;
  }, [outreaches, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const result = await apiClient.post<ColdOutreach>(
        `/api/projects/${projectId}/outreach`,
        {
          type: outreachType,
          platform,
          handle: handle.trim().replace(/^@/, ""),
          profileUrl: profileUrl || null,
          templateId: templateId === "" ? null : templateId,
          messageSent: messageSent || null,
          notes: notes || null,
        }
      );
      onSave(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">New Outreach</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {/* Warm / Cold toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["COLD", "WARM"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOutreachType(t)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  outreachType === t
                    ? t === "COLD"
                      ? "bg-sky-500 text-white"
                      : "bg-amber-400 text-white"
                    : "bg-white text-gray-400 hover:bg-gray-50"
                }`}
              >
                {t === "COLD" ? "❄ Cold outreach" : "🔥 Warm outreach"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Profile URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://x.com/username"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {templates.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Template <span className="text-gray-400">(optional)</span>
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                <button
                  type="button"
                  onClick={() => handleTemplateChange("")}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    templateId === ""
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  — No template —
                </button>
                {templates.map((t) => {
                  const { resolved, rate } = successRateMap.get(t.id) ?? { resolved: 0, rate: null };
                  const benchmark = BENCHMARKS[outreachType][platform] ?? BENCHMARKS[outreachType]["OTHER"];
                  const badgeClass = rate === null ? "" : (() => {
                    const ratio = rate / benchmark;
                    if (ratio >= 1.5)  return "bg-green-200 text-green-800";
                    if (ratio >= 1.15) return "bg-green-100 text-green-700";
                    if (ratio >= 0.85) return "bg-yellow-100 text-yellow-700";
                    if (ratio >= 0.6)  return "bg-orange-100 text-orange-700";
                    return "bg-red-100 text-red-600";
                  })();
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTemplateChange(t.id)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2 ${
                        templateId === t.id
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate font-medium">{t.name}</span>
                      {rate !== null ? (
                        <span className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full ${badgeClass}`}>
                          {rate}% ({resolved})
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs text-gray-400">No data</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Message sent <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={messageSent}
              onChange={(e) => setMessageSent(e.target.value)}
              rows={3}
              placeholder="Hey, I saw your work on..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Context, follow-up ideas..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Add Outreach"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Card detail modal ─────────────────────────────────────────────────────────

function CardDetailModal({
  card,
  projectId,
  onUpdate,
  onDelete,
  onClose,
}: {
  card: ColdOutreach;
  projectId: number;
  onUpdate: (updated: ColdOutreach) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(card.notes ?? "");
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const updated = await apiClient.patch<ColdOutreach>(
        `/api/projects/${projectId}/outreach/${card.id}/status`,
        { status: card.status, notes }
      );
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete outreach for @${card.handle}?`)) return;
    await apiClient.delete(`/api/projects/${projectId}/outreach/${card.id}`);
    onDelete(card.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PLATFORM_COLORS[card.platform] ?? "bg-gray-500 text-white"}`}
            >
              {card.platform === "TWITTER" ? "X" : card.platform.charAt(0) + card.platform.slice(1).toLowerCase()}
            </span>
            <span className="font-semibold text-gray-900">@{card.handle}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {card.profileUrl && (
            <a
              href={card.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline"
            >
              {card.profileUrl}
            </a>
          )}
          {card.messageSent && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Message sent</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                {card.messageSent}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
            <Button size="sm" onClick={saveNotes} disabled={saving}>
              {saving ? "Saving..." : "Save notes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Template manager ──────────────────────────────────────────────────────────

function nextVersionName(name: string): string {
  const match = name.match(/^(.*?)\s+v(\d+)$/i);
  if (match) return `${match[1]} v${parseInt(match[2]) + 1}`;
  return `${name} v2`;
}

function TemplateManager({
  projectId,
  templates,
  onTemplatesChange,
  onClose,
}: {
  projectId: number;
  templates: OutreachTemplate[];
  onTemplatesChange: (templates: OutreachTemplate[]) => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState<OutreachTemplate | null>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const isNew    = editing === null;
  const nextName = editing ? nextVersionName(name || editing.name) : "";

  const startEdit = (t: OutreachTemplate) => {
    setEditing(t);
    setName(t.name);
    setContent(t.content);
  };

  const cancelEdit = () => {
    setEditing(null);
    setName("");
    setContent("");
  };

  // Create a brand-new template
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const created = await apiClient.post<OutreachTemplate>(
        `/api/projects/${projectId}/outreach/templates`,
        { name: name.trim(), content: content.trim() }
      );
      onTemplatesChange([created, ...templates]);
      setName("");
      setContent("");
    } finally {
      setSaving(false);
    }
  };

  // Overwrite the existing template in-place
  const handleUpdate = async () => {
    if (!editing || !name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const updated = await apiClient.put<OutreachTemplate>(
        `/api/projects/${projectId}/outreach/templates/${editing.id}`,
        { name: name.trim(), content: content.trim() }
      );
      onTemplatesChange(templates.map((t) => (t.id === updated.id ? updated : t)));
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  // Keep current template untouched, save edited content as a new versioned template
  const handleSaveAsVersion = async () => {
    if (!editing || !content.trim()) return;
    setSaving(true);
    try {
      const newName = nextVersionName(name.trim() || editing.name);
      const created = await apiClient.post<OutreachTemplate>(
        `/api/projects/${projectId}/outreach/templates`,
        { name: newName, content: content.trim() }
      );
      onTemplatesChange([created, ...templates]);
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    await apiClient.delete(`/api/projects/${projectId}/outreach/templates/${id}`);
    onTemplatesChange(templates.filter((t) => t.id !== id));
    if (editing?.id === id) cancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-gray-900">Message Templates</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — template list */}
          <div className="w-56 shrink-0 border-r border-gray-100 overflow-y-auto py-3">
            <button
              onClick={cancelEdit}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                isNew ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              + New template
            </button>
            {templates.length > 0 && (
              <div className="mt-1 border-t border-gray-100 pt-1">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => startEdit(t)}
                    className={`w-full text-left px-4 py-2.5 transition-colors ${
                      editing?.id === t.id
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{t.content}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — editor */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isNew ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Template name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Partnership pitch"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    placeholder="Hey [name], I saw your work on..."
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <Button type="submit" size="sm" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Template"}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Template name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleUpdate} disabled={saving} className="flex-1">
                    {saving ? "Saving..." : "Update"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveAsVersion}
                    disabled={saving}
                    className="flex-1"
                    title={`Save as ${nextName}`}
                  >
                    {saving ? "..." : `Save as ${nextName}`}
                  </Button>
                </div>
                <button
                  onClick={() => handleDelete(editing!.id)}
                  className="text-xs text-red-400 hover:text-red-600 text-center w-full"
                >
                  Delete this template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Template analytics chart ──────────────────────────────────────────────────

/**
 * Industry benchmarks: typical positive-response / success rate per platform.
 *
 * Cold sources:
 *  – LinkedIn: ~10% (Expandi "State of LinkedIn Outreach H1-2025", 10.3 avg reply rate)
 *  – Instagram: ~12% (Influencer Marketing Hub / Grin studies, 10-20% DM acceptance midpoint)
 *  – Twitter/X: ~5% (noisier DMs, lower receptiveness than LinkedIn)
 *  – TikTok: ~6% (newer platform, high noise)
 *  – YouTube: ~10% (business email in About section increases receptiveness)
 *  – Other: ~7%
 *
 * Warm sources:
 *  – Research consistently shows warm outreach performs ~2-3× cold across channels
 *  – LinkedIn: ~25% (Expandi warm-intent campaigns 22%+ approval + reply combined)
 *  – Instagram: ~30% (known contacts respond significantly better)
 *  – Twitter/X: ~18%, TikTok: ~20%, YouTube: ~25%, Other: ~20%
 */
const BENCHMARKS: Record<"COLD" | "WARM", Record<string, number>> = {
  COLD: { LINKEDIN: 10, INSTAGRAM: 12, TWITTER: 5, TIKTOK: 6, YOUTUBE: 10, OTHER: 7 },
  WARM: { LINKEDIN: 25, INSTAGRAM: 30, TWITTER: 18, TIKTOK: 20, YOUTUBE: 25, OTHER: 20 },
};

/** Absolute red→green gradient (used in ALL mode and for totals column) */
function absoluteCellStyle(rate: number, hasData: boolean): React.CSSProperties {
  if (!hasData) return { backgroundColor: "#f9fafb" };
  const r = Math.round(252 + (134 - 252) * (rate / 100));
  const g = Math.round(165 + (239 - 165) * (rate / 100));
  const b = Math.round(165 + (172 - 165) * (rate / 100));
  return { backgroundColor: `rgb(${r},${g},${b})` };
}

/** 5-tier coloring relative to an industry benchmark */
function benchmarkCellStyle(rate: number, benchmark: number): React.CSSProperties {
  const ratio = rate / benchmark;
  if (ratio >= 1.5)  return { backgroundColor: "#86efac" }; // far above  – deep green
  if (ratio >= 1.15) return { backgroundColor: "#bbf7d0" }; // above      – light green
  if (ratio >= 0.85) return { backgroundColor: "#fef9c3" }; // at avg     – yellow
  if (ratio >= 0.6)  return { backgroundColor: "#fed7aa" }; // below      – orange
  return                    { backgroundColor: "#fca5a5" }; // far below  – red
}

type OutreachTypeFilter = "ALL" | "COLD" | "WARM";

function TemplateAnalyticsChart({
  outreaches,
  templates,
}: {
  outreaches: ColdOutreach[];
  templates: OutreachTemplate[];
}) {
  const [typeFilter, setTypeFilter] = useState<OutreachTypeFilter>("ALL");

  const hasBenchmarks = typeFilter !== "ALL";

  // Only resolved outreaches that were sent with a template, filtered by type
  const resolved = useMemo(() => {
    return outreaches.filter(
      (o) =>
        o.templateId != null &&
        o.status !== "ONGOING" &&
        (typeFilter === "ALL" || o.type === typeFilter)
    );
  }, [outreaches, typeFilter]);

  // Platforms present in resolved data (ordered by PLATFORMS list)
  const activePlatforms = useMemo(
    () => PLATFORMS.filter((p) => resolved.some((o) => o.platform === p)),
    [resolved]
  );

  // Templates that have at least one resolved outreach
  const activeTemplates = useMemo(
    () => templates.filter((t) => resolved.some((o) => o.templateId === t.id)),
    [templates, resolved]
  );

  // Matrix: templateId → platform → { success, total }
  const matrix = useMemo(() => {
    const m = new Map<number, Map<string, { success: number; total: number }>>();
    for (const t of activeTemplates) m.set(t.id, new Map());
    for (const o of resolved) {
      if (o.templateId == null) continue;
      const tMap = m.get(o.templateId);
      if (!tMap) continue;
      const cell = tMap.get(o.platform) ?? { success: 0, total: 0 };
      cell.total++;
      if (o.status === "SUCCESS") cell.success++;
      tMap.set(o.platform, cell);
    }
    return m;
  }, [activeTemplates, resolved]);

  // Overall per-template totals with weighted benchmark, sorted by rate desc
  const ranked = useMemo(() => {
    return activeTemplates
      .map((t) => {
        let success = 0, total = 0;
        let bSum = 0, bTotal = 0;
        for (const [platform, cell] of (matrix.get(t.id) ?? new Map<string, {success:number;total:number}>()).entries()) {
          success += cell.success;
          total   += cell.total;
          if (hasBenchmarks) {
            const b = BENCHMARKS[typeFilter as "COLD" | "WARM"][platform] ?? BENCHMARKS[typeFilter as "COLD" | "WARM"]["OTHER"];
            bSum   += b * cell.total;
            bTotal += cell.total;
          }
        }
        const rate      = total  > 0 ? Math.round((success / total)  * 100) : 0;
        const benchmark = bTotal > 0 ? Math.round(bSum / bTotal) : null;
        return { template: t, success, total, rate, benchmark };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [activeTemplates, matrix, hasBenchmarks, typeFilter]);

  const typeFilterUI = (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
      {(["ALL", "COLD", "WARM"] as const).map((f) => (
        <button
          key={f}
          onClick={() => setTypeFilter(f)}
          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
            typeFilter === f
              ? f === "COLD"
                ? "bg-sky-500 text-white shadow-sm"
                : f === "WARM"
                ? "bg-amber-400 text-white shadow-sm"
                : "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {f === "ALL" ? "All" : f === "COLD" ? "❄ Cold" : "🔥 Warm"}
        </button>
      ))}
    </div>
  );

  if (activeTemplates.length === 0) {
    return (
      <div className="space-y-4">
        {typeFilterUI}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-gray-400">
            No resolved {typeFilter !== "ALL" ? typeFilter.toLowerCase() : ""} outreaches with templates yet.
          </p>
          <p className="text-xs text-gray-300 mt-1">Mark outreaches as Success or Fail to see analytics.</p>
        </div>
      </div>
    );
  }

  const maxRate = Math.max(...ranked.map((r) => r.rate), 1);

  return (
    <div className="space-y-8">
      {/* Type filter */}
      {typeFilterUI}

      {/* ── Ranked bar chart ── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Overall success rate by template</h4>
        {hasBenchmarks && (
          <p className="text-xs text-gray-400 mb-4">
            Dashed line = industry avg · delta shown vs weighted platform benchmark
          </p>
        )}
        <div className="space-y-2.5">
          {ranked.map(({ template, success, total, rate, benchmark }) => {
            const delta = benchmark != null ? rate - benchmark : null;
            const barStyle = benchmark != null
              ? benchmarkCellStyle(rate, benchmark)
              : absoluteCellStyle(rate, true);
            const benchmarkPct = benchmark != null
              ? Math.min((benchmark / maxRate) * 100, 100)
              : null;
            return (
              <div key={template.id} className="flex items-center gap-3">
                <span className="w-36 text-xs text-gray-600 truncate shrink-0 text-right" title={template.name}>
                  {template.name}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max((rate / maxRate) * 100, 4)}%`, ...barStyle }}
                  />
                  {/* Industry benchmark reference line */}
                  {benchmarkPct != null && (
                    <div
                      className="absolute top-1 bottom-1 w-px bg-gray-500/50"
                      style={{ left: `${benchmarkPct}%` }}
                    />
                  )}
                </div>
                <div className="w-36 shrink-0 flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-800">{rate}%</span>
                  <span className="text-xs text-gray-400">({success}/{total})</span>
                  {delta != null && (
                    <span
                      className={`text-[10px] font-bold ${
                        delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}{delta}pp
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Heatmap grid ── */}
      {activePlatforms.length >= 2 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Success rate by template × platform</h4>
          {hasBenchmarks && (
            <p className="text-xs text-gray-400 mb-4">
              Color = performance vs industry avg · delta shows percentage points difference
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="text-xs border-separate border-spacing-1 w-full">
              <thead>
                <tr>
                  <th className="text-left font-medium text-gray-400 pr-2 pb-1 w-36" />
                  {activePlatforms.map((p) => {
                    const bench = hasBenchmarks
                      ? BENCHMARKS[typeFilter as "COLD" | "WARM"][p] ?? null
                      : null;
                    return (
                      <th key={p} className="text-center font-medium text-gray-500 pb-1 px-1 min-w-[76px]">
                        <div>{PLATFORM_LABELS[p]}</div>
                        {bench != null && (
                          <div className="text-[10px] font-normal text-gray-400">~{bench}% avg</div>
                        )}
                      </th>
                    );
                  })}
                  <th className="text-center font-medium text-gray-500 pb-1 px-1 min-w-[68px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map(({ template, success: totalSuccess, total: totalTotal, rate: totalRate }) => {
                  const tMap = matrix.get(template.id)!;
                  return (
                    <tr key={template.id}>
                      <td
                        className="text-gray-600 pr-2 py-0.5 font-medium truncate max-w-[144px]"
                        title={template.name}
                      >
                        {template.name}
                      </td>
                      {activePlatforms.map((p) => {
                        const cell = tMap.get(p);
                        if (!cell || cell.total === 0) {
                          return (
                            <td
                              key={p}
                              className="text-center rounded-md px-2 py-2 text-gray-300"
                              style={{ backgroundColor: "#f9fafb" }}
                            >
                              —
                            </td>
                          );
                        }
                        const rate  = Math.round((cell.success / cell.total) * 100);
                        const bench = hasBenchmarks
                          ? (BENCHMARKS[typeFilter as "COLD" | "WARM"][p] ?? BENCHMARKS[typeFilter as "COLD" | "WARM"]["OTHER"])
                          : null;
                        const delta = bench != null ? rate - bench : null;
                        const style = bench != null
                          ? benchmarkCellStyle(rate, bench)
                          : absoluteCellStyle(rate, true);
                        return (
                          <td key={p} className="text-center rounded-md px-2 py-2" style={style}>
                            <div className="font-semibold text-gray-700">{rate}%</div>
                            <div className="text-[10px] text-gray-500">{cell.success}/{cell.total}</div>
                            {delta != null && (
                              <div className={`text-[10px] font-bold ${
                                delta > 0 ? "text-green-700" : delta < 0 ? "text-red-700" : "text-gray-500"
                              }`}>
                                {delta > 0 ? "+" : ""}{delta}pp
                              </div>
                            )}
                          </td>
                        );
                      })}
                      {/* Row total — always absolute coloring, no benchmark */}
                      <td
                        className="text-center rounded-md px-2 py-2 ring-1 ring-inset ring-black/5"
                        style={absoluteCellStyle(totalRate, true)}
                      >
                        <div className="font-semibold text-gray-700">{totalRate}%</div>
                        <div className="text-[10px] text-gray-500">{totalSuccess}/{totalTotal}</div>
                      </td>
                    </tr>
                  );
                })}
                {/* Column totals row */}
                <tr>
                  <td className="text-right text-gray-400 font-medium pr-2 pt-1">Your avg</td>
                  {activePlatforms.map((p) => {
                    let s = 0, t = 0;
                    for (const tMap of matrix.values()) {
                      const cell = tMap.get(p);
                      if (cell) { s += cell.success; t += cell.total; }
                    }
                    const rate  = t > 0 ? Math.round((s / t) * 100) : 0;
                    const bench = hasBenchmarks
                      ? (BENCHMARKS[typeFilter as "COLD" | "WARM"][p] ?? null)
                      : null;
                    const style = bench != null
                      ? benchmarkCellStyle(rate, bench)
                      : absoluteCellStyle(rate, t > 0);
                    return (
                      <td key={p} className="text-center rounded-md px-2 py-2 ring-1 ring-inset ring-black/5" style={style}>
                        {t > 0 ? (
                          <>
                            <div className="font-semibold text-gray-700">{rate}%</div>
                            <div className="text-[10px] text-gray-500">{s}/{t}</div>
                          </>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          {hasBenchmarks ? (
            <div className="flex items-center gap-3 mt-4 text-[10px] text-gray-500 flex-wrap">
              <span className="font-medium">vs industry avg:</span>
              {[
                { bg: "#fca5a5", label: "Far below (< 60%)" },
                { bg: "#fed7aa", label: "Below (60-85%)" },
                { bg: "#fef9c3", label: "At avg (85-115%)" },
                { bg: "#bbf7d0", label: "Above (115-150%)" },
                { bg: "#86efac", label: "Far above (> 150%)" },
              ].map(({ bg, label }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm shrink-0 inline-block" style={{ backgroundColor: bg }} />
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[10px] text-gray-400">0%</span>
              <div className="h-2.5 w-24 rounded-full" style={{ background: "linear-gradient(to right, rgb(252,165,165), rgb(134,239,172))" }} />
              <span className="text-[10px] text-gray-400">100%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function ColdOutreachBoard({ projectId }: { projectId: number }) {
  const [outreaches, setOutreaches] = useState<ColdOutreach[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"board" | "analytics">("board");
  const [showNew, setShowNew] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ColdOutreach | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<ColdOutreach[]>(`/api/projects/${projectId}/outreach`),
      apiClient.get<OutreachTemplate[]>(`/api/projects/${projectId}/outreach/templates`),
    ]).then(([o, t]) => {
      setOutreaches(o);
      setTemplates(t);
    }).finally(() => setLoading(false));
  }, [projectId]);

  const moveStatus = useCallback(async (id: number, status: "ONGOING" | "SUCCESS" | "FAIL") => {
    const updated = await apiClient.patch<ColdOutreach>(
      `/api/projects/${projectId}/outreach/${id}/status`,
      { status }
    );
    setOutreaches((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }, [projectId]);

  const handleCreated = useCallback((outreach: ColdOutreach) => {
    setOutreaches((prev) => [outreach, ...prev]);
    setShowNew(false);
  }, []);

  const handleUpdated = useCallback((updated: ColdOutreach) => {
    setOutreaches((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedCard(updated);
  }, []);

  const handleDeleted = useCallback((id: number) => {
    setOutreaches((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const { ongoing, success, fail } = useMemo(() => {
    const ongoing: ColdOutreach[] = [];
    const success: ColdOutreach[] = [];
    const fail:    ColdOutreach[] = [];
    for (const o of outreaches) {
      if (o.status === "ONGOING") ongoing.push(o);
      else if (o.status === "SUCCESS") success.push(o);
      else fail.push(o);
    }
    return { ongoing, success, fail };
  }, [outreaches]);

  const total       = outreaches.length;
  const successRate = useMemo(
    () => (total > 0 ? Math.round((success.length / total) * 100) : null),
    [success.length, total]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header: tabs + stats + actions */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Tab switcher */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 shrink-0">
          {(["board", "analytics"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium capitalize ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "board" ? "Board" : "Analytics"}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-gray-500 flex-1 min-w-0">
          <span className="shrink-0">{total} total</span>
          {successRate !== null && (
            <span className="text-green-600 font-medium shrink-0">{successRate}% success rate</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
            Templates
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)}>
            + New Outreach
          </Button>
        </div>
      </div>

      {/* Board view */}
      {tab === "board" && (
        <div className="flex gap-4">
          <KanbanColumn
            title="Ongoing"
            status="ONGOING"
            cards={ongoing}
            onMove={moveStatus}
            onDelete={handleDeleted}
            onCardClick={setSelectedCard}
            color="bg-blue-400"
          />
          <KanbanColumn
            title="Success"
            status="SUCCESS"
            cards={success}
            onMove={moveStatus}
            onDelete={handleDeleted}
            onCardClick={setSelectedCard}
            color="bg-green-400"
          />
          <KanbanColumn
            title="Fail"
            status="FAIL"
            cards={fail}
            onMove={moveStatus}
            onDelete={handleDeleted}
            onCardClick={setSelectedCard}
            color="bg-red-400"
          />
        </div>
      )}

      {/* Analytics view */}
      {tab === "analytics" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <TemplateAnalyticsChart outreaches={outreaches} templates={templates} />
        </div>
      )}

      {/* Modals */}
      {showNew && (
        <NewContactModal
          projectId={projectId}
          templates={templates}
          outreaches={outreaches}
          onSave={handleCreated}
          onClose={() => setShowNew(false)}
        />
      )}
      {showTemplates && (
        <TemplateManager
          projectId={projectId}
          templates={templates}
          onTemplatesChange={setTemplates}
          onClose={() => setShowTemplates(false)}
        />
      )}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          projectId={projectId}
          onUpdate={handleUpdated}
          onDelete={handleDeleted}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
