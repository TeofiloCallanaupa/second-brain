"use client";

import { useEffect, useState } from "react";

interface ActionLog {
  id: number;
  action: string;
  toolName: string;
  riskLevel: string;
  status: string;
  inputSummary: string | null;
  outputSummary: string | null;
  createdAt: string;
}

const riskColors: Record<string, string> = {
  low: "var(--accent-green)",
  medium: "var(--accent-yellow)",
  high: "var(--accent-orange)",
  critical: "var(--accent-red)",
};

const statusIcons: Record<string, string> = {
  success: "✓",
  failed: "✗",
  pending_approval: "…",
  denied: "—",
};

interface ActionLogModalProps {
  onClose: () => void;
}

export function ActionLogModal({ onClose }: ActionLogModalProps) {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/actions");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        }
      } catch (err) {
        console.error("Failed to fetch action logs:", err);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">Logs</span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Action Logs
            </h2>
            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
              {logs.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              No actions logged yet. Start chatting to see action logs here.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--border-glow)] transition-colors duration-150"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{
                          color: riskColors[log.riskLevel] || "var(--text-muted)",
                          backgroundColor: `color-mix(in srgb, ${riskColors[log.riskLevel] || "var(--text-muted)"} 15%, transparent)`,
                        }}
                      >
                        {log.riskLevel}
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {log.toolName}
                      </span>
                      <span className="text-xs">
                        {statusIcons[log.status] || ""}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.inputSummary && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {log.inputSummary}
                    </p>
                  )}
                  {log.outputSummary && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      → {log.outputSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
