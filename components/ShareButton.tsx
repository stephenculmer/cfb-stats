"use client";

import { useState } from "react";

interface ShareButtonProps {
  question: string;
  answer: string;
  followUps?: string[];
}

type State = "idle" | "loading" | "copied" | "error";

export default function ShareButton({ question, answer, followUps = [] }: ShareButtonProps) {
  const [state, setState] = useState<State>("idle");

  async function handleShare() {
    if (state === "loading") return;
    setState("loading");

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, followUps }),
      });

      const data = await res.json() as { id?: string; error?: string };

      if (!res.ok) throw new Error(data.error ?? "Failed to create share");

      const url = `${window.location.origin}/share/${data.id}`;
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const expanded = state === "copied" || state === "error";

  const colorClass =
    state === "copied"
      ? "border-green-400 dark:border-green-600 text-green-600 dark:text-green-400"
      : state === "error"
      ? "border-red-400 dark:border-red-600 text-red-600 dark:text-red-400"
      : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-500";

  return (
    <button
      onClick={handleShare}
      disabled={state === "loading"}
      aria-label={state === "copied" ? "Link copied!" : state === "error" ? "Failed to copy link" : "Copy link to share"}
      className={`h-12 rounded-xl border bg-white dark:bg-gray-900 flex items-center justify-center shrink-0 gap-2 transition-all duration-200 disabled:opacity-50 ${colorClass} ${expanded ? "px-4 w-auto" : "w-12"}`}
    >
      {/* Link icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>

      {expanded && (
        <span className="text-xs font-medium whitespace-nowrap">
          {state === "copied" ? "Link copied!" : "Failed to copy"}
        </span>
      )}
    </button>
  );
}
