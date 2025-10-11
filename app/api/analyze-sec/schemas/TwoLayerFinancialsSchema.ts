// app/api/analyze-sec/schemas/TwoLayerFinancialsSchema.ts
import { z } from "zod";

const excerptSchema = z.string().min(1).default("No excerpt available.");

// XBRL Metrics (Sadece sayılar)
const MetricDetailSchema = z.object({
  current: z.string().default("N/A"),
  previous: z.string().default("N/A"),
  change: z.string().optional(),
  changePercentage: z.string().optional(),
});

// Basit Policy
const PolicySchema = z.object({
  policy: z.string(),
  description: z.string(),
  excerpt: excerptSchema,
});

// Basit Insight
const InsightSchema = z.object({
  topic: z.string(),
  summary: z.string(),
  significance: z.enum(["high", "medium", "low"]).default("medium"),
  excerpt: excerptSchema,
});

// Basit Risk
const RiskSchema = z.object({
  description: z.string(),
  mitigation: z.string().optional(),
  excerpt: excerptSchema,
});

// Entegre Finansal Item (sadeleştirilmiş)
const IntegratedFinancialItemSchema = z.object({
  label: z.string(),

  // XBRL data
  metric: MetricDetailSchema.optional(),

  // Narrative summary (1-2 cümle)
  summary: z.string().optional(),

  // Commentary (detaylı açıklama)
  commentary: z.string().optional(),

  // Excerpt for this specific item
  excerpt: excerptSchema.optional(),

  // Related items (opsiyonel)
  policies: z.array(PolicySchema).default([]),
  insights: z.array(InsightSchema).default([]),
  risks: z.array(RiskSchema).default([]),
});

export const twoLayerFinancialsSchema = z.object({
  // Executive Summary
  executiveSummary: z.object({
    overview: z.string(),
    keyHighlights: z.array(z.string()),
    excerpt: excerptSchema.optional(),
  }),

  // Income Statement
  incomeStatement: z.object({
    revenue: IntegratedFinancialItemSchema,
    cogs: IntegratedFinancialItemSchema,
    grossProfit: IntegratedFinancialItemSchema,
    operatingExpenses: IntegratedFinancialItemSchema,
    operatingIncome: IntegratedFinancialItemSchema,
    netIncome: IntegratedFinancialItemSchema,
    eps: IntegratedFinancialItemSchema,
  }),

  // Balance Sheet
  balanceSheet: z.object({
    totalAssets: IntegratedFinancialItemSchema,
    currentAssets: IntegratedFinancialItemSchema,
    totalLiabilities: IntegratedFinancialItemSchema,
    currentLiabilities: IntegratedFinancialItemSchema,
    shareholdersEquity: IntegratedFinancialItemSchema,
    cash: IntegratedFinancialItemSchema,
  }),

  // Cash Flow
  cashFlow: z.object({
    operatingCashFlow: IntegratedFinancialItemSchema,
    investingCashFlow: IntegratedFinancialItemSchema,
    financingCashFlow: IntegratedFinancialItemSchema,
  }),

  // Ratios
  ratios: z.object({
    currentRatio: IntegratedFinancialItemSchema,
    grossMargin: IntegratedFinancialItemSchema,
    operatingMargin: IntegratedFinancialItemSchema,
    netMargin: IntegratedFinancialItemSchema,
    roe: IntegratedFinancialItemSchema,
  }),

  // Global items (bütün finansallar için geçerli)
  globalCommitments: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
        amount: z.string().optional(),
        excerpt: excerptSchema,
      })
    )
    .default([]),

  globalPolicies: z.array(PolicySchema).default([]),

  globalRisks: z.array(RiskSchema).default([]),

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

  overallAssessment: z.object({
    strengths: z.array(z.string()).default([]),
    concerns: z.array(z.string()).default([]),
    unusualItems: z.array(z.string()).default([]),
    summary: z.string(),
    excerpt: excerptSchema.optional(),
  }),

  analysisDate: z.string(),
  sourceFiles: z.object({
    item8Length: z.number(),
    item15Length: z.number(),
    combinedLength: z.number(),
  }),
});

export type TwoLayerFinancials = z.infer<typeof twoLayerFinancialsSchema>;
export type IntegratedFinancialItem = z.infer<
  typeof IntegratedFinancialItemSchema
>;
