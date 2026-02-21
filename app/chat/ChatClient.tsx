"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import ShareButton from "@/components/ShareButton";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
}

const EXAMPLE_QUESTIONS = [
  "Compare Alabama and Georgia's win/loss records since 2020",
  "Who led the SEC in rushing yards in 2023?",
  "How have Ohio State's recruiting rankings changed over the last 5 years?",
  "What were the biggest upsets of the 2023 season?",
];

export default function ChatClient() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  // Full Anthropic message history (includes tool calls) sent to the API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apiHistory, setApiHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didAutoSubmit = useRef(false);

  // Auto-submit the ?q= query param on first load
  useEffect(() => {
    if (didAutoSubmit.current) return;
    const q = searchParams.get("q");
    if (q) {
      didAutoSubmit.current = true;
      handleSubmit(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(question: string) {
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message and a placeholder assistant message immediately
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: "", isLoading: true } as DisplayMessage & {
        isLoading: boolean;
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: apiHistory }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const { answer, followUps, history } = data as {
        answer: string;
        followUps: string[];
        history: unknown[];
      };

      // Replace the placeholder assistant message with the real response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: answer, followUps },
      ]);
      setApiHistory(history);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      // Remove the placeholder assistant message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  function handleRetry() {
    const lastUserMsg = messages.findLast((m) => m.role === "user");
    if (!lastUserMsg) return;
    const content = lastUserMsg.content;
    setError(null);
    setMessages((prev) => prev.slice(0, -1));
    handleSubmit(content);
  }

  function handleReset() {
    setMessages([]);
    setApiHistory([]);
    setError(null);
  }

  const isEmpty = messages.length === 0 && !isLoading;

  const lastAsstIdx = messages.map((m) => m.role).lastIndexOf("assistant");
  const lastAssistant = lastAsstIdx >= 0 ? messages[lastAsstIdx] : null;
  const lastQuestion = lastAsstIdx > 0 ? messages[lastAsstIdx - 1].content : "";
  const showShare = !isLoading && lastAssistant !== null && lastAssistant.content !== "";

  return (
    <div className="flex flex-col h-[calc(100vh-56px-48px)]">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="max-w-2xl mx-auto px-4 pt-16">
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
              Ask a question to get started, or try one of these:
            </p>
            <div className="grid gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-left p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-sm hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                followUps={msg.followUps}
                onFollowUp={handleSubmit}
                isLoading={
                  isLoading && i === messages.length - 1 && msg.role === "assistant"
                }
              />
            ))}
            {error && (
              <div className="flex items-center gap-3 text-sm px-1">
                <span className="text-red-600 dark:text-red-400">Error: {error}</span>
                <button
                  onClick={handleRetry}
                  className="text-xs rounded-full border border-gray-300 dark:border-gray-700 px-3 py-1 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Fixed input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-background">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
            </div>
            {showShare && (
              <ShareButton
                question={lastQuestion}
                answer={lastAssistant!.content}
                followUps={lastAssistant!.followUps}
              />
            )}
          </div>
          {messages.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                New conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
