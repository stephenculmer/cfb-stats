import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude";
import { cfbdTools, executeTool } from "@/lib/tools";

const SYSTEM_PROMPT = `You are a college football statistics expert. You help users explore and understand data from the College Football Data API (CFBD).

When answering questions:
- Use the available tools to fetch real, current data. Always fetch data before answering statistical questions.
- Call multiple tools in parallel when you need data from several endpoints.
- Provide clear, insightful narrative answers with specific numbers and data points.
- Use markdown formatting: headers, bold for key stats, bullet lists for comparisons.
- If a question is ambiguous (e.g., "Miami" could be Miami FL or Miami OH), make a reasonable assumption and state it explicitly.
- If a question is outside the scope of college football, politely decline.
- Keep answers focused. Lead with the key insight, then support with data.

When your answer includes data that would benefit from visualization, embed chart specifications inline using this exact format (a fenced code block with the language tag "chart"):

\`\`\`chart
{ "type": "...", ... }
\`\`\`

**Chart types and required fields:**

Bar chart — comparing values across teams, players, or categories:
{ "type": "bar", "title": "...", "xKey": "team", "yKeys": ["wins"], "data": [{"team": "Alabama", "wins": 12}, ...], "xLabel": "Team", "yLabel": "Wins" }

Line chart — trends over seasons or time:
{ "type": "line", "title": "...", "xKey": "year", "yKeys": ["rating"], "data": [{"year": 2020, "rating": 95.2}, ...], "xLabel": "Year", "yLabel": "Rating" }

Scatter chart — correlation between two metrics:
{ "type": "scatter", "title": "...", "xKey": "offRank", "yKey": "wins", "nameKey": "team", "data": [{"offRank": 5, "wins": 12, "team": "Ohio State"}, ...], "xLabel": "Offense Rank", "yLabel": "Wins" }

Table — ranked lists or detailed multi-column stats:
{ "type": "table", "title": "...", "columns": [{"key": "team", "label": "Team"}, {"key": "wins", "label": "W"}], "data": [{"team": "Alabama", "wins": 12}, ...] }

Rules for charts:
- Only include a chart when it genuinely adds value beyond the text (comparisons, trends, rankings).
- Place the chart spec right after the relevant narrative text.
- The JSON must be valid and complete — all data values must be actual numbers or strings, not placeholders.
- Use concise field names (e.g., "year", "wins", "team") that are consistent across all data objects.
- For yKeys with multiple series, include all series keys in every data object.

At the end of every response, include exactly this section with 3 suggested follow-ups:

**Suggested follow-ups:**
- [follow-up question 1]
- [follow-up question 2]
- [follow-up question 3]`;

function parseFollowUps(text: string): string[] {
  const match = text.match(
    /\*\*Suggested follow-ups:\*\*\s*\n((?:[-*] .+\n?)+)/
  );
  if (!match) return [];
  return match[1]
    .split("\n")
    .filter((line) => /^[-*] /.test(line))
    .map((line) => line.replace(/^[-*] /, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function stripFollowUps(text: string): string {
  return text
    .replace(/\n*\*\*Suggested follow-ups:\*\*\s*\n((?:[-*] .+\n?)+)\s*$/, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body as {
      message: string;
      history: Anthropic.MessageParam[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const claude = getClaudeClient();

    const messages: Anthropic.MessageParam[] = [
      ...history,
      { role: "user", content: message },
    ];

    // Run the agentic tool-use loop
    let response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: cfbdTools,
      messages,
    });

    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      // Execute all tool calls in parallel
      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          try {
            const result = await executeTool(
              toolUse.name,
              toolUse.input as Record<string, unknown>
            );
            return {
              type: "tool_result" as const,
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            };
          } catch (err) {
            return {
              type: "tool_result" as const,
              tool_use_id: toolUse.id,
              content: `Error fetching data: ${err instanceof Error ? err.message : "Unknown error"}`,
              is_error: true,
            };
          }
        })
      );

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await claude.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        tools: cfbdTools,
        messages,
      });
    }

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    if (!textBlock) {
      throw new Error("No text response received from Claude");
    }

    const followUps = parseFollowUps(textBlock.text);
    const answer = stripFollowUps(textBlock.text);

    // Return updated history so client can send it with the next message
    const updatedHistory: Anthropic.MessageParam[] = [
      ...messages,
      { role: "assistant", content: response.content },
    ];

    return NextResponse.json({ answer, followUps, history: updatedHistory });
  } catch (err) {
    console.error("[/api/chat]", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
