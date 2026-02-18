"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SeoCheckItem {
  id: string;
  category: string;
  label: string;
  status: "PASS" | "WARN" | "FAIL" | "INFO";
  detail: string | null;
  recommendation: string | null;
}

interface SeoAuditResponse {
  id: number;
  url: string;
  auditedAt: string;
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  checks: SeoCheckItem[];
}

const CATEGORY_ORDER = ["Content", "Technical", "Social", "Structured Data"];

const CATEGORY_ICONS: Record<string, string> = {
  Content:          "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  Technical:        "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  Social:           "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
  "Structured Data":"M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
};

// ── Score circle ──────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${filled} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="60" y="56" textAnchor="middle" fontSize="28" fontWeight="700" fill="#111827">
          {score}
        </text>
        <text x="60" y="72" textAnchor="middle" fontSize="11" fill="#9ca3af">
          / 100
        </text>
      </svg>
      <p className="text-xs font-medium mt-1" style={{ color }}>
        {score >= 75 ? "Good" : score >= 50 ? "Needs work" : "Poor"}
      </p>
    </div>
  );
}

// ── Status icon ───────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: SeoCheckItem["status"] }) {
  if (status === "PASS") return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
  if (status === "WARN") return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
      <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
      </svg>
    </span>
  );
  if (status === "FAIL") return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
      <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  );
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
      <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
      </svg>
    </span>
  );
}

// ── Single check row ──────────────────────────────────────────────────────────

function CheckRow({ check }: { check: SeoCheckItem }) {
  const [open, setOpen] = useState(false);
  const hasRec = !!check.recommendation;

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        check.status === "FAIL" ? "border-red-100 bg-red-50/40" :
        check.status === "WARN" ? "border-amber-100 bg-amber-50/30" :
        check.status === "PASS" ? "border-green-100 bg-green-50/20" :
        "border-blue-100 bg-blue-50/20"
      }`}
    >
      <div
        className={`flex items-start gap-3 ${hasRec ? "cursor-pointer" : ""}`}
        onClick={() => hasRec && setOpen((o) => !o)}
      >
        <StatusIcon status={check.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">{check.label}</p>
            {hasRec && (
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
          {check.detail && (
            <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
          )}
        </div>
      </div>
      {open && check.recommendation && (
        <div className="mt-2 ml-8 text-xs text-gray-600 bg-white/70 rounded-md px-3 py-2 border border-gray-100">
          <span className="font-medium text-gray-700">How to fix: </span>
          {check.recommendation}
        </div>
      )}
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────────

function CategorySection({ name, checks }: { name: string; checks: SeoCheckItem[] }) {
  const pass = checks.filter((c) => c.status === "PASS").length;
  const total = checks.filter((c) => c.status !== "INFO").length;
  const iconPath = CATEGORY_ICONS[name];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {iconPath && (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        )}
        <h4 className="text-sm font-semibold text-gray-700">{name}</h4>
        {total > 0 && (
          <span className="ml-auto text-xs text-gray-400">{pass}/{total} passed</span>
        )}
      </div>
      <div className="space-y-2">
        {checks.map((c) => <CheckRow key={c.id} check={c} />)}
      </div>
    </div>
  );
}

// ── Countdown helper ──────────────────────────────────────────────────────────

function useCountdown(seconds: number | null) {
  const [remaining, setRemaining] = useState<number | null>(seconds);

  useEffect(() => {
    setRemaining(seconds);
    if (seconds === null || seconds <= 0) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  return remaining;
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function SeoBoard({
  projectId,
  websiteUrl,
  onScoreChange,
}: {
  projectId: number;
  websiteUrl: string | null;
  onScoreChange?: (score: number | null) => void;
}) {
  const [loading, setLoading]         = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [result, setResult]           = useState<SeoAuditResponse | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);

  const countdown = useCountdown(rateLimitSeconds);
  const canRefresh = !loading && (countdown === null || countdown <= 0);

  const loadLatest = useCallback(async () => {
    if (!websiteUrl) { setInitialLoading(false); return; }
    try {
      const data = await apiClient.get<SeoAuditResponse>(`/api/projects/${projectId}/seo/audit`);
      if (data) {
        setResult(data);
        onScoreChange?.(data.score);
      }
    } catch (err: unknown) {
      console.error("Failed to load SEO audit", err);
    } finally {
      setInitialLoading(false);
    }
  }, [projectId, websiteUrl, onScoreChange]);

  useEffect(() => { loadLatest(); }, [loadLatest]);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<SeoAuditResponse>(
        `/api/projects/${projectId}/seo/audit`,
        {}
      );
      setResult(data);
      setRateLimitSeconds(null);
      onScoreChange?.(data.score);
    } catch (err: unknown) {
      const anyErr = err as { status?: number; secondsLeft?: number; message?: string };
      if (anyErr?.status === 429) {
        setRateLimitSeconds(anyErr.secondsLeft ?? 900);
        setError(null);
      } else {
        setError(anyErr?.message ?? "Audit failed — make sure the website is publicly accessible.");
      }
    } finally {
      setLoading(false);
    }
  };

  const byCategory = result
    ? CATEGORY_ORDER.reduce<Record<string, SeoCheckItem[]>>((acc, cat) => {
        acc[cat] = result.checks.filter((c) => c.category === cat);
        return acc;
      }, {})
    : null;

  // ── No website URL configured ──────────────────────────────────────────────
  if (!websiteUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="w-10 h-10 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <p className="text-sm font-medium text-gray-600">No website URL set</p>
        <p className="text-xs text-gray-400 mt-1">
          Edit this project and add a website URL to enable SEO audits.
        </p>
      </div>
    );
  }

  // ── Initial loading ────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 truncate max-w-xs">{websiteUrl}</p>
          {result && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last audited {new Date(result.auditedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={runAudit}
            disabled={!canRefresh}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Auditing…
              </span>
            ) : countdown !== null && countdown > 0 ? (
              `Refresh in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
            ) : result ? (
              "Refresh Audit"
            ) : (
              "Run Audit"
            )}
          </Button>
          {countdown !== null && countdown > 0 && (
            <p className="text-[10px] text-gray-400">Rate limit: 1 audit / 15 min</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty state — no audit yet */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
          <svg className="w-10 h-10 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm">Click "Run Audit" to analyse your website</p>
          <p className="text-xs mt-1">We check 16 factors across content, technical, social and structured data</p>
        </div>
      )}

      {/* Results */}
      {result && byCategory && (
        <div className="space-y-8">
          {/* Score header */}
          <div className="flex items-center gap-8 bg-white border border-gray-100 rounded-2xl p-6">
            <ScoreCircle score={result.score} />
            <div className="flex-1">
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-sm font-semibold text-gray-800">{result.passCount}</span>
                  <span className="text-xs text-gray-400">passed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="text-sm font-semibold text-gray-800">{result.warnCount}</span>
                  <span className="text-xs text-gray-400">warnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span className="text-sm font-semibold text-gray-800">{result.failCount}</span>
                  <span className="text-xs text-gray-400">failed</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Click any warning or failure for a recommended fix
              </p>
            </div>
          </div>

          {/* Category sections */}
          {CATEGORY_ORDER.map((cat) =>
            byCategory[cat]?.length ? (
              <CategorySection key={cat} name={cat} checks={byCategory[cat]} />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
