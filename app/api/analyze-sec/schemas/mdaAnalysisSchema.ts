// app/api/analyze-sec/schemas/mdaAnalysisSchema.ts
import { z } from "zod";

// Helper schemas
const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty")
  .catch("No excerpt available.")
  .default("No excerpt available.");

const narrativeSectionSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(1, "Summary cannot be empty")
    .catch("Not available.")
    .default("Not available."),
  keyPoints: z.array(z.string()).default([]),
  excerpts: z.array(excerptSchema).default([]),
});

// Daha esnek financialMetricSchema - optional fields
const financialMetricSchema = z.object({
  currentPeriod: z
    .object({
      value: z.string().default("N/A"),
      period: z.string().default("N/A"),
    })
    .optional(),
  priorPeriod: z
    .object({
      value: z.string().default("N/A"),
      period: z.string().default("N/A"),
    })
    .optional(),
  change: z
    .object({
      absolute: z.string().default("N/A"),
      percentage: z.string().default("N/A"),
    })
    .optional(),
  commentary: z.string().default("Not discussed.").optional(),
  excerpt: excerptSchema.optional(),
});

// Daha basit storeMetricsSchema
const storeMetricsSchema = z.object({
  totalStores: z
    .union([
      z.number(),
      z.object({
        currentPeriod: z.number().default(0),
        priorPeriod: z.number().default(0),
        opened: z.number().default(0),
        closed: z.number().default(0),
      }),
    ])
    .optional(),
  byGeography: z
    .array(
      z.object({
        region: z.string(),
        count: z.number(),
        change: z.number().optional(),
      })
    )
    .default([]),
  byType: z
    .array(
      z.object({
        type: z.string(),
        count: z.number(),
        commentary: z.string().optional(),
      })
    )
    .default([]),
  salesPerSquareFoot: z.string().optional(),
  excerpt: excerptSchema.optional(),
});

// Daha esnek segmentPerformanceSchema
const segmentPerformanceSchema = z.object({
  segmentName: z.string(),
  revenue: z
    .union([
      financialMetricSchema,
      z.object({
        currentPeriod: z
          .object({
            value: z.string().default("N/A"),
            period: z.string().default("N/A"),
          })
          .optional(),
        value: z.string().optional(),
        percentage: z.string().optional(),
      }),
    ])
    .optional(),
  operatingIncome: financialMetricSchema.optional(),
  keyMetrics: z
    .array(
      z.object({
        metricName: z.string(),
        value: z.string(),
        trend: z.string().optional(),
      })
    )
    .default([]),
  narrative: z.string().default("Not discussed."),
  excerpt: excerptSchema.optional(),
});

const liquidityItemSchema = z.object({
  description: z.string(),
  amount: z.string().optional(),
  impact: z.string().optional(),
  excerpt: excerptSchema.optional(),
});

const criticalAccountingPolicySchema = z.object({
  policyName: z.string(),
  description: z.string(),
  keyAssumptions: z.array(z.string()).default([]),
  sensitivityAnalysis: z.string().optional(),
  excerpt: excerptSchema,
});

export const mdaAnalysisSchema = z.object({
  title: z.string().default("Management's Discussion and Analysis"),

  // 1. Business Overview
  businessOverview: z
    .object({
      executiveSummary: z.string().min(1).default("Not available."),
      businessDescription: z.string().default("Not available."),
      keyStrategies: z.array(z.string()).default([]),
      competitiveStrengths: z.array(z.string()).default([]),
      operatingSegments: z
        .array(
          z.object({
            name: z.string(),
            description: z.string(),
            revenueContribution: z.string().optional(),
          })
        )
        .default([]),
      recentDevelopments: z
        .array(
          z.object({
            event: z.string(),
            impact: z.string(),
            date: z.string().optional(),
          })
        )
        .default([]),
      excerpts: z.array(excerptSchema).default([]),
    })
    .partial()
    .default({}),

  // 2. Current Period Highlights
  currentPeriodHighlights: z
    .object({
      fiscalYearEnd: z.string().default("Not specified"),
      keyAchievements: z.array(z.string()).default([]),
      challenges: z.array(z.string()).default([]),
      financialHighlights: z
        .array(
          z.object({
            metric: z.string(),
            value: z.string(),
            trend: z.string().optional(),
          })
        )
        .default([]),
      excerpt: excerptSchema.optional(),
    })
    .partial()
    .default({}),

  // 3. Results of Operations - More flexible
  resultsOfOperations: z
    .object({
      overallPerformance: narrativeSectionSchema.optional(),

      // Revenue Analysis - More flexible
      revenueAnalysis: z
        .object({
          totalRevenue: financialMetricSchema.optional(),
          revenueBySegment: z.array(segmentPerformanceSchema).default([]),
          revenueDrivers: z
            .array(
              z.object({
                driver: z.string(),
                impact: z.string(),
                quantification: z.string().optional(),
              })
            )
            .default([]),
          geographicRevenue: z
            .array(
              z.object({
                region: z.string(),
                revenue: z.string(),
                percentOfTotal: z.string().optional(),
                trend: z.string().optional(),
              })
            )
            .default([]),
          excerpts: z.array(excerptSchema).default([]),
        })
        .partial()
        .default({}),

      // Cost Structure Analysis
      costAnalysis: z
        .object({
          costOfRevenue: financialMetricSchema.optional(),
          grossMargin: financialMetricSchema.optional(),
          operatingExpenses: z
            .object({
              total: financialMetricSchema.optional(),
              breakdown: z
                .array(
                  z.object({
                    category: z.string(),
                    amount: z.string(),
                    percentOfRevenue: z.string().optional(),
                    trend: z.string().optional(),
                  })
                )
                .default([]),
            })
            .partial()
            .default({}),
          costDrivers: z.array(z.string()).default([]),
          efficiencyMeasures: z.array(z.string()).default([]),
          excerpts: z.array(excerptSchema).default([]),
        })
        .partial()
        .default({}),

      // Profitability Metrics
      profitabilityAnalysis: z
        .object({
          operatingIncome: financialMetricSchema.optional(),
          netIncome: financialMetricSchema.optional(),
          adjustedEBITDA: financialMetricSchema.optional(),
          margins: z
            .object({
              grossMargin: z.string(),
              operatingMargin: z.string(),
              netMargin: z.string(),
              trend: z.string().optional(),
            })
            .partial()
            .default({}),
          nonGAAPReconciliation: z
            .array(
              z.object({
                item: z.string(),
                amount: z.string(),
                explanation: z.string().optional(),
              })
            )
            .default([]),
          excerpts: z.array(excerptSchema).default([]),
        })
        .partial()
        .default({}),

      // Store/Location Metrics (if applicable)
      storeMetrics: storeMetricsSchema.optional(),

      // Year-over-Year Comparison Tables
      comparativeTables: z
        .array(
          z.object({
            tableName: z.string(),
            metrics: z
              .array(
                z.object({
                  item: z.string(),
                  currentYear: z.string(),
                  priorYear: z.string(),
                  change: z.string().optional(),
                })
              )
              .default([]),
            footnotes: z.array(z.string()).default([]),
          })
        )
        .default([]),
    })
    .partial()
    .default({}),

  // 4. Liquidity and Capital Resources
  liquidityAndCapitalResources: z
    .object({
      cashPosition: z
        .object({
          currentCash: z.string(),
          restrictedCash: z.string().optional(),
          availableCredit: z.string().optional(),
          narrative: z.string(),
          excerpt: excerptSchema.optional(),
        })
        .partial()
        .default({}),

      cashFlowAnalysis: z
        .object({
          operatingActivities: z
            .object({
              amount: z.string(),
              keyDrivers: z.array(z.string()).default([]),
              trend: z.string().optional(),
            })
            .partial()
            .default({}),
          investingActivities: z
            .object({
              amount: z.string(),
              majorInvestments: z.array(liquidityItemSchema).default([]),
              capex: z.string().optional(),
            })
            .partial()
            .default({}),
          financingActivities: z
            .object({
              amount: z.string(),
              dividends: z.string().optional(),
              shareRepurchases: z.string().optional(),
              debtActivity: z.string().optional(),
            })
            .partial()
            .default({}),
          excerpts: z.array(excerptSchema).default([]),
        })
        .partial()
        .default({}),

      capitalStructure: z
        .object({
          totalDebt: z.string().optional(),
          equityPosition: z.string().optional(),
          creditFacilities: z
            .array(
              z.object({
                facility: z.string(),
                available: z.string(),
                utilized: z.string().optional(),
                terms: z.string().optional(),
              })
            )
            .default([]),
          debtCovenants: z.string().optional(),
          excerpt: excerptSchema.optional(),
        })
        .partial()
        .default({}),

      futureCapitalNeeds: z
        .object({
          anticipatedNeeds: z.array(z.string()).default([]),
          fundingSources: z.array(z.string()).default([]),
          commitments: z
            .array(
              z.object({
                type: z.string(),
                amount: z.string(),
                timing: z.string().optional(),
              })
            )
            .default([]),
          excerpt: excerptSchema.optional(),
        })
        .partial()
        .default({}),
    })
    .partial()
    .default({}),

  // 5. Market Trends and Business Environment
  marketTrendsAndOutlook: z
    .object({
      industryTrends: z.array(z.string()).default([]),
      competitiveLandscape: z.string().optional(),
      regulatoryEnvironment: z
        .array(
          z.object({
            issue: z.string(),
            impact: z.string(),
            managementResponse: z.string().optional(),
          })
        )
        .default([]),
      economicFactors: z
        .array(
          z.object({
            factor: z.string(),
            currentImpact: z.string(),
            expectedImpact: z.string().optional(),
          })
        )
        .default([]),
      excerpts: z.array(excerptSchema).default([]),
    })
    .partial()
    .default({}),

  // 6. Critical Accounting Policies
  criticalAccountingPolicies: z
    .array(criticalAccountingPolicySchema)
    .default([]),

  // 7. Known Trends, Uncertainties
  knownTrendsAndUncertainties: z
    .object({
      opportunities: z
        .array(
          z.object({
            description: z.string(),
            potentialImpact: z.string().optional(),
            timeline: z.string().optional(),
          })
        )
        .default([]),
      risks: z
        .array(
          z.object({
            description: z.string(),
            potentialImpact: z.string().optional(),
            mitigationStrategy: z.string().optional(),
          })
        )
        .default([]),
      forwardLookingStatements: z
        .object({
          guidance: z
            .array(
              z.object({
                metric: z.string(),
                target: z.string(),
                assumptions: z.array(z.string()).default([]),
              })
            )
            .default([]),
          strategicInitiatives: z.array(z.string()).default([]),
          cautionaryNote: z.string().optional(),
        })
        .partial()
        .default({}),
      excerpts: z.array(excerptSchema).default([]),
    })
    .partial()
    .default({}),

  // 8. Contractual Obligations
  contractualObligations: z
    .object({
      summary: z.string().default("Not discussed."),
      obligations: z
        .array(
          z.object({
            type: z.string(),
            total: z.string(),
            timing: z
              .object({
                within1Year: z.string().optional(),
                years1to3: z.string().optional(),
                years3to5: z.string().optional(),
                beyond5Years: z.string().optional(),
              })
              .optional(),
          })
        )
        .default([]),
      offBalanceSheet: z.string().optional(),
      excerpt: excerptSchema.optional(),
    })
    .partial()
    .default({}),

  // 9. Overall MD&A Takeaways
  keyTakeaways: z
    .object({
      strengths: z.array(z.string()).default([]),
      challenges: z.array(z.string()).default([]),
      managementTone: z.string().default("Not assessed."),
      investorConsiderations: z.array(z.string()).default([]),
      excerpts: z.array(excerptSchema).default([]),
    })
    .partial()
    .default({}),
});

export type MDAAnalysis = z.infer<typeof mdaAnalysisSchema>;
