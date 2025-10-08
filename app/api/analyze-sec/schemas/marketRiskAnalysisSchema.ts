// app/api/analyze-sec/schemas/marketRiskAnalysisSchema.ts
import { z } from "zod";

// Helper for optional string fields that might be empty or "Not specified"
const optionalExcerptSchema = z
  .string()
  .trim()
  .optional() // Can be undefined
  .transform((s) => (s && s.trim() !== "" ? s : undefined)); // Convert empty/whitespace strings to undefined

// Define the default structure for sensitivityAnalysisDetails once
const defaultSensitivityDetails = {
  changePercentage: "N/A",
  affectedMetric: "N/A",
  impactValue: "N/A",
  period: "N/A",
  currencyPair: "N/A",
  commodity: "N/A",
};

const sensitivityAnalysisDetailsSchema = z
  .object({
    changePercentage: z.string().trim().default("N/A"),
    affectedMetric: z.string().trim().default("N/A"),
    impactValue: z.string().trim().default("N/A"),
    period: z.string().trim().default("N/A"),
    currencyPair: z.string().trim().default("N/A").optional(),
    commodity: z.string().trim().default("N/A").optional(),
  })
  .partial() // Allow all fields to be optional when parsing initially
  .default(defaultSensitivityDetails) // If an empty object is provided, use these defaults
  .transform((details) => {
    // Fill in any missing/null fields with "N/A"
    const filledDetails = {
      changePercentage: details.changePercentage || "N/A",
      affectedMetric: details.affectedMetric || "N/A",
      impactValue: details.impactValue || "N/A",
      period: details.period || "N/A",
      currencyPair: details.currencyPair || "N/A",
      commodity: details.commodity || "N/A",
    };

    // Check if any field is "N/A". If so, return undefined to remove the whole object.
    const hasNA = Object.values(filledDetails).some(
      (val) => typeof val === "string" && val.toUpperCase() === "N/A"
    );

    return hasNA ? undefined : filledDetails;
  });

const potentialImpactSchema = z
  .object({
    description: z.string().trim().default("Not specified."),
    // sensitivityAnalysisDetails is now optional at this level.
    // If it's undefined (due to the transform above), it will be removed.
    sensitivityAnalysisDetails: sensitivityAnalysisDetailsSchema.optional(),
    originalExcerpt: optionalExcerptSchema, // Add originalExcerpt
  })
  .default({
    description: "Not specified.",
    originalExcerpt: undefined, // Added default for originalExcerpt
  }); // sensitivityAnalysisDetails will be undefined by default if not provided

// Helper function to create a robust risk object schema
function createRobustRiskSchema() {
  return z
    .object({
      exposure: z.string().trim().default("None reported."),
      originalExcerpt: optionalExcerptSchema, // originalExcerpt for exposure
      potentialImpact: potentialImpactSchema,
      mitigationStrategies: z
        .array(z.string().trim().min(1, "Strategy cannot be empty."))
        .default([]),
    })
    .default({
      exposure: "None reported.",
      originalExcerpt: undefined, // Added default for originalExcerpt
      potentialImpact: {
        description: "Not specified.",
        originalExcerpt: undefined, // Added default for originalExcerpt inside potentialImpact
      },
      mitigationStrategies: [],
    });
}

// Special schema for derivative usage, including originalExcerpt
const derivativeFinancialInstrumentsUsageSchema = z
  .object({
    summary: z.string().trim().default("None reported."),
    typesOfDerivatives: z
      .array(z.string().trim().min(1, "Derivative type cannot be empty."))
      .default([]),
    objectives: z
      .array(z.string().trim().min(1, "Objective cannot be empty."))
      .default([]),
    originalExcerpt: optionalExcerptSchema, // originalExcerpt for derivatives summary
  })
  .default({
    summary: "None reported.",
    typesOfDerivatives: [],
    objectives: [],
    originalExcerpt: undefined, // Added default for originalExcerpt
  });

// Special schema for key takeaways, including originalExcerpt
const keyTakeawaysConcernsAndFutureOutlookSchema = z
  .object({
    takeaways: z
      .array(z.string().trim().min(1, "Takeaway cannot be empty."))
      .default(["None identified."]),
    originalExcerpt: optionalExcerptSchema, // originalExcerpt for key takeaways
  })
  .default({
    takeaways: ["None identified."],
    originalExcerpt: undefined, // Added default for originalExcerpt
  });

export const marketRiskAnalysisSchema = z.object({
  title: z.string().trim().default("Detailed Market Risk Analysis"),
  overallSummaryAndPhilosophy: z
    .object({
      summary: z
        .string()
        .trim()
        .default("No overall market risk summary or philosophy reported."),
      originalExcerpt: optionalExcerptSchema, // originalExcerpt for overall summary
    })
    .default({
      summary: "No overall market risk summary or philosophy reported.",
      originalExcerpt: undefined, // Added default for originalExcerpt
    }),

  interestRateRisk: createRobustRiskSchema(),
  currencyRisk: createRobustRiskSchema(),
  commodityPriceRisk: createRobustRiskSchema(),
  equityPriceRisk: createRobustRiskSchema(),

  derivativeFinancialInstrumentsUsage:
    derivativeFinancialInstrumentsUsageSchema,

  keyTakeawaysConcernsAndFutureOutlook:
    keyTakeawaysConcernsAndFutureOutlookSchema,
});

export type MarketRiskAnalysis = z.infer<typeof marketRiskAnalysisSchema>;
