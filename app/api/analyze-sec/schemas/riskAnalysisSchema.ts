// app/api/analyze-sec/schemas/riskAnalysisSchema.ts
import { z } from "zod";

// excerptSchema'nın tanımını daha esnek hale getiriyoruz.
// LLM'in boş bir string döndürmesini veya hiç döndürmemesini yönetmek için.
const excerptSchema = z.string().trim().default("No excerpt available."); // Varsayılan değeri hala tutalım

export const riskCategoryEnum = z.enum([
  "operational",
  "financial",
  "regulatory",
  "market",
  "strategic",
  "cybersecurity",
  "environmental",
  "geopolitical",
  "technological",
  "reputational",
  "supply chain",
  "other",
]);

export const riskSeverityEnum = z.enum(["high", "medium", "low"]);

const riskItemSchema = z.object({
  category: riskCategoryEnum.default("other"),
  title: z
    .string()
    .trim()
    .min(1, "Risk title cannot be empty.")
    .default("Untitled Risk"),
  description: z
    .string()
    .trim()
    .min(1, "Risk description cannot be empty.")
    .default("No description available."),
  potentialImpact: z
    .string()
    .trim()
    .min(1, "Potential impact cannot be empty.")
    .default("Impact not specified."),
  mitigationStrategies: z.string().trim().default("None explicitly mentioned."),
  severity: riskSeverityEnum.default("medium"),
  // BURADA DEĞİŞİKLİK: originalExcerpt alanını isteğe bağlı yapıyoruz.
  // Bu, LLM bu alanı hiç döndürmezse Zod'un hata vermemesini sağlar.
  originalExcerpt: excerptSchema.optional(),
});

export const riskAnalysisSchema = z.object({
  title: z
    .literal("Detailed Risk Factors Analysis")
    .default("Detailed Risk Factors Analysis"),
  risks: z
    .array(riskItemSchema)
    .min(1, "At least one risk item is required.")
    .default([])
    .transform((risks) => {
      if (risks.length === 0) {
        return [
          {
            category: "other",
            title: "No specific risks detailed",
            description:
              "The risk factors section did not provide specific, actionable risk items.",
            potentialImpact: "Undetermined",
            mitigationStrategies: "None explicitly mentioned",
            severity: "low",
            originalExcerpt:
              "No specific risk factors were explicitly detailed in this section.",
          },
        ];
      }
      return risks;
    }),
  overallRiskSummary: z
    .string()
    .trim()
    .min(1, "Overall risk summary cannot be empty.")
    .default("Overall risk profile not summarized."),
});

export type RiskAnalysis = z.infer<typeof riskAnalysisSchema>;
