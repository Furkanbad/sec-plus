// app/api/analyze-sec/services/analyzeTwoLayerFinancials.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  twoLayerFinancialsSchema,
  TwoLayerFinancials,
  XBRLMetrics,
  NarrativeAnalysis,
} from "../schemas/TwoLayerFinancialsSchema";
import { JSON_EXCERPT_INSTRUCTION } from "../constants/llm-instructions";

/**
 * LAYER 1: Analyze XBRL metrics
 * Pure quantitative analysis - no excerpts needed
 */
async function analyzeXBRLMetrics(xbrlData: {
  raw: any;
  metrics: any;
  formatter: any;
}): Promise<XBRLMetrics> {
  const { metrics, formatter } = xbrlData;

  console.log(
    "🔍 [analyzeXBRLMetrics] Available metrics:",
    Object.keys(metrics)
  );

  // Helper: Calculate change
  const calcChange = (current: number, previous: number) => {
    const absolute = current - previous;
    const percentage =
      previous !== 0
        ? ((absolute / Math.abs(previous)) * 100).toFixed(2) + "%"
        : "N/A";
    return {
      change: formatter.formatFinancialNumber(absolute),
      changePercentage: percentage,
    };
  };

  // Helper: Create metric with null safety
  const createMetric = (
    current: number | null | undefined,
    previous: number | null | undefined
  ) => {
    if (current == null || previous == null) {
      return {
        current: "N/A",
        previous: "N/A",
        change: undefined,
        changePercentage: undefined,
      };
    }
    return {
      current: formatter.formatFinancialNumber(current),
      previous: formatter.formatFinancialNumber(previous),
      ...calcChange(current, previous),
    };
  };

  // Calculate ratios with null safety
  const currentGrossMargin =
    metrics.revenue?.current && metrics.cogs?.current
      ? (
          ((metrics.revenue.current - metrics.cogs.current) /
            metrics.revenue.current) *
          100
        ).toFixed(1) + "%"
      : "N/A";
  const previousGrossMargin =
    metrics.revenue?.previous && metrics.cogs?.previous
      ? (
          ((metrics.revenue.previous - metrics.cogs.previous) /
            metrics.revenue.previous) *
          100
        ).toFixed(1) + "%"
      : "N/A";

  const currentNetMargin =
    metrics.revenue?.current && metrics.netIncome?.current
      ? ((metrics.netIncome.current / metrics.revenue.current) * 100).toFixed(
          1
        ) + "%"
      : "N/A";
  const previousNetMargin =
    metrics.revenue?.previous && metrics.netIncome?.previous
      ? ((metrics.netIncome.previous / metrics.revenue.previous) * 100).toFixed(
          1
        ) + "%"
      : "N/A";

  const currentCurrentRatio =
    metrics.currentAssets?.current && metrics.currentLiabilities?.current
      ? (
          metrics.currentAssets.current / metrics.currentLiabilities.current
        ).toFixed(2)
      : "N/A";
  const previousCurrentRatio =
    metrics.currentAssets?.previous && metrics.currentLiabilities?.previous
      ? (
          metrics.currentAssets.previous / metrics.currentLiabilities.previous
        ).toFixed(2)
      : "N/A";

  // Log what we found
  console.log("📊 [analyzeXBRLMetrics] Extracted data:");
  console.log(
    `   - Income Statement: ${metrics.revenue?.current ? "✅" : "❌"}`
  );
  console.log(
    `   - Balance Sheet: ${metrics.totalAssets?.current ? "✅" : "❌"}`
  );
  console.log(
    `   - Cash Flow: ${metrics.operatingCashFlow?.current ? "✅" : "❌"}`
  );

  return {
    title: "XBRL Financial Metrics",

    incomeStatement: {
      revenue: createMetric(
        metrics.revenue?.current,
        metrics.revenue?.previous
      ),
      costOfSales: createMetric(metrics.cogs?.current, metrics.cogs?.previous),
      grossProfit: createMetric(
        metrics.revenue?.current && metrics.cogs?.current
          ? metrics.revenue.current - metrics.cogs.current
          : null,
        metrics.revenue?.previous && metrics.cogs?.previous
          ? metrics.revenue.previous - metrics.cogs.previous
          : null
      ),
      operatingExpenses: createMetric(
        metrics.opex?.current,
        metrics.opex?.previous
      ),
      operatingIncome: createMetric(
        metrics.operatingIncome?.current,
        metrics.operatingIncome?.previous
      ),
      netIncome: createMetric(
        metrics.netIncome?.current,
        metrics.netIncome?.previous
      ),
      eps: {
        current: metrics.eps?.current?.toString() || "N/A",
        previous: metrics.eps?.previous?.toString() || "N/A",
        change:
          metrics.eps?.current && metrics.eps?.previous
            ? (metrics.eps.current - metrics.eps.previous).toFixed(2)
            : undefined,
        changePercentage:
          metrics.eps?.current && metrics.eps?.previous
            ? (
                ((metrics.eps.current - metrics.eps.previous) /
                  Math.abs(metrics.eps.previous)) *
                100
              ).toFixed(2) + "%"
            : undefined,
      },
    },

    balanceSheet: {
      totalAssets: createMetric(
        metrics.totalAssets?.current,
        metrics.totalAssets?.previous
      ),
      currentAssets: createMetric(
        metrics.currentAssets?.current,
        metrics.currentAssets?.previous
      ),
      totalLiabilities: createMetric(
        metrics.totalLiabilities?.current,
        metrics.totalLiabilities?.previous
      ),
      currentLiabilities: createMetric(
        metrics.currentLiabilities?.current,
        metrics.currentLiabilities?.previous
      ),
      shareholdersEquity: createMetric(
        metrics.equity?.current,
        metrics.equity?.previous
      ),
      cash: createMetric(metrics.cash?.current, metrics.cash?.previous),
      debt: metrics.debt?.current
        ? createMetric(metrics.debt.current, metrics.debt.previous)
        : undefined,
    },

    cashFlow: {
      operatingCashFlow: createMetric(
        metrics.operatingCashFlow?.current,
        metrics.operatingCashFlow?.previous
      ),
      investingCashFlow: createMetric(
        metrics.investingCashFlow?.current,
        metrics.investingCashFlow?.previous
      ),
      financingCashFlow: createMetric(
        metrics.financingCashFlow?.current,
        metrics.financingCashFlow?.previous
      ),
      freeCashFlow: metrics.freeCashFlow?.current
        ? createMetric(
            metrics.freeCashFlow.current,
            metrics.freeCashFlow.previous
          )
        : undefined,
      capitalExpenditures: metrics.capex?.current
        ? createMetric(metrics.capex.current, metrics.capex.previous)
        : undefined,
    },

    profitabilityRatios: {
      grossMargin: {
        current: currentGrossMargin,
        previous: previousGrossMargin,
        trend:
          currentGrossMargin !== "N/A" &&
          previousGrossMargin !== "N/A" &&
          parseFloat(currentGrossMargin) > parseFloat(previousGrossMargin)
            ? "improving"
            : currentGrossMargin !== "N/A" && previousGrossMargin !== "N/A"
            ? "declining"
            : undefined,
      },
      operatingMargin: { current: "N/A", previous: "N/A" },
      netMargin: {
        current: currentNetMargin,
        previous: previousNetMargin,
        trend:
          currentNetMargin !== "N/A" &&
          previousNetMargin !== "N/A" &&
          parseFloat(currentNetMargin) > parseFloat(previousNetMargin)
            ? "improving"
            : currentNetMargin !== "N/A" && previousNetMargin !== "N/A"
            ? "declining"
            : undefined,
      },
      roe: { current: "N/A", previous: "N/A" },
      roa: { current: "N/A", previous: "N/A" },
    },

    liquidityRatios: {
      currentRatio: {
        current: currentCurrentRatio,
        previous: previousCurrentRatio,
        trend:
          currentCurrentRatio !== "N/A" &&
          previousCurrentRatio !== "N/A" &&
          parseFloat(currentCurrentRatio) > parseFloat(previousCurrentRatio)
            ? "improving"
            : currentCurrentRatio !== "N/A" && previousCurrentRatio !== "N/A"
            ? "declining"
            : undefined,
      },
      quickRatio: { current: "N/A", previous: "N/A" },
      workingCapital: createMetric(
        metrics.currentAssets?.current && metrics.currentLiabilities?.current
          ? metrics.currentAssets.current - metrics.currentLiabilities.current
          : null,
        metrics.currentAssets?.previous && metrics.currentLiabilities?.previous
          ? metrics.currentAssets.previous - metrics.currentLiabilities.previous
          : null
      ),
    },

    leverageRatios: {
      debtToEquity: { current: "N/A", previous: "N/A" },
      debtToAssets: { current: "N/A", previous: "N/A" },
    },
  };
}

/**
 * LAYER 2: Analyze narrative text
 * Qualitative analysis with excerpts from Item 8 + Item 15 text
 */
async function analyzeNarrativeText(
  combinedText: string,
  openai: OpenAI,
  companyName: string
): Promise<NarrativeAnalysis> {
  const prompt = `You are analyzing the Financial Statements section (Item 8 + Item 15) for ${companyName}.

**CRITICAL INSTRUCTIONS:**
1. Extract insights from the NARRATIVE TEXT ONLY (not from tables or numbers)
2. ALL excerpts must be complete sentences with context
3. Focus on: footnotes, disclosures, accounting policies, commitments, risks
4. Look for management commentary, unusual items, significant changes

**GOOD EXCERPT EXAMPLES:**
✅ "The Company recognized a one-time charge of $10.3 billion related to the State Aid Decision in fiscal 2024."
✅ "Revenue is recognized at the point of sale for products and over time for services."
✅ "The Company has purchase commitments totaling $147.7 billion over the next five years."

**BAD EXCERPT EXAMPLES:**
❌ "Total revenue 391,035 &#160; 383,285" (table data)
❌ "Net income $ 93,736" (just numbers)

=== NARRATIVE TEXT ===
${combinedText}
=== END TEXT ===

${JSON_EXCERPT_INSTRUCTION}

Return comprehensive JSON covering:
{
  "title": "Financial Statements Narrative Analysis",
  
  "executiveSummary": {
    "overview": "2-3 sentence overview of key financial statement insights",
    "keyHighlights": ["Highlight 1", "Highlight 2"],
    "excerpt": "Key sentence from management discussion"
  },
  
  "accountingPolicies": [
    {
      "policy": "Revenue Recognition",
      "description": "How revenue is recognized",
      "changes": "Any changes from prior year",
      "impact": "Impact of policy or change",
      "excerpt": "Direct quote describing policy"
    }
  ],
  
  "footnotes": {
    "revenueRecognition": {
      "summary": "Revenue recognition methodology",
      "methodologies": ["Method 1", "Method 2"],
      "excerpt": "Direct quote"
    },
    "stockBasedCompensation": {
      "totalExpense": "$11.69B",
      "summary": "Stock compensation details",
      "excerpt": "Direct quote"
    },
    "incomeTaxes": {
      "effectiveRate": "24.1%",
      "significantItems": ["State Aid Decision"],
      "excerpt": "Direct quote"
    },
    "debtObligations": {
      "summary": "Debt structure and maturities",
      "maturities": ["2025: $10B", "2026: $15B"],
      "excerpt": "Direct quote"
    },
    "leases": {
      "summary": "Lease commitments",
      "excerpt": "Direct quote"
    },
    "fairValue": {
      "summary": "Fair value measurement approach",
      "excerpt": "Direct quote"
    }
  },
  
  "commitmentsContingencies": [
    {
      "type": "Purchase Commitments",
      "description": "Component manufacturing commitments",
      "amount": "$147.7B",
      "timing": "Next 5 years",
      "excerpt": "Direct quote"
    },
    {
      "type": "Legal Contingency",
      "description": "State Aid case",
      "amount": "$10.3B",
      "probability": "probable",
      "excerpt": "Direct quote"
    }
  ],
  
  "relatedPartyTransactions": {
    "hasMaterialTransactions": false,
    "summary": "None material",
    "transactions": []
  },
  
  "subsequentEvents": [
    {
      "event": "Quarterly dividend declared",
      "date": "November 2024",
      "impact": "$0.25 per share",
      "excerpt": "Direct quote"
    }
  ],
  
  "segmentInformation": {
    "hasSeparateSegments": true,
    "segments": [
      {
        "name": "Americas",
        "revenue": "$169B",
        "description": "Regional segment",
        "excerpt": "Direct quote"
      }
    ]
  },
  
  "keyInsights": [
    {
      "topic": "One-Time Tax Charge",
      "summary": "Significant impact from State Aid case",
      "significance": "high",
      "excerpt": "Direct quote"
    }
  ],
  
  "risksIdentified": [
    {
      "risk": "Foreign Exchange Risk",
      "description": "Currency volatility impact",
      "mitigationStrategy": "Hedging program",
      "excerpt": "Direct quote"
    }
  ],
  
  "overallAssessment": {
    "strengths": ["Strong cash generation", "Improving margins"],
    "concerns": ["Tax uncertainty", "FX exposure"],
    "unusualItems": ["$10.3B one-time charge"],
    "summary": "Overall financial health assessment",
    "excerpt": "Management's overall commentary"
  }
}`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 8000,
    });

    const parsed = JSON.parse(result.choices[0].message.content || "{}");
    return parsed as NarrativeAnalysis;
  } catch (error) {
    console.error("[analyzeNarrativeText] Error:", error);
    throw error;
  }
}

/**
 * Helper: Create empty XBRL metrics structure when no data is available
 */
function createEmptyXBRLMetrics(): XBRLMetrics {
  const emptyMetric = {
    current: "N/A",
    previous: "N/A",
    change: undefined,
    changePercentage: undefined,
  };

  const emptyRatio = {
    current: "N/A",
    previous: "N/A",
    trend: undefined as "improving" | "declining" | "stable" | undefined,
  };

  return {
    title: "XBRL Financial Metrics",
    incomeStatement: {
      revenue: emptyMetric,
      costOfSales: emptyMetric,
      grossProfit: emptyMetric,
      operatingExpenses: emptyMetric,
      operatingIncome: emptyMetric,
      netIncome: emptyMetric,
      eps: emptyMetric,
    },
    balanceSheet: {
      totalAssets: emptyMetric,
      currentAssets: emptyMetric,
      totalLiabilities: emptyMetric,
      currentLiabilities: emptyMetric,
      shareholdersEquity: emptyMetric,
      cash: emptyMetric,
      debt: undefined,
    },
    cashFlow: {
      operatingCashFlow: emptyMetric,
      investingCashFlow: emptyMetric,
      financingCashFlow: emptyMetric,
      freeCashFlow: undefined,
      capitalExpenditures: undefined,
    },
    profitabilityRatios: {
      grossMargin: emptyRatio,
      operatingMargin: emptyRatio,
      netMargin: emptyRatio,
      roe: emptyRatio,
      roa: emptyRatio,
    },
    liquidityRatios: {
      currentRatio: emptyRatio,
      quickRatio: emptyRatio,
      workingCapital: emptyMetric,
    },
    leverageRatios: {
      debtToEquity: emptyRatio,
      debtToAssets: emptyRatio,
    },
  };
}

/**
 * MAIN: Analyze both layers
 */
export async function analyzeTwoLayerFinancials(
  item8Text: string,
  item15Text: string,
  xbrlData: { raw: any; metrics: any; formatter: any } | null,
  openai: OpenAI,
  companyName: string
): Promise<TwoLayerFinancials | null> {
  try {
    console.log("📊 [Two-Layer Analysis] Starting...");
    console.log(`   Item 8 text: ${item8Text.length} chars`);
    console.log(`   Item 15 text: ${item15Text.length} chars`);
    console.log(`   XBRL available: ${!!xbrlData}`);

    const combinedText = `${item8Text}\n\n=== EXHIBITS & FOOTNOTES ===\n\n${item15Text}`;

    // Layer 1: XBRL Metrics (if available)
    let xbrlMetrics: XBRLMetrics;
    if (xbrlData && xbrlData.metrics) {
      console.log("   Analyzing XBRL metrics...");
      xbrlMetrics = await analyzeXBRLMetrics(xbrlData);
      console.log("   ✅ XBRL metrics analyzed");
    } else {
      console.log("   ⚠️  No XBRL data available, using empty structure");
      xbrlMetrics = createEmptyXBRLMetrics();
    }

    // Layer 2: Narrative Analysis
    console.log("   Analyzing narrative text...");
    const narrativeAnalysis = await analyzeNarrativeText(
      combinedText,
      openai,
      companyName
    );
    console.log("   ✅ Narrative analysis complete");

    const result: TwoLayerFinancials = {
      xbrlMetrics,
      narrativeAnalysis,
      analysisDate: new Date().toISOString(),
      sourceFiles: {
        item8Length: item8Text.length,
        item15Length: item15Text.length,
        combinedLength: combinedText.length,
      },
    };

    console.log("📊 [Two-Layer Analysis] ✅ Complete");
    return result;
  } catch (error) {
    console.error("[analyzeTwoLayerFinancials] Error:", error);
    return null;
  }
}
