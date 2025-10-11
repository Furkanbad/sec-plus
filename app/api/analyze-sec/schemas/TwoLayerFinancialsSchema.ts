// app/api/analyze-sec/schemas/TwoLayerFinancialsSchema.ts
import { z } from "zod";

// ============================================
// ENTEGRE FİNANSAL KALEM ŞEMASI
// Hem XBRL hem Narrative birleşik
// ============================================

const excerptSchema = z.string().min(1).default("No excerpt available.");

// Temel metrik detayı (XBRL'den)
const MetricDetailSchema = z.object({
  current: z.string().default("N/A"),
  previous: z.string().default("N/A"),
  change: z.string().optional(),
  changePercentage: z.string().optional(),
});

// İlgili politikalar
const PolicySchema = z.object({
  policy: z.string(),
  description: z.string(),
  changes: z.string().optional(),
  excerpt: excerptSchema,
});

// Önemli içgörüler
const InsightSchema = z.object({
  summary: z.string(),
  significance: z.enum(["high", "medium", "low"]).default("medium"),
  excerpt: excerptSchema,
});

// Riskler
const RiskSchema = z.object({
  description: z.string(),
  mitigationStrategy: z.string().optional(),
  excerpt: excerptSchema,
});

// ENTEGRE FİNANSAL KALEM
const IntegratedFinancialItemSchema = z.object({
  label: z.string(), // "Revenue", "Net Income", etc.

  // XBRL verisi (nicel)
  metric: MetricDetailSchema.optional(),

  // Narrative özet (nitel)
  narrativeSummary: z.string().optional(),

  // İlgili muhasebe politikaları
  relevantPolicies: z.array(PolicySchema).default([]),

  // Önemli içgörüler
  keyInsights: z.array(InsightSchema).default([]),

  // Riskler
  risks: z.array(RiskSchema).default([]),

  // Genel excerpt
  excerpt: excerptSchema.optional(),
});

// ============================================
// ANA SCHEMA - ENTEGRE YAPIYLA
// ============================================

export const twoLayerFinancialsSchema = z.object({
  // Özet
  executiveSummary: z.object({
    overview: z.string(),
    keyHighlights: z.array(z.string()),
    excerpt: excerptSchema.optional(),
  }),

  // INCOME STATEMENT - Entegre
  incomeStatement: z.object({
    revenue: IntegratedFinancialItemSchema,
    costOfSales: IntegratedFinancialItemSchema,
    grossProfit: IntegratedFinancialItemSchema,
    operatingExpenses: IntegratedFinancialItemSchema,
    operatingIncome: IntegratedFinancialItemSchema,
    netIncome: IntegratedFinancialItemSchema,
    eps: IntegratedFinancialItemSchema,
  }),

  // BALANCE SHEET - Entegre
  balanceSheet: z.object({
    totalAssets: IntegratedFinancialItemSchema,
    currentAssets: IntegratedFinancialItemSchema,
    totalLiabilities: IntegratedFinancialItemSchema,
    currentLiabilities: IntegratedFinancialItemSchema,
    shareholdersEquity: IntegratedFinancialItemSchema,
    cash: IntegratedFinancialItemSchema,
  }),

  // CASH FLOW - Entegre
  cashFlow: z.object({
    operatingCashFlow: IntegratedFinancialItemSchema,
    investingCashFlow: IntegratedFinancialItemSchema,
    financingCashFlow: IntegratedFinancialItemSchema,
  }),

  // RATIOS - Entegre
  ratios: z.object({
    currentRatio: IntegratedFinancialItemSchema,
    grossMargin: IntegratedFinancialItemSchema,
    operatingMargin: IntegratedFinancialItemSchema,
    netMargin: IntegratedFinancialItemSchema,
    roe: IntegratedFinancialItemSchema,
  }),

  // COMMITMENTS & CONTINGENCIES
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

  // ACCOUNTING POLICIES (Genel)
  significantAccountingPolicies: z
    .array(
      z.object({
        policy: z.string(),
        description: z.string(),
        changes: z.string().optional(),
        excerpt: excerptSchema,
      })
    )
    .default([]),

  // SUBSEQUENT EVENTS
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

  // OVERALL ASSESSMENT
  overallAssessment: z.object({
    strengths: z.array(z.string()).default([]),
    concerns: z.array(z.string()).default([]),
    unusualItems: z.array(z.string()).default([]),
    summary: z.string(),
    excerpt: excerptSchema.optional(),
  }),

  // Metadata
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
