"use client";

import ReactMarkdown from "react-markdown";
import ChartRenderer from "./ChartRenderer";
import type { ChartSpec } from "@/lib/chart-spec";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
  onFollowUp?: (question: string) => void;
  isLoading?: boolean;
}

type ContentPart =
  | { kind: "text"; text: string }
  | { kind: "chart"; spec: ChartSpec }
  | { kind: "chart-error"; raw: string };

function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const chartBlockRegex = /```chart\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = chartBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) parts.push({ kind: "text", text });
    }

    const raw = match[1].trim();
    try {
      const spec = JSON.parse(raw) as ChartSpec;
      parts.push({ kind: "chart", spec });
    } catch {
      parts.push({ kind: "chart-error", raw });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) parts.push({ kind: "text", text });
  }

  return parts;
}

export default function ChatMessage({
  role,
  content,
  followUps,
  onFollowUp,
  isLoading,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-3 text-sm">
          {content}
        </div>
      </div>
    );
  }

  const parts = isLoading ? [] : parseContent(content);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex gap-1">
              <span className="animate-bounce [animation-delay:0ms]">·</span>
              <span className="animate-bounce [animation-delay:150ms]">·</span>
              <span className="animate-bounce [animation-delay:300ms]">·</span>
            </span>
            <span>Fetching data and generating answer…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {parts.map((part, i) => {
              if (part.kind === "text") {
                return (
                  <div
                    key={i}
                    className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-li:leading-relaxed"
                  >
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div>
                );
              }
              if (part.kind === "chart") {
                return <ChartRenderer key={i} spec={part.spec} />;
              }
              // chart-error: render raw JSON in a code block as fallback
              return (
                <pre
                  key={i}
                  className="text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto"
                >
                  {part.raw}
                </pre>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && followUps?.length && onFollowUp && (
        <div className="flex flex-wrap items-center gap-2 pl-1">
          {followUps.map((q) => (
            <button
              key={q}
              onClick={() => onFollowUp(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
