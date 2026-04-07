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

  return (
    <div className="w-72 md:relative absolute inset-y-0 left-0 z-20 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 animate-slide-left">
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
      <div className="flex-1 overflow-y-auto">
        {/* AI Preferences — pinned section */}
        {entries.filter(e => e.path === "AI_PREFERENCES").map((prefEntry) => (
          <div key="ai-prefs" className="px-3 py-2 border-b border-[var(--border-color)]">
            <button
              onClick={() => onSelectEntry(prefEntry)}
              className={`w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors duration-100 ${
                selectedPath === "AI_PREFERENCES"
                  ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <div>
                <span className="text-xs font-semibold tracking-wide">AI PREFERENCES</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Formatting rules for the AI</span>
              </div>
            </button>
          </div>
        ))}

        {/* Regular entries */}
        <div className="py-2">
          {entries.filter(e => e.path !== "AI_PREFERENCES").length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">No entries yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">
                Chat with the AI to create knowledge entries
              </p>
            </div>
          ) : (
            buildTree(entries.filter(e => e.path !== "AI_PREFERENCES")).map((node) => (
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
    </div>
  );
}
