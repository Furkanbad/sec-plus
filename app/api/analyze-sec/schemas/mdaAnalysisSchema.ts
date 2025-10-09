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
  excerpts: z.array(excerptSchema).default([]), // Multiple excerpts allowed
});

const financialMetricSchema = z.object({
  currentPeriod: z.object({
    value: z.string().default("N/A"),
    period: z.string().default("N/A"),
  }),
  priorPeriod: z.object({
    value: z.string().default("N/A"),
    period: z.string().default("N/A"),
  }),
  change: z.object({
    absolute: z.string().default("N/A"),
    percentage: z.string().default("N/A"),
  }),
  commentary: z.string().default("Not discussed."),
  excerpt: excerptSchema.optional(),
});

const storeMetricsSchema = z.object({
  totalStores: z.object({
    currentPeriod: z.number().default(0),
    priorPeriod: z.number().default(0),
    opened: z.number().default(0),
    closed: z.number().default(0),
  }),
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
        type: z.string(), // e.g., "Corporate", "Franchise", "Third-party"
        count: z.number(),
        commentary: z.string().optional(),
      })
    )
    .default([]),
  salesPerSquareFoot: z.string().optional(),
  excerpt: excerptSchema.optional(),
});

const segmentPerformanceSchema = z.object({
  segmentName: z.string(),
  revenue: financialMetricSchema.optional(),
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

  // 1. Business Overview - More flexible narrative structure
  businessOverview: z.object({
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
  }),

  // 2. Current Period Highlights
  currentPeriodHighlights: z.object({
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
  }),

  // 3. Results of Operations - More comprehensive
  resultsOfOperations: z.object({
    overallPerformance: narrativeSectionSchema,

    // Revenue Analysis - Enhanced
    revenueAnalysis: z.object({
      totalRevenue: financialMetricSchema,
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
    }),

    // Cost Structure Analysis
    costAnalysis: z.object({
      costOfRevenue: financialMetricSchema,
      grossMargin: financialMetricSchema,
      operatingExpenses: z.object({
        total: financialMetricSchema,
        breakdown: z
          .array(
            z.object({
              category: z.string(), // e.g., "SG&A", "R&D", "Marketing"
              amount: z.string(),
              percentOfRevenue: z.string().optional(),
              trend: z.string().optional(),
            })
          )
          .default([]),
      }),
      costDrivers: z.array(z.string()).default([]),
      efficiencyMeasures: z.array(z.string()).default([]),
      excerpts: z.array(excerptSchema).default([]),
    }),

    // Profitability Metrics
    profitabilityAnalysis: z.object({
      operatingIncome: financialMetricSchema,
      netIncome: financialMetricSchema,
      adjustedEBITDA: financialMetricSchema.optional(),
      margins: z.object({
        grossMargin: z.string(),
        operatingMargin: z.string(),
        netMargin: z.string(),
        trend: z.string().optional(),
      }),
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
    }),

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
  }),

  // 4. Liquidity and Capital Resources - Enhanced
  liquidityAndCapitalResources: z.object({
    cashPosition: z.object({
      currentCash: z.string(),
      restrictedCash: z.string().optional(),
      availableCredit: z.string().optional(),
      narrative: z.string(),
      excerpt: excerptSchema.optional(),
    }),

    cashFlowAnalysis: z.object({
      operatingActivities: z.object({
        amount: z.string(),
        keyDrivers: z.array(z.string()).default([]),
        trend: z.string().optional(),
      }),
      investingActivities: z.object({
        amount: z.string(),
        majorInvestments: z.array(liquidityItemSchema).default([]),
        capex: z.string().optional(),
      }),
      financingActivities: z.object({
        amount: z.string(),
        dividends: z.string().optional(),
        shareRepurchases: z.string().optional(),
        debtActivity: z.string().optional(),
      }),
      excerpts: z.array(excerptSchema).default([]),
    }),

    capitalStructure: z.object({
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
    }),

    futureCapitalNeeds: z.object({
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
    }),
  }),

  // 5. Market Trends and Business Environment
  marketTrendsAndOutlook: z.object({
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
          factor: z.string(), // e.g., "Inflation", "Interest Rates", "FX", "Tariffs"
          currentImpact: z.string(),
          expectedImpact: z.string().optional(),
        })
      )
      .default([]),
    excerpts: z.array(excerptSchema).default([]),
  }),

  // 6. Critical Accounting Policies
  criticalAccountingPolicies: z
    .array(criticalAccountingPolicySchema)
    .default([]),

  // 7. Known Trends, Uncertainties, and Forward-Looking Statements
  knownTrendsAndUncertainties: z.object({
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
    forwardLookingStatements: z.object({
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
    }),
    excerpts: z.array(excerptSchema).default([]),
  }),

  // 8. Contractual Obligations and Commitments
  contractualObligations: z.object({
    summary: z.string().default("Not discussed."),
    obligations: z
      .array(
        z.object({
          type: z.string(), // e.g., "Operating Leases", "Purchase Obligations", "Debt"
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
  }),

  // 9. Overall MD&A Takeaways
  keyTakeaways: z.object({
    strengths: z.array(z.string()).default([]),
    challenges: z.array(z.string()).default([]),
    managementTone: z.string().default("Not assessed."), // e.g., "Optimistic", "Cautious", "Neutral"
    investorConsiderations: z.array(z.string()).default([]),
    excerpts: z.array(excerptSchema).default([]),
  }),
});

export type MDAAnalysis = z.infer<typeof mdaAnalysisSchema>;
