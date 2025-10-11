// app/api/analyze-sec/sec-analysis.service.ts
import { OpenAI } from "openai";
import { getSecApiClient } from "@/lib/sec-api-client";
import { getOpenAIClient } from "@/lib/openai";
import {
  getXbrlApiClient,
  XBRLApiClient,
  XBRLFinancialData,
} from "@/lib/xbrl-api-client";

import {
  SECAnalysis,
  SECSearchRequest,
  SECAnalysisResult,
  SECFiling,
} from "@/app/api/analyze-sec/models/sec-analysis";

import * as analyzeServices from "@/app/api/analyze-sec/services";

import {
  fixImageUrls,
  markExcerptsInOriginalHtml,
} from "@/app/api/analyze-sec/html.utils";

import { openaiRequestLimiter, delay } from "@/utils/rate-limiter";

export class SECAnalysisService {
  private secApiClient: ReturnType<typeof getSecApiClient>;
  private openai: OpenAI;
  private xbrlApiClient: ReturnType<typeof getXbrlApiClient>;

  constructor() {
    this.secApiClient = getSecApiClient();
    this.openai = getOpenAIClient();
    this.xbrlApiClient = getXbrlApiClient();
  }

  /**
   * XBRL verilerini AI prompt için formatlar
   */
  private formatXBRLForPrompt(
    xbrlData: XBRLFinancialData,
    metrics: any,
    formatter: XBRLApiClient
  ): string {
    console.log("📝 [formatXBRLForPrompt] Starting formatting...");
    console.log(
      "   Available statements:",
      Object.keys(xbrlData).filter(
        (k) => k.includes("Statement") || k.includes("Balance")
      )
    );
    console.log("   Metrics received:", JSON.stringify(metrics, null, 2));

    let formatted = "=== STRUCTURED XBRL FINANCIAL DATA ===\n\n";

    // Company Information
    formatted += "COMPANY INFORMATION:\n";
    formatted += `Company: ${
      xbrlData.CoverPage?.EntityRegistrantName || "N/A"
    }\n`;
    formatted += `Fiscal Year: ${
      xbrlData.CoverPage?.DocumentFiscalYearFocus || "N/A"
    }\n`;
    formatted += `Period End: ${
      xbrlData.CoverPage?.DocumentPeriodEndDate || "N/A"
    }\n`;
    formatted += `Fiscal Period: ${
      xbrlData.CoverPage?.DocumentFiscalPeriodFocus || "N/A"
    }\n\n`;

    // Key Metrics Summary
    formatted += "KEY FINANCIAL METRICS:\n";

    if (metrics.periods && metrics.periods.length >= 2) {
      formatted += `Comparison Periods: ${metrics.periods[0]} (current) vs ${metrics.periods[1]} (previous)\n\n`;
    }

    if (metrics.revenue) {
      const change =
        metrics.revenue.previous !== 0
          ? (
              ((metrics.revenue.current - metrics.revenue.previous) /
                Math.abs(metrics.revenue.previous)) *
              100
            ).toFixed(2)
          : "N/A";
      formatted += `REVENUE:\n`;
      formatted += `  Current Period: ${formatter.formatFinancialNumber(
        metrics.revenue.current
      )}\n`;
      formatted += `  Previous Period: ${formatter.formatFinancialNumber(
        metrics.revenue.previous
      )}\n`;
      formatted += `  Change: ${change}%\n\n`;
    }

    if (metrics.netIncome) {
      const change =
        metrics.netIncome.previous !== 0
          ? (
              ((metrics.netIncome.current - metrics.netIncome.previous) /
                Math.abs(metrics.netIncome.previous)) *
              100
            ).toFixed(2)
          : "N/A";
      formatted += `NET INCOME:\n`;
      formatted += `  Current Period: ${formatter.formatFinancialNumber(
        metrics.netIncome.current
      )}\n`;
      formatted += `  Previous Period: ${formatter.formatFinancialNumber(
        metrics.netIncome.previous
      )}\n`;
      formatted += `  Change: ${change}%\n\n`;
    }

    if (metrics.totalAssets) {
      formatted += `TOTAL ASSETS:\n`;
      formatted += `  Current Period: ${formatter.formatFinancialNumber(
        metrics.totalAssets.current
      )}\n`;
      formatted += `  Previous Period: ${formatter.formatFinancialNumber(
        metrics.totalAssets.previous
      )}\n\n`;
    }

    if (metrics.totalLiabilities) {
      formatted += `TOTAL LIABILITIES:\n`;
      formatted += `  Current Period: ${formatter.formatFinancialNumber(
        metrics.totalLiabilities.current
      )}\n`;
      formatted += `  Previous Period: ${formatter.formatFinancialNumber(
        metrics.totalLiabilities.previous
      )}\n\n`;
    }

    if (metrics.operatingCashFlow) {
      formatted += `OPERATING CASH FLOW:\n`;
      formatted += `  Current Period: ${formatter.formatFinancialNumber(
        metrics.operatingCashFlow.current
      )}\n`;
      formatted += `  Previous Period: ${formatter.formatFinancialNumber(
        metrics.operatingCashFlow.previous
      )}\n\n`;
    }

    // Detailed Balance Sheet Data
    formatted += "DETAILED BALANCE SHEET:\n";
    if (xbrlData.BalanceSheets) {
      // XBRL API her GAAP item'ı array olarak döndürür
      const balanceSheetItems = Object.entries(xbrlData.BalanceSheets)
        .slice(0, 15) // İlk 15 item
        .filter(([key, items]) => Array.isArray(items) && items.length > 0);

      balanceSheetItems.forEach(([key, items]: [string, any]) => {
        // En son period'u al (segment olmayan)
        const latestItem = items
          .filter((item: any) => !item.segment && item.value)
          .sort((a: any, b: any) => {
            const dateA = a.period?.instant || a.period?.endDate || "";
            const dateB = b.period?.instant || b.period?.endDate || "";
            return dateB.localeCompare(dateA);
          })[0];

        if (latestItem) {
          formatted += `  ${key}: ${formatter.formatFinancialNumber(
            parseFloat(latestItem.value),
            latestItem.unitRef
          )}\n`;
        }
      });
    }

    // Detailed Income Statement Data
    formatted += "\nDETAILED INCOME STATEMENT:\n";
    if (xbrlData.StatementsOfIncome) {
      const incomeItems = Object.entries(xbrlData.StatementsOfIncome)
        .slice(0, 20)
        .filter(([key, items]) => Array.isArray(items) && items.length > 0);

      incomeItems.forEach(([key, items]: [string, any]) => {
        const latestItem = items
          .filter((item: any) => !item.segment && item.value)
          .sort((a: any, b: any) => {
            const dateA = a.period?.endDate || a.period?.startDate || "";
            const dateB = b.period?.endDate || b.period?.startDate || "";
            return dateB.localeCompare(dateA);
          })[0];

        if (latestItem) {
          formatted += `  ${key}: ${formatter.formatFinancialNumber(
            parseFloat(latestItem.value),
            latestItem.unitRef
          )}\n`;
        }
      });
    }

    // Cash Flow Data
    formatted += "\nDETAILED CASH FLOW STATEMENT:\n";
    if (xbrlData.StatementsOfCashFlows) {
      const cashFlowItems = Object.entries(xbrlData.StatementsOfCashFlows)
        .slice(0, 15)
        .filter(([key, items]) => Array.isArray(items) && items.length > 0);

      cashFlowItems.forEach(([key, items]: [string, any]) => {
        const latestItem = items
          .filter((item: any) => !item.segment && item.value)
          .sort((a: any, b: any) => {
            const dateA = a.period?.endDate || a.period?.startDate || "";
            const dateB = b.period?.endDate || b.period?.startDate || "";
            return dateB.localeCompare(dateA);
          })[0];

        if (latestItem) {
          formatted += `  ${key}: ${formatter.formatFinancialNumber(
            parseFloat(latestItem.value),
            latestItem.unitRef
          )}\n`;
        }
      });
    }

    formatted += "\n" + "=".repeat(50) + "\n";
    formatted += "NOTE: Use these exact XBRL figures for financial analysis.\n";
    formatted +=
      "Cross-reference with narrative text for context and insights.\n";
    formatted += "=".repeat(50) + "\n";

    console.log(
      `📝 [formatXBRLForPrompt] Formatted length: ${formatted.length} chars`
    );
    console.log(
      `📝 [formatXBRLForPrompt] Preview:\n${formatted.substring(0, 1000)}...`
    );

    return formatted;
  }

  /**
   * SEC dosyasını analiz eder
   */
  public async analyzeFiling(
    searchRequest: SECSearchRequest
  ): Promise<SECAnalysisResult> {
    const { ticker, filingType, year } = searchRequest;

    console.log(`🔍 Searching for ${ticker} ${filingType} filing...`);

    // 1. SEC Dosyalarını Arama
    const filings = await this.secApiClient.searchFilings({
      ticker,
      filingType,
      year,
    });

    if (filings.length === 0) {
      throw new Error(`No ${filingType} filings found for ${ticker}`);
    }

    const filing = filings[0];
    console.log(`✓ Found filing: ${filing.companyName} - ${filing.filingDate}`);

    // 2. Orijinal HTML'i Çekme
    console.log(`📄 Fetching original HTML from SEC...`);
    const originalHtmlResponse = await fetch(filing.htmlUrl);
    if (!originalHtmlResponse.ok) {
      throw new Error("Failed to fetch original SEC HTML");
    }
    let fullOriginalHtml = await originalHtmlResponse.text();
    console.log(`✓ HTML fetched (${fullOriginalHtml.length} chars)`);

    // 3. Resim URL'lerini Düzeltme
    fullOriginalHtml = fixImageUrls(fullOriginalHtml, filing.htmlUrl);

    // 4. Bölüm Verilerini Alma (XBRL dahil)
    console.log(`📊 Extracting sections and XBRL data...`);
    const result = await this.secApiClient.getAllSections(filing, true);
    const sectionsData = result.sections;

    console.log("📊 Section sizes for AI analysis:");
    Object.entries(sectionsData).forEach(([key, value]) => {
      if (value.text.length > 0) {
        console.log(`   ${key}: ${value.text.length} chars`);
      }
    });

    if (result.xbrlData) {
      console.log("✅ XBRL data is available for enhanced financial analysis");
    } else {
      console.log("⚠️ XBRL data not available, using text extraction only");
    }

    // 5. AI Analizini Çalıştırma
    console.log(`🤖 Starting AI analysis...`);
    const analysis = await this.runAIAnalysis(
      filing,
      sectionsData,
      result.xbrlData ?? null, // undefined'ı null'a çevir
      this.openai,
      filing.companyName
    );

    // 6. Alıntıları İşaretleme
    console.log(`🔖 Marking excerpts in HTML...`);
    const { markedHtml, excerptMap } = await markExcerptsInOriginalHtml(
      fullOriginalHtml,
      analysis
    );

    // 7. Alıntı ID'lerini Ekleme
    const updatedAnalysis = this.addExcerptIdsToAnalysis(analysis, excerptMap);

    console.log(`✅ Analysis complete!`);

    return {
      analysis: updatedAnalysis,
      fullOriginalHtml: markedHtml,
      filingInfo: {
        ticker,
        filingType,
        year: filing.fiscalYear,
        companyName: filing.companyName,
      },
    };
  }

  /**
   * AI kullanarak bölümleri analiz eder
   */
  private async runAIAnalysis(
    filing: SECFiling,
    sectionsData: Record<string, { text: string; html: string }>,
    xbrlData: {
      raw: XBRLFinancialData;
      metrics: any;
      formatter: any;
    } | null,
    openai: OpenAI,
    companyName: string
  ): Promise<SECAnalysis> {
    const analysis: SECAnalysis = {
      filing,
      sections: {},
      generatedAt: new Date().toISOString(),
    };

    // XBRL verilerini formatla
    let xbrlFormatted = "";
    if (xbrlData) {
      xbrlFormatted = this.formatXBRLForPrompt(
        xbrlData.raw,
        xbrlData.metrics,
        xbrlData.formatter
      );
    }

    const analysisPromises: Promise<void>[] = [];

    const sectionAnalyses = [
      // {
      //   condition:
      //     sectionsData.business?.text &&
      //     sectionsData.business.text.length > 500,
      //   analyze: () =>
      //     analyzeServices.analyzeBusinessSection(
      //       sectionsData.business.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "business",
      // },
      // {
      //   condition:
      //     sectionsData.properties?.text &&
      //     sectionsData.properties.text.length > 50,
      //   analyze: () =>
      //     analyzeServices.analyzePropertySection(
      //       sectionsData.properties.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "properties",
      // },
      // {
      //   condition:
      //     sectionsData.risk?.text && sectionsData.risk.text.length > 500,
      //   analyze: () =>
      //     analyzeServices.analyzeRiskSection(
      //       sectionsData.risk.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "risks",
      // },
      // {
      //   condition:
      //     sectionsData.legal?.text && sectionsData.legal.text.length > 300,
      //   analyze: () =>
      //     analyzeServices.analyzeLegalSection(
      //       sectionsData.legal.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "legal",
      // },
      // {
      //   condition:
      //     sectionsData.mdna?.text && sectionsData.mdna.text.length > 500,
      //   analyze: () =>
      //     analyzeServices.analyzeMdnaSection(
      //       sectionsData.mdna.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "mdna",
      // },
      // {
      //   condition:
      //     sectionsData.marketRisk?.text &&
      //     sectionsData.marketRisk.text.length > 300,
      //   analyze: () =>
      //     analyzeServices.analyzeMarketRiskSection(
      //       sectionsData.marketRisk.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "marketRisks",
      // },
      {
        condition: sectionsData.financials?.text,
        analyze: () =>
          analyzeServices.analyzeTwoLayerFinancials(
            sectionsData.financials.text,
            sectionsData.exhibits?.text || "",
            xbrlData,
            openai,
            companyName
          ),
        key: "twoLayerFinancials",
      },
      // {
      //   condition:
      //     sectionsData.controls?.text &&
      //     sectionsData.controls.text.length > 300,
      //   analyze: () =>
      //     analyzeServices.analyzeControlsSection(
      //       sectionsData.controls.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "controls",
      // },
      // {
      //   condition:
      //     sectionsData.directors?.text &&
      //     sectionsData.directors.text.length > 300,
      //   analyze: () =>
      //     analyzeServices.analyzeDirectorsSection(
      //       sectionsData.directors.text,
      //       openai,
      //       companyName
      //     ),
      //   key: "directors",
      // },
    ];

    for (const section of sectionAnalyses) {
      if (section.condition) {
        analysisPromises.push(
          openaiRequestLimiter(async () => {
            await delay(2000);
            try {
              const result = await section.analyze();
              if (result) {
                (analysis.sections as any)[section.key] = result;
                console.log(`   ✅ ${section.key} analyzed`);
              }
            } catch (error) {
              console.error(`   ❌ Failed to analyze ${section.key}:`, error);
              if (error instanceof Error && error.message.includes("429")) {
                console.log(
                  `   ⏳ Rate limit hit for ${section.key}, waiting 30s...`
                );
                await delay(30000);
                try {
                  const result = await section.analyze();
                  if (result) {
                    (analysis.sections as any)[section.key] = result;
                    console.log(`   ✅ ${section.key} analyzed on retry`);
                  }
                } catch (retryError) {
                  console.error(
                    `   ❌ Retry failed for ${section.key}:`,
                    retryError
                  );
                }
              }
            }
          })
        );
      }
    }

    console.log(
      `   Running ${analysisPromises.length} AI analyses with rate limiting...`
    );

    await Promise.allSettled(analysisPromises);

    console.log(
      `   📊 Analysis complete. Sections analyzed: ${Object.keys(
        analysis.sections
      ).join(", ")}`
    );

    return analysis;
  }

  /**
   * Alıntı ID'lerini ekler
   */
  private addExcerptIdsToAnalysis(
    analysis: SECAnalysis,
    excerptMap: Record<string, string>
  ): SECAnalysis {
    const updatedAnalysis = { ...analysis };

    const addId = (
      obj: any,
      excerptField: string = "originalExcerpt",
      idField: string = "originalExcerptId"
    ) => {
      if (obj && obj[excerptField] && excerptMap[obj[excerptField]]) {
        obj[idField] = excerptMap[obj[excerptField]];
      }
    };

    const processArray = (
      items: any[],
      excerptField: string = "originalExcerpt",
      idField: string = "originalExcerptId"
    ) => {
      items?.forEach((item) => addId(item, excerptField, idField));
    };

    // Business section
    if (analysis.sections.business) {
      const business = analysis.sections.business as any;
      addId(business, "summaryExcerpt", "summaryExcerptId");
      processArray(business.keyProducts);
      processArray(business.competitiveAdvantages);
      processArray(business.growthStrategiesOpportunities);
      processArray(business.partnershipsCollaborations);
      addId(business.targetCustomers);
      addId(business.businessModel);
    }

    // Risk section
    if (analysis.sections.risks) {
      const risks = analysis.sections.risks as any;
      processArray(risks.risks);
    }

    // Properties section
    if (analysis.sections.properties) {
      const properties = analysis.sections.properties as any;
      addId(properties.propertiesOverview, "excerpt", "excerptId");
    }

    // TwoLayerFinancials section
    if (analysis.sections.twoLayerFinancials) {
      const twoLayer = analysis.sections.twoLayerFinancials as any;

      // Narrative Analysis
      if (twoLayer.narrativeAnalysis) {
        const narrative = twoLayer.narrativeAnalysis;

        // Executive Summary
        addId(narrative.executiveSummary, "excerpt", "excerptId");

        // Key Insights
        processArray(narrative.keyInsights, "excerpt", "excerptId");

        // Accounting Policies
        processArray(narrative.accountingPolicies, "excerpt", "excerptId");

        // Footnotes
        if (narrative.footnotes) {
          addId(narrative.footnotes.revenueRecognition, "excerpt", "excerptId");
          addId(
            narrative.footnotes.stockBasedCompensation,
            "excerpt",
            "excerptId"
          );
          addId(narrative.footnotes.incomeTaxes, "excerpt", "excerptId");
          addId(narrative.footnotes.debtObligations, "excerpt", "excerptId");
          addId(narrative.footnotes.leases, "excerpt", "excerptId");
          addId(narrative.footnotes.fairValue, "excerpt", "excerptId");
        }

        // Commitments & Contingencies
        processArray(
          narrative.commitmentsContingencies,
          "excerpt",
          "excerptId"
        );

        // Related Party Transactions
        if (narrative.relatedPartyTransactions?.transactions) {
          processArray(
            narrative.relatedPartyTransactions.transactions,
            "excerpt",
            "excerptId"
          );
        }

        // Subsequent Events
        processArray(narrative.subsequentEvents, "excerpt", "excerptId");

        // Segment Information
        if (narrative.segmentInformation?.segments) {
          processArray(
            narrative.segmentInformation.segments,
            "excerpt",
            "excerptId"
          );
        }

        // Risks Identified
        processArray(narrative.risksIdentified, "excerpt", "excerptId");

        // Overall Assessment
        addId(narrative.overallAssessment, "excerpt", "excerptId");
      }
    }

    // Legal section
    if (analysis.sections.legal) {
      const legal = analysis.sections.legal as any;
      addId(
        legal,
        "overallLegalSummaryExcerpt",
        "overallLegalSummaryExcerptId"
      );
      addId(
        legal,
        "regulatoryInquiriesExcerpt",
        "regulatoryInquiriesExcerptId"
      );
      addId(
        legal,
        "environmentalLitigationExcerpt",
        "environmentalLitigationExcerptId"
      );
      addId(
        legal,
        "overallRiskAssessmentExcerpt",
        "overallRiskAssessmentExcerptId"
      );

      legal.materialCases?.forEach((legalCase: any) => {
        addId(legalCase, "caseTitleExcerpt", "caseTitleExcerptId");
        addId(legalCase, "natureOfClaimExcerpt", "natureOfClaimExcerptId");
        addId(legalCase, "currentStatusExcerpt", "currentStatusExcerptId");
        addId(legalCase, "companyPositionExcerpt", "companyPositionExcerptId");
        addId(legalCase.potentialFinancialImpact);
      });
    }

    // MDA section
    if (analysis.sections.mdna) {
      const mda = analysis.sections.mdna as any;
      mda.businessOverview?.excerpts?.forEach((excerpt: any) =>
        addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      addId(mda.currentPeriodHighlights, "excerpt", "excerptId");
      mda.resultsOfOperations?.overallPerformance?.excerpts?.forEach(
        (excerpt: any) => addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      addId(
        mda.resultsOfOperations?.revenueAnalysis?.totalRevenue,
        "excerpt",
        "excerptId"
      );
      mda.resultsOfOperations?.revenueAnalysis?.excerpts?.forEach(
        (excerpt: any) => addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      mda.resultsOfOperations?.costAnalysis?.excerpts?.forEach((excerpt: any) =>
        addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      mda.resultsOfOperations?.profitabilityAnalysis?.excerpts?.forEach(
        (excerpt: any) => addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      addId(
        mda.liquidityAndCapitalResources?.cashPosition,
        "excerpt",
        "excerptId"
      );
      mda.liquidityAndCapitalResources?.cashFlowAnalysis?.excerpts?.forEach(
        (excerpt: any) => addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      addId(
        mda.liquidityAndCapitalResources?.capitalStructure,
        "excerpt",
        "excerptId"
      );
      addId(
        mda.liquidityAndCapitalResources?.futureCapitalNeeds,
        "excerpt",
        "excerptId"
      );
      mda.marketTrendsAndOutlook?.excerpts?.forEach((excerpt: any) =>
        addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      processArray(mda.criticalAccountingPolicies, "excerpt", "excerptId");
      addId(mda.contractualObligations, "excerpt", "excerptId");
      mda.knownTrendsAndUncertainties?.excerpts?.forEach((excerpt: any) =>
        addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
      mda.keyTakeaways?.excerpts?.forEach((excerpt: any) =>
        addId({ excerpt: excerpt }, "excerpt", "excerptId")
      );
    }

    // Market Risk section
    if (analysis.sections.marketRisks) {
      const marketRisk = analysis.sections.marketRisks as any;
      addId(marketRisk.overallSummaryAndPhilosophy);
      addId(marketRisk.interestRateRisk);
      addId(marketRisk.interestRateRisk?.potentialImpact);
      addId(marketRisk.currencyRisk);
      addId(marketRisk.currencyRisk?.potentialImpact);
      addId(marketRisk.commodityPriceRisk);
      addId(marketRisk.commodityPriceRisk?.potentialImpact);
      addId(marketRisk.equityPriceRisk);
      addId(marketRisk.equityPriceRisk?.potentialImpact);
      addId(marketRisk.derivativeFinancialInstrumentsUsage);
      addId(marketRisk.keyTakeawaysConcernsAndFutureOutlook);
    }

    // Financials section
    if (analysis.sections.financials) {
      const financials = analysis.sections.financials as any;
      addId(financials.revenueAnalysis, "excerpt", "excerptId");
      addId(
        financials.cogsAndGrossProfitAnalysis?.grossProfit,
        "excerpt",
        "excerptId"
      );
      addId(financials.cogsAndGrossProfitAnalysis, "excerpt", "excerptId");
      addId(
        financials.operatingExpensesAnalysis?.totalOperatingExpenses,
        "excerpt",
        "excerptId"
      );
      addId(financials.operatingExpensesAnalysis, "excerpt", "excerptId");
      addId(financials.operatingIncomeEBITAnalysis, "excerpt", "excerptId");
      addId(financials.ebitdaAnalysis, "excerpt", "excerptId");
      addId(
        financials.interestAndOtherNonOperatingItems,
        "excerpt",
        "excerptId"
      );
      addId(financials.incomeTaxExpenseAnalysis, "excerpt", "excerptId");
      addId(financials.netIncomeAnalysis, "excerpt", "excerptId");
      addId(financials.epsDilutedAnalysis, "excerpt", "excerptId");
      addId(financials.profitabilityRatios, "excerpt", "excerptId");
      processArray(financials.noteworthyItemsImpacts, "excerpt", "excerptId");
      addId(financials, "keyInsightsExcerpt", "keyInsightsExcerptId");
    }

    // Controls section
    if (analysis.sections.controls) {
      const controls = analysis.sections.controls as any;
      addId(
        controls.managementConclusionDisclosureControls,
        "excerpt",
        "excerptId"
      );
      addId(controls.managementReportICFR, "excerpt", "excerptId");
      processArray(controls.materialWeaknessesICFR, "excerpt", "excerptId");
      processArray(controls.remediationEfforts, "excerpt", "excerptId");
      addId(controls.auditorOpinionICFR, "excerpt", "excerptId");
    }

    // Directors section
    if (analysis.sections.directors) {
      const directors = analysis.sections.directors as any;
      addId(directors.boardCompositionOverview);
      addId(directors.boardLeadershipStructure);
    }

    return updatedAnalysis;
  }
}
