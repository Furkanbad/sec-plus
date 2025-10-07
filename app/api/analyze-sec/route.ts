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
      analyzeBusinessSection(sectionsData.business.text, openai)
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
      analyzeRiskSection(sectionsData.risk.text, openai)
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
      analyzeLegalSection(sectionsData.legal.text, openai)
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
      analyzeMdnaSection(sectionsData.mdna.text, openai)
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
      analyzeMarketRiskSection(sectionsData.marketRisk.text, openai)
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
      analyzeFinancialsSection(sectionsData.financials.text, openai)
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
      analyzeControlsSection(sectionsData.controls.text, openai)
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
      analyzeDirectorsSection(sectionsData.directors.text, openai)
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
      analyzeCompensationSection(sectionsData.compensation.text, openai)
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
      analyzeOwnershipSection(sectionsData.ownership.text, openai)
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
      analyzeRelatedPartySection(sectionsData.relatedParty.text, openai)
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

async function analyzeBusinessSection(text: string, openai: OpenAI) {
  const prompt = `Analyze this Business section for ${
    process.env.COMPANY_NAME || "the company"
  }:
1. What does the company do? (specific products/services)
2. Key products by name and their market position.
3. Geographic markets of operation.
4. **Identify and describe 2-3 key competitive advantages** (e.g., proprietary technology, brand strength, cost leadership, network effect, distribution channels).
5. **Identify any significant growth strategies or market opportunities** explicitly mentioned (e.g., new market entry, product innovation, acquisitions).

Text: ${text}

Return JSON:
{
  "summary": "2-3 sentences with specifics about what the company does.",
  "keyProducts": [
    {"name": "product name", "marketPosition": "brief statement"}
  ],
  "markets": ["geographic markets"],
  "competitiveAdvantages": ["description of advantage 1", "description of advantage 2"],
  "growthStrategiesOpportunities": ["description of strategy/opportunity 1", "description of strategy/opportunity 2"]
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");
  // Ensure arrays are correctly handled
  if (!Array.isArray(parsedContent.keyProducts)) {
    parsedContent.keyProducts = parsedContent.keyProducts
      ? [parsedContent.keyProducts]
      : [];
  }
  if (!Array.isArray(parsedContent.competitiveAdvantages)) {
    parsedContent.competitiveAdvantages = parsedContent.competitiveAdvantages
      ? [parsedContent.competitiveAdvantages]
      : [];
  }
  if (!Array.isArray(parsedContent.growthStrategiesOpportunities)) {
    parsedContent.growthStrategiesOpportunities =
      parsedContent.growthStrategiesOpportunities
        ? [parsedContent.growthStrategiesOpportunities]
        : [];
  }
  return parsedContent;
}

async function analyzeRiskSection(text: string, openai: OpenAI) {
  const prompt = `From the Risk Factors section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed analysis by extracting 8-15 specific risks.
  For each risk, provide the following information:

  1.  **Category:** Classify the risk as 'operational', 'financial', 'regulatory', 'market', 'strategic', 'cybersecurity', 'environmental', or 'other'.
  2.  **Title:** A concise, descriptive title for the risk.
  3.  **Description:** A 2-4 sentence summary describing the nature of the risk and why it's a concern for the company.
  4.  **Potential Impact:** Describe the specific ways this risk could adversely affect the company's business, financial condition, or results of operations (e.g., "could lead to decreased revenue," "increase operating costs," "result in regulatory fines").
  5.  **Mitigation Strategies (if mentioned):** Briefly describe any specific strategies, controls, or plans the company mentions to mitigate or manage this risk. State 'None explicitly mentioned' if no strategy is detailed.
  6.  **Severity:** Assign a severity level based on the likely impact and probability: 'high', 'medium', or 'low'.
  7.  **Original Text Excerpt:** A short, direct quote (1-3 sentences) from the original text that best encapsulates the risk. **This field is mandatory.**

  Text: ${text}

  Return JSON. Ensure 'risks' is an array of objects.
  {
    "title": "Detailed Risk Factors Analysis",
    "risks": [
      {
        "category": "operational|financial|regulatory|market|strategic|cybersecurity|environmental|other",
        "title": "Concise risk title",
        "description": "2-4 sentence detailed description of the risk.",
        "potentialImpact": "Specific adverse effects on business/financials.",
        "mitigationStrategies": "Description of mitigation efforts or 'None explicitly mentioned'.",
        "severity": "high|medium|low",
        "originalExcerpt": "Direct quote from the text (1-3 sentences) that best represents the risk."
      }
    ],
    "overallRiskSummary": "A concluding statement on the company's general risk profile, highlighting the most significant identified risks."
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = result.choices[0].message.content || "{}";

    let data;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      console.error("Risk JSON parsing error, attempting to fix...");

      const fixedContent = content
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/\n/g, " ")
        .replace(/\t/g, " ");

      try {
        data = JSON.parse(fixedContent);
      } catch (secondError) {
        console.error(
          "Failed to parse risk analysis even after cleanup:",
          secondError
        );
        return [
          {
            id: "risk-0",
            category: "other",
            title: "Risk Analysis Error",
            description:
              "Unable to parse risk analysis due to formatting issues. Please review the original document.",
            potentialImpact: "See original document for details",
            mitigationStrategies: "None explicitly mentioned",
            severity: "medium",
            originalExcerpt:
              "Risk analysis could not be completed due to technical issues.",
          },
        ];
      }
    }

    const risks = Array.isArray(data.risks) ? data.risks : [];
    return risks.map((r: any, i: number) => ({
      id: `risk-${i}`,
      category: r.category || "other",
      title: r.title || "Untitled Risk",
      description: r.description || "No description available",
      potentialImpact: r.potentialImpact || "Impact not specified",
      mitigationStrategies:
        r.mitigationStrategies || "None explicitly mentioned",
      severity: r.severity || "medium",
      originalExcerpt: r.originalExcerpt || "No excerpt available",
      ...r,
    }));
  } catch (error) {
    console.error("Failed to analyze risks:", error);
    return [];
  }
}

async function analyzeLegalSection(text: string, openai: OpenAI) {
  const prompt = `From the Legal Proceedings section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a comprehensive analysis of significant legal matters.

  Specifically, extract and analyze the following:
  1.  **Overall Legal Summary:** Provide a brief overview (1-2 sentences) of the company's general legal landscape or state 'No material litigation reported'.
  2.  **Material Legal Cases (if any):** For each material legal proceeding identified:
      *   **Case Title/Description:** A concise title and description of the case, including the parties involved.
      *   **Nature of Claim:** The type of claim (e.g., patent infringement, environmental violation, consumer class action, antitrust, regulatory inquiry).
      *   **Current Status:** The current stage of the proceeding (e.g., ongoing litigation, settlement discussions, appeal, concluded with judgment).
      *   **Company's Position:** A brief statement on the company's defense or position in the case.
      *   **Potential Financial Impact:** A detailed assessment of the potential financial impact, including:
          *   Estimated range of loss, if disclosed.
          *   Any reserves/provisions set aside.
          *   Impact on earnings, cash flow, or financial condition.
          *   Whether the impact is covered by insurance.
          *   State 'Not estimable at this time' or 'No material impact expected' if explicitly stated.
      *   **Key Dates:** Any significant upcoming dates or past rulings mentioned.
  3.  **Regulatory Inquiries/Investigations (if separate):** Summarize any significant regulatory inquiries or investigations mentioned, their nature, and potential implications. State 'None reported' if not applicable.
  4.  **Environmental Litigation (if specific):** Summarize any specific environmental litigation or regulatory actions, their status, and estimated costs. State 'None reported' if not applicable.
  5.  **Overall Risk Assessment:** Provide a concluding statement on the overall legal risk exposure for the company based on the information provided. State 'Low legal risk' or 'Moderate legal risk' if an assessment can be inferred, or 'Assessment not specified'.

  Text: ${text}

  Return JSON. If no material litigation, only return the "overallLegalSummary" indicating 'No material litigation reported'.
  {
    "title": "Detailed Legal Proceedings Analysis",
    "overallLegalSummary": "Brief overview or 'No material litigation reported'.",
    "materialCases": [
      {
        "caseTitle": "Title/Parties",
        "natureOfClaim": "Type of claim",
        "currentStatus": "Stage of proceeding",
        "companyPosition": "Company's defense/position",
        "potentialFinancialImpact": {
          "estimatedLossRange": "e.g., '$X - $Y million' or 'Not estimable'",
          "reservesSetAside": "e.g., '$Z million' or 'None'",
          "impactDescription": "Description of impact on financials",
          "insuranceCoverage": "Yes|No|Not specified"
        },
        "keyDates": ["Date 1", "Date 2"]
      }
    ],
    "regulatoryInquiries": "Summary of regulatory inquiries or 'None reported'.",
    "environmentalLitigation": "Summary of environmental litigation or 'None reported'.",
    "overallRiskAssessment": "Concluding statement on legal risk exposure."
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Ensure materialCases and keyDates are arrays
  if (!Array.isArray(parsedContent.materialCases)) {
    parsedContent.materialCases = parsedContent.materialCases
      ? [parsedContent.materialCases]
      : [];
  }
  parsedContent.materialCases.forEach((caseItem: any) => {
    if (!Array.isArray(caseItem.keyDates)) {
      caseItem.keyDates = caseItem.keyDates ? [caseItem.keyDates] : [];
    }
  });

  return parsedContent;
}

async function analyzeMdnaSection(text: string, openai: OpenAI) {
  const prompt = `Analyze the Management's Discussion and Analysis (MD&A) section for the company ${
    process.env.COMPANY_NAME || "the company"
  } in detail.
  Extract the following comprehensive information, providing specific numbers, percentages, and years where available:

  1.  **Executive Summary of Operations and Financial Condition:** Provide a narrative summary (4-6 sentences) of the company's financial performance (revenues, profitability, key drivers of change) and financial condition (liquidity, capital resources) for the most recent periods presented. Include actual numbers and year-over-year comparisons.
  2.  **Results of Operations - Detailed Analysis:**
      *   **Revenue Analysis:** Describe key factors and trends influencing revenue (e.g., product mix, pricing, volume, geographic performance). Include specific numbers and growth rates.
      *   **Cost of Sales/Gross Profit Analysis:** Explain significant changes in cost of sales and gross profit margins.
      *   **Operating Expenses Analysis:** Detail major changes and drivers in operating expenses (e.g., R&D, SG&A) and their impact on profitability.
      *   **Other Income/Expense:** Summarize any material non-operating income or expenses.
  3.  **Liquidity and Capital Resources:**
      *   **Current Liquidity:** Summarize the company's short-term liquidity, including cash and equivalents, working capital, and operating cash flows. Provide relevant figures and trends.
      *   **Capital Resources:** Describe the company's long-term capital structure, significant debt obligations, and access to capital markets.
      *   **Cash Flow Analysis:** Briefly analyze cash flows from operating, investing, and financing activities, highlighting major uses and sources of cash.
      *   **Future Capital Needs:** Identify any stated future capital expenditure plans (CAPEX) or other significant funding needs.
  4.  **Critical Accounting Policies and Estimates:**
      *   Identify 2-3 of the most critical accounting policies or estimates that require management's subjective judgment and could have a material impact on financial results.
      *   Briefly explain why these policies are considered critical and the nature of the estimation uncertainty.
  5.  **Off-Balance Sheet Arrangements:** Describe any material off-balance sheet arrangements (e.g., guarantees, securitized assets, unconsolidated entities) and their potential impact on liquidity or capital resources. State 'None reported' if not applicable.
  6.  **Known Trends, Uncertainties, and Opportunities:**
      *   Identify 3-5 significant known trends, demands, commitments, events, uncertainties, **or opportunities** that are reasonably likely to have a material effect on the company's future financial condition or operating results.
      *   For each, briefly describe its nature and potential impact/benefit.
  7.  **Strategic Outlook and Future Plans:**
      *   Summarize the company's strategic vision, significant future plans (e.g., expansion, new products, strategic initiatives, market entries), and expected challenges as discussed by management.
      *   Mention any identified forward-looking statements or risks associated with them, but also highlight potential benefits of these plans.

  Text: ${text}

  Return JSON. Ensure 'executiveSummary' is a plain string.
  {
    "title": "Comprehensive Management's Discussion and Analysis",
    "executiveSummary": "A 4-6 sentence narrative summary of financial performance and condition with specific numbers and comparisons.",
    "resultsOfOperations": {
      "revenueAnalysis": "Detailed analysis of revenue changes and drivers with numbers.",
      "costOfSalesAnalysis": "Explanation of changes in COGS and gross margins.",
      "operatingExpensesAnalysis": "Analysis of operating expense changes and impact on profitability.",
      "otherIncomeExpense": "Summary of material non-operating items or 'None reported'."
    },
    "liquidityAndCapitalResources": {
      "currentLiquidity": "Summary of short-term liquidity with figures and trends.",
      "capitalResources": "Description of long-term capital structure and debt.",
      "cashFlowAnalysis": "Brief analysis of operating, investing, and financing cash flows.",
      "futureCapitalNeeds": "Identified future CAPEX or funding needs or 'None reported'."
    },
    "criticalAccountingPolicies": [
      {
        "policyName": "Name of policy",
        "explanation": "Why it's critical and estimation uncertainty."
      }
    ],
    "offBalanceSheetArrangements": "Description of arrangements and their impact or 'None reported'.",
    "knownTrendsUncertaintiesOpportunities": [
      {
        "itemDescription": "Description of trend, uncertainty, or opportunity.",
        "impactBenefit": "Potential material effect or benefit."
      }
    ],
    "strategicOutlookAndFuturePlans": "Summary of company's strategic vision, future plans, and potential benefits/challenges."
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Ensure arrays are correctly handled
  if (!Array.isArray(parsedContent.criticalAccountingPolicies)) {
    parsedContent.criticalAccountingPolicies =
      parsedContent.criticalAccountingPolicies
        ? [parsedContent.criticalAccountingPolicies]
        : [];
  }
  if (!Array.isArray(parsedContent.knownTrendsUncertaintiesOpportunities)) {
    parsedContent.knownTrendsUncertaintiesOpportunities =
      parsedContent.knownTrendsUncertaintiesOpportunities
        ? [parsedContent.knownTrendsUncertaintiesOpportunities]
        : [];
  }
  if (
    typeof parsedContent.executiveSummary !== "string" &&
    parsedContent.executiveSummary !== null
  ) {
    console.warn(
      "OpenAI returned non-string for MD&A executiveSummary. Stringifying it."
    );
    parsedContent.executiveSummary = String(parsedContent.executiveSummary);
  }

  return parsedContent;
}

async function analyzeMarketRiskSection(text: string, openai: OpenAI) {
  const prompt = `From the Market Risk section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed analysis of market risk exposures, including their potential impact and the company's mitigation strategies.

  Specifically, extract and analyze the following:
  1.  **Overall Market Risk Summary:** Provide a concise overview (2-3 sentences) of the company's primary market risk exposures.
  2.  **Interest Rate Risk:**
      *   Describe the company's exposure to changes in interest rates (e.g., variable-rate debt, investments).
      *   Quantify, if possible, the potential financial impact of a hypothetical change in interest rates (e.g., "A 1% increase in interest rates would impact pre-tax earnings by $X million").
      *   Detail any strategies or instruments used to mitigate interest rate risk (e.g., interest rate swaps, fixed-rate debt).
      *   State 'None reported' if no significant interest rate risk or mitigation is mentioned.
  3.  **Foreign Currency Exchange Rate Risk:**
      *   Describe the company's exposure to fluctuations in foreign currency exchange rates (e.g., foreign sales, international operations, foreign-denominated debt).
      *   Quantify, if possible, the potential financial impact of a hypothetical change in exchange rates (e.g., "A 10% weakening of the Euro against the USD would impact revenue by $Y million").
      *   Detail any strategies or instruments used to mitigate currency risk (e.g., foreign currency forward contracts, natural hedges).
      *   State 'None reported' if no significant currency risk or mitigation is mentioned.
  4.  **Commodity Price Risk (if applicable):**
      *   Describe any significant exposure to changes in commodity prices (e.g., raw materials for production, energy costs).
      *   Quantify, if possible, the potential financial impact of a hypothetical change in commodity prices.
      *   Detail any strategies or instruments used to mitigate commodity price risk (e.g., supply contracts, hedging instruments).
      *   State 'None reported' if no significant commodity price risk or mitigation is mentioned.
  5.  **Equity Price Risk (if applicable):**
      *   Describe any significant exposure to changes in equity prices (e.g., equity investments, stock-based compensation).
      *   Quantify, if possible, the potential financial impact of a hypothetical change in equity prices.
      *   Detail any strategies or instruments used to mitigate equity price risk.
      *   State 'None reported' if no significant equity price risk or mitigation is mentioned.
  6.  **Overall Hedging Strategy:** Summarize the company's general philosophy and approach to managing its market risks (e.g., "The company primarily uses derivative financial instruments to manage interest rate and foreign currency risks...").
  7.  **Key Takeaways/Concerns:** Highlight any particularly noteworthy points, significant vulnerabilities, or unusual hedging practices identified in the section. State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON. Ensure all financial impacts include currency and unit.
  {
    "title": "Detailed Market Risk Analysis",
    "overallSummary": "A concise overview of primary market risk exposures.",
    "interestRateRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": "Quantified potential financial impact or 'Not specified'.",
      "mitigationStrategies": ["Strategy 1", "Strategy 2", "..."]
    },
    "currencyRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": "Quantified potential financial impact or 'Not specified'.",
      "mitigationStrategies": ["Strategy 1", "Strategy 2", "..."]
    },
    "commodityPriceRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": "Quantified potential financial impact or 'Not specified'.",
      "mitigationStrategies": ["Strategy 1", "Strategy 2", "..."]
    },
    "equityPriceRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": "Quantified potential financial impact or 'Not specified'.",
      "mitigationStrategies": ["Strategy 1", "Strategy 2", "..."]
    },
    "overallHedgingStrategy": "Summary of the company's general approach to market risk management.",
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Ensure mitigationStrategies and keyTakeawaysConcerns are arrays
  if (
    parsedContent.interestRateRisk &&
    !Array.isArray(parsedContent.interestRateRisk.mitigationStrategies)
  ) {
    parsedContent.interestRateRisk.mitigationStrategies = parsedContent
      .interestRateRisk.mitigationStrategies
      ? [parsedContent.interestRateRisk.mitigationStrategies]
      : [];
  }
  if (
    parsedContent.currencyRisk &&
    !Array.isArray(parsedContent.currencyRisk.mitigationStrategies)
  ) {
    parsedContent.currencyRisk.mitigationStrategies = parsedContent.currencyRisk
      .mitigationStrategies
      ? [parsedContent.currencyRisk.mitigationStrategies]
      : [];
  }
  if (
    parsedContent.commodityPriceRisk &&
    !Array.isArray(parsedContent.commodityPriceRisk.mitigationStrategies)
  ) {
    parsedContent.commodityPriceRisk.mitigationStrategies = parsedContent
      .commodityPriceRisk.mitigationStrategies
      ? [parsedContent.commodityPriceRisk.mitigationStrategies]
      : [];
  }
  if (
    parsedContent.equityPriceRisk &&
    !Array.isArray(parsedContent.equityPriceRisk.mitigationStrategies)
  ) {
    parsedContent.equityPriceRisk.mitigationStrategies = parsedContent
      .equityPriceRisk.mitigationStrategies
      ? [parsedContent.equityPriceRisk.mitigationStrategies]
      : [];
  }
  if (!Array.isArray(parsedContent.keyTakeawaysConcerns)) {
    parsedContent.keyTakeawaysConcerns = parsedContent.keyTakeawaysConcerns
      ? [parsedContent.keyTakeawaysConcerns]
      : [];
  }

  return parsedContent;
}

async function analyzeFinancialsSection(text: string, openai: OpenAI) {
  const prompt = `From the Financial Statements section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed breakdown of profitability for the most recent fiscal year and a year-over-year comparison.
  Specifically, extract and analyze the following:
  1.  **Revenue:** Value, absolute change and percentage change from the previous year, and the specific reporting period (e.g., FY20XX vs FY20XY). Explain the primary drivers for any significant change.
  2.  **Gross Profit:** Value, absolute change and percentage change from the previous year, and the period. Briefly explain factors affecting gross margin.
  3.  **Operating Income (EBIT):** Value, absolute change and percentage change from the previous year, and the period. Comment on operational efficiency changes.
  4.  **Net Income (Profit/Loss):** Value, absolute change and percentage change from the previous year, and the period. Highlight key contributors to net income fluctuations.
  5.  **Earnings Per Share (EPS) - Diluted:** Value, absolute change and percentage change from the previous year, and the period.
  6.  **Profit Margins:** Calculate and provide Gross Profit Margin, Operating Margin, and Net Profit Margin for the most recent year and the previous year. Comment on trends.
  7.  **Noteworthy Items/Footnotes:** Identify and summarize any unusual or non-recurring items, significant adjustments, one-time gains/losses, or critical information mentioned in footnotes that significantly impacted profitability or warrant special attention. If nothing unusual, state 'None identified'.

  Text: ${text}

  Return JSON. Ensure all values include units (e.g., "$X million", "Y%") and periods.
  {
    "title": "Detailed Profitability Analysis and Year-over-Year Comparison",
    "revenue": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "drivers": "Brief explanation of revenue changes."
    },
    "grossProfit": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "factors": "Brief explanation of gross profit factors."
    },
    "operatingIncome": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "efficiencyComment": "Comment on operational efficiency."
    },
    "netIncome": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "contributors": "Key contributors to net income fluctuations."
    },
    "epsDiluted": {
      "currentYear": {"value": "$X", "period": "FY20XX"},
      "previousYear": {"value": "$Y", "period": "FY20XY"},
      "changeAbsolute": "$Z",
      "changePercentage": "A%"
    },
    "profitMargins": {
      "grossProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "operatingMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "netProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "trendComment": "Brief comment on margin trends."
    },
    "noteworthyItems": [
      {
        "description": "Summary of unusual item 1 or footnote, including impact.",
        "type": "unusual_item|adjustment|footnote"
      },
      {
        "description": "Summary of unusual item 2 or footnote, including impact.",
        "type": "unusual_item|adjustment|footnote"
      }
    ],
    "overallAnalysis": "A concluding sentence or two highlighting the most significant finding regarding profitability."
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");
  // Ensure noteworthyItems is an array
  if (!Array.isArray(parsedContent.noteworthyItems)) {
    parsedContent.noteworthyItems = parsedContent.noteworthyItems
      ? [parsedContent.noteworthyItems]
      : [];
  }
  return parsedContent;
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
    model: "gpt-4o",
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
    model: "gpt-4o",
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
    model: "gpt-4o",
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
    model: "gpt-4o",
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
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  return JSON.parse(result.choices[0].message.content || "{}");
}
