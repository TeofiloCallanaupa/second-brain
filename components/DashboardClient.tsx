"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { BrainSidebar } from "@/components/BrainSidebar";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ActionLogModal } from "@/components/ActionLogModal";
import type { BrainEntry } from "@/lib/types";

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
    sub: string;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [brainEntries, setBrainEntries] = useState<BrainEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<BrainEntry | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showBrain, setShowBrain] = useState(true);
  const [connections, setConnections] = useState({
    google: false,
    github: false,
    notion: false,
  });

  const fetchBrainEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/brain");
      if (res.ok) {
        const data = await res.json();
        setBrainEntries(data.entries);
      }
    } catch (err) {
      console.error("Failed to fetch brain entries:", err);
    }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections({
          google: data.google?.connected || false,
          github: data.github?.connected || false,
          notion: data.notion?.connected || false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    }
  }, []);

  useEffect(() => {
    fetchBrainEntries();
    fetchConnections();
  }, [fetchBrainEntries, fetchConnections]);

  const handleConnect = (connection: string) => {
    const popup = window.open(
      `/auth/connect?connection=${connection}&returnTo=/connect-callback`,
      `Connect ${connection}`,
      "width=600,height=700,popup=true"
    );
    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
        fetchConnections();
      }
    }, 500);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Top Nav */}
      <nav className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center px-5 shrink-0 gap-4">
        {/* Left: Logo + Knowledge toggle */}
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-semibold text-[var(--accent-primary)] tracking-tight hover:opacity-80 transition-opacity">
            Second Brain
          </a>
          <button
            onClick={() => setShowBrain(!showBrain)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors duration-150 ${
              showBrain
                ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            Knowledge
            {brainEntries.length > 0 && (
              <span className="ml-1.5 text-[10px] opacity-60">{brainEntries.length}</span>
            )}
          </button>
          <button
            onClick={() => setShowLogs(true)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-md transition-colors duration-150"
          >
            Logs
          </button>
        </div>

        {/* Right: Connections + User */}
        <div className="ml-auto flex items-center gap-5">
          {/* Connection indicators */}
          <div className="flex items-center gap-3">
            {[
              { key: "google", label: "Gmail", provider: "google-oauth2", connected: connections.google },
              { key: "github", label: "GitHub", provider: "github", connected: connections.github },
              { key: "notion", label: "Notion", provider: "Notion", connected: connections.notion },
            ].map((svc) => (
              <button
                key={svc.key}
                onClick={() => handleConnect(svc.provider)}
                className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                title={svc.connected ? `${svc.label} connected` : `Connect ${svc.label}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    svc.connected ? "bg-emerald-400" : "bg-red-400/60"
                  }`}
                />
                <span>{svc.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-[var(--border-color)]" />

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-xs text-[var(--accent-primary-text)] font-medium">
              {user.name[0]?.toUpperCase() || "U"}
            </div>
            <a
              href="/auth/logout"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Sign out
            </a>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Brain sidebar (slide-out panel) */}
        {showBrain && (
          <BrainSidebar
            entries={brainEntries}
            selectedPath={selectedEntry?.path || null}
            onSelectEntry={(entry) => {
              setSelectedEntry(entry);
            }}
            collapsed={false}
            onToggleCollapse={() => setShowBrain(false)}
          />
        )}

        {/* Chat Interface (centered) */}
        <ChatInterface onBrainUpdate={fetchBrainEntries} />

        {/* Document Viewer (slide-out) */}
        {selectedEntry && (
          <DocumentViewer
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>

      {/* Action Log Modal */}
      {showLogs && <ActionLogModal onClose={() => setShowLogs(false)} />}
    </div>
  );
}
