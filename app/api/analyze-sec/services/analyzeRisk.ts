// app/api/analyze-sec/analyzeRiskSection.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  riskAnalysisSchema,
  RiskAnalysis,
  riskCategoryEnum,
  riskSeverityEnum,
} from "../schemas/riskAnalysisSchema";
import {
  EXCERPT_INSTRUCTION,
  JSON_EXCERPT_INSTRUCTION,
} from "../constants/llm-instructions";

export async function analyzeRiskSection(
  text: string,
  openai: OpenAI,
  ticker: string
): Promise<RiskAnalysis> {
  // Zod enum değerlerini prompt içine dinamik olarak ekle
  const categories = riskCategoryEnum.options.map((o) => `'${o}'`).join(", ");
  const severities = riskSeverityEnum.options.map((o) => `'${o}'`).join("|");

  const prompt = `${EXCERPT_INSTRUCTION}
  From the "Risk Factors" section for ${
    ticker || "the company"
  }, provide a detailed analysis by extracting 8-15 specific risks.
  For each risk, provide the following information:

  1.  **Category:** Classify the risk using ONLY one of the following exact keywords: ${categories}.
  2.  **Title:** A concise, descriptive title for the risk.
  3.  **Description:** A 2-4 sentence summary describing the nature of the risk and why it's a concern for the company.
  4.  **Potential Impact:** Describe the specific ways this risk could adversely affect the company's business, financial condition, or results of operations (e.g., "could lead to decreased revenue," "increase operating costs," "result in regulatory fines").
  5.  **Mitigation Strategies (if mentioned):** Briefly describe any specific strategies, controls, or plans the company mentions to mitigate or manage this risk. State 'None explicitly mentioned' if no strategy is detailed.
  6.  **Severity:** Assign a severity level using ONLY one of the following exact keywords: ${severities}.
  7.  **Original Text Excerpt (CRITICAL - ONLY for ONE MOST SIGNIFICANT RISK):**
      **You MUST provide a 'originalExcerpt' for ONE AND ONLY ONE risk** among all the identified risks. This excerpt should be for the risk that you deem the **most significant, overarching, or representative** of the company's overall risk profile.
      This 'originalExcerpt' should be a **short, direct, and impactful quote** (1-3 sentences, maximum 75 words) from the original text. It must be highly relevant and act as a key summary or anchor for that specific risk.
      **For ALL OTHER RISKS, you MUST OMIT the 'originalExcerpt' field entirely from their JSON object.** Do NOT include an empty string or "No excerpt available." for other risks; simply do not include the key.

  Finally, provide an **overallRiskSummary**: A concluding statement (2-4 sentences) on the company's general risk profile, highlighting the most significant identified risks.

  Text: ${text}

  ${JSON_EXCERPT_INSTRUCTION}

  Return JSON. Ensure 'risks' is an array of objects.
  {
    "title": "Detailed Risk Factors Analysis",
    "risks": [
      {
        "category": "ONLY one of: ${categories}",
        "title": "Concise risk title",
        "description": "2-4 sentence detailed description of the risk.",
        "potentialImpact": "Specific adverse effects on business/financials.",
        "mitigationStrategies": "Description of mitigation efforts or 'None explicitly mentioned'.",
        "severity": "ONLY one of: ${severities}"
        // "originalExcerpt": "ONLY for the SINGLE MOST SIGNIFICANT RISK, a short, impactful quote."
      },
      // ... other risks without 'originalExcerpt' field
    ],
    "overallRiskSummary": "A concluding statement (2-4 sentences) on the company's general risk profile, highlighting the most significant identified risks."
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1, // Düşük sıcaklık daha tutarlı davranış sağlayabilir.
    });

    let rawParsedContent;
    try {
      // LLM'den gelen yanıtı JSON olarak ayrıştırmaya çalış
      rawParsedContent = JSON.parse(result.choices[0].message.content || "{}");
    } catch (parseError) {
      // JSON ayrıştırma hatası durumunda logla ve boş bir nesne ile devam et
      console.error(
        "Failed to parse JSON from OpenAI risk response:",
        parseError
      );
      rawParsedContent = {};
    }

    try {
      // Ayrıştırılan içeriği Zod şemasıyla doğrula ve tiplendir
      const validatedContent = riskAnalysisSchema.parse(rawParsedContent);
      return validatedContent;
    } catch (error) {
      // Zod doğrulama hatası durumunda hatayı logla ve fırlat
      if (error instanceof z.ZodError) {
        console.error("Zod Validation Error in Risk Section:", error.issues);
        throw new Error(
          `Risk section analysis failed due to validation: ${error.message}`
        );
      }
      // Diğer bilinmeyen hataları fırlat
      throw error;
    }
  } catch (error) {
    // Genel bir hata oluşursa logla ve varsayılan bir RiskAnalysis objesi döndür
    console.error("An unexpected error occurred during risk analysis:", error);
    // Zod'un varsayılan değerlerini uygulamasını sağlayarak güvenli bir dönüş sağlar
    return riskAnalysisSchema.parse({});
  }
}
