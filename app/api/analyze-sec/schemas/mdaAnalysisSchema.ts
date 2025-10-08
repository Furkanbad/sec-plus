import { z } from "zod";

const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty")
  .catch("No excerpt available.")
  .default("No excerpt available.");

const mdaSectionWithExcerptSchema = z.object({
  analysis: z
    .string()
    .trim()
    .min(1, "Analysis cannot be empty.")
    .catch("Not available.")
    .default("Not available."),
  excerpt: excerptSchema,
});

const mdaSectionSchema = z
  .string()
  .trim()
  .min(1, "Analysis cannot be empty.")
  .catch("Not available.")
  .default("Not available.");

const criticalAccountingPolicySchema = z.object({
  policyName: z
    .string()
    .trim()
    .min(1, "Policy name cannot be empty.")
    .catch("N/A")
    .default("N/A"),
  explanation: z
    .string()
    .trim()
    .min(1, "Explanation cannot be empty.")
    .catch("No explanation available.")
    .default("No explanation available."),
  excerpt: excerptSchema,
});

const knownTrendUncertaintyOpportunitySchema = z.object({
  itemDescription: z
    .string()
    .trim()
    .min(1, "Item description cannot be empty.")
    .catch("N/A")
    .default("N/A"),
  impactBenefit: z
    .string()
    .trim()
    .min(1, "Impact/Benefit cannot be empty.")
    .catch("No impact/benefit available.")
    .default("No impact/benefit available."),
  excerpt: excerptSchema,
});

export const mdaAnalysisSchema = z
  .object({
    title: z
      .string()
      .trim()
      .default("Comprehensive Management's Discussion and Analysis"),
    executiveSummary: mdaSectionWithExcerptSchema
      .extend({
        analysis: z
          .string()
          .trim()
          .min(1, "Summary cannot be empty.")
          .catch("Summary not available.")
          .default("Summary not available."),
      })
      .transform((val) => ({
        // 'summary' olarak gelen anahtarı 'analysis' olarak yeniden eşle
        analysis: val.analysis,
        excerpt: val.excerpt,
      })),
    resultsOfOperations: z.object({
      revenueAnalysis: mdaSectionSchema,
      costOfSalesAnalysis: mdaSectionSchema,
      operatingExpensesAnalysis: mdaSectionSchema,
      otherIncomeExpense: mdaSectionSchema,
      segmentInformation: mdaSectionSchema,
    }),
    liquidityAndCapitalResources: z.object({
      currentLiquidity: mdaSectionSchema,
      capitalResources: mdaSectionSchema,
      cashFlowAnalysis: mdaSectionSchema,
      futureCapitalNeedsAndFundingStrategies: mdaSectionWithExcerptSchema,
    }),
    criticalAccountingPolicies: z
      .array(criticalAccountingPolicySchema)
      .default([])
      .transform((policies) => {
        // Ensure each policy has default values if missing from LLM
        return policies.map((policy) => ({
          policyName: policy.policyName || "N/A",
          explanation: policy.explanation || "No explanation available.",
          excerpt: policy.excerpt || "No excerpt available.",
        }));
      }),
    offBalanceSheetArrangements: mdaSectionWithExcerptSchema,
    contractualObligationsAndCommercialCommitments: mdaSectionSchema,
    knownTrendsUncertaintiesOpportunities: z
      .array(knownTrendUncertaintyOpportunitySchema)
      .default([])
      .transform((items) => {
        return items.map((item) => ({
          itemDescription: item.itemDescription || "N/A",
          impactBenefit: item.impactBenefit || "No impact/benefit available.",
          excerpt: item.excerpt || "No excerpt available.",
        }));
      }),
    inflationAndChangingPrices: mdaSectionSchema,
    strategicOutlookAndFuturePlans: mdaSectionSchema,
  })
  .transform((data) => {
    // Post-processing to ensure 'None reported', 'Not applicable', 'Not discussed' defaults are set where appropriate
    if (data.resultsOfOperations.otherIncomeExpense === "Not available.") {
      data.resultsOfOperations.otherIncomeExpense = "None reported";
    }
    if (data.resultsOfOperations.segmentInformation === "Not available.") {
      data.resultsOfOperations.segmentInformation = "Not applicable";
    }
    if (
      data.liquidityAndCapitalResources.futureCapitalNeedsAndFundingStrategies
        .analysis === "Not available."
    ) {
      data.liquidityAndCapitalResources.futureCapitalNeedsAndFundingStrategies.analysis =
        "None reported";
    }
    if (
      data.liquidityAndCapitalResources.futureCapitalNeedsAndFundingStrategies
        .excerpt === "No excerpt available."
    ) {
      data.liquidityAndCapitalResources.futureCapitalNeedsAndFundingStrategies.excerpt =
        "None reported";
    }
    if (data.offBalanceSheetArrangements.analysis === "Not available.") {
      data.offBalanceSheetArrangements.analysis = "None reported";
    }
    if (data.offBalanceSheetArrangements.excerpt === "No excerpt available.") {
      data.offBalanceSheetArrangements.excerpt = "None reported";
    }
    if (
      data.contractualObligationsAndCommercialCommitments === "Not available."
    ) {
      data.contractualObligationsAndCommercialCommitments = "None reported";
    }
    if (data.inflationAndChangingPrices === "Not available.") {
      data.inflationAndChangingPrices = "Not discussed";
    }
    return data;
  });

export type MDAAnalysis = z.infer<typeof mdaAnalysisSchema>;
