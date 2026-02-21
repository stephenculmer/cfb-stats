import { NextRequest, NextResponse } from "next/server";
import { getShare } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const share = await getShare(id);
    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }
    return NextResponse.json(share);
  } catch (err) {
    console.error("[/api/share GET]", err);
    const message = err instanceof Error ? err.message : "Failed to retrieve share";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
