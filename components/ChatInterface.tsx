"use client";

import { useChat } from "@ai-sdk/react";
import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatInterfaceProps {
  onBrainUpdate: () => void;
}

export function ChatInterface({ onBrainUpdate }: ChatInterfaceProps) {
  const {
    messages,
    sendMessage,
    addToolApprovalResponse,
    status,
    setMessages,
  } = useChat({
    onFinish: () => {
      onBrainUpdate();
    },
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textarea = inputRef.current;
    if (!textarea || !textarea.value.trim()) return;
    sendMessage({ text: textarea.value });
    textarea.value = "";
    textarea.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Render tool parts
  const renderToolPart = (part: any, i: number) => {
    const toolName = part.type.startsWith("tool-")
      ? part.type.slice(5)
      : part.toolName || "tool";
    const state = part.state || "";
    const isHighRisk = toolName === "gmailSend" || toolName === "githubComment";

    // Approval requested
    if (state === "approval-requested" && isHighRisk) {
      const input = part.input || {};
      const approvalId = part.approval?.id;
      const isEmail = toolName === "gmailSend";
      const title = isEmail ? "Send Email" : "Post Comment";

      return (
        <div
          key={i}
          className="my-3 rounded-lg border border-amber-500/30 overflow-hidden bg-[var(--bg-secondary)]"
        >
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
            <span className="text-amber-400 text-xs font-semibold">!</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Approval Required
            </span>
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {title}
            </span>
          </div>

          <div className="px-4 py-3">
            {isEmail ? (
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0 w-14">To:</span>
                  <span className="text-[var(--text-primary)] font-medium">{input.to}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0 w-14">Subject:</span>
                  <span className="text-[var(--text-primary)] font-medium">{input.subject}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-xs block mb-1">Message:</span>
                  <div className="text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-primary)] rounded-lg p-3 text-xs leading-relaxed max-h-40 overflow-y-auto">
                    {input.body}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0 w-14">Repo:</span>
                  <span className="text-[var(--text-primary)] font-medium">{input.owner}/{input.repo}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0 w-14">Issue:</span>
                  <span className="text-[var(--text-primary)] font-medium">#{input.issueNumber}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-xs block mb-1">Comment:</span>
                  <div className="text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-primary)] rounded-lg p-3 text-xs leading-relaxed max-h-40 overflow-y-auto">
                    {input.body}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  addToolApprovalResponse({ id: approvalId, approved: true })
                }
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Approve
              </button>
              <button
                onClick={() =>
                  addToolApprovalResponse({ id: approvalId, approved: false })
                }
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-primary)] hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 text-sm font-medium border border-[var(--border-color)] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Deny
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Success
    if (state === "output-available" && isHighRisk) {
      return (
        <div key={i} className="my-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="font-semibold">Done</span>
            <span className="font-medium">{toolName === "gmailSend" ? "Email sent" : "Comment posted"}</span>
            <span className="text-emerald-300/60 ml-auto">approved</span>
          </div>
        </div>
      );
    }

    // Error
    if (state === "output-error") {
      return (
        <div key={i} className="my-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs">
          <div className="flex items-center gap-2 text-red-400">
            <span className="font-semibold">Failed</span>
            <span className="font-medium">Action failed or denied</span>
          </div>
        </div>
      );
    }

    // Generic tool states
    return (
      <div key={i} className="mb-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent-primary)] font-mono text-[10px]">&rarr;</span>
          <span className="text-[var(--text-secondary)] font-medium">{toolName}</span>
          {(state === "input-streaming" || state === "input-available") && (
            <span className="text-[var(--accent-yellow)]">running...</span>
          )}
          {state === "output-available" && (
            <span className="text-[var(--accent-green)]">done</span>
          )}
          {state === "approval-requested" && (
            <span className="text-amber-400">awaiting approval...</span>
          )}
        </div>
      </div>
    );
  };

  const suggestions = [
    { title: "Check my recent emails", desc: "Read and summarize your latest Gmail messages" },
    { title: "What issues are open?", desc: "Browse GitHub issues across your repositories" },
    { title: "Search my Notion", desc: "Find and read pages in your Notion workspace" },
    { title: "What do I know?", desc: "Search through your saved knowledge entries" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Messages area — centered column */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-6 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center animate-fade-in w-full">
                <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                  What can I help with?
                </h1>
                <p className="text-sm text-[var(--text-muted)] mb-10">
                  Connected to your Gmail, GitHub, and Notion
                </p>

                {/* Suggestion cards — 2x2 grid */}
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => sendMessage({ text: s.title })}
                      className="text-left px-4 py-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--outline)] transition-all duration-150 group"
                    >
                      <div className="text-sm font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                        {s.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {s.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 animate-fade-in ${
                message.role === "user" ? "flex justify-end" : ""
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[var(--accent-primary)] text-[var(--accent-primary-text)] rounded-br-md user-message"
                    : "rounded-bl-md"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--accent-primary)]">SB</span>
                    <span>Second Brain</span>
                  </div>
                )}

                {message.parts?.map((part, i) => {
                  if (part.type === "text" && "text" in part) {
                    return (
                      <div key={i} className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {(part as { text: string }).text}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                  if (part.type === "step-start") {
                    return i > 0 ? (
                      <div key={i} className="my-1 border-t border-[var(--border-color)] opacity-20" />
                    ) : null;
                  }
                  if (
                    part.type.startsWith("tool-") ||
                    part.type === "dynamic-tool" ||
                    "toolCallId" in part
                  ) {
                    return renderToolPart(part, i);
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
            <div className="mb-6 animate-fade-in">
              <div className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area — centered, pinned to bottom */}
      <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
        <div className="max-w-[720px] mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                const next = Math.min(el.scrollHeight, 200);
                el.style.height = next + "px";
                el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
              }}
              placeholder="Message Second Brain..."
              rows={1}
              className="w-full resize-none rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 pr-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--outline)] transition-colors duration-200"
              style={{ maxHeight: "200px", overflowY: "hidden" }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-30 disabled:hover:bg-[var(--accent-primary)] flex items-center justify-center transition-colors duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-2 opacity-60">
            llama-3.3-70b via Groq — Actions require your approval
          </p>
        </div>
      </div>
    </div>
  );
}
