import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "POSTGRES_URL is not set. Create a Neon database at https://neon.tech and add the connection string to .env.local."
    );
  }
  return neon(url);
}

export interface Share {
  id: string;
  question: string;
  answer: string;
  follow_ups: string[];
  created_at: string;
}

export async function createShare(
  question: string,
  answer: string,
  followUps: string[]
): Promise<string> {
  const sql = getSql();
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);

  await sql`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      follow_ups JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO shares (id, question, answer, follow_ups)
    VALUES (${id}, ${question}, ${answer}, ${JSON.stringify(followUps)})
  `;

  return id;
}

export async function getShare(id: string): Promise<Share | null> {
  const sql = getSql();

  // If the table doesn't exist yet, return null rather than throwing
  try {
    const rows = await sql`
      SELECT id, question, answer, follow_ups, created_at
      FROM shares
      WHERE id = ${id}
      LIMIT 1
    `;
    if (!rows.length) return null;
    const row = rows[0];
    return {
      id: row.id as string,
      question: row.question as string,
      answer: row.answer as string,
      follow_ups: row.follow_ups as string[],
      created_at: String(row.created_at),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist")) return null;
    throw err;
  }
}
