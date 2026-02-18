"use client";

import { useEffect, useState } from "react";
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
  contactedAt: string;
}

const PLATFORMS = ["TWITTER", "LINKEDIN", "INSTAGRAM", "TIKTOK", "YOUTUBE", "OTHER"];

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

function KanbanColumn({
  title,
  status,
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
}

// ── Outreach card ─────────────────────────────────────────────────────────────

function OutreachCard({
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
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PLATFORM_COLORS[card.platform] ?? "bg-gray-500 text-white"}`}
            >
              {card.platform === "TWITTER" ? "X" : card.platform.charAt(0) + card.platform.slice(1).toLowerCase()}
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
}

// ── New contact modal ─────────────────────────────────────────────────────────

function NewContactModal({
  projectId,
  templates,
  onSave,
  onClose,
}: {
  projectId: number;
  templates: OutreachTemplate[];
  onSave: (outreach: ColdOutreach) => void;
  onClose: () => void;
}) {
  const [platform, setPlatform] = useState("TWITTER");
  const [handle, setHandle] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [templateId, setTemplateId] = useState<number | "">("");
  const [messageSent, setMessageSent] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateChange = (id: string) => {
    const tid = id === "" ? "" : Number(id);
    setTemplateId(tid);
    if (tid !== "") {
      const t = templates.find((t) => t.id === tid);
      if (t) setMessageSent(t.content);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const result = await apiClient.post<ColdOutreach>(
        `/api/projects/${projectId}/outreach`,
        {
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
          <h2 className="font-semibold text-gray-900">New Contact</h2>
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
              <select
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">— No template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
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
              {saving ? "Saving..." : "Add Contact"}
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
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleDelete = async (id: number) => {
    await apiClient.delete(`/api/projects/${projectId}/outreach/templates/${id}`);
    onTemplatesChange(templates.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-gray-900">Message Templates</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name (e.g. Partnership pitch)"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Hey [name], I saw your work on..."
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <Button type="submit" size="sm" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Template"}
            </Button>
          </form>

          {templates.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500">Saved templates</p>
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {t.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs text-red-400 hover:text-red-600 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function ColdOutreachBoard({ projectId }: { projectId: number }) {
  const [outreaches, setOutreaches] = useState<ColdOutreach[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
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

  const moveStatus = async (id: number, status: "ONGOING" | "SUCCESS" | "FAIL") => {
    const updated = await apiClient.patch<ColdOutreach>(
      `/api/projects/${projectId}/outreach/${id}/status`,
      { status }
    );
    setOutreaches((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const handleCreated = (outreach: ColdOutreach) => {
    setOutreaches((prev) => [outreach, ...prev]);
    setShowNew(false);
  };

  const handleUpdated = (updated: ColdOutreach) => {
    setOutreaches((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedCard(updated);
  };

  const handleDeleted = (id: number) => {
    setOutreaches((prev) => prev.filter((o) => o.id !== id));
  };

  const ongoing = outreaches.filter((o) => o.status === "ONGOING");
  const success = outreaches.filter((o) => o.status === "SUCCESS");
  const fail    = outreaches.filter((o) => o.status === "FAIL");

  const total       = outreaches.length;
  const successRate = total > 0 ? Math.round((success.length / total) * 100) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats + actions bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{total} total</span>
          {successRate !== null && (
            <span className="text-green-600 font-medium">{successRate}% success rate</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
          >
            Templates
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)}>
            + New Contact
          </Button>
        </div>
      </div>

      {/* Kanban */}
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

      {/* Modals */}
      {showNew && (
        <NewContactModal
          projectId={projectId}
          templates={templates}
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
