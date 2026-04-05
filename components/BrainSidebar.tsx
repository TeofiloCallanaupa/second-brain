"use client";

import { useState } from "react";
import type { BrainEntry } from "@/lib/types";

interface BrainSidebarProps {
  entries: BrainEntry[];
  selectedPath: string | null;
  onSelectEntry: (entry: BrainEntry) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}



// Tree structures
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
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedPath === node.fullPath;

  return (
    <div>
      <button
        onClick={() => {
          if (node.entry) {
            onSelectEntry(node.entry);
          } else {
            setExpanded(!expanded);
          }
        }}
        className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm transition-colors duration-100 ${
          isSelected
            ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 text-[var(--text-muted)] transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" className="shrink-0 text-[var(--text-muted)]">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        )}
        <span className="truncate text-[13px]">{node.name}</span>
      </button>
      {hasChildren && expanded && (
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
  onToggleCollapse,
}: BrainSidebarProps) {
  const tree = buildTree(entries);

  return (
    <div className="w-72 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 animate-slide-left">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--border-color)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-[var(--text-primary)]">
            Knowledge
          </span>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
            {entries.length}
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-md hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Close panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto py-2">
        {entries.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">No entries yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">
              Chat with the AI to create knowledge entries
            </p>
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
