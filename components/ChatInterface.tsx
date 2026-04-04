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
    // Auto-submit after user approves/denies so the model continues
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textarea = inputRef.current;
    if (!textarea || !textarea.value.trim()) return;

    sendMessage({ text: textarea.value });
    textarea.value = "";
  };

  // Handle Enter to submit, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Render a tool part based on its state
  const renderToolPart = (part: any, i: number) => {
    // In AI SDK v6, toolName is embedded in the type: "tool-gmailSend" -> "gmailSend"
    const toolName = part.type.startsWith("tool-")
      ? part.type.slice(5)
      : part.toolName || "tool";
    const state = part.state || "";
    const isHighRisk = toolName === "gmailSend" || toolName === "githubComment";

    // Approval requested — render the approval card
    if (state === "approval-requested" && isHighRisk) {
      const input = part.input || {};
      const approvalId = part.approval?.id;
      const isEmail = toolName === "gmailSend";
      const title = isEmail ? "📧 Send Email" : "💬 Post Comment";

      return (
        <div
          key={i}
          className="my-2 rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)]"
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
            <span className="text-amber-400 text-sm">🛡️</span>
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
                    {input.to}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0 w-14">Subject:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {input.subject}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-xs block mb-1">
                    Message:
                  </span>
                  <div className="text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-primary)] rounded-lg p-3 text-xs leading-relaxed max-h-40 overflow-y-auto">
                    {input.body}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0 w-14">Repo:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {input.owner}/{input.repo}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)] shrink-0 w-14">Issue:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    #{input.issueNumber}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] text-xs block mb-1">
                    Comment:
                  </span>
                  <div className="text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-primary)] rounded-lg p-3 text-xs leading-relaxed max-h-40 overflow-y-auto">
                    {input.body}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  addToolApprovalResponse({
                    id: approvalId,
                    approved: true,
                  })
                }
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Approve & Send
              </button>
              <button
                onClick={() =>
                  addToolApprovalResponse({
                    id: approvalId,
                    approved: false,
                  })
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

    // Output available — tool executed successfully (after approval)
    if (state === "output-available" && isHighRisk) {
      return (
        <div key={i} className="my-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <span>✅</span>
            <span className="font-medium">{toolName === "gmailSend" ? "Email sent" : "Comment posted"}</span>
            <span className="text-emerald-300/60 ml-auto">approved</span>
          </div>
        </div>
      );
    }

    // Output error — tool denied or failed
    if (state === "output-error") {
      return (
        <div key={i} className="my-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs">
          <div className="flex items-center gap-2 text-red-400">
            <span>❌</span>
            <span className="font-medium">Action failed or denied</span>
          </div>
        </div>
      );
    }

    // Generic tool call states (loading, completed)
    return (
      <div
        key={i}
        className="mb-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent-blue)]">⚡</span>
          <span className="text-[var(--text-secondary)] font-medium">
            {toolName}
          </span>
          {(state === "input-streaming" || state === "input-available") && (
            <span className="text-[var(--accent-yellow)]">running...</span>
          )}
          {state === "output-available" && (
            <span className="text-[var(--accent-green)]">done ✓</span>
          )}
          {state === "approval-requested" && (
            <span className="text-amber-400">awaiting approval...</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="text-5xl mb-4">🧠</div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Welcome to Second Brain
              </h2>
              <p className="text-[var(--text-muted)] max-w-md">
                Ask me about your knowledge, search your brain, read your
                emails, or manage your GitHub issues. I&apos;m here to help.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "What do I know about Auth0?",
                  "List all my brain entries",
                  "Check my recent emails",
                  "What issues are open in my repo?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      sendMessage({ text: suggestion });
                    }}
                    className="px-3 py-2 text-sm rounded-lg glass text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)] transition-colors duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 animate-fade-in ${
              message.role === "user" ? "flex justify-end" : ""
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-[var(--accent-blue)] text-white rounded-br-sm user-message"
                  : "glass rounded-bl-sm"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 text-xs text-[var(--text-muted)]">
                  <span>🧠</span>
                  <span>Second Brain</span>
                </div>
              )}

              {/* Render message parts */}
              {message.parts?.map((part, i) => {
                // Text parts
                if (part.type === "text" && "text" in part) {
                  return (
                    <div key={i} className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {(part as { text: string }).text}
                      </ReactMarkdown>
                    </div>
                  );
                }

                // Step-start parts (multi-step boundaries)
                if (part.type === "step-start") {
                  return i > 0 ? (
                    <div key={i} className="my-1 border-t border-[var(--border-color)] opacity-30" />
                  ) : null;
                }

                // Tool parts: SDK v6 uses `tool-${toolName}` or `dynamic-tool`
                // Check if it's a tool part by looking for toolName or toolCallId
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

        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div className="mb-4 animate-fade-in">
            <div className="glass rounded-xl rounded-bl-sm px-4 py-3 max-w-[80%]">
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)] animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)] animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)] animate-bounce [animation-delay:300ms]" />
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-6 pb-4">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your brain, emails, or GitHub..."
            rows={1}
            className="w-full resize-none rounded-xl glass px-4 py-3 pr-12 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-glow)] transition-colors duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] disabled:opacity-30 disabled:hover:bg-[var(--accent-blue)] flex items-center justify-center transition-colors duration-150"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
