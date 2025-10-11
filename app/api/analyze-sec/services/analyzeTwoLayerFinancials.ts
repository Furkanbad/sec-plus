// app/api/analyze-sec/services/analyzeTwoLayerFinancials.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  twoLayerFinancialsSchema,
  TwoLayerFinancials,
} from "../schemas/TwoLayerFinancialsSchema";

function formatXBRLForPrompt(xbrlData: {
  raw: any;
  metrics: any;
  formatter: any;
}): string {
  const { metrics, formatter } = xbrlData;
  let formatted = "=== XBRL STRUCTURED DATA ===\n\n";

  if (metrics.revenue) {
    formatted += `Revenue: ${formatter.formatFinancialNumber(
      metrics.revenue.current
    )} (current), ${formatter.formatFinancialNumber(
      metrics.revenue.previous
    )} (previous)\n`;
  }
  if (metrics.netIncome) {
    formatted += `Net Income: ${formatter.formatFinancialNumber(
      metrics.netIncome.current
    )} (current), ${formatter.formatFinancialNumber(
      metrics.netIncome.previous
    )} (previous)\n`;
  }
  if (metrics.totalAssets) {
    formatted += `Total Assets: ${formatter.formatFinancialNumber(
      metrics.totalAssets.current
    )} (current)\n`;
  }
  if (metrics.operatingCashFlow) {
    formatted += `Operating Cash Flow: ${formatter.formatFinancialNumber(
      metrics.operatingCashFlow.current
    )} (current)\n`;
  }

  formatted += "\n=== END XBRL ===\n";
  return formatted;
}

export async function analyzeTwoLayerFinancials(
  item8Text: string,
  item15Text: string,
  xbrlData: { raw: any; metrics: any; formatter: any } | null,
  openai: OpenAI,
  companyName: string
): Promise<TwoLayerFinancials | null> {
  try {
    const combinedText = `${item8Text}\n\n=== EXHIBITS ===\n\n${item15Text}`;
    const xbrlFormatted = xbrlData
      ? formatXBRLForPrompt(xbrlData)
      : "⚠️ No XBRL data\n";

    const prompt = `Analyze Financial Statements for ${companyName}.

**🔴 CRITICAL EXCERPT RULE:**

Every 'excerpt' field MUST contain:
✅ EXACT, WORD-FOR-WORD copy-paste from the text below (1-3 sentences)
✅ Keep ALL original punctuation, numbers, symbols (®, ™, $, %)
❌ NEVER paraphrase, summarize, or write your own sentences

Example WRONG (your words):
"Revenue increased due to strong iPhone sales."

Example CORRECT (exact quote):
"Total net sales increased 2% or $7.8 billion during 2024 compared to 2023, driven primarily by growth in iPhone and Services revenue."

---

${xbrlFormatted}

=== FINANCIAL TEXT (Item 8 + Item 15) ===
${combinedText.substring(0, 120000)}
=== END TEXT ===

---

**TASK:**

For each financial item (Revenue, Net Income, etc.), provide:

1. **metric**: Numbers from XBRL (if available) or extract from text
   - current, previous, change, changePercentage

2. **summary**: 1-2 sentence overview of this specific item

3. **commentary**: 2-4 sentences with detailed explanation of:
   - What drove the change?
   - Any unusual items?
   - Management's perspective?

4. **excerpt**: EXACT QUOTE from text that supports your summary/commentary

5. **policies** (if relevant): Array of related accounting policies
   - Each with: policy name, description, EXACT QUOTE excerpt

6. **insights** (if significant): Array of key findings
   - Each with: topic, summary, significance (high/medium/low), EXACT QUOTE

7. **risks** (if any): Array of risks related to this item
   - Each with: description, mitigation, EXACT QUOTE

Also provide:
- **globalCommitments**: Purchase commitments, capital commitments
- **globalPolicies**: Critical accounting policies
- **globalRisks**: Overall financial risks
- **subsequentEvents**: Post-balance sheet events
- **overallAssessment**: Strengths, concerns, unusual items

**Return JSON:**

{
  "executiveSummary": {
    "overview": "2-3 sentence overview",
    "keyHighlights": ["Highlight 1", "Highlight 2"],
    "excerpt": "EXACT QUOTE"
  },
  
  "incomeStatement": {
    "revenue": {
      "label": "Revenue",
      "metric": {
        "current": "$391.04B",
        "previous": "$383.29B",
        "changePercentage": "2.02%"
      },
      "summary": "Revenue grew 2% driven by iPhone and Services",
      "commentary": "The increase was primarily due to higher iPhone unit sales in emerging markets and continued growth in the Services segment, particularly App Store and subscriptions. However, Mac revenue declined due to supply constraints.",
      "excerpt": "Total net sales increased 2% or $7.8 billion during 2024 compared to 2023, driven primarily by growth in iPhone and Services revenue.",
      "policies": [
        {
          "policy": "Revenue Recognition",
          "description": "Revenue is recognized when control transfers to customer",
          "excerpt": "EXACT QUOTE from text"
        }
      ],
      "insights": [
        {
          "topic": "Services Growth",
          "summary": "Services revenue grew 15% YoY to $85.2B",
          "significance": "high",
          "excerpt": "EXACT QUOTE"
        }
      ],
      "risks": []
    },
    
    "netIncome": {
      "label": "Net Income",
      "metric": {
        "current": "$93.74B",
        "previous": "$97.00B",
        "changePercentage": "-3.36%"
      },
      "summary": "Net income declined 3.4% due to higher tax rate",
      "commentary": "Despite revenue growth and improved gross margins, net income decreased due to a one-time transition tax charge of $10.3 billion related to the Tax Cuts and Jobs Act. Excluding this charge, net income would have increased approximately 7%.",
      "excerpt": "EXACT QUOTE about tax charge",
      "insights": [
        {
          "topic": "One-time Tax Charge",
          "summary": "$10.3B charge significantly impacted net income",
          "significance": "high",
          "excerpt": "EXACT QUOTE"
        }
      ]
    },
    
    // ... (similar for other income statement items)
  },
  
  "balanceSheet": {
    "totalAssets": { ... },
    "cash": { ... }
  },
  
  "cashFlow": {
    "operatingCashFlow": { ... }
  },
  
  "ratios": {
    "grossMargin": { ... }
  },
  
  "globalCommitments": [
    {
      "type": "Purchase Commitments",
      "description": "Non-cancellable component purchase obligations",
      "amount": "$147.7B",
      "excerpt": "EXACT QUOTE"
    }
  ],
  
  "globalPolicies": [
    {
      "policy": "Stock-Based Compensation",
      "description": "How SBC is accounted for",
      "excerpt": "EXACT QUOTE"
    }
  ],
  
  "subsequentEvents": [
    {
      "event": "Quarterly dividend declared",
      "date": "November 2024",
      "impact": "$0.25 per share",
      "excerpt": "EXACT QUOTE"
    }
  ],
  
  "overallAssessment": {
    "strengths": ["Strong cash generation", "Growing margins"],
    "concerns": ["Tax headwinds", "FX exposure"],
    "unusualItems": ["$10.3B one-time tax charge"],
    "summary": "Overall strong position despite one-time charges",
    "excerpt": "EXACT QUOTE"
  }
}

**REMEMBER: All excerpts = EXACT QUOTES. No paraphrasing!**
`;

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 16000,
    });

    const parsed = JSON.parse(result.choices[0].message.content || "{}");

    const validated = twoLayerFinancialsSchema.parse({
      ...parsed,
      analysisDate: new Date().toISOString(),
      sourceFiles: {
        item8Length: item8Text.length,
        item15Length: item15Text.length,
        combinedLength: combinedText.length,
      },
    });

    console.log("📊 ✅ Analysis complete");
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
