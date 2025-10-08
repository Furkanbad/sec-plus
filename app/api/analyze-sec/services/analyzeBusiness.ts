// app/api/analyze-sec/services/analyzeBusiness.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  businessAnalysisSchema,
  BusinessAnalysis,
} from "../schemas/businessAnalysisSchema"; // Doğru yolu ayarla

export async function analyzeBusinessSection(
  text: string,
  openai: OpenAI,
  companyName: string // Şirket adını dinamik olarak almak için ticker parametresi ekliyoruz
): Promise<BusinessAnalysis> {
  const prompt = `Analyze this Business section for ${
    companyName || "the company"
  }:
1. What does the company do? (specific products/services) Provide a comprehensive yet concise summary (4-5 sentences) and **a single direct quote (1-3 sentences) from the text that best captures the company's core business.**
2. Key products by name and their market position. For each product, provide its name, market position (if any), and **a single direct quote (1-3 sentences) from the text that best describes it or its market position.**
3. Geographic markets of operation.
4. **Identify and describe 2-3 key competitive advantages** (e.g., proprietary technology, brand strength, cost leadership, network effect, distribution channels). For each advantage, provide a concise description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text that best illustrates this advantage.**
5. **Identify any significant growth strategies or market opportunities** explicitly mentioned (e.g., new market entry, product innovation, acquisitions). For each strategy/opportunity, provide a concise description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text that best describes it.**
6. **Identify the company's target customers or segments.** Provide a brief description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text that best illustrates this.**
7. **Highlight any significant partnerships or collaborations** mentioned. For each, provide a brief description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text.**
8. **Analyze the company's overall business model.** Provide a concise description (2-3 sentences) of how the company generates revenue and creates value, along with **a single direct quote (1-3 sentences) from the text that best illustrates its business model.**

Text: ${text}

Return JSON:
{
  "summary": "4-5 sentences with specifics about what the company does, providing a comprehensive yet concise overview.",
  "summaryExcerpt": "Direct quote (1-3 sentences) from the text that best captures the company's core business.",
  "keyProducts": [
    {"name": "product name", "marketPosition": "brief statement", "originalExcerpt": "Direct quote (1-3 sentences) for this product."}
  ],
  "markets": ["geographic markets"],
  "competitiveAdvantages": [
    {"description": "concise description of advantage 1", "originalExcerpt": "Direct quote (1-3 sentences) for advantage 1."},
    {"description": "concise description of advantage 2", "originalExcerpt": "Direct quote (1-3 sentences) for advantage 2."}
  ],
  "growthStrategiesOpportunities": [
    {"description": "concise description of strategy/opportunity 1", "originalExcerpt": "Direct quote (1-3 sentences) for strategy/opportunity 1."},
    {"description": "concise description of strategy/opportunity 2", "originalExcerpt": "Direct quote (1-3 sentences) for strategy/opportunity 2."}
  ],
  "targetCustomers": {
    "description": "concise description of target customers/segments",
    "originalExcerpt": "Direct quote (1-3 sentences) for target customers."
  },
  "partnershipsCollaborations": [
    {"description": "concise description of partnership 1", "originalExcerpt": "Direct quote (1-3 sentences) for partnership 1."}
  ],
  "businessModel": {
    "description": "concise description of how the company generates revenue and creates value (2-3 sentences).",
    "originalExcerpt": "Direct quote (1-3 sentences) for business model."
  }
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  let rawParsedContent;
  try {
    rawParsedContent = JSON.parse(result.choices[0].message.content || "{}");
  } catch (parseError) {
    console.error("Failed to parse JSON from OpenAI response:", parseError);
    // Eğer LLM geçerli JSON döndürmezse, boş bir obje ile devam et
    rawParsedContent = {};
  }

  try {
    // Zod schema ile valide et ve default değerlerini uygula
    const validatedContent = businessAnalysisSchema.parse(rawParsedContent);
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error in Business Section:", error.issues);
      throw new Error(
        `Business section analysis failed due to validation: ${error.message}`
      );
    }
    throw error;
  }
}
