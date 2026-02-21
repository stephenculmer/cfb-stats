import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getShare } from "@/lib/db";
import ChatMessage from "@/components/ChatMessage";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const share = await getShare(id).catch(() => null);
  if (!share) return { title: "Not found — CFB Stats" };

  const title = share.question.length > 80
    ? share.question.slice(0, 77) + "…"
    : share.question;

  const answerText = share.answer.replace(/```[\s\S]*?```/g, "").trim();
  const description = answerText.length > 160
    ? answerText.slice(0, 157) + "…"
    : answerText;

  return {
    title: `${title} — CFB Stats`,
    description,
    openGraph: {
      title: `${title} — CFB Stats`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${title} — CFB Stats`,
      description,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const share = await getShare(id).catch(() => null);
  if (!share) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Shared answer from CFB Stats
        </p>
        <Link
          href={`/chat?q=${encodeURIComponent(share.question)}`}
          className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          Ask your own question →
        </Link>
      </div>

      {/* User question */}
      <ChatMessage role="user" content={share.question} />

      {/* Assistant answer (read-only, no follow-ups interaction) */}
      <ChatMessage
        role="assistant"
        content={share.answer}
        followUps={share.follow_ups}
      />
    </div>
  );
}
