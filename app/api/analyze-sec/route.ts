// app/api/analyze-sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { secApiClient } from "@/lib/sec-api-client";
import type { SECAnalysis, SECSearchRequest } from "@/types/sec-analysis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Orijinal SEC HTML'ini fetch et
    console.log(`📥 Fetching original SEC HTML...`);
    const originalHtmlResponse = await fetch(filing.htmlUrl);
    const originalHtml = await originalHtmlResponse.text();
    console.log(`✅ Original HTML fetched: ${originalHtml.length} chars`);

    console.log(`📥 Extracting all sections...`);
    const sectionsData = await secApiClient.getAllSections(filing);

    console.log(`✅ Sections extracted:`);
    Object.entries(sectionsData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.text.length} chars`);
    });

    // AI analizine text kısımlarını gönder
    const analysis = await analyzeWithAI(filing, sectionsData);

    console.log("✅ Analysis complete");

    return NextResponse.json({
      analysis,
      originalHtml: originalHtml,
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
  sectionsData: Record<string, { text: string; html: string }>
): Promise<SECAnalysis> {
  const analysis: any = {
    filing,
    sections: {},
    generatedAt: new Date().toISOString(),
  };

  // Item 1: Business
  if (sectionsData.business?.text && sectionsData.business.text.length > 500) {
    console.log("🤖 Analyzing Business...");
    const prompt = `Analyze this Business section:

1. What does the company do? (specific products/services)
2. Key products by name
3. Geographic markets
4. Competitive position

Text (first 20000 chars):
${sectionsData.business.text.substring(0, 20000)}

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

    analysis.sections.business = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 1A: Risk Factors
  if (sectionsData.risk?.text && sectionsData.risk.text.length > 500) {
    console.log("🤖 Analyzing Risk Factors...");
    const prompt = `Extract 5-8 specific risks:

Text (first 25000 chars):
${sectionsData.risk.text.substring(0, 25000)}

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
    analysis.sections.risks = (data.risks || []).map((r: any, i: number) => ({
      id: `risk-${i}`,
      ...r,
    }));
  }

  // Item 3: Legal Proceedings
  if (sectionsData.legal?.text && sectionsData.legal.text.length > 300) {
    console.log("🤖 Analyzing Legal Proceedings...");
    const prompt = `Analyze legal proceedings:

Questions:
- Any material litigation?
- Potential financial impact?
- Red flags?

Text (first 15000 chars):
${sectionsData.legal.text.substring(0, 15000)}

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

    analysis.sections.legal = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 7: MD&A
  if (sectionsData.mdna?.text && sectionsData.mdna.text.length > 500) {
    console.log("🤖 Analyzing MD&A...");
    const prompt = `Extract key information:

Text (first 20000 chars):
${sectionsData.mdna.text.substring(0, 20000)}

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

    analysis.sections.mdna = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 7A: Market Risk
  if (
    sectionsData.marketRisk?.text &&
    sectionsData.marketRisk.text.length > 300
  ) {
    console.log("🤖 Analyzing Market Risk...");
    const prompt = `Analyze market risk exposures:

Questions:
- Currency risk?
- Interest rate risk?
- Commodity price risk?
- Hedging strategies?

Text (first 15000 chars):
${sectionsData.marketRisk.text.substring(0, 15000)}

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

    analysis.sections.marketRisk = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 8: Financials
  if (
    sectionsData.financials?.text &&
    sectionsData.financials.text.length > 500
  ) {
    console.log("🤖 Analyzing Financials...");
    const prompt = `Extract financial metrics and any unusual items:

Questions:
- Key metrics (revenue, net income, EPS)?
- Any unusual items in footnotes?
- Going concern issues?
- Significant accounting changes?

Text (first 20000 chars):
${sectionsData.financials.text.substring(0, 20000)}

Return JSON:
{
  "revenue": {"value": "$X", "change": "Y%", "period": "FY20XX"},
  "netIncome": {"value": "$X", "change": "Y%", "period": "FY20XX"},
  "eps": {"value": "$X", "change": "Y%", "period": "FY20XX"},
  "unusualItems": ["any red flags in footnotes"],
  "accountingChanges": "description or N/A"
}`;

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    analysis.sections.financials = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 9A: Controls and Procedures
  if (sectionsData.controls?.text && sectionsData.controls.text.length > 300) {
    console.log("🤖 Analyzing Controls...");
    const prompt = `Analyze internal controls:

Questions:
- Any material weaknesses?
- Control deficiencies?
- Remediation plans?

Text (first 15000 chars):
${sectionsData.controls.text.substring(0, 15000)}

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

    analysis.sections.controls = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 10: Directors and Officers
  if (
    sectionsData.directors?.text &&
    sectionsData.directors.text.length > 300
  ) {
    console.log("🤖 Analyzing Directors...");
    const prompt = `Analyze board composition:

Questions:
- Key executives and their backgrounds?
- Board independence?
- Any concerns?

Text (first 15000 chars):
${sectionsData.directors.text.substring(0, 15000)}

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

    analysis.sections.directors = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 11: Executive Compensation
  if (
    sectionsData.compensation?.text &&
    sectionsData.compensation.text.length > 300
  ) {
    console.log("🤖 Analyzing Compensation...");
    const prompt = `Analyze executive compensation:

Questions:
- How much do CEO and top executives earn?
- Performance-based vs guaranteed?
- Any red flags (excessive pay, golden parachutes)?
- Pay ratio to median employee?

Text (first 20000 chars):
${sectionsData.compensation.text.substring(0, 20000)}

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

    analysis.sections.compensation = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 12: Security Ownership
  if (
    sectionsData.ownership?.text &&
    sectionsData.ownership.text.length > 300
  ) {
    console.log("🤖 Analyzing Ownership...");
    const prompt = `Analyze ownership structure:

Questions:
- Major shareholders?
- Insider ownership percentage?
- Any concentrated ownership?

Text (first 15000 chars):
${sectionsData.ownership.text.substring(0, 15000)}

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

    analysis.sections.ownership = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  // Item 13: Related Party Transactions
  if (
    sectionsData.relatedParty?.text &&
    sectionsData.relatedParty.text.length > 300
  ) {
    console.log("🤖 Analyzing Related Party Transactions...");
    const prompt = `Analyze related party transactions:

Questions:
- Any related party transactions?
- Potential conflicts of interest?
- Are they at arm's length?

Text (first 15000 chars):
${sectionsData.relatedParty.text.substring(0, 15000)}

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

    analysis.sections.relatedParty = JSON.parse(
      result.choices[0].message.content || "{}"
    );
  }

  return analysis;
}
