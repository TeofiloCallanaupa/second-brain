"use client";

import { useChat } from "@ai-sdk/react";
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
    status,
    setMessages,
  } = useChat({
    onFinish: () => {
      onBrainUpdate();
    },
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
                  ? "bg-[var(--accent-blue)] text-white rounded-br-sm"
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
                if (part.type.startsWith("tool-")) {
                  const toolName =
                    "toolName" in part ? (part as Record<string, unknown>).toolName as string : "tool";
                  const state = "state" in part ? (part as Record<string, unknown>).state as string : "";
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
                        {state === "call" && (
                          <span className="text-[var(--accent-yellow)]">
                            running...
                          </span>
                        )}
                        {(state === "result" || state === "output") && (
                          <span className="text-[var(--accent-green)]">
                            done ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                if (part.type === "text" && "text" in part) {
                  return (
                    <div key={i} className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {(part as { text: string }).text}
                      </ReactMarkdown>
                    </div>
                  );
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
