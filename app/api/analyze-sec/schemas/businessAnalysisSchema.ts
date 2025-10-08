// app/schemas/businessAnalysisSchema.ts
import { z } from "zod";

const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty")
  .catch("No excerpt available.")
  .default("No excerpt available.");

const productSchema = z.object({
  name: z.string().trim().default("N/A"),
  marketPosition: z.string().trim().default("N/A"),
  originalExcerpt: excerptSchema,
});

const competitiveAdvantageSchema = z.object({
  description: z.string().trim().default("No description available."),
  originalExcerpt: excerptSchema,
});

const growthStrategyOpportunitySchema = z.object({
  description: z.string().trim().default("No description available."),
  originalExcerpt: excerptSchema,
});

const partnershipCollaborationSchema = z.object({
  description: z.string().trim().default("No description available."),
  originalExcerpt: excerptSchema,
});

export const businessAnalysisSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(1, "Summary cannot be empty.")
    .catch("Summary not available.")
    .default("Summary not available."),
  summaryExcerpt: excerptSchema,
  keyProducts: z
    .array(productSchema)
    .default([])
    .transform((products) => {
      // Ensure each product has default values if missing from LLM
      return products.map((product) => ({
        name: product.name || "N/A",
        marketPosition: product.marketPosition || "N/A",
        originalExcerpt: product.originalExcerpt || "No excerpt available.",
      }));
    }),
  markets: z
    .array(z.string().trim().min(1, "Market cannot be empty."))
    .default(["Not specified"])
    .transform((markets) =>
      markets.length === 0 ? ["Not specified"] : markets
    ), // Ensure at least one market
  competitiveAdvantages: z
    .array(competitiveAdvantageSchema)
    .default([])
    .transform((advantages) => {
      return advantages.map((adv) => ({
        description: adv.description || "No description available.",
        originalExcerpt:
          adv.originalExcerpt || adv.description || "No excerpt available.",
      }));
    }),
  growthStrategiesOpportunities: z
    .array(growthStrategyOpportunitySchema)
    .default([])
    .transform((strategies) => {
      return strategies.map((strat) => ({
        description: strat.description || "No description available.",
        originalExcerpt:
          strat.originalExcerpt || strat.description || "No excerpt available.",
      }));
    }),
  targetCustomers: z
    .object({
      description: z.string().trim().default("Not specified."),
      originalExcerpt: excerptSchema,
    })
    .default({
      description: "Not specified.",
      originalExcerpt: "No excerpt available.",
    }),
  partnershipsCollaborations: z
    .array(partnershipCollaborationSchema)
    .default([])
    .transform((partnerships) => {
      return partnerships.map((partner) => ({
        description: partner.description || "No description available.",
        originalExcerpt:
          partner.originalExcerpt ||
          partner.description ||
          "No excerpt available.",
      }));
    }),
  businessModel: z
    .object({
      description: z.string().trim().default("Not specified."),
      originalExcerpt: excerptSchema,
    })
    .default({
      description: "Not specified.",
      originalExcerpt: "No excerpt available.",
    }),
});

export type BusinessAnalysis = z.infer<typeof businessAnalysisSchema>;
