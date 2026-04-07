"use client";

import { useState } from "react";
import type { BrainEntry } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentViewerProps {
  entry: BrainEntry;
  onClose: () => void;
  onSave?: () => void;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  journal: { label: "Journal", color: "var(--accent-yellow)" },
  project: { label: "Project", color: "var(--accent-primary)" },
  area: { label: "Area", color: "var(--accent-green)" },
  resource: { label: "Resource", color: "var(--accent-primary)" },
  general: { label: "General", color: "var(--text-muted)" },
};

export function DocumentViewer({ entry, onClose, onSave }: DocumentViewerProps) {
  const catInfo = categoryLabels[entry.category || "general"] || categoryLabels.general;
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/brain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: entry.path, content: editContent }),
      });
      if (res.ok) {
        entry.content = editContent;
        setEditing(false);
        onSave?.();
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(entry.content);
    setEditing(false);
  };

  return (
    <div className="w-full md:w-96 absolute md:relative inset-0 md:inset-auto z-20 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 animate-slide-right">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Doc</span>
          <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
            {entry.title}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Edit toggle */}
          {!editing && (
            <button
              onClick={() => { setEditContent(entry.content); setEditing(true); }}
              className="w-7 h-7 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-150"
              title="Edit"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          )}
          {/* Close */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
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

      {/* Content / Editor */}
      {editing ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 w-full px-4 py-4 bg-transparent text-sm text-[var(--text-primary)] resize-none outline-none font-mono leading-relaxed"
            style={{ caretColor: "var(--accent-primary)" }}
            autoFocus
          />
          <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || editContent === entry.content}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-primary-text)] text-xs font-medium disabled:opacity-40 transition-opacity"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {entry.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
