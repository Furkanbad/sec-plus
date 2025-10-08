// app/api/analyze-sec/services/analyzeMarketRisk.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  marketRiskAnalysisSchema,
  MarketRiskAnalysis,
} from "../schemas/marketRiskAnalysisSchema"; // Doğru yolu ayarlayın

export async function analyzeMarketRiskSection(
  text: string,
  openai: OpenAI,
  companyName: string // Şirket adını dinamik olarak almak için parametre eklendi
): Promise<MarketRiskAnalysis> {
  const prompt = `From the Market Risk section for ${
    companyName || "the company"
  }, provide a detailed analysis of market risk exposures, including their potential impact, the company's mitigation strategies, and any reported sensitivity analyses.

  Specifically, extract and analyze the following:
  1.  **Overall Market Risk Summary & Philosophy:** Provide a concise overview (3-4 sentences) of the company's primary market risk exposures, including its general philosophy or framework for managing these risks. If not explicitly stated, infer or state 'Not specified'. **If there is a concise statement that best captures this summary or philosophy, provide it as a single direct quote (1-3 sentences).**
  2.  **Interest Rate Risk:**
      *   Describe the company's exposure to changes in interest rates (e.g., variable-rate debt, floating-rate investments, cash equivalents, interest rate-sensitive assets/liabilities). If none, state 'None reported'.
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact (e.g., on pre-tax earnings, cash flows, fair value of debt) of a hypothetical change in interest rates (e.g., "A 1% increase in interest rates would impact pre-tax earnings by $X million over the next year"). State the specific percentage change and the financial metric affected. If not quantified, state 'Not specified'. **If this impact is explicitly quantified and described in a single statement (1-3 sentences), provide it as a direct quote.**
      *   Detail any strategies or instruments used to mitigate interest rate risk (e.g., interest rate swaps, fixed-rate debt conversion, natural hedges). If none, state 'None reported'.
  3.  **Foreign Currency Exchange Rate Risk:**
      *   Describe the company's exposure to fluctuations in foreign currency exchange rates, distinguishing between **transaction risk** (e.g., foreign-denominated sales/purchases, operating expenses) and **translation risk** (e.g., consolidating foreign subsidiary financial statements). If none, state 'None reported'.
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact (e.g., on revenue, net income, shareholders' equity) of a hypothetical change in exchange rates (e.g., "A 10% weakening of the Euro against the USD would impact revenue by $Y million"). State the specific percentage change, currencies, and the financial metric affected. If not quantified, state 'Not specified'. **If this impact is explicitly quantified and described in a single statement (1-3 sentences), provide it as a direct quote.**
      *   Detail any strategies or instruments used to mitigate currency risk (e.g., foreign currency forward contracts, options, natural hedges, functional currency management). If none, state 'None reported'.
  4.  **Commodity Price Risk (if applicable):**
      *   Describe any significant exposure to changes in commodity prices (e.g., raw materials for production, energy costs, finished product prices tied to commodities). Identify the key commodities involved. If none, state 'None reported'.
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact of a hypothetical change in commodity prices. If not quantified, state 'Not specified'. **If this impact is explicitly quantified and described in a single statement (1-3 sentences), provide it as a direct quote.**
      *   Detail any strategies or instruments used to mitigate commodity price risk (e.g., long-term supply contracts with fixed prices, commodity futures/options, vertical integration). If none, state 'None reported'.
  5.  **Equity Price Risk (if applicable):**
      *   Describe any significant exposure to changes in equity prices (e.g., marketable equity securities investments, deferred compensation plans tied to company stock or other equities, stock-based compensation liabilities). If none, state 'None reported'.
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact of a hypothetical change in equity prices. If not quantified, state 'Not specified'. **If this impact is explicitly quantified and described in a single statement (1-3 sentences), provide it as a direct quote.**
      *   Detail any strategies or instruments used to mitigate equity price risk. If none, state 'None reported'.
  6.  **Derivative Financial Instruments Usage:**
      *   Summarize the company's use of derivative financial instruments across all risk categories.
      *   Specify the primary types of derivatives used (e.g., swaps, forwards, options, futures).
      *   State the primary objectives for using derivatives (e.g., hedging specific exposures, managing overall portfolio risk, fair value hedges, cash flow hedges).
      *   Mention if hedge accounting is applied and its general impact. If derivatives are not materially discussed, state 'None reported'. **If there is a concise statement that best summarizes the derivative usage, provide it as a single direct quote (1-3 sentences).**
  7.  **Key Takeaways/Concerns & Future Outlook:**
      *   Highlight any particularly noteworthy points, significant vulnerabilities, unusual hedging practices, or unhedged material exposures identified in the section.
      *   Include any forward-looking statements or management commentary on the future outlook of market risks or risk management strategies. If everything appears standard and no specific concerns or outlook are mentioned, state 'None identified'. **If there is a concise statement that best captures any key takeaways or future outlook, provide it as a single direct quote (1-3 sentences).**

  Text: ${text}

  Return JSON. Ensure all financial impacts include currency and unit. If a field for \`sensitivityAnalysisDetails\` would contain 'N/A' or similar placeholder for any of its sub-fields, omit that specific \`sensitivityAnalysisDetails\` object entirely.
  {
    "title": "Detailed Market Risk Analysis",
    "overallSummaryAndPhilosophy": {
      "summary": "A concise overview of primary market risk exposures and management philosophy (3-4 sentences).",
      "originalExcerpt": "Direct quote (1-3 sentences) from the text that best captures this summary or philosophy, if applicable."
    },
    "interestRateRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact (e.g., 'A 1% increase in interest rates would impact pre-tax earnings by $X million over the next year') or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '1%' (string, if available)",
          "affectedMetric": "e.g., 'pre-tax earnings' (string)",
          "impactValue": "e.g., '$X million' (string)",
          "period": "e.g., 'next year' or 'annual' (string)"
        },
        "originalExcerpt": "Direct quote (1-3 sentences) from the text that explicitly quantifies and describes this impact, if applicable."
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"] // Array of strings or empty array
    },
    "currencyRisk": {
      "exposure": "Description of exposure (transaction and translation risk) or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '10%' (string)",
          "currencyPair": "e.g., 'EUR/USD' (string)",
          "affectedMetric": "e.g., 'revenue' (string)",
          "impactValue": "e.g., '$Y million' (string)"
        },
        "originalExcerpt": "Direct quote (1-3 sentences) from the text that explicitly quantifies and describes this impact, if applicable."
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"]
    },
    "commodityPriceRisk": {
      "exposure": "Description of exposure including key commodities or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '10%' (string)",
          "commodity": "e.g., 'crude oil' (string)",
          "affectedMetric": "e.g., 'cost of goods sold' (string)",
          "impactValue": "e.g., '$Z million' (string)"
        },
        "originalExcerpt": "Direct quote (1-3 sentences) from the text that explicitly quantifies and describes this impact, if applicable."
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"]
    },
    "equityPriceRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '10%' (string)",
          "affectedMetric": "e.g., 'net income' (string)",
          "impactValue": "e.g., '$A million' (string)"
        },
        "originalExcerpt": "Direct quote (1-3 sentences) from the text that explicitly quantifies and describes this impact, if applicable."
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"]
    },
    "derivativeFinancialInstrumentsUsage": {
      "summary": "Summary of derivative use, types, objectives, and hedge accounting or 'None reported'.",
      "typesOfDerivatives": ["Type 1", "Type 2"],
      "objectives": ["Objective 1", "Objective 2"],
      "originalExcerpt": "Direct quote (1-3 sentences) from the text that best summarizes the derivative usage, if applicable."
    },
    "keyTakeawaysConcernsAndFutureOutlook": {
      "takeaways": ["Concern 1", "Concern 2", "Future outlook commentary"],
      "originalExcerpt": "Direct quote (1-3 sentences) from the text that best captures any key takeaways or future outlook, if applicable."
    }
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1, // Daha tutarlı sonuçlar için düşük sıcaklık
  });

  let rawParsedContent;
  try {
    rawParsedContent = JSON.parse(result.choices[0].message.content || "{}");
  } catch (parseError) {
    console.error("Failed to parse JSON from OpenAI response:", parseError);
    rawParsedContent = {};
  }

  // N/A içeren sensitivityAnalysisDetails objelerini temizle ve boş originalExcerpt'leri kaldır
  const cleanOutput = (data: any) => {
    if (data && typeof data === "object") {
      const cleanedData: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (
            key === "originalExcerpt" &&
            (!data[key] || data[key].trim() === "")
          ) {
            // Boş veya sadece boşluk içeren originalExcerpt'leri atla
            continue;
          }
          if (
            key === "sensitivityAnalysisDetails" &&
            typeof data[key] === "object" &&
            data[key] !== null
          ) {
            const details = data[key];
            const hasNA = Object.values(details).some(
              (val) => typeof val === "string" && val.toUpperCase() === "N/A"
            );
            if (!hasNA && Object.keys(details).length > 0) {
              // Sadece N/A yoksa ve boş değilse ekle
              cleanedData[key] = details;
            }
          } else if (
            typeof data[key] === "object" &&
            data[key] !== null &&
            !Array.isArray(data[key])
          ) {
            const cleanedSubObject = cleanOutput(data[key]);
            if (Object.keys(cleanedSubObject).length > 0) {
              // Boş objeleri atla
              cleanedData[key] = cleanedSubObject;
            }
          } else {
            // Diziler ve diğer skaler değerler için direkt atama
            cleanedData[key] = data[key];
          }
        }
      }
      return cleanedData;
    }
    return data;
  };

  const cleanedContent = cleanOutput(rawParsedContent);

  try {
    // Zod schema ile valide et ve default değerlerini uygula
    const validatedContent = marketRiskAnalysisSchema.parse(cleanedContent);
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "Zod Validation Error in Market Risk Section:",
        error.issues
      );
      throw new Error(
        `Market Risk section analysis failed due to validation: ${error.message}`
      );
    }
    throw error;
  }
}
