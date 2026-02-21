import { NextRequest, NextResponse } from "next/server";
import { createShare } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { question, answer, followUps = [] } = await req.json() as {
      question: string;
      answer: string;
      followUps?: string[];
    };

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json(
        { error: "question and answer are required" },
        { status: 400 }
      );
    }

    const id = await createShare(question, answer, followUps);
    return NextResponse.json({ id });
  } catch (err) {
    console.error("[/api/share POST]", err);
    const message = err instanceof Error ? err.message : "Failed to create share";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
