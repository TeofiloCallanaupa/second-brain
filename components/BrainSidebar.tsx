"use client";

import type { BrainEntry } from "@/lib/types";

interface BrainSidebarProps {
  entries: BrainEntry[];
  selectedPath: string | null;
  onSelectEntry: (entry: BrainEntry) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Category icons
const categoryIcons: Record<string, string> = {
  journal: "📓",
  project: "🚀",
  area: "🏠",
  resource: "📚",
  general: "📄",
};

// Build a tree structure from flat paths
interface TreeNode {
  name: string;
  fullPath: string;
  entry: BrainEntry | null;
  children: TreeNode[];
}

function buildTree(entries: BrainEntry[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const entry of entries) {
    const parts = entry.path.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = parts.slice(0, i + 1).join("/");
      let existing = currentLevel.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          fullPath,
          entry: i === parts.length - 1 ? entry : null,
          children: [],
        };
        currentLevel.push(existing);
      } else if (i === parts.length - 1) {
        existing.entry = entry;
      }

      currentLevel = existing.children;
    }
  }

  return root;
}

function TreeItem({
  node,
  selectedPath,
  onSelectEntry,
  depth = 0,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelectEntry: (entry: BrainEntry) => void;
  depth?: number;
}) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedPath === node.fullPath;
  const icon = node.entry
    ? categoryIcons[node.entry.category || "general"]
    : "📁";

  return (
    <div>
      <button
        onClick={() => node.entry && onSelectEntry(node.entry)}
        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors duration-150 ${
          isSelected
            ? "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
        } ${!node.entry ? "cursor-default" : "cursor-pointer"}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <span className="text-xs shrink-0">{icon}</span>
        <span className="truncate">{node.entry?.title || node.name}</span>
      </button>
      {hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.fullPath}
              node={child}
              selectedPath={selectedPath}
              onSelectEntry={onSelectEntry}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BrainSidebar({
  entries,
  selectedPath,
  onSelectEntry,
  collapsed,
  onToggleCollapse,
}: BrainSidebarProps) {
  const tree = buildTree(entries);

  if (collapsed) {
    return (
      <div className="w-12 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col items-center py-3 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
          title="Expand sidebar"
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
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <div className="mt-4 text-lg" title="Brain">
          🧠
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 animate-slide-left">
      {/* Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            Brain
          </span>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
            {entries.length}
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-lg hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
          title="Collapse sidebar"
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
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {tree.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
            No brain entries yet.
            <br />
            Ask the AI to save something!
          </div>
        ) : (
          tree.map((node) => (
            <TreeItem
              key={node.fullPath}
              node={node}
              selectedPath={selectedPath}
              onSelectEntry={onSelectEntry}
            />
          ))
        )}
      </div>
    </div>
  );
}
