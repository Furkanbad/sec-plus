// app/api/analyze-sec/services/analyzeTwoLayerFinancials.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  twoLayerFinancialsSchema,
  TwoLayerFinancials,
} from "../schemas/TwoLayerFinancialsSchema";
import { JSON_EXCERPT_INSTRUCTION } from "../constants/llm-instructions";

/**
 * XBRL metriklerini LLM için formatla
 */
function formatXBRLForPrompt(xbrlData: {
  raw: any;
  metrics: any;
  formatter: any;
}): string {
  const { metrics, formatter } = xbrlData;

  let formatted = "=== XBRL KEY METRICS ===\n\n";

  if (metrics.revenue) {
    formatted += `Revenue:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.revenue.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.revenue.previous
    )}\n`;
    const change = (
      ((metrics.revenue.current - metrics.revenue.previous) /
        Math.abs(metrics.revenue.previous)) *
      100
    ).toFixed(2);
    formatted += `  Change: ${change}%\n\n`;
  }

  if (metrics.cogs) {
    formatted += `Cost of Sales:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.cogs.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.cogs.previous
    )}\n\n`;
  }

  if (metrics.grossProfit || (metrics.revenue && metrics.cogs)) {
    const gpCurrent =
      metrics.grossProfit?.current ||
      metrics.revenue.current - metrics.cogs.current;
    const gpPrevious =
      metrics.grossProfit?.previous ||
      metrics.revenue.previous - metrics.cogs.previous;
    formatted += `Gross Profit:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(gpCurrent)}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      gpPrevious
    )}\n\n`;
  }

  if (metrics.opex) {
    formatted += `Operating Expenses:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.opex.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.opex.previous
    )}\n\n`;
  }

  if (metrics.operatingIncome) {
    formatted += `Operating Income:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.operatingIncome.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.operatingIncome.previous
    )}\n\n`;
  }

  if (metrics.netIncome) {
    formatted += `Net Income:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.netIncome.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.netIncome.previous
    )}\n\n`;
  }

  if (metrics.eps) {
    formatted += `EPS (Diluted):\n`;
    formatted += `  Current: $${metrics.eps.current.toFixed(2)}\n`;
    formatted += `  Previous: $${metrics.eps.previous.toFixed(2)}\n\n`;
  }

  if (metrics.totalAssets) {
    formatted += `Total Assets:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.totalAssets.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.totalAssets.previous
    )}\n\n`;
  }

  if (metrics.currentAssets) {
    formatted += `Current Assets:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.currentAssets.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.currentAssets.previous
    )}\n\n`;
  }

  if (metrics.totalLiabilities) {
    formatted += `Total Liabilities:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.totalLiabilities.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.totalLiabilities.previous
    )}\n\n`;
  }

  if (metrics.currentLiabilities) {
    formatted += `Current Liabilities:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.currentLiabilities.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.currentLiabilities.previous
    )}\n\n`;
  }

  if (metrics.equity) {
    formatted += `Shareholders' Equity:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.equity.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.equity.previous
    )}\n\n`;
  }

  if (metrics.cash) {
    formatted += `Cash and Cash Equivalents:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.cash.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.cash.previous
    )}\n\n`;
  }

  if (metrics.operatingCashFlow) {
    formatted += `Operating Cash Flow:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.operatingCashFlow.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.operatingCashFlow.previous
    )}\n\n`;
  }

  if (metrics.investingCashFlow) {
    formatted += `Investing Cash Flow:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.investingCashFlow.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.investingCashFlow.previous
    )}\n\n`;
  }

  if (metrics.financingCashFlow) {
    formatted += `Financing Cash Flow:\n`;
    formatted += `  Current: ${formatter.formatFinancialNumber(
      metrics.financingCashFlow.current
    )}\n`;
    formatted += `  Previous: ${formatter.formatFinancialNumber(
      metrics.financingCashFlow.previous
    )}\n\n`;
  }

  formatted += "=== END XBRL ===\n";
  return formatted;
}

/**
 * Empty XBRL metrics when not available
 */
function createEmptyXBRLMetrics() {
  return {
    revenue: null,
    cogs: null,
    grossProfit: null,
    opex: null,
    operatingIncome: null,
    netIncome: null,
    eps: null,
    totalAssets: null,
    currentAssets: null,
    totalLiabilities: null,
    currentLiabilities: null,
    equity: null,
    cash: null,
    operatingCashFlow: null,
    investingCashFlow: null,
    financingCashFlow: null,
  };
}

/**
 * ANA ANALİZ FONKSİYONU - ENTEGRE
 */
export async function analyzeTwoLayerFinancials(
  item8Text: string,
  item15Text: string,
  xbrlData: { raw: any; metrics: any; formatter: any } | null,
  openai: OpenAI,
  companyName: string
): Promise<TwoLayerFinancials | null> {
  try {
    console.log("📊 [Integrated Financial Analysis] Starting...");

    const combinedText = `${item8Text}\n\n=== EXHIBITS & FOOTNOTES ===\n\n${item15Text}`;

    // XBRL verilerini formatla
    const xbrlFormatted = xbrlData
      ? formatXBRLForPrompt(xbrlData)
      : "⚠️ XBRL data not available - extract all information from narrative text.\n";

    const prompt = `You are analyzing Financial Statements (Item 8 + Item 15) for ${companyName}.

**CRITICAL INSTRUCTIONS:**
1. **INTEGRATE**: For each financial item (Revenue, Net Income, etc.), combine:
   - Quantitative data from XBRL metrics (if available)
   - Qualitative explanations from narrative text
   
2. **CONTEXTUALIZE**: Explain what the numbers mean based on narrative context

3. **EXCERPTS ARE MANDATORY**: 
   - Extract direct quotes from NARRATIVE TEXT ONLY (never from XBRL)
   - Every policy, insight, and risk MUST have a supporting excerpt
   - Use complete sentences (1-3 sentences)

4. **FOCUS**: Prioritize:
   - Significant accounting policies
   - Unusual items or one-time charges
   - Commitments and contingencies
   - Identified risks
   - Management commentary

5. **STRUCTURE**: Fill the JSON schema completely. For missing data, use appropriate defaults.

${xbrlFormatted}

=== NARRATIVE TEXT (ITEM 8 + ITEM 15) ===
${combinedText}
=== END NARRATIVE TEXT ===

${JSON_EXCERPT_INSTRUCTION}

Return comprehensive JSON following this structure:

{
  "executiveSummary": {
    "overview": "2-3 sentence overview of financial health",
    "keyHighlights": ["Highlight 1", "Highlight 2"],
    "excerpt": "Key management statement from text"
  },
  
  "incomeStatement": {
    "revenue": {
      "label": "Revenue",
      "metric": {
        "current": "$391.04B",
        "previous": "$383.29B",
        "change": "$7.75B",
        "changePercentage": "2.02%"
      },
      "narrativeSummary": "Brief explanation of revenue trends from narrative",
      "relevantPolicies": [
        {
          "policy": "Revenue Recognition",
          "description": "How revenue is recognized",
          "changes": "Any changes from prior period",
          "excerpt": "Direct quote describing policy"
        }
      ],
      "keyInsights": [
        {
          "summary": "Significant finding about revenue",
          "significance": "high",
          "excerpt": "Direct quote supporting this insight"
        }
      ],
      "risks": [
        {
          "description": "Risk related to revenue",
          "mitigationStrategy": "How it's managed",
          "excerpt": "Direct quote about risk"
        }
      ],
      "excerpt": "Overall excerpt about revenue if available"
    },
    "costOfSales": { /* Same structure */ },
    "grossProfit": { /* Same structure */ },
    "operatingExpenses": { /* Same structure */ },
    "operatingIncome": { /* Same structure */ },
    "netIncome": {
      "label": "Net Income",
      "metric": { /* XBRL data */ },
      "narrativeSummary": "Explanation of net income drivers",
      "keyInsights": [
        {
          "summary": "E.g., One-time tax charge of $10.3B",
          "significance": "high",
          "excerpt": "Direct quote about the charge"
        }
      ],
      /* ... */
    },
    "eps": { /* Same structure */ }
  },
  
  "balanceSheet": {
    "totalAssets": { /* Same integrated structure */ },
    "currentAssets": { /* Same integrated structure */ },
    "totalLiabilities": { /* Same integrated structure */ },
    "currentLiabilities": { /* Same integrated structure */ },
    "shareholdersEquity": { /* Same integrated structure */ },
    "cash": { /* Same integrated structure */ }
  },
  
  "cashFlow": {
    "operatingCashFlow": { /* Same integrated structure */ },
    "investingCashFlow": { /* Same integrated structure */ },
    "financingCashFlow": { /* Same integrated structure */ }
  },
  
  "ratios": {
    "currentRatio": {
      "label": "Current Ratio",
      "metric": {
        "current": "1.32",
        "previous": "1.28"
      },
      "narrativeSummary": "Explanation of liquidity position",
      "excerpt": "Direct quote if available"
    },
    "grossMargin": { /* Same structure */ },
    "operatingMargin": { /* Same structure */ },
    "netMargin": { /* Same structure */ },
    "roe": { /* Same structure */ }
  },
  
  "commitmentsContingencies": [
    {
      "type": "Purchase Commitments",
      "description": "Component manufacturing commitments",
      "amount": "$147.7B",
      "timing": "Next 5 years",
      "probability": "probable",
      "excerpt": "Direct quote"
    }
  ],
  
  "significantAccountingPolicies": [
    {
      "policy": "Stock-Based Compensation",
      "description": "How SBC is accounted for",
      "changes": "Any changes from prior year",
      "excerpt": "Direct quote"
    }
  ],
  
  "subsequentEvents": [
    {
      "event": "Quarterly dividend declared",
      "date": "November 2024",
      "impact": "$0.25 per share",
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

    console.log("   Calling OpenAI with integrated analysis prompt...");

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 12000,
    });

    const parsed = JSON.parse(result.choices[0].message.content || "{}");

    console.log("   Validating with Zod schema...");
    const validated = twoLayerFinancialsSchema.parse({
      ...parsed,
      analysisDate: new Date().toISOString(),
      sourceFiles: {
        item8Length: item8Text.length,
        item15Length: item15Text.length,
        combinedLength: combinedText.length,
      },
    });

    console.log("📊 [Integrated Financial Analysis] ✅ Complete");
    return validated;
  } catch (error) {
    console.error("[analyzeTwoLayerFinancials] Error:", error);
    if (error instanceof z.ZodError) {
      console.error(
        "Validation errors:",
        JSON.stringify(error.issues, null, 2)
      );
    }
    return null;
  }
}
