"use client";

import { useState, useEffect, useCallback } from "react";
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

// Tools reference data
const connectionTools = {
  google: {
    label: "Google",
    icon: "📧",
    tools: [
      { name: "Read Emails", description: "Search and read Gmail messages", risk: "low" },
      { name: "Send Email", description: "Send emails via Gmail", risk: "high" },
    ],
  },
  github: {
    label: "GitHub",
    icon: "🐙",
    tools: [
      { name: "List Repos", description: "Browse your repositories", risk: "low" },
      { name: "Read Issues", description: "View issues on a repository", risk: "low" },
      { name: "Comment on Issue", description: "Post a comment on an issue", risk: "high" },
    ],
  },
  notion: {
    label: "Notion",
    icon: "📝",
    tools: [
      { name: "Search Pages", description: "Search your Notion workspace", risk: "low" },
      { name: "Read Page", description: "Read content from a Notion page", risk: "low" },
    ],
  },
};

interface ConnectionStatus {
  google: { connected: boolean };
  github: { connected: boolean };
  notion: { connected: boolean };
}

function ConnectionPanel({
  connections,
  showPanel,
  onClose,
  onConnect,
}: {
  connections: ConnectionStatus;
  showPanel: boolean;
  onClose: () => void;
  onConnect: (connection: string) => void;
}) {
  if (!showPanel) return null;

  return (
    <div className="absolute bottom-14 left-0 w-72 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Connections & Tools</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
        {(["google", "github", "notion"] as const).map((key) => {
          const conn = connectionTools[key];
          const isConnected = connections[key]?.connected;
          const connectionId = key === "google" ? "google-oauth2" : key === "notion" ? "Notion" : key;

          return (
            <div key={key} className="rounded-lg border border-[var(--border-color)] overflow-hidden">
              {/* Connection header */}
              <div className="px-3 py-2.5 bg-[var(--bg-secondary)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{conn.icon}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{conn.label}</span>
                </div>
                {isConnected ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => onConnect(connectionId)}
                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] font-medium hover:bg-[var(--accent-blue)]/25 transition-colors cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Tools list */}
              <div className="px-3 py-2 space-y-1.5">
                {conn.tools.map((t) => (
                  <div key={t.name} className="flex items-start gap-2 text-[13px]">
                    <span
                      className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        isConnected
                          ? t.risk === "high"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                          : "bg-[var(--text-muted)]"
                      }`}
                    />
                    <div>
                      <span className={`font-medium ${isConnected ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                        {t.name}
                      </span>
                      <span className="text-[var(--text-muted)] ml-1">— {t.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-muted)]">
          🟢 Low risk &nbsp; 🟡 Requires approval
        </p>
      </div>
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
  const [connections, setConnections] = useState<ConnectionStatus>({
    google: { connected: false },
    github: { connected: false },
    notion: { connected: false },
  });
  const [showPanel, setShowPanel] = useState(false);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
      }
    } catch (err) {
      console.error("Failed to check connections:", err);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Re-check connections when popup closes
  useEffect(() => {
    const handleFocus = () => {
      fetchConnections();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchConnections]);

  const handleConnect = (connection: string) => {
    const popup = window.open(
      `/auth/connect?connection=${connection}&returnTo=/connect-callback`,
      `Connect ${connection}`,
      "width=600,height=700,popup=true"
    );
    // Re-check when popup closes
    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
        fetchConnections();
      }
    }, 500);
  };

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
        {/* Collapsed connection indicators */}
        <div className="mt-auto mb-2 flex flex-col gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connections.google.connected ? "bg-emerald-400" : "bg-[var(--text-muted)]"}`}
            title={`Google: ${connections.google.connected ? "Connected" : "Not connected"}`}
          />
          <div
            className={`w-2 h-2 rounded-full ${connections.github.connected ? "bg-emerald-400" : "bg-[var(--text-muted)]"}`}
            title={`GitHub: ${connections.github.connected ? "Connected" : "Not connected"}`}
          />
          <div
            className={`w-2 h-2 rounded-full ${connections.notion.connected ? "bg-emerald-400" : "bg-[var(--text-muted)]"}`}
            title={`Notion: ${connections.notion.connected ? "Connected" : "Not connected"}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 animate-slide-left relative">
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

      {/* Connections section */}
      <div className="border-t border-[var(--border-color)] px-3 py-2.5 shrink-0">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="w-full flex items-center justify-between px-2 py-1.5 mb-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <span>🛠️</span>
            <span>View Tools</span>
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${showPanel ? "rotate-180" : ""}`}
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleConnect("google-oauth2")}
            className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
              connections.google.connected
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            }`}
            title={connections.google.connected ? "Google connected — click to reconnect" : "Connect Google Account"}
          >
            <span className="text-[10px]">📧</span>
            <span>Google</span>
            <span
              className={`ml-auto w-1.5 h-1.5 rounded-full ${
                connections.google.connected ? "bg-emerald-400" : "bg-red-400/60"
              }`}
            />
          </button>
          <button
            onClick={() => handleConnect("github")}
            className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
              connections.github.connected
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            }`}
            title={connections.github.connected ? "GitHub connected — click to reconnect" : "Connect GitHub Account"}
          >
            <span className="text-[10px]">🐙</span>
            <span>GitHub</span>
            <span
              className={`ml-auto w-1.5 h-1.5 rounded-full ${
                connections.github.connected ? "bg-emerald-400" : "bg-red-400/60"
              }`}
            />
          </button>
          <button
            onClick={() => handleConnect("Notion")}
            className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer ${
              connections.notion.connected
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            }`}
            title={connections.notion.connected ? "Notion connected — click to reconnect" : "Connect Notion Account"}
          >
            <span className="text-[10px]">📝</span>
            <span>Notion</span>
            <span
              className={`ml-auto w-1.5 h-1.5 rounded-full ${
                connections.notion.connected ? "bg-emerald-400" : "bg-red-400/60"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Connection panel popup */}
      <ConnectionPanel
        connections={connections}
        showPanel={showPanel}
        onClose={() => setShowPanel(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}
