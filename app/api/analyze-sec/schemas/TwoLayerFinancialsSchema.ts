// app/api/analyze-sec/schemas/twoLayerFinancialsSchema.ts
import { z } from "zod";

// ============================================
// LAYER 1: XBRL-BASED QUANTITATIVE METRICS
// ============================================

const financialMetricSchema = z.object({
  current: z.string().default("N/A"),
  previous: z.string().default("N/A"),
  change: z.string().optional(),
  changePercentage: z.string().optional(),
});

const financialRatioSchema = z.object({
  current: z.string().default("N/A"),
  previous: z.string().default("N/A"),
  trend: z.enum(["improving", "declining", "stable"]).optional(),
});

export const xbrlMetricsSchema = z.object({
  title: z.literal("XBRL Financial Metrics").default("XBRL Financial Metrics"),

  // Income Statement
  incomeStatement: z.object({
    revenue: financialMetricSchema,
    costOfSales: financialMetricSchema,
    grossProfit: financialMetricSchema,
    operatingExpenses: financialMetricSchema,
    operatingIncome: financialMetricSchema,
    netIncome: financialMetricSchema,
    eps: financialMetricSchema,
  }),

  // Balance Sheet
  balanceSheet: z.object({
    totalAssets: financialMetricSchema,
    currentAssets: financialMetricSchema,
    totalLiabilities: financialMetricSchema,
    currentLiabilities: financialMetricSchema,
    shareholdersEquity: financialMetricSchema,
    cash: financialMetricSchema,
    debt: financialMetricSchema.optional(),
  }),

  // Cash Flow
  cashFlow: z.object({
    operatingCashFlow: financialMetricSchema,
    investingCashFlow: financialMetricSchema,
    financingCashFlow: financialMetricSchema,
    freeCashFlow: financialMetricSchema.optional(),
    capitalExpenditures: financialMetricSchema.optional(),
  }),

  // Calculated Ratios
  profitabilityRatios: z.object({
    grossMargin: financialRatioSchema,
    operatingMargin: financialRatioSchema,
    netMargin: financialRatioSchema,
    roe: financialRatioSchema,
    roa: financialRatioSchema,
  }),

  liquidityRatios: z.object({
    currentRatio: financialRatioSchema,
    quickRatio: financialRatioSchema,
    workingCapital: financialMetricSchema,
  }),

  leverageRatios: z.object({
    debtToEquity: financialRatioSchema,
    debtToAssets: financialRatioSchema,
  }),
});

// ============================================
// LAYER 2: TEXT-BASED NARRATIVE ANALYSIS
// ============================================

const excerptSchema = z.string().min(1).default("No excerpt available.");

const narrativeInsightSchema = z.object({
  topic: z.string(),
  summary: z.string(),
  significance: z.enum(["high", "medium", "low"]).default("medium"),
  excerpt: excerptSchema,
});

export const narrativeAnalysisSchema = z.object({
  title: z
    .literal("Financial Statements Narrative Analysis")
    .default("Financial Statements Narrative Analysis"),

  // Executive Summary
  executiveSummary: z.object({
    overview: z.string(),
    keyHighlights: z.array(z.string()),
    excerpt: excerptSchema,
  }),

  // Significant Accounting Policies
  accountingPolicies: z
    .array(
      z.object({
        policy: z.string(),
        description: z.string(),
        changes: z.string().optional(),
        impact: z.string().optional(),
        excerpt: excerptSchema,
      })
    )
    .default([]),

  // Footnotes & Disclosures
  footnotes: z.object({
    // Revenue Recognition
    revenueRecognition: z
      .object({
        summary: z.string(),
        methodologies: z.array(z.string()).default([]),
        excerpt: excerptSchema,
      })
      .optional(),

    // Stock-Based Compensation
    stockBasedCompensation: z
      .object({
        totalExpense: z.string().optional(),
        vestingSchedule: z.string().optional(),
        summary: z.string(),
        excerpt: excerptSchema,
      })
      .optional(),

    // Income Taxes
    incomeTaxes: z
      .object({
        effectiveRate: z.string().optional(),
        deferredTaxAssets: z.string().optional(),
        deferredTaxLiabilities: z.string().optional(),
        significantItems: z.array(z.string()).default([]),
        excerpt: excerptSchema,
      })
      .optional(),

    // Debt & Credit Facilities
    debtObligations: z
      .object({
        summary: z.string(),
        maturities: z.array(z.string()).default([]),
        covenants: z.string().optional(),
        excerpt: excerptSchema,
      })
      .optional(),

    // Leases
    leases: z
      .object({
        summary: z.string(),
        operatingLeases: z.string().optional(),
        financeLeases: z.string().optional(),
        excerpt: excerptSchema,
      })
      .optional(),

    // Fair Value Measurements
    fairValue: z
      .object({
        summary: z.string(),
        level1: z.string().optional(),
        level2: z.string().optional(),
        level3: z.string().optional(),
        excerpt: excerptSchema,
      })
      .optional(),
  }),

  // Commitments & Contingencies
  commitmentsContingencies: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
        amount: z.string().optional(),
        timing: z.string().optional(),
        probability: z
          .enum(["probable", "reasonably_possible", "remote"])
          .optional(),
        excerpt: excerptSchema,
      })
    )
    .default([]),

  // Related Party Transactions
  relatedPartyTransactions: z
    .object({
      hasMaterialTransactions: z.boolean(),
      summary: z.string(),
      transactions: z
        .array(
          z.object({
            party: z.string(),
            nature: z.string(),
            amount: z.string().optional(),
            excerpt: excerptSchema,
          })
        )
        .default([]),
    })
    .optional(),

  // Subsequent Events
  subsequentEvents: z
    .array(
      z.object({
        event: z.string(),
        date: z.string().optional(),
        impact: z.string(),
        excerpt: excerptSchema,
      })
    )
    .default([]),

  // Segment Information
  segmentInformation: z
    .object({
      hasSeparateSegments: z.boolean(),
      segments: z
        .array(
          z.object({
            name: z.string(),
            revenue: z.string().optional(),
            operatingIncome: z.string().optional(),
            description: z.string(),
            excerpt: excerptSchema,
          })
        )
        .default([]),
    })
    .optional(),

  // Key Insights
  keyInsights: z.array(narrativeInsightSchema).default([]),

  // Risks Identified
  risksIdentified: z
    .array(
      z.object({
        risk: z.string(),
        description: z.string(),
        mitigationStrategy: z.string().optional(),
        excerpt: excerptSchema,
      })
    )
    .default([]),

  // Overall Assessment
  overallAssessment: z.object({
    strengths: z.array(z.string()).default([]),
    concerns: z.array(z.string()).default([]),
    unusualItems: z.array(z.string()).default([]),
    summary: z.string(),
    excerpt: excerptSchema,
  }),
});

// ============================================
// COMBINED SCHEMA
// ============================================

export const twoLayerFinancialsSchema = z.object({
  // Layer 1: Pure numbers from XBRL
  xbrlMetrics: xbrlMetricsSchema,

  // Layer 2: Narrative insights from Item 8 + Item 15 text
  narrativeAnalysis: narrativeAnalysisSchema,

  // Metadata
  analysisDate: z.string(),
  sourceFiles: z.object({
    item8Length: z.number(),
    item15Length: z.number(),
    combinedLength: z.number(),
  }),
});

export type TwoLayerFinancials = z.infer<typeof twoLayerFinancialsSchema>;
export type XBRLMetrics = z.infer<typeof xbrlMetricsSchema>;
export type NarrativeAnalysis = z.infer<typeof narrativeAnalysisSchema>;
