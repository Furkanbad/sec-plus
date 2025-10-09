// services.ts - analyzeFinancialSection'ı güncelleyin
import { z } from "zod";
import OpenAI from "openai";
import {
  financialAnalysisSchema,
  FinancialAnalysis,
} from "../schemas/financialsAnalysisSchema"; // Doğru yolu ayarla
import pLimit from "p-limit"; // p-limit'i import edin

// Maksimum token limitleri
const MAX_TOKENS_FINANCIALS_GPT4O = 128000; // GPT-4o'nun bağlam penceresi
const MAX_CHUNK_SIZE_TOKENS = 25000; // Her bir chunk için daha düşük bir limit belirleyelim

// Her bir OpenAI completion çağrısı için ayrı bir limiter tanımlayın.
// Bu limiter, analyzeFinancialSection içinde her chunk için yapılan çağrıları yönetecek.
// Bu değeri, OpenAI organizasyonunuzun TPM (Tokens Per Minute) ve RPM (Requests Per Minute) limitlerine göre ayarlayın.
// Genel "route.ts" dosyasındaki OPENAI_CONCURRENT_REQUESTS ile uyumlu veya daha düşük olabilir.
const ANALYZE_FINANCIAL_CONCURRENT_REQUESTS = 1; // analyzeFinancialSection içinde aynı anda maksimum 1 OpenAI isteği
const financialSectionRequestLimiter = pLimit(
  ANALYZE_FINANCIAL_CONCURRENT_REQUESTS
);

export async function analyzeFinancialSection(
  text: string,
  openai: OpenAI,
  companyName: string
): Promise<FinancialAnalysis | null> {
  const promptTemplate = (
    chunkText: string
  ) => `Analyze the provided Financial Statements section for ${
    companyName || "the company"
  }. Focus on providing a detailed breakdown of profitability for the most recent two fiscal years and year-over-year comparisons based on the text.

  **Crucial Instruction for Excerpts:**
  For most analysis points, an 'excerpt' (direct quote) is **optional**. Only provide an 'excerpt' if it's a **direct, verbatim quote** from the text that offers a **meaningful insight, explanation, driver, or a critical footnote detail** that adds significant context beyond just the numbers.
  **DO NOT provide excerpts that are merely a repetition of numerical values, percentages, or very generic statements.** The goal is to highlight specific textual evidence for important qualitative or explanatory points.
  **However, for 'Noteworthy Items & Footnotes' and 'Key Insights', an 'excerpt' is mandatory and must be a direct quote supporting the item or insight.**

  The 'description' or 'comment' fields are for your analytical summary/interpretation, while 'excerpt' fields (when provided) are for the raw textual evidence for significant findings.

  Specifically, extract and analyze the following:
  1.  **Revenue Analysis:**
      *   Value for the most recent fiscal year (Current Year) and the previous fiscal year (Previous Year).
      *   Absolute change and percentage change year-over-year.
      *   The specific reporting periods (e.g., FY20XX vs FY20XY).
      *   Explain the primary 'drivers' for any significant change, specifically mentioning contributions from volume, pricing, and product/service mix if discussed (this is your summary).
      *   *Optional Excerpt:* Include a direct quote describing these revenue changes or drivers, ONLY if it provides unique qualitative insight.
  2.  **Cost of Goods Sold (COGS) & Gross Profit Analysis:**
      *   COGS value for Current Year and Previous Year.
      *   Gross Profit value for Current Year and Previous Year.
      *   Absolute change and percentage change in Gross Profit year-over-year.
      *   Explain primary 'factors' affecting COGS and gross margin, such as raw material costs, labor, production efficiency, or pricing strategies (this is your summary).
      *   *Optional Excerpt:* Include a direct quote describing COGS and gross profit factors, ONLY if it provides unique qualitative insight.
  3.  **Operating Expenses Analysis:**
      *   Total Operating Expenses value for Current Year and Previous Year.
      *   Break down major components like Selling, General & Administrative (SG&A) and Research & Development (R&D) expenses for both years, if available.
      *   Absolute change and percentage change in Total Operating Expenses year-over-year.
      *   Provide an 'efficiencyComment' on operational efficiency changes and the key drivers of expense fluctuations (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting the total operating expenses change or efficiency comment, ONLY if it provides unique qualitative insight.
  4.  **Operating Income (EBIT) Analysis:**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Provide a 'trendComment' on the overall operational profitability trend (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting the operational profitability trend, ONLY if it provides unique qualitative insight.
  5.  **EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization):**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Briefly explain its 'significance' or drivers of change, if different from EBIT (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting EBITDA significance or drivers, ONLY if it provides unique qualitative insight.
  6.  **Interest Expense & Other Non-Operating Items:**
      *   Summarize significant interest expenses, other non-operating income/expenses, and their impact on pre-tax income for both years in 'impactComment' (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting the impact on pre-tax income, ONLY if it provides unique qualitative insight.
  7.  **Income Tax Expense:**
      *   Value for Current Year and Previous Year.
      *   Effective tax rate for both years.
      *   Provide a 'taxRateComment' on any significant changes in tax rate or unusual tax items (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting the tax rate comment, ONLY if it provides unique qualitative insight.
  8.  **Net Income (Profit/Loss) Analysis:**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Highlight key 'contributors' (positive or negative) to net income fluctuations (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting net income contributors, ONLY if it provides unique qualitative insight.
  9.  **Earnings Per Share (EPS) - Diluted:**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Mention any significant 'factorsBeyondNetIncome' affecting EPS (e.g., share buybacks, new issuances) (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting factors beyond net income for EPS, ONLY if it provides unique qualitative insight.
  10. **Profitability Ratios:**
      *   Calculate and provide Gross Profit Margin, Operating Margin, Net Profit Margin, EBITDA Margin, Return on Assets (ROA), and Return on Equity (ROE) for both Current Year and Previous Year.
      *   Provide a 'trendComment' on the trends and implications of these ratios (this is your summary).
      *   *Optional Excerpt:* Include a direct quote supporting the margin and ratio trends comment, ONLY if it provides unique qualitative insight.
  11. **Noteworthy Items/Footnotes Impacting Profitability:**
      *   Identify and summarize any unusual or non-recurring items, significant adjustments, one-time gains/losses, restructuring charges, impairments, or critical information mentioned in footnotes that significantly impacted profitability. (The 'description' field can be your brief summary of the item).
      *   For each item, specify its estimated financial impact and whether it's recurring. If nothing unusual, state 'None identified'.
      *   **For EACH noteworthy item, include a concise, 1-2 sentence 'excerpt' that is a direct, verbatim quote from the text that EXPLICITLY supports or introduces the key information for that item. This is MANDATORY.**
  12. **Key Insights:**
      *   A 'keyInsights' summary highlighting the most significant findings regarding profitability for the period (this is your summary).
      *   **Include a 'keyInsightsExcerpt' that is a direct, verbatim quote of 1-2 sentences from the text that directly led to or best summarizes this key insight. This is MANDATORY.**

  Financial Text Chunk:
  ${chunkText}

  Return JSON. Ensure all monetary values include currency (e.g., "$X million"), percentages include "%", and periods are clearly stated (e.g., "FY20XX").
  Prioritize extracting exact values and periods where possible. If a value or period is not explicitly found for an item, use "N/A" for the value and "No period specified" or similar for the period. If an optional 'excerpt' cannot be found that meets the criteria, omit it or set to "No direct excerpt found."

  {
    "title": "Detailed Profitability Analysis and Year-over-Year Comparison",
    "revenueAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "drivers": "Explanation of revenue changes including volume, pricing, mix."
      // "excerpt": "Direct quote from the text supporting revenue drivers." // Opsiyonel olduğu için model varsa ekleyecek
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
        // "excerpt": "Direct quote from the text supporting gross profit change." // Opsiyonel
      },
      "factors": "Explanation of COGS and gross margin factors."
      // "excerpt": "Direct quote from the text supporting COGS/gross profit factors." // Opsiyonel
    },
    "operatingExpensesAnalysis": {
      "totalOperatingExpenses": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"},
        "changeAbsolute": "$Z million",
        "changePercentage": "A%"
        // "excerpt": "Direct quote from the text supporting total operating expenses change." // Opsiyonel
      },
      "sgna": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "rd": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "efficiencyComment": "Comment on operational efficiency and drivers of change."
      // "excerpt": "Direct quote from the text supporting efficiency comment." // Opsiyonel
    },
    "operatingIncomeEBITAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "trendComment": "Comment on overall operational profitability trend."
      // "excerpt": "Direct quote from the text supporting operational profitability trend." // Opsiyonel
    },
    "ebitdaAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "significance": "Brief explanation of significance or drivers of change."
      // "excerpt": "Direct quote from the text supporting EBITDA significance." // Opsiyonel
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
      "impactComment": "Summary of impact on pre-tax income."
      // "excerpt": "Direct quote from the text supporting impact on pre-tax income." // Opsiyonel
    },
    "incomeTaxExpenseAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "effectiveTaxRateCurrentYear": "X%",
      "effectiveTaxRatePreviousYear": "Y%",
      "taxRateComment": "Comment on significant changes in tax rate or unusual items."
      // "excerpt": "Direct quote from the text supporting tax rate comment." // Opsiyonel
    },
    "netIncomeAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "contributors": "Key contributors to net income fluctuations."
      // "excerpt": "Direct quote from the text supporting net income contributors." // Opsiyonel
    },
    "epsDilutedAnalysis": {
      "currentYear": {"value": "$X", "period": "FY20XX"},
      "previousYear": {"value": "$Y", "period": "FY20XY"},
      "changeAbsolute": "$Z",
      "changePercentage": "A%",
      "factorsBeyondNetIncome": "Significant factors affecting EPS beyond net income."
      // "excerpt": "Direct quote from the text supporting factors beyond net income for EPS." // Opsiyonel
    },
    "profitabilityRatios": {
      "grossProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "operatingMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "netProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "ebitdaMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "roa": {"currentYear": "X%", "previousYear": "Y%"},
      "roe": {"currentYear": "X%", "previousYear": "Y%"},
      "trendComment": "Comment on margin and ratio trends and implications."
      // "excerpt": "Direct quote from the text supporting margin and ratio trends." // Opsiyonel
    },
    "noteworthyItemsImpacts": [
      {
        "description": "Summary of unusual item 1 or footnote, including its financial impact.",
        "type": "unusual_item|adjustment|one_time_gain_loss|restructuring_charge|impairment|footnote|none_identified",
        "financialImpact": "$I million (non-recurring)",
        "recurring": false,
        "excerpt": "Direct, verbatim quote from the text for this noteworthy item." // BURADA ZORUNLU
      }
    ],
    "keyInsights": "A concluding summary highlighting the most significant findings regarding profitability for the period.",
    "keyInsightsExcerpt": "Direct, verbatim quote from the text summarizing the key insight." // BURADA ZORUNLU
  }`;

  const countTokens = (str: string) => Math.ceil(str.length / 4);

  let fullAnalysis: Partial<FinancialAnalysis> = {};

  const textTokens = countTokens(text);
  console.log(
    `[analyzeFinancialSection] Financials section total tokens: ${textTokens}`
  );

  // Chunking promises'ları bir diziye toplayın
  const chunkAnalysisPromises: Promise<Partial<FinancialAnalysis> | null>[] =
    [];

  if (textTokens > MAX_CHUNK_SIZE_TOKENS) {
    console.log(
      `[analyzeFinancialSection] Financials section is too long (${textTokens} tokens). Splitting into chunks.`
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

    console.log(
      `[analyzeFinancialSection] Created ${chunks.length} chunks for financial analysis.`
    );

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      chunkAnalysisPromises.push(
        financialSectionRequestLimiter(async () => {
          // Limiter ile sarmalayın
          console.log(
            `[analyzeFinancialSection] Processing chunk ${i + 1}/${
              chunks.length
            }...`
          );
          const chunkPrompt = promptTemplate(chunk);

          try {
            const result = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [{ role: "user", content: chunkPrompt }],
              response_format: { type: "json_object" },
              temperature: 0.1,
            });

            const rawParsedContent = JSON.parse(
              result.choices[0].message.content || "{}"
            );
            console.log(
              `[analyzeFinancialSection] Chunk ${i + 1} raw response content:`,
              JSON.stringify(rawParsedContent, null, 2)
            );
            return rawParsedContent;
          } catch (chunkError) {
            console.error(
              `[analyzeFinancialSection] Error processing financial chunk ${
                i + 1
              }:`,
              chunkError
            );
            return null;
          }
        })
      );
    }

    // Tüm chunk analizlerinin tamamlanmasını bekleyin
    const chunkResults = await Promise.all(chunkAnalysisPromises);

    // Sonuçları birleştirin
    chunkResults.forEach((rawParsedContent, i) => {
      if (!rawParsedContent) return; // Hata veren chunk'ları atla

      if (i === 0) {
        fullAnalysis = rawParsedContent;
      } else {
        // Merge noteworthy items from subsequent chunks
        if (
          rawParsedContent.noteworthyItemsImpacts &&
          Array.isArray(rawParsedContent.noteworthyItemsImpacts)
        ) {
          if (!fullAnalysis.noteworthyItemsImpacts) {
            fullAnalysis.noteworthyItemsImpacts = [];
          }
          const newItems = rawParsedContent.noteworthyItemsImpacts.filter(
            (item: any) =>
              item.type !== "none_identified" &&
              item.description !== "None identified." &&
              item.description !== "No description available."
          );
          fullAnalysis.noteworthyItemsImpacts = [
            ...(fullAnalysis.noteworthyItemsImpacts || []),
            ...newItems,
          ];
        }
        // Diğer alanları birleştirme mantığı, ihtiyaca göre daha karmaşık hale getirilebilir.
        // Şu an için ilk chunk'tan gelen veriler önceliklidir.
        // Örneğin, eğer bir sonraki chunk'ta daha güncel veya eksik bilgi varsa burada birleştirilebilir.
        // Ancak, genellikle finansal analizde ilk chunk ana tablo ve özetleri içerirken,
        // sonraki chunk'lar dipnotlar ve ek detaylar içerir.
      }
    });
  } else {
    console.log(
      "[analyzeFinancialSection] Financials section is within token limits. Analyzing directly."
    );
    const prompt = promptTemplate(text);
    const result = await financialSectionRequestLimiter(() =>
      // Limiter ile sarmalayın
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      })
    );
    fullAnalysis = JSON.parse(result.choices[0].message.content || "{}");
    console.log(
      "[analyzeFinancialSection] Direct analysis raw response content:",
      JSON.stringify(fullAnalysis, null, 2)
    );
  }

  try {
    console.log("[analyzeFinancialSection] Attempting Zod validation...");
    const validatedContent = financialAnalysisSchema.parse(fullAnalysis);
    console.log("[analyzeFinancialSection] Zod validation successful.");

    // Noteworthy Items & Footnotes için varsayılan ve deduplikasyon mantığı
    if (
      !validatedContent.noteworthyItemsImpacts ||
      validatedContent.noteworthyItemsImpacts.length === 0 ||
      validatedContent.noteworthyItemsImpacts.every(
        (item) => item.type === "none_identified"
      )
    ) {
      console.log(
        "[analyzeFinancialSection] No noteworthy items found, adding default 'None identified'."
      );
      validatedContent.noteworthyItemsImpacts = [
        {
          description: "None identified.",
          type: "none_identified",
          financialImpact: "N/A",
          recurring: false,
          excerpt:
            "No specific unusual items or footnotes impacting profitability were identified in the provided text.", // Zorunlu olduğu için varsayılan bir alıntı
        },
      ];
    } else {
      // Duplikasyon ve 'none_identified' öğelerini temizleme
      const uniqueItems = new Map();
      validatedContent.noteworthyItemsImpacts.forEach((item) => {
        // Excerpt'i kullanarak benzersizlik sağla, çünkü artık zorunlu ve anlamlı olması bekleniyor
        const key = `${item.type}-${item.excerpt}`;
        uniqueItems.set(key, item);
      });
      validatedContent.noteworthyItemsImpacts = Array.from(
        uniqueItems.values()
      ).filter(
        (item) =>
          item.type !== "none_identified" ||
          Array.from(uniqueItems.values()).length === 1 // Eğer listede tek öğe ise ve 'none_identified' ise kalsın
      );

      // Eğer temizlik sonrası hiç item kalmazsa, varsayılan "None identified" ekle
      if (validatedContent.noteworthyItemsImpacts.length === 0) {
        validatedContent.noteworthyItemsImpacts = [
          {
            description: "None identified.",
            type: "none_identified",
            financialImpact: "N/A",
            recurring: false,
            excerpt:
              "No specific unusual items or footnotes impacting profitability were identified in the provided text.",
          },
        ];
      }
      console.log(
        "[analyzeFinancialSection] Cleaned and deduplicated noteworthy items."
      );
    }

    // Key Insights Excerpt için kontrol
    if (
      !validatedContent.keyInsightsExcerpt ||
      validatedContent.keyInsightsExcerpt === "No direct excerpt found." ||
      validatedContent.keyInsightsExcerpt.trim() === ""
    ) {
      console.warn(
        "[analyzeFinancialSection] Key insights excerpt is missing or generic despite being mandatory. Using key insights as fallback."
      );
      validatedContent.keyInsightsExcerpt =
        validatedContent.keyInsights &&
        validatedContent.keyInsights !== "No description available."
          ? validatedContent.keyInsights
          : "No specific key insight excerpt found in the text.";
    }

    console.log(
      "[analyzeFinancialSection] Final validated content before return:",
      JSON.stringify(validatedContent, null, 2)
    );
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "[analyzeFinancialSection] Zod Validation Error:",
        JSON.stringify(error.issues, null, 2)
      );
      return null;
    }
    console.error(
      "[analyzeFinancialSection] Unexpected error during validation or processing:",
      error
    );
    return null;
  }
}
