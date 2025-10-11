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

// Token limitleri - Daha büyük chunk için artırıldı
const MAX_CHUNK_SIZE_TOKENS = 50000; // GPT-4o 128k destekler

// Token sayma
const countTokens = (str: string) => Math.ceil(str.length / 4);

// Delay fonksiyonu
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Deep merge helper - Nested objeleri düzgün birleştirir
const deepMerge = (target: any, source: any): any => {
  if (!source) return target;
  if (!target) return source;

  const output = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else if (Array.isArray(source[key])) {
      // Array'leri birleştir ve deduplicate et
      output[key] = [...(target[key] || []), ...source[key]];
    } else if (
      source[key] !== undefined &&
      source[key] !== null &&
      source[key] !== "N/A"
    ) {
      // Sadece meaningful değerleri al
      output[key] = source[key];
    }
  }

  return output;
};

export async function analyzeFinancialSection(
  text: string,
  openai: OpenAI,
  companyName: string,
  xbrlData?: string
): Promise<FinancialAnalysis | null> {
  const promptTemplate = (chunkText: string) => `${EXCERPT_INSTRUCTION}

You are analyzing Financial Statements for ${companyName}.

**CRITICAL INSTRUCTIONS:**
1. **ALWAYS use XBRL data for ALL numerical values** (if provided below)
2. **EVERY field is REQUIRED - no field should be undefined or null**
3. **All excerpts MUST be direct quotes from NARRATIVE TEXT** (never from XBRL)
4. **Use exact format**: "$XXX.XXB" or "$XXX.XXB billion" for money, "X.XX%" for percentages

${
  xbrlData
    ? `\n=== XBRL STRUCTURED DATA ===\n${xbrlData}\n=== END XBRL ===\n`
    : "⚠️ XBRL not available - extract all from narrative\n"
}

=== NARRATIVE TEXT ===
${chunkText}
=== END TEXT ===

${JSON_EXCERPT_INSTRUCTION}

**REQUIRED OUTPUT - FILL ALL FIELDS:**

{
  "title": "Detailed Profitability Analysis and Year-over-Year Comparison",
  
  "revenueAnalysis": {
    "currentYear": {"value": "$391.04B", "period": "FY2024"},
    "previousYear": {"value": "$383.29B", "period": "FY2023"},
    "changeAbsolute": "$7.75B",
    "changePercentage": "2.02%",
    "drivers": "Brief explanation",
    "excerpt": "Direct quote from narrative"
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
      "excerpt": "Direct quote"
    },
    "factors": "Explanation",
    "excerpt": "Direct quote"
  },
  
  "operatingExpensesAnalysis": {
    "totalOperatingExpenses": {
      "currentYear": {"value": "$57.47B", "period": "FY2024"},
      "previousYear": {"value": "$54.85B", "period": "FY2023"},
      "changeAbsolute": "$2.62B",
      "changePercentage": "4.77%",
      "excerpt": "Direct quote"
    },
    "sgna": {
      "currentYear": {"value": "$26.10B", "period": "FY2024"},
      "previousYear": {"value": "$24.93B", "period": "FY2023"}
    },
    "rd": {
      "currentYear": {"value": "$31.37B", "period": "FY2024"},
      "previousYear": {"value": "$29.92B", "period": "FY2023"}
    },
    "efficiencyComment": "Comment",
    "excerpt": "Direct quote"
  },
  
  "operatingIncomeEBITAnalysis": {
    "currentYear": {"value": "$123.22B", "period": "FY2024"},
    "previousYear": {"value": "$114.30B", "period": "FY2023"},
    "changeAbsolute": "$8.92B",
    "changePercentage": "7.81%",
    "trendComment": "Comment",
    "excerpt": "Direct quote"
  },
  
  "ebitdaAnalysis": {
    "currentYear": {"value": "$134.66B", "period": "FY2024"},
    "previousYear": {"value": "$125.82B", "period": "FY2023"},
    "changeAbsolute": "$8.84B",
    "changePercentage": "7.03%",
    "significance": "Significance",
    "excerpt": "Direct quote"
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
    "impactComment": "Impact",
    "excerpt": "Direct quote"
  },
  
  "incomeTaxExpenseAnalysis": {
    "currentYear": {"value": "$29.75B", "period": "FY2024"},
    "previousYear": {"value": "$16.74B", "period": "FY2023"},
    "effectiveTaxRateCurrentYear": "24.1%",
    "effectiveTaxRatePreviousYear": "14.7%",
    "taxRateComment": "Comment",
    "excerpt": "Direct quote"
  },
  
  "netIncomeAnalysis": {
    "currentYear": {"value": "$93.74B", "period": "FY2024"},
    "previousYear": {"value": "$97.00B", "period": "FY2023"},
    "changeAbsolute": "-$3.26B",
    "changePercentage": "-3.36%",
    "contributors": "Key contributors",
    "excerpt": "Direct quote"
  },
  
  "epsDilutedAnalysis": {
    "currentYear": {"value": "$6.08", "period": "FY2024"},
    "previousYear": {"value": "$6.13", "period": "FY2023"},
    "changeAbsolute": "-$0.05",
    "changePercentage": "-0.82%",
    "factorsBeyondNetIncome": "Factors",
    "excerpt": "Direct quote"
  },
  
  "profitabilityRatios": {
    "grossProfitMargin": {"currentYear": "46.2%", "previousYear": "44.1%"},
    "operatingMargin": {"currentYear": "31.5%", "previousYear": "29.8%"},
    "netProfitMargin": {"currentYear": "24.0%", "previousYear": "25.3%"},
    "ebitdaMargin": {"currentYear": "34.4%", "previousYear": "32.8%"},
    "roa": {"currentYear": "25.6%", "previousYear": "28.5%"},
    "roe": {"currentYear": "164.5%", "previousYear": "156.1%"},
    "trendComment": "Comment",
    "excerpt": "Direct quote"
  },
  
  "noteworthyItemsImpacts": [
    {
      "description": "Description",
      "type": "unusual_item",
      "financialImpact": "$10.3B",
      "recurring": false,
      "excerpt": "Direct quote"
    }
  ],
  
  "keyInsights": "2-3 most significant findings",
  "keyInsightsExcerpt": "Direct quote"
}

**REMEMBER:**
- Extract numbers from XBRL (if available)
- Extract ALL excerpts from narrative text
- FILL EVERY FIELD - no undefined/null values
- Calculate percentages accurately
- Use format: "$XXX.XXB" and "X.XX%"`;

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
            max_tokens: 8000,
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
                hasCogsAnalysis: !!rawParsedContent.cogsAndGrossProfitAnalysis,
                hasProfitabilityRatios: !!rawParsedContent.profitabilityRatios,
              },
              null,
              2
            )
          );

          if (i === 0) {
            fullAnalysis = rawParsedContent;
          } else {
            // Deep merge tüm alanları
            fullAnalysis = deepMerge(fullAnalysis, rawParsedContent);
            console.log(
              `[analyzeFinancialSection] ✓ Merged chunk ${i + 1} data`
            );
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

      try {
        const result = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 8000, // Daha büyük response için artırıldı
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
              hasCogsAnalysis: !!fullAnalysis.cogsAndGrossProfitAnalysis,
              hasProfitabilityRatios: !!fullAnalysis.profitabilityRatios,
              hasNoteworthyItems: !!fullAnalysis.noteworthyItemsImpacts,
            },
            null,
            2
          )
        );
      } catch (singleError: any) {
        console.error(
          "[analyzeFinancialSection] Error in single request:",
          singleError.message
        );
        throw singleError;
      }
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
