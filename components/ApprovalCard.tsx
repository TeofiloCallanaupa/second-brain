"use client";

import { useState } from "react";

interface ApprovalCardProps {
  actionType: string;
  actionId: string;
  preview: Record<string, any>;
}

export function ApprovalCard({
  actionType,
  actionId,
  preview,
}: ApprovalCardProps) {
  const [status, setStatus] = useState<
    "pending" | "approving" | "approved" | "denied" | "error"
  >("pending");
  const [resultMessage, setResultMessage] = useState("");

  const handleApprove = async () => {
    setStatus("approving");
    try {
      const res = await fetch("/api/approve-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType, actionId, preview }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("approved");
        setResultMessage(data.message || "Action completed successfully");
      } else {
        setStatus("error");
        setResultMessage(data.error || "Action failed");
      }
    } catch (err: any) {
      setStatus("error");
      setResultMessage(err?.message || "Network error");
    }
  };

  const handleDeny = () => {
    setStatus("denied");
    setResultMessage("Action cancelled by user");
  };

  const isEmail = actionType === "gmail-send";
  const title = isEmail ? "Send Email" : "Post Comment";
  const icon = isEmail ? "G" : "GH";

  return (
    <div className="my-2 rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <span className="text-amber-400 text-sm font-semibold">!</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Approval Required
        </span>
        <span className="text-xs text-[var(--text-muted)] ml-auto">
          {title}
        </span>
      </div>

      {/* Preview content */}
      <div className="px-4 py-3">
        {isEmail ? (
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] shrink-0 w-14">To:</span>
              <span className="text-[var(--text-primary)] font-medium">
                {preview.to}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] shrink-0 w-14">Subject:</span>
              <span className="text-[var(--text-primary)] font-medium">
                {preview.subject}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] text-xs block mb-1">
                Message:
              </span>
              <div className="text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-primary)] rounded-lg p-3 text-xs leading-relaxed max-h-40 overflow-y-auto">
                {preview.body}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] shrink-0 w-14">Repo:</span>
              <span className="text-[var(--text-primary)] font-medium">
                {preview.owner}/{preview.repo}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] shrink-0 w-14">Issue:</span>
              <span className="text-[var(--text-primary)] font-medium">
                #{preview.issueNumber}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] text-xs block mb-1">
                Comment:
              </span>
              <div className="text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-primary)] rounded-lg p-3 text-xs leading-relaxed max-h-40 overflow-y-auto">
                {preview.body}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions / Status */}
      <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        {status === "pending" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Approve & Send
            </button>
            <button
              onClick={handleDeny}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-primary)] hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 text-sm font-medium border border-[var(--border-color)] transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Deny
            </button>
          </div>
        )}

        {status === "approving" && (
          <div className="flex items-center justify-center gap-2 py-1 text-sm text-[var(--accent-primary)]">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:300ms]" />
            </div>
            <span>Sending...</span>
          </div>
        )}

        {status === "approved" && (
          <div className="flex items-center gap-2 py-1 text-sm text-emerald-400">
            <span className="font-semibold">Done</span>
            <span>{resultMessage}</span>
          </div>
        )}

        {status === "denied" && (
          <div className="flex items-center gap-2 py-1 text-sm text-[var(--text-muted)]">
            <span className="font-medium">Denied</span>
            <span>{resultMessage}</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 py-1 text-sm text-red-400">
            <span className="font-semibold">Error</span>
            <span>{resultMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
