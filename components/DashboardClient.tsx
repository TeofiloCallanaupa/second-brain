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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  useEffect(() => {
    fetchBrainEntries();
  }, [fetchBrainEntries]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Brain Sidebar */}
        <BrainSidebar
          entries={brainEntries}
          selectedPath={selectedEntry?.path || null}
          onSelectEntry={(entry) => setSelectedEntry(entry)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Chat Interface */}
        <ChatInterface onBrainUpdate={fetchBrainEntries} />

        {/* Document Viewer (slide-out) */}
        {selectedEntry && (
          <DocumentViewer
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center px-4 justify-between text-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-xs text-white">
              {user.name[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-[var(--text-secondary)]">{user.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogs(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
          >
            <span className="text-xs">📋</span>
            Logs
          </button>

          <a
            href="/auth/logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
          >
            Sign Out
          </a>
        </div>
      </footer>

      {/* Action Log Modal */}
      {showLogs && <ActionLogModal onClose={() => setShowLogs(false)} />}
    </div>
  );
}
