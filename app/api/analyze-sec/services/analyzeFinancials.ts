// app/api/analyze-sec/services/analyzeFinancials.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  financialAnalysisSchema,
  FinancialAnalysis,
} from "../schemas/financialsAnalysisSchema";

// Token limitleri - daha güvenli değerler
const MAX_CHUNK_SIZE_TOKENS = 15000; // 30K'dan 15K'ya düşürdük

// Basit token sayma (yaklaşık)
const countTokens = (str: string) => Math.ceil(str.length / 4);

// Delay fonksiyonu
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeFinancialSection(
  text: string,
  openai: OpenAI,
  companyName: string
): Promise<FinancialAnalysis | null> {
  const promptTemplate = (
    chunkText: string
  ) => `Analyze the Financial Statements for ${companyName}. Focus on profitability analysis for the most recent two fiscal years.

  IMPORTANT: Return ONLY the requested fields. For optional 'excerpt' fields, include them ONLY if they provide meaningful qualitative insight beyond just numbers.

  Extract and analyze:
  1. Revenue Analysis (current/previous year, change, drivers)
  2. COGS & Gross Profit Analysis
  3. Operating Expenses Analysis (total, SG&A, R&D if available)
  4. Operating Income (EBIT) Analysis
  5. EBITDA Analysis
  6. Interest & Non-Operating Items
  7. Income Tax Analysis
  8. Net Income Analysis
  9. EPS (Diluted) Analysis
  10. Profitability Ratios (margins, ROA, ROE)
  11. Noteworthy Items/Footnotes (unusual items with MANDATORY excerpt)
  12. Key Insights (with MANDATORY excerpt)

  Financial Text:
  ${chunkText}

  Return JSON matching this exact structure. All monetary values must include currency (e.g., "$X million"):
  {
    "title": "Detailed Profitability Analysis and Year-over-Year Comparison",
    "revenueAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "drivers": "Explanation of revenue changes"
    },
    "cogsAndGrossProfitAnalysis": {
      "cogs": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "grossProfit": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"},
        "changeAbsolute": "$Z million",
        "changePercentage": "A%"
      },
      "factors": "Explanation of COGS and gross margin factors"
    },
    "operatingExpensesAnalysis": {
      "totalOperatingExpenses": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"},
        "changeAbsolute": "$Z million",
        "changePercentage": "A%"
      },
      "sgna": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "efficiencyComment": "Comment on operational efficiency"
    },
    "operatingIncomeEBITAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "trendComment": "Comment on operational profitability trend"
    },
    "ebitdaAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "significance": "Significance or drivers of change"
    },
    "interestAndOtherNonOperatingItems": {
      "interestExpense": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "otherNonOperatingIncomeExpense": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "impactComment": "Summary of impact on pre-tax income"
    },
    "incomeTaxExpenseAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "effectiveTaxRateCurrentYear": "X%",
      "effectiveTaxRatePreviousYear": "Y%",
      "taxRateComment": "Comment on tax rate changes"
    },
    "netIncomeAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "contributors": "Key contributors to net income fluctuations"
    },
    "epsDilutedAnalysis": {
      "currentYear": {"value": "$X", "period": "FY20XX"},
      "previousYear": {"value": "$Y", "period": "FY20XY"},
      "changeAbsolute": "$Z",
      "changePercentage": "A%",
      "factorsBeyondNetIncome": "Factors affecting EPS beyond net income"
    },
    "profitabilityRatios": {
      "grossProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "operatingMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "netProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "ebitdaMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "roa": {"currentYear": "X%", "previousYear": "Y%"},
      "roe": {"currentYear": "X%", "previousYear": "Y%"},
      "trendComment": "Comment on margin trends"
    },
    "noteworthyItemsImpacts": [
      {
        "description": "Description of unusual item",
        "type": "unusual_item",
        "financialImpact": "$X million",
        "recurring": false,
        "excerpt": "MANDATORY direct quote from text"
      }
    ],
    "keyInsights": "Summary of significant findings",
    "keyInsightsExcerpt": "MANDATORY direct quote summarizing key insight"
  }`;

  let fullAnalysis: Partial<FinancialAnalysis> = {};
  const textTokens = countTokens(text);
  console.log(`[analyzeFinancialSection] Total tokens: ${textTokens}`);

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

      // Process chunks sequentially with delay
      for (let i = 0; i < chunks.length; i++) {
        console.log(
          `[analyzeFinancialSection] Processing chunk ${i + 1}/${
            chunks.length
          }...`
        );

        // Add delay before each request
        await delay(3000); // 3 second delay between chunks

        const chunkPrompt = promptTemplate(chunks[i]);

        try {
          const result = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: chunkPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 4000, // Limit response size
          });

          const rawParsedContent = JSON.parse(
            result.choices[0].message.content || "{}"
          );

          if (i === 0) {
            fullAnalysis = rawParsedContent;
          } else {
            // Merge noteworthy items from subsequent chunks
            if (rawParsedContent.noteworthyItemsImpacts?.length > 0) {
              if (!fullAnalysis.noteworthyItemsImpacts) {
                fullAnalysis.noteworthyItemsImpacts = [];
              }
              const newItems = rawParsedContent.noteworthyItemsImpacts.filter(
                (item: any) => item.type !== "none_identified"
              );
              fullAnalysis.noteworthyItemsImpacts.push(...newItems);
            }
          }
        } catch (chunkError: any) {
          console.error(
            `[analyzeFinancialSection] Error in chunk ${i + 1}:`,
            chunkError.message
          );

          // If rate limit error, wait longer
          if (chunkError.message?.includes("429")) {
            console.log(
              `[analyzeFinancialSection] Rate limit hit, waiting 30s...`
            );
            await delay(30000);
            i--; // Retry the same chunk
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
    }

    // Validate with Zod
    const validatedContent = financialAnalysisSchema.parse(fullAnalysis);

    // Clean up noteworthy items
    if (!validatedContent.noteworthyItemsImpacts?.length) {
      validatedContent.noteworthyItemsImpacts = [
        {
          description: "None identified.",
          type: "none_identified",
          financialImpact: "N/A",
          recurring: false,
          excerpt: "No specific unusual items were identified.",
        },
      ];
    }

    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "[analyzeFinancialSection] Validation error:",
        error.issues
      );
      return null;
    }
    console.error("[analyzeFinancialSection] Unexpected error:", error);
    return null;
  }
}
