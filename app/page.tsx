import Link from "next/link";

const EXAMPLE_QUESTIONS = [
  "How has Alabama's recruiting ranking changed over the last 10 years?",
  "Compare Ohio State and Michigan's win/loss records since 2015",
  "Who were the top 10 rushing leaders in the SEC in 2024?",
  "What's the historical betting line accuracy for top-25 matchups?",
  "Show me the transfer portal activity for Texas A&M over the last 3 years",
  "Which conferences have produced the most NFL draft picks since 2010?",
];

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Ask anything about college football
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Powered by real data from the College Football Data API and Claude AI.
          Get charts, stats, and narrative answers to any CFB question.
        </p>
      </div>

      <div className="flex justify-center mb-16">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Start asking questions →
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Example questions
        </h2>
        <ul className="space-y-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <li key={q}>
              <Link
                href={`/chat?q=${encodeURIComponent(q)}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {q}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
