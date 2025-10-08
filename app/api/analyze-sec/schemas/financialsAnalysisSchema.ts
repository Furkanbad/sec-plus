import { z } from "zod";

// Helper schemas for common data types
const monetaryValueSchema = z
  .string()
  .trim()
  .min(1, "Monetary value cannot be empty.")
  .regex(
    /^\$?[\d,]+(\.\d{1,2})?(\s*(million|billion|trillion))?$/i,
    "Invalid monetary value format. Must include currency and format (e.g., '$X million')."
  )
  .catch("N/A")
  .default("N/A");

const percentageValueSchema = z
  .string()
  .trim()
  .min(1, "Percentage value cannot be empty.")
  .regex(/^\d+(\.\d{1,2})?%$/, "Invalid percentage format (e.g., 'X%').")
  .catch("N/A")
  .default("N/A");

const periodSchema = z
  .string()
  .trim()
  .min(1, "Period cannot be empty.")
  .catch("N/A")
  .default("N/A");

// For analytical descriptions and comments
const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description cannot be empty.")
  .catch("No description available.")
  .default("No description available.");

const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty.")
  .catch("No direct excerpt found.")
  .default("No direct excerpt found.");

// Common structure for financial entries
const financialEntrySchema = z.object({
  value: monetaryValueSchema,
  period: periodSchema,
});

// Financial entry with year-over-year change.
const financialEntryChangeSchema = z.object({
  currentYear: financialEntrySchema,
  previousYear: financialEntrySchema,
  changeAbsolute: monetaryValueSchema,
  changePercentage: percentageValueSchema,
  // Bu alanlar analitik özetler içindir:
  drivers: descriptionSchema.optional(),
  factors: descriptionSchema.optional(),
  efficiencyComment: descriptionSchema.optional(),
  trendComment: descriptionSchema.optional(),
  significance: descriptionSchema.optional(),
  impactComment: descriptionSchema.optional(),
  taxRateComment: descriptionSchema.optional(),
  contributors: descriptionSchema.optional(),
  factorsBeyondNetIncome: descriptionSchema.optional(),
  // Bu genel bir alıntı olup, sadece anlamlı bir açıklama veya içgörü içeriyorsa doldurulmalıdır.
  // Varsayılan olarak optional bırakalım ve prompt ile yönlendirelim.
  excerpt: excerptSchema.optional(),
});

// Main Financial Analysis Schema
export const financialAnalysisSchema = z.object({
  title: z
    .string()
    .trim()
    .default("Detailed Profitability Analysis and Year-over-Year Comparison"),

  revenueAnalysis: financialEntryChangeSchema.extend({
    drivers: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  cogsAndGrossProfitAnalysis: z.object({
    cogs: z.object({
      currentYear: financialEntrySchema,
      previousYear: financialEntrySchema,
    }),
    grossProfit: financialEntryChangeSchema.extend({
      excerpt: excerptSchema.optional(), // Opsiyonel
    }),
    factors: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  operatingExpensesAnalysis: z.object({
    totalOperatingExpenses: financialEntryChangeSchema.extend({
      excerpt: excerptSchema.optional(), // Opsiyonel
    }),
    sgna: z
      .object({
        currentYear: financialEntrySchema,
        previousYear: financialEntrySchema,
      })
      .optional(),
    rd: z
      .object({
        currentYear: financialEntrySchema,
        previousYear: financialEntrySchema,
      })
      .optional(),
    efficiencyComment: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  operatingIncomeEBITAnalysis: financialEntryChangeSchema.extend({
    trendComment: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  ebitdaAnalysis: financialEntryChangeSchema.extend({
    significance: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  interestAndOtherNonOperatingItems: z.object({
    interestExpense: z.object({
      currentYear: financialEntrySchema,
      previousYear: financialEntrySchema,
    }),
    otherNonOperatingIncomeExpense: z.object({
      currentYear: financialEntrySchema,
      previousYear: financialEntrySchema,
    }),
    impactComment: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  incomeTaxExpenseAnalysis: z.object({
    currentYear: financialEntrySchema,
    previousYear: financialEntrySchema,
    effectiveTaxRateCurrentYear: percentageValueSchema,
    effectiveTaxRatePreviousYear: percentageValueSchema,
    taxRateComment: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  netIncomeAnalysis: financialEntryChangeSchema.extend({
    contributors: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  epsDilutedAnalysis: financialEntryChangeSchema.extend({
    currentYear: z.object({
      value: monetaryValueSchema,
      period: periodSchema,
    }),
    previousYear: z.object({
      value: monetaryValueSchema,
      period: periodSchema,
    }),
    changeAbsolute: monetaryValueSchema,
    changePercentage: percentageValueSchema,
    factorsBeyondNetIncome: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  profitabilityRatios: z.object({
    grossProfitMargin: z.object({
      currentYear: percentageValueSchema,
      previousYear: percentageValueSchema,
    }),
    operatingMargin: z.object({
      currentYear: percentageValueSchema,
      previousYear: percentageValueSchema,
    }),
    netProfitMargin: z.object({
      currentYear: percentageValueSchema,
      previousYear: percentageValueSchema,
    }),
    ebitdaMargin: z.object({
      currentYear: percentageValueSchema,
      previousYear: percentageValueSchema,
    }),
    roa: z.object({
      currentYear: percentageValueSchema,
      previousYear: percentageValueSchema,
    }),
    roe: z.object({
      currentYear: percentageValueSchema,
      previousYear: percentageValueSchema,
    }),
    trendComment: descriptionSchema,
    excerpt: excerptSchema.optional(), // Opsiyonel
  }),

  noteworthyItemsImpacts: z
    .array(
      z.object({
        description: descriptionSchema,
        type: z
          .enum([
            "unusual_item",
            "adjustment",
            "one_time_gain_loss",
            "restructuring_charge",
            "impairment",
            "footnote",
            "none_identified",
          ])
          .catch("unusual_item")
          .default("unusual_item"),
        financialImpact: monetaryValueSchema.optional(),
        recurring: z.boolean().catch(false).default(false),
        excerpt: excerptSchema, // BURADA KESİNLİKLE ZORUNLU KALIYOR
      })
    )
    .default([]),

  keyInsights: descriptionSchema,
  keyInsightsExcerpt: excerptSchema, // BURADA KESİNLİKLE ZORUNLU KALIYOR
});

export type FinancialAnalysis = z.infer<typeof financialAnalysisSchema>;
