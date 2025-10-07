// app/api/analyze-sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSecApiClient } from "@/lib/sec-api-client";
import type {
  SECAnalysis,
  SECSearchRequest,
  SECFiling,
} from "@/types/sec-analysis";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not defined");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function POST(request: NextRequest) {
  console.log("📥 SEC Analysis API called");

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
    const secApiClient = getSecApiClient();
    const openai = getOpenAIClient();

    const filings = await secApiClient.searchFilings({
      ticker,
      filingType,
      year,
    });

    if (filings.length === 0) {
      return NextResponse.json(
        { error: `No ${filingType} filings found for ${ticker}` },
        { status: 404 }
      );
    }

    const filing = filings[0];
    console.log(`📄 Found filing: ${filing.filingDate}`);

    // Fetch original HTML
    console.log(`📥 Fetching original SEC HTML...`);
    const originalHtmlResponse = await fetch(filing.htmlUrl);
    if (!originalHtmlResponse.ok) {
      throw new Error("Failed to fetch original SEC HTML");
    }
    const originalHtml = await originalHtmlResponse.text();
    console.log(`✅ Original HTML fetched: ${originalHtml.length} chars`);

    // Extract sections
    console.log(`📥 Extracting all sections...`);
    const sectionsData = await secApiClient.getAllSections(filing);

    console.log(`✅ Sections extracted:`);
    Object.entries(sectionsData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.text.length} chars`);
    });

    // AI analysis
    console.log("🤖 Starting AI analysis...");
    const analysis = await analyzeWithAI(filing, sectionsData, openai);
    console.log("✅ Analysis complete");

    // Debug: Log what sections we have
    console.log("📊 Analysis sections found:", Object.keys(analysis.sections));

    // Debug: Log sample data from each section
    if (analysis.sections.business) {
      console.log(
        "Sample business data:",
        JSON.stringify(analysis.sections.business).substring(0, 200)
      );
    }
    if (analysis.sections.risks) {
      console.log("Sample risks count:", analysis.sections.risks.length);
    }

    return NextResponse.json({
      analysis,
      originalHtml,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("SEC Analysis Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function analyzeWithAI(
  filing: SECFiling,
  sectionsData: Record<string, { text: string; html: string }>,
  openai: OpenAI
): Promise<SECAnalysis> {
  const analysis: SECAnalysis = {
    filing,
    sections: {},
    generatedAt: new Date().toISOString(),
  };

  // Process sections in parallel for speed
  const analysisPromises: Promise<void>[] = [];

  // Business section
  if (sectionsData.business?.text && sectionsData.business.text.length > 500) {
    analysisPromises.push(
      analyzeBusinessSection(
        sectionsData.business.text.substring(0, 20000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.business = result;
          console.log(`✅ business analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze business:`, error)
        )
    );
  }

  // Risk section
  if (sectionsData.risk?.text && sectionsData.risk.text.length > 500) {
    analysisPromises.push(
      analyzeRiskSection(sectionsData.risk.text.substring(0, 25000), openai)
        .then((result) => {
          if (result) analysis.sections.risks = result;
          console.log(`✅ risks analyzed`);
        })
        .catch((error) => console.error(`❌ Failed to analyze risks:`, error))
    );
  }

  // Legal section
  if (sectionsData.legal?.text && sectionsData.legal.text.length > 300) {
    analysisPromises.push(
      analyzeLegalSection(sectionsData.legal.text.substring(0, 15000), openai)
        .then((result) => {
          if (result) analysis.sections.legal = result;
          console.log(`✅ legal analyzed`);
        })
        .catch((error) => console.error(`❌ Failed to analyze legal:`, error))
    );
  }

  // MD&A section
  if (sectionsData.mdna?.text && sectionsData.mdna.text.length > 500) {
    analysisPromises.push(
      analyzeMdnaSection(sectionsData.mdna.text.substring(0, 20000), openai)
        .then((result) => {
          if (result) analysis.sections.mdna = result;
          console.log(`✅ mdna analyzed`);
        })
        .catch((error) => console.error(`❌ Failed to analyze mdna:`, error))
    );
  }

  // Market Risk section
  if (
    sectionsData.marketRisk?.text &&
    sectionsData.marketRisk.text.length > 300
  ) {
    analysisPromises.push(
      analyzeMarketRiskSection(
        sectionsData.marketRisk.text.substring(0, 15000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.marketRisk = result;
          console.log(`✅ marketRisk analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze marketRisk:`, error)
        )
    );
  }

  // Financials section
  if (
    sectionsData.financials?.text &&
    sectionsData.financials.text.length > 500
  ) {
    analysisPromises.push(
      analyzeFinancialsSection(
        sectionsData.financials.text.substring(0, 20000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.financials = result;
          console.log(`✅ financials analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze financials:`, error)
        )
    );
  }

  // Controls section
  if (sectionsData.controls?.text && sectionsData.controls.text.length > 300) {
    analysisPromises.push(
      analyzeControlsSection(
        sectionsData.controls.text.substring(0, 15000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.controls = result;
          console.log(`✅ controls analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze controls:`, error)
        )
    );
  }

  // Directors section
  if (
    sectionsData.directors?.text &&
    sectionsData.directors.text.length > 300
  ) {
    analysisPromises.push(
      analyzeDirectorsSection(
        sectionsData.directors.text.substring(0, 15000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.directors = result;
          console.log(`✅ directors analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze directors:`, error)
        )
    );
  }

  // Compensation section
  if (
    sectionsData.compensation?.text &&
    sectionsData.compensation.text.length > 300
  ) {
    analysisPromises.push(
      analyzeCompensationSection(
        sectionsData.compensation.text.substring(0, 20000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.compensation = result;
          console.log(`✅ compensation analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze compensation:`, error)
        )
    );
  }

  // Ownership section
  if (
    sectionsData.ownership?.text &&
    sectionsData.ownership.text.length > 300
  ) {
    analysisPromises.push(
      analyzeOwnershipSection(
        sectionsData.ownership.text.substring(0, 15000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.ownership = result;
          console.log(`✅ ownership analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze ownership:`, error)
        )
    );
  }

  // Related Party section
  if (
    sectionsData.relatedParty?.text &&
    sectionsData.relatedParty.text.length > 300
  ) {
    analysisPromises.push(
      analyzeRelatedPartySection(
        sectionsData.relatedParty.text.substring(0, 15000),
        openai
      )
        .then((result) => {
          if (result) analysis.sections.relatedParty = result;
          console.log(`✅ relatedParty analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze relatedParty:`, error)
        )
    );
  }

  // Wait for all analyses to complete
  console.log(
    `🤖 Running ${analysisPromises.length} AI analyses in parallel...`
  );
  await Promise.all(analysisPromises);

  return analysis;
}

// Helper functions for each section analysis
async function analyzeBusinessSection(text: string, openai: OpenAI) {
  const prompt = `Analyze this Business section:
1. What does the company do? (specific products/services)
2. Key products by name
3. Geographic markets
4. Competitive position

Text: ${text}

Return JSON:
{
  "summary": "2-3 sentences with specifics",
  "keyProducts": ["product names"],
  "markets": ["geographic markets"],
  "competitivePosition": "statement"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeRiskSection(text: string, openai: OpenAI) {
  const prompt = `Extract 5-8 specific risks:
Text: ${text}

Return JSON:
{
  "risks": [
    {
      "category": "operational|financial|regulatory|market|strategic",
      "title": "risk title",
      "description": "1-2 sentence description",
      "severity": "high|medium|low"
    }
  ]
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const data = JSON.parse(result.choices[0].message.content || "{}");
  return (data.risks || []).map((r: any, i: number) => ({
    id: `risk-${i}`,
    ...r,
  }));
}

async function analyzeLegalSection(text: string, openai: OpenAI) {
  const prompt = `Analyze legal proceedings:
Text: ${text}

Return JSON:
{
  "summary": "brief overview or 'No material litigation'",
  "materialCases": ["case descriptions if any"],
  "potentialImpact": "financial impact assessment"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeMdnaSection(text: string, openai: OpenAI) {
  const prompt = `Extract key information:
Text: ${text}

Return JSON:
{
  "executiveSummary": "summary with actual numbers",
  "keyTrends": ["trends with numbers"],
  "futureOutlook": "outlook",
  "liquidity": "liquidity info"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeMarketRiskSection(text: string, openai: OpenAI) {
  const prompt = `Analyze market risk exposures:
Text: ${text}

Return JSON:
{
  "summary": "overview of market risks",
  "currencyRisk": "description or N/A",
  "interestRateRisk": "description or N/A",
  "hedgingStrategy": "description"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeFinancialsSection(text: string, openai: OpenAI) {
  const prompt = `Extract financial metrics:
Text: ${text}

Return JSON:
{
  "revenue": {"value": "$X", "change": "Y%", "period": "FY20XX"},
  "netIncome": {"value": "$X", "change": "Y%", "period": "FY20XX"},
  "eps": {"value": "$X", "change": "Y%", "period": "FY20XX"},
  "unusualItems": ["any red flags"],
  "accountingChanges": "description or N/A"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeControlsSection(text: string, openai: OpenAI) {
  const prompt = `Analyze internal controls:
Text: ${text}

Return JSON:
{
  "summary": "overview",
  "materialWeaknesses": ["list or 'None reported'"],
  "assessment": "management conclusion"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeDirectorsSection(text: string, openai: OpenAI) {
  const prompt = `Analyze board composition:
Text: ${text}

Return JSON:
{
  "summary": "board composition overview",
  "keyExecutives": ["names and titles"],
  "boardIndependence": "assessment"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeCompensationSection(text: string, openai: OpenAI) {
  const prompt = `Analyze executive compensation:
Text: ${text}

Return JSON:
{
  "summary": "overview of comp structure",
  "ceoTotalComp": "amount or estimate",
  "topExecutives": ["exec and amount"],
  "performanceBased": "percentage or description",
  "redFlags": ["concerns or 'None identified'"]
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeOwnershipSection(text: string, openai: OpenAI) {
  const prompt = `Analyze ownership structure:
Text: ${text}

Return JSON:
{
  "summary": "ownership structure",
  "majorShareholders": ["shareholder and percentage"],
  "insiderOwnership": "percentage"
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}

async function analyzeRelatedPartySection(text: string, openai: OpenAI) {
  const prompt = `Analyze related party transactions:
Text: ${text}

Return JSON:
{
  "summary": "overview or 'None reported'",
  "transactions": ["transaction descriptions"],
  "concerns": ["red flags or 'None identified'"]
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}
