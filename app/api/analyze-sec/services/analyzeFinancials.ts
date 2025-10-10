// app/api/analyze-sec/services/analyzeFinancials.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  financialAnalysisSchema,
  FinancialAnalysis,
} from "../schemas/financialsAnalysisSchema";

import {
  EXCERPT_INSTRUCTION,
  JSON_EXCERPT_INSTRUCTION,
} from "../constants/llm-instructions";

// Token limitleri
const MAX_CHUNK_SIZE_TOKENS = 15000;

// Token sayma
const countTokens = (str: string) => Math.ceil(str.length / 4);

// Delay fonksiyonu
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeFinancialSection(
  text: string,
  openai: OpenAI,
  companyName: string,
  xbrlData?: string
): Promise<FinancialAnalysis | null> {
  const promptTemplate = (chunkText: string) => `${EXCERPT_INSTRUCTION}

You are analyzing Financial Statements for ${companyName}.

**CRITICAL: DATA SOURCE PRIORITIZATION**

You have TWO data sources:
1. **XBRL Structured Data** (below): Precise, machine-readable financial figures
2. **Narrative Text** (below): Contextual explanations and management analysis

**INSTRUCTIONS:**
✅ **ALWAYS prioritize XBRL data for ALL numerical values** (revenue, expenses, assets, liabilities, cash flow, margins, etc.)
✅ **Use narrative text for:**
   - Business context and reasons for changes
   - Management commentary and insights
   - Qualitative factors
   - Forward-looking statements
   - All excerpts (MANDATORY)
✅ **Cross-reference both sources** for comprehensive analysis
⚠️ **If XBRL lacks a specific metric**, extract from narrative text
⚠️ **ALL excerpts MUST be direct quotes from NARRATIVE TEXT**, never from XBRL data

${
  xbrlData
    ? `\n=== XBRL STRUCTURED DATA (USE FOR EXACT NUMBERS) ===\n${xbrlData}\n=== END XBRL DATA ===\n`
    : "⚠️ XBRL data not available - extract all metrics from narrative text\n"
}

=== NARRATIVE TEXT (USE FOR CONTEXT AND EXCERPTS) ===
${chunkText}
=== END NARRATIVE TEXT ===

${JSON_EXCERPT_INSTRUCTION}

**OUTPUT REQUIREMENTS:**
- All monetary values: Include currency and scale (e.g., "$45.2B", "$1.23M")
- All percentages: Include "%" symbol (e.g., "15.5%")
- All excerpts: Direct quotes from NARRATIVE TEXT only
- Year-over-year comparisons: Provide where applicable
- Period labels: Include (e.g., "FY2024", "Q3 2024")

**CRITICAL FORMAT REQUIREMENTS:**
- Monetary values can use EITHER format:
  * Short: "$391.04B", "$7.75B", "$123.22B" (preferred)
  * Long: "$391.04 billion", "$7.75 billion", "$123.22 billion"
- Percentages: "2.02%", "-3.36%" (include % and handle negatives)
- Periods: "FY2024", "FY2023", "Q3 2024", etc.

**ACCEPTED FORMATS:**
✅ "$391.04B" or "$391.04 billion"
✅ "$7.75M" or "$7.75 million"  
✅ "$123.22K" or "$123.22 thousand"
✅ "2.02%" or "-3.36%"
❌ "391 billion" (missing $)
❌ "2.02" (missing %)
❌ "$391B" (missing decimal for billions)

Return JSON matching this exact structure:
{
  "title": "Detailed Profitability Analysis and Year-over-Year Comparison",
  "revenueAnalysis": {
    "currentYear": {"value": "$391.04B", "period": "FY2024"},
    "previousYear": {"value": "$383.29B", "period": "FY2023"},
    "changeAbsolute": "$7.75B",
    "changePercentage": "2.02%",
    "drivers": "Brief explanation of revenue changes",
    "excerpt": "MANDATORY direct quote from narrative text"
  },
  "cogsAndGrossProfitAnalysis": {
    "cogs": {
      "currentYear": {"value": "$210.35B", "period": "FY2024"},
      "previousYear": {"value": "$214.14B", "period": "FY2023"}
    },
    "grossProfit": {
      "currentYear": {"value": "$180.68B", "period": "FY2024"},
      "previousYear": {"value": "$169.15B", "period": "FY2023"},
      "changeAbsolute": "$11.53B",
      "changePercentage": "6.82%",
      "excerpt": "MANDATORY direct quote"
    },
    "factors": "Explanation of COGS and margin factors",
    "excerpt": "MANDATORY direct quote"
  },
  "operatingExpensesAnalysis": {
    "totalOperatingExpenses": {
      "currentYear": {"value": "$57.47B", "period": "FY2024"},
      "previousYear": {"value": "$54.85B", "period": "FY2023"},
      "changeAbsolute": "$2.62B",
      "changePercentage": "4.77%",
      "excerpt": "MANDATORY direct quote"
    },
    "sgna": {
      "currentYear": {"value": "$26.10B", "period": "FY2024"},
      "previousYear": {"value": "$24.93B", "period": "FY2023"}
    },
    "efficiencyComment": "Comment on operational efficiency",
    "excerpt": "MANDATORY direct quote"
  },
  "operatingIncomeEBITAnalysis": {
    "currentYear": {"value": "$123.22B", "period": "FY2024"},
    "previousYear": {"value": "$114.30B", "period": "FY2023"},
    "changeAbsolute": "$8.92B",
    "changePercentage": "7.81%",
    "trendComment": "Comment on profitability trend",
    "excerpt": "MANDATORY direct quote"
  },
  "ebitdaAnalysis": {
    "currentYear": {"value": "$134.66B", "period": "FY2024"},
    "previousYear": {"value": "$125.82B", "period": "FY2023"},
    "changeAbsolute": "$8.84B",
    "changePercentage": "7.03%",
    "significance": "Significance of EBITDA change",
    "excerpt": "MANDATORY direct quote"
  },
  "interestAndOtherNonOperatingItems": {
    "interestExpense": {
      "currentYear": {"value": "$3.75B", "period": "FY2024"},
      "previousYear": {"value": "$3.93B", "period": "FY2023"}
    },
    "otherNonOperatingIncomeExpense": {
      "currentYear": {"value": "$269M", "period": "FY2024"},
      "previousYear": {"value": "-$565M", "period": "FY2023"}
    },
    "impactComment": "Impact on pre-tax income",
    "excerpt": "MANDATORY direct quote"
  },
  "incomeTaxExpenseAnalysis": {
    "currentYear": {"value": "$29.75B", "period": "FY2024"},
    "previousYear": {"value": "$16.74B", "period": "FY2023"},
    "effectiveTaxRateCurrentYear": "24.1%",
    "effectiveTaxRatePreviousYear": "14.7%",
    "taxRateComment": "Comment on tax rate changes",
    "excerpt": "MANDATORY direct quote"
  },
  "netIncomeAnalysis": {
    "currentYear": {"value": "$93.74B", "period": "FY2024"},
    "previousYear": {"value": "$97.00B", "period": "FY2023"},
    "changeAbsolute": "-$3.26B",
    "changePercentage": "-3.36%",
    "contributors": "Key contributors to changes",
    "excerpt": "MANDATORY direct quote"
  },
  "epsDilutedAnalysis": {
    "currentYear": {"value": "$6.08", "period": "FY2024"},
    "previousYear": {"value": "$6.13", "period": "FY2023"},
    "changeAbsolute": "-$0.05",
    "changePercentage": "-0.82%",
    "factorsBeyondNetIncome": "Factors affecting EPS (e.g., buybacks)",
    "excerpt": "MANDATORY direct quote"
  },
  "profitabilityRatios": {
    "grossProfitMargin": {"currentYear": "46.2%", "previousYear": "44.1%"},
    "operatingMargin": {"currentYear": "31.5%", "previousYear": "29.8%"},
    "netProfitMargin": {"currentYear": "24.0%", "previousYear": "25.3%"},
    "ebitdaMargin": {"currentYear": "34.4%", "previousYear": "32.8%"},
    "roa": {"currentYear": "25.6%", "previousYear": "28.5%"},
    "roe": {"currentYear": "164.5%", "previousYear": "156.1%"},
    "trendComment": "Comment on margin trends",
    "excerpt": "MANDATORY direct quote"
  },
  "noteworthyItemsImpacts": [
    {
      "description": "Description of unusual/one-time item",
      "type": "unusual_item",
      "financialImpact": "$10.3B",
      "recurring": false,
      "excerpt": "MANDATORY direct quote from narrative text"
    }
  ],
  "keyInsights": "Concise summary of 2-3 most significant findings",
  "keyInsightsExcerpt": "MANDATORY direct quote"
}

**REMEMBER:**
- Extract ALL numbers from XBRL data (if available)
- Extract ALL excerpts from narrative text
- Never quote XBRL data in excerpts
- Calculate percentage changes accurately
- Include currency symbols and units
- Use exact format: "$XXX.XXB" not "XXX billion" or "XXX,XXX million"`;

  let fullAnalysis: Partial<FinancialAnalysis> = {};
  const textTokens = countTokens(text);

  console.log(`[analyzeFinancialSection] Total tokens: ${textTokens}`);
  console.log(
    `[analyzeFinancialSection] XBRL data ${xbrlData ? "IS" : "NOT"} available`
  );

  if (xbrlData) {
    console.log(
      `[analyzeFinancialSection] XBRL data preview (first 500 chars):\n${xbrlData.substring(
        0,
        500
      )}...`
    );
  }

  try {
    if (textTokens > MAX_CHUNK_SIZE_TOKENS) {
      console.log(
        `[analyzeFinancialSection] Splitting into chunks (${textTokens} tokens)`
      );

      const sentences = text.split(/(?<=\.)\s+|\n\n/);
      let currentChunk = "";
      const chunks: string[] = [];

      for (const sentence of sentences) {
        if (countTokens(currentChunk + sentence) < MAX_CHUNK_SIZE_TOKENS) {
          currentChunk += (currentChunk ? " " : "") + sentence.trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence.trim();
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      console.log(`[analyzeFinancialSection] Created ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `[analyzeFinancialSection] Processing chunk ${i + 1}/${
            chunks.length
          }...`
        );

        if (i > 0) {
          await delay(3000);
        }

        const chunkPrompt = promptTemplate(chunks[i]);

        try {
          const result = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: chunkPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 4000,
          });

          const rawParsedContent = JSON.parse(
            result.choices[0].message.content || "{}"
          );

          console.log(
            `[analyzeFinancialSection] AI response for chunk ${i + 1}:`,
            JSON.stringify(
              {
                revenueAnalysis: rawParsedContent.revenueAnalysis,
                netIncomeAnalysis: rawParsedContent.netIncomeAnalysis,
                operatingIncomeEBITAnalysis:
                  rawParsedContent.operatingIncomeEBITAnalysis,
              },
              null,
              2
            )
          );

          if (i === 0) {
            fullAnalysis = rawParsedContent;
          } else {
            // Merge noteworthy items
            if (rawParsedContent.noteworthyItemsImpacts?.length > 0) {
              if (!fullAnalysis.noteworthyItemsImpacts) {
                fullAnalysis.noteworthyItemsImpacts = [];
              }
              const newItems = rawParsedContent.noteworthyItemsImpacts.filter(
                (item: any) => item.type !== "none_identified"
              );
              fullAnalysis.noteworthyItemsImpacts.push(...newItems);
            }

            // Merge key insights
            if (
              rawParsedContent.keyInsights &&
              rawParsedContent.keyInsights !== "None identified."
            ) {
              fullAnalysis.keyInsights =
                (fullAnalysis.keyInsights || "") +
                " " +
                rawParsedContent.keyInsights;
            }
          }
        } catch (chunkError: any) {
          console.error(
            `[analyzeFinancialSection] Error in chunk ${i + 1}:`,
            chunkError.message
          );

          if (chunkError.message?.includes("429")) {
            console.log(
              `[analyzeFinancialSection] Rate limit hit, waiting 30s...`
            );
            await delay(30000);
            i--;
          }
        }
      }
    } else {
      console.log(
        "[analyzeFinancialSection] Analyzing directly (within token limits)"
      );

      const prompt = promptTemplate(text);
      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 4000,
      });

      fullAnalysis = JSON.parse(result.choices[0].message.content || "{}");

      console.log(
        `[analyzeFinancialSection] AI response (single request):`,
        JSON.stringify(
          {
            revenueAnalysis: fullAnalysis.revenueAnalysis,
            netIncomeAnalysis: fullAnalysis.netIncomeAnalysis,
            operatingIncomeEBITAnalysis:
              fullAnalysis.operatingIncomeEBITAnalysis,
          },
          null,
          2
        )
      );
    }

    // Validate with Zod
    console.log("[analyzeFinancialSection] Validating with Zod...");
    console.log("[analyzeFinancialSection] Sample values before validation:", {
      revenueCurrentValue: fullAnalysis.revenueAnalysis?.currentYear?.value,
      revenuePreviousValue: fullAnalysis.revenueAnalysis?.previousYear?.value,
      revenueChangePercentage: fullAnalysis.revenueAnalysis?.changePercentage,
      netIncomeCurrentValue: fullAnalysis.netIncomeAnalysis?.currentYear?.value,
    });

    const validatedContent = financialAnalysisSchema.parse(fullAnalysis);

    console.log("[analyzeFinancialSection] ✅ Zod validation successful");
    console.log("[analyzeFinancialSection] Sample values after validation:", {
      revenueCurrentValue: validatedContent.revenueAnalysis?.currentYear?.value,
      revenuePreviousValue:
        validatedContent.revenueAnalysis?.previousYear?.value,
      revenueChangePercentage:
        validatedContent.revenueAnalysis?.changePercentage,
      netIncomeCurrentValue:
        validatedContent.netIncomeAnalysis?.currentYear?.value,
    });

    // Ensure noteworthy items
    if (!validatedContent.noteworthyItemsImpacts?.length) {
      validatedContent.noteworthyItemsImpacts = [
        {
          description: "None identified.",
          type: "none_identified",
          financialImpact: "N/A",
          recurring: false,
          excerpt:
            "No specific unusual items were identified in the financial statements.",
        },
      ];
    }

    console.log("[analyzeFinancialSection] ✅ Analysis complete");
    if (xbrlData) {
      console.log(
        "[analyzeFinancialSection] ✅ XBRL data was used for numerical values"
      );
    }

    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "[analyzeFinancialSection] ❌ Validation error:",
        error.issues
      );
      return null;
    }
    console.error("[analyzeFinancialSection] ❌ Unexpected error:", error);
    return null;
  }
}
