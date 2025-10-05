// app/api/analyze-sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { secClient } from "@/lib/sec-edgar";
import { checkAndIncrementUsage } from "@/lib/tracking";
import type { SECAnalysis, SECSearchRequest } from "@/types/sec-analysis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log("📥 SEC Analysis API called");

  // Usage limit temporarily disabled for testing
  // const usageCheck = await checkAndIncrementUsage();
  const usageCheck = { allowed: true, remaining: 999, total: 0 };

  try {
    const body: SECSearchRequest = await request.json();
    const { ticker, filingType, year } = body;

    if (!ticker || !filingType) {
      return NextResponse.json(
        { error: "Ticker and filing type required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching for ${ticker} ${filingType}...`);

    // 1. Search for filings
    const filings = await secClient.searchFilings({ ticker, filingType, year });

    if (filings.length === 0) {
      return NextResponse.json(
        { error: `No ${filingType} filings found for ${ticker}` },
        { status: 404 }
      );
    }

    // Get the most recent filing
    const filing = filings[0];
    console.log(`📄 Found filing: ${filing.filingDate}`);

    // 2. Fetch HTML content
    const html = await secClient.fetchFilingHTML(filing);
    console.log(`✅ Fetched HTML: ${html.length} characters`);

    // 3. Parse sections
    const sections = secClient.parseSections(html);
    console.log(`📑 Parsed sections:`, Object.keys(sections));

    // Log section lengths to verify we got real data
    Object.entries(sections).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value.length} chars`);
      if (value.length > 0) {
        console.log(`    Preview: ${value.substring(0, 200)}...`);
      }
    });

    // 4. Analyze each section with AI
    const analysis = await analyzeWithAI(filing, sections);

    console.log("✅ Analysis complete");

    // If no sections found, return text sample for debugging
    const hasSections = Object.keys(sections).length > 0;
    const debugInfo = !hasSections
      ? {
          sampleText: html.substring(68864, 68864 + 5000), // 5k chars from where we started
          cleanTextSample: secClient
            .getCleanText(html)
            .substring(68864, 68864 + 3000),
        }
      : {};

    return NextResponse.json({
      analysis,
      rawHTML: html.substring(0, 500000),
      debug: debugInfo,
      usage: usageCheck,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("❌ ERROR:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function analyzeWithAI(
  filing: any,
  sections: Record<string, string>
): Promise<SECAnalysis> {
  const analysis: SECAnalysis = {
    filing,
    sections: {
      business: {
        summary: "",
        keyProducts: [],
        markets: [],
        competitivePosition: "",
        highlights: [],
      },
      risks: [],
      mdna: {
        executiveSummary: "",
        keyTrends: [],
        futureOutlook: "",
        liquidity: "",
        criticalAccounting: "",
        highlights: [],
      },
      financials: {
        revenue: { name: "", value: "", change: "", analysis: "", period: "" },
        netIncome: {
          name: "",
          value: "",
          change: "",
          analysis: "",
          period: "",
        },
        eps: { name: "", value: "", change: "", analysis: "", period: "" },
        keyRatios: [],
        highlights: [],
      },
    },
    generatedAt: new Date().toISOString(),
  };

  // Analyze Business Section
  if (sections.business && sections.business.length > 500) {
    console.log("🤖 Analyzing Business section...");
    const businessPrompt = `You are analyzing a real SEC 10-K Business section. Extract SPECIFIC information:
1. What does this company ACTUALLY do? Be specific about their products/services
2. List their ACTUAL key products (not generic categories)
3. List their ACTUAL geographic markets
4. What is their competitive position?

DO NOT make up generic answers. Use ONLY the specific information from this text.

Text (first 15000 chars):
${sections.business.substring(0, 15000)}

Return JSON:
{
  "summary": "specific 2-3 sentence summary",
  "keyProducts": ["actual product names"],
  "markets": ["actual geographic regions mentioned"],
  "competitivePosition": "actual competitive position statement"
}`;

    const businessResult = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: businessPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.1, // Lower temperature for more factual
    });

    const businessData = JSON.parse(
      businessResult.choices[0].message.content || "{}"
    );
    analysis.sections.business = { ...businessData, highlights: [] };
  } else {
    console.log("⚠️ Business section too short or missing");
  }

  // Analyze Risk Factors
  if (sections.risk && sections.risk.length > 500) {
    console.log("🤖 Analyzing Risk Factors...");
    const riskPrompt = `Analyze these REAL Risk Factors from a 10-K. Extract 5-8 SPECIFIC risks mentioned:
- Use ACTUAL risk titles from the document (not generic categories)
- Category: operational, financial, regulatory, market, or strategic
- Description: SPECIFIC 1-2 sentence summary of what the risk actually is
- Severity: high, medium, or low (based on how the company describes it)

DO NOT make up generic risks. Use ONLY the specific risks mentioned in this text.

Text (first 18000 chars):
${sections.risk.substring(0, 18000)}

Return JSON:
{
  "risks": [
    {
      "category": "operational|financial|regulatory|market|strategic",
      "title": "actual risk title from document",
      "description": "specific description from document",
      "severity": "high|medium|low"
    }
  ]
}`;

    const riskResult = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: riskPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const riskData = JSON.parse(riskResult.choices[0].message.content || "{}");
    analysis.sections.risks = (riskData.risks || []).map(
      (r: any, i: number) => ({
        id: `risk-${i}`,
        ...r,
        highlights: [],
      })
    );
  } else {
    console.log("⚠️ Risk section too short or missing");
  }

  // Analyze MD&A
  if (sections.mdna && sections.mdna.length > 500) {
    console.log("🤖 Analyzing MD&A section...");
    const mdnaPrompt = `Analyze this REAL Management Discussion & Analysis section. Extract SPECIFIC facts:
1. Executive summary with ACTUAL financial performance
2. Key trends with ACTUAL numbers/percentages
3. Future outlook based on what management ACTUALLY said
4. Liquidity position with ACTUAL numbers

Use ONLY specific information from this text. Include actual numbers, percentages, and dollar amounts.

Text (first 15000 chars):
${sections.mdna.substring(0, 15000)}

Return JSON:
{
  "executiveSummary": "specific summary with numbers",
  "keyTrends": ["actual trends with numbers"],
  "futureOutlook": "actual outlook statement",
  "liquidity": "actual liquidity with numbers"
}`;

    const mdnaResult = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: mdnaPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const mdnaData = JSON.parse(mdnaResult.choices[0].message.content || "{}");
    analysis.sections.mdna = {
      ...mdnaData,
      criticalAccounting: "",
      highlights: [],
    };
  } else {
    console.log("⚠️ MD&A section too short or missing");
  }

  // Analyze Financials
  if (sections.financials && sections.financials.length > 500) {
    console.log("🤖 Analyzing Financials section...");
    const financialsPrompt = `Extract SPECIFIC financial metrics from this Financial Statements section:
1. Revenue (with actual numbers and year-over-year change)
2. Net Income (with actual numbers and change)
3. EPS (with actual numbers)
4. Any key financial ratios mentioned

Use ONLY actual numbers from the text. Include currency symbols and units.

Text (first 15000 chars):
${sections.financials.substring(0, 15000)}

Return JSON:
{
  "revenue": {
    "name": "Total Revenue",
    "value": "actual amount",
    "change": "YoY % or amount",
    "analysis": "brief note",
    "period": "fiscal year"
  },
  "netIncome": {
    "name": "Net Income",
    "value": "actual amount",
    "change": "YoY % or amount",
    "analysis": "brief note",
    "period": "fiscal year"
  },
  "eps": {
    "name": "Earnings Per Share",
    "value": "actual amount",
    "change": "YoY % or amount",
    "analysis": "brief note",
    "period": "fiscal year"
  }
}`;

    const financialsResult = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: financialsPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const financialsData = JSON.parse(
      financialsResult.choices[0].message.content || "{}"
    );
    analysis.sections.financials = {
      revenue: financialsData.revenue || {
        name: "",
        value: "",
        change: "",
        analysis: "",
        period: "",
      },
      netIncome: financialsData.netIncome || {
        name: "",
        value: "",
        change: "",
        analysis: "",
        period: "",
      },
      eps: financialsData.eps || {
        name: "",
        value: "",
        change: "",
        analysis: "",
        period: "",
      },
      keyRatios: [],
      highlights: [],
    };
  } else {
    console.log("⚠️ Financials section too short or missing");
  }

  return analysis;
}
