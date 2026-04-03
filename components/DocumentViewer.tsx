"use client";

import type { BrainEntry } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentViewerProps {
  entry: BrainEntry;
  onClose: () => void;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  journal: { label: "Journal", color: "var(--accent-yellow)" },
  project: { label: "Project", color: "var(--accent-blue)" },
  area: { label: "Area", color: "var(--accent-green)" },
  resource: { label: "Resource", color: "var(--accent-purple)" },
  general: { label: "General", color: "var(--text-muted)" },
};

export function DocumentViewer({ entry, onClose }: DocumentViewerProps) {
  const catInfo = categoryLabels[entry.category || "general"] || categoryLabels.general;

  return (
    <div className="w-96 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 animate-slide-right">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">📄</span>
          <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
            {entry.title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 shrink-0"
          title="Close"
        >
          <svg
            width="14"
            height="14"
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

      {/* Metadata bar */}
      <div className="px-4 py-2 border-b border-[var(--border-color)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <span
          className="px-2 py-0.5 rounded-full border"
          style={{
            borderColor: catInfo.color,
            color: catInfo.color,
          }}
        >
          {catInfo.label}
        </span>
        <span className="text-[var(--text-muted)]">
          {entry.path}
        </span>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
