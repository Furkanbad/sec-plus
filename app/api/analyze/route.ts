// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkAndIncrementUsage } from "@/lib/tracking";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions
interface Insight {
  id: string;
  type: "risk" | "financial" | "opportunity" | "metric" | "general";
  title: string;
  description: string;
  pageNumber: number;
  searchText: string;
  emoji: string;
  color: string;
}

interface ParsedInsight {
  type?: string;
  title?: string;
  description?: string;
  pageNumber?: number;
  searchText?: string;
}

export async function POST(request: NextRequest) {
  console.log("📥 API called");

  // Check usage limit
  const usageCheck = await checkAndIncrementUsage();

  if (!usageCheck.allowed) {
    console.log("❌ Free limit reached");
    return NextResponse.json(
      {
        error: "Free limit reached",
        message: `You've used all ${usageCheck.total} free PDFs this month. Create an account to get 17 more PDFs/month.`,
        limitReached: true,
        usage: usageCheck,
      },
      { status: 403 }
    );
  }

  console.log(
    `✅ Usage: ${usageCheck.total}/3, ${usageCheck.remaining} remaining`
  );

  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text" }, { status: 400 });
    }

    console.log("✅ Text received:", text.length, "chars");
    console.log("🤖 Calling OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze:\n\n${text}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    console.log("✅ OpenAI done");
    const result = completion.choices[0].message.content;
    const insights = parseInsights(result || "{}");

    console.log("✅ Insights:", insights.length);
    return NextResponse.json({
      insights,
      usage: usageCheck,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ ERROR:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

const SYSTEM_PROMPT = `Extract 8-12 key insights from this 10-K. Return JSON:
{
  "insights": [
    {
      "type": "risk|financial|opportunity|metric|general",
      "title": "Brief title",
      "description": "2-3 sentences with specifics",
      "pageNumber": 1,
      "searchText": "unique phrase"
    }
  ]
}`;

function parseInsights(jsonString: string): Insight[] {
  const emojiMap: Record<string, string> = {
    risk: "🔴",
    financial: "💰",
    opportunity: "✅",
    metric: "📊",
    general: "💡",
  };

  try {
    const parsed = JSON.parse(jsonString);
    const insights: ParsedInsight[] = parsed.insights || [];

    return insights.map(
      (insight: ParsedInsight, i: number): Insight => ({
        id: `insight-${i}`,
        type: (insight.type || "general") as Insight["type"],
        title: insight.title || "Untitled",
        description: insight.description || "",
        pageNumber: insight.pageNumber || 1,
        searchText: insight.searchText || "",
        emoji: emojiMap[insight.type || "general"] || "📌",
        color: insight.type || "blue",
      })
    );
  } catch (error: unknown) {
    console.error("Parse error:", error);
    return [];
  }
}
