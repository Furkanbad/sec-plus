// app/api/analyze-sec/sec-analysis.service.ts
import { OpenAI } from "openai";
// Gerekli istemci fonksiyonlarını import ediyoruz
import { getSecApiClient } from "@/lib/sec-api-client";
import { getOpenAIClient } from "@/lib/openai"; // Varsayım: openai client utility'si lib altında

// Modelleri ve tipleri import ediyoruz
import {
  SECAnalysis,
  SECSearchRequest,
  SECAnalysisResult,
  SECFiling,
} from "@/app/api/analyze-sec/models/sec-analysis";

// AI analiz hizmetlerini import ediyoruz
import * as analyzeServices from "@/app/api/analyze-sec/services";

// HTML yardımcı fonksiyonlarını import ediyoruz
import {
  fixImageUrls,
  markExcerptsInOriginalHtml,
} from "@/app/api/analyze-sec/html.utils";

// Analiz şemalarını import ediyoruz (addExcerptIdsToAnalysis fonksiyonu için gerekli)
import {
  BusinessAnalysis,
  RiskAnalysis,
  LegalAnalysis,
  MDAAnalysis,
  MarketRiskAnalysis,
  PropertyAnalysis,
  FinancialAnalysis,
  ControlsAnalysis,
  DirectorsAnalysis,
} from "@/app/api/analyze-sec/schemas";

// Rate limiter utility'sini import ediyoruz
import { openaiRequestLimiter, delay } from "@/utils/rate-limiter";

export class SECAnalysisService {
  private secApiClient: ReturnType<typeof getSecApiClient>;
  private openai: OpenAI;

  constructor() {
    this.secApiClient = getSecApiClient();
    this.openai = getOpenAIClient();
  }

  /**
   * Belirtilen arama isteğine göre bir SEC dosyasını analiz eder.
   * @param searchRequest Ticker, filingType ve yıl içeren arama isteği.
   * @returns Analiz sonuçları, işaretlenmiş HTML ve dosya bilgileri.
   * @throws Eğer dosya bulunamazsa veya HTML çekme başarısız olursa.
   */
  public async analyzeFiling(
    searchRequest: SECSearchRequest
  ): Promise<SECAnalysisResult> {
    const { ticker, filingType, year } = searchRequest;

    // 1. SEC Dosyalarını Arama
    const filings = await this.secApiClient.searchFilings({
      ticker,
      filingType,
      year,
    });

    if (filings.length === 0) {
      throw new Error(`No ${filingType} filings found for ${ticker}`);
    }

    const filing = filings[0]; // Genellikle en son dosyayı alırız

    // 2. Orijinal HTML'i Çekme
    const originalHtmlResponse = await fetch(filing.htmlUrl);
    if (!originalHtmlResponse.ok) {
      throw new Error("Failed to fetch original SEC HTML");
    }
    let fullOriginalHtml = await originalHtmlResponse.text();

    // 3. Resim URL'lerini Düzeltme (HTML Utility tarafından)
    fullOriginalHtml = fixImageUrls(fullOriginalHtml, filing.htmlUrl);

    // 4. AI Analizi İçin Bölüm Verilerini Alma
    const sectionsData = await this.secApiClient.getAllSections(filing);

    console.log("📊 Section sizes for AI analysis:");
    Object.entries(sectionsData).forEach(([key, value]) => {
      console.log(`   ${key}: Text ${value.text.length} chars`);
    });

    // 5. AI Analizini Çalıştırma (Service'in kendi metodu)
    const analysis = await this.runAIAnalysis(
      filing,
      sectionsData,
      this.openai,
      filing.companyName
    );

    // 6. Orijinal HTML'de Alıntıları İşaretleme (HTML Utility tarafından)
    const { markedHtml, excerptMap } = await markExcerptsInOriginalHtml(
      fullOriginalHtml,
      analysis
    );

    // 7. Analize Alıntı Kimliklerini Ekleme (Service'in kendi metodu)
    const updatedAnalysis = this.addExcerptIdsToAnalysis(analysis, excerptMap);

    // 8. Sonuçları Döndürme
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
   * AI kullanarak SEC dosyasının farklı bölümlerini analiz eder.
   * Bu, önceki analyzeWithAI fonksiyonunun içeriğidir.
   * @param filing SECFiling nesnesi.
   * @param sectionsData Bölümlere ayrılmış metin verileri.
   * @param openai OpenAI istemcisi.
   * @param companyName Şirket adı.
   * @returns SECAnalysis nesnesi.
   */
  private async runAIAnalysis(
    filing: SECFiling,
    sectionsData: Record<string, { text: string; html: string }>,
    openai: OpenAI,
    companyName: string
  ): Promise<SECAnalysis> {
    const analysis: SECAnalysis = {
      filing,
      sections: {},
      generatedAt: new Date().toISOString(),
    };

    const analysisPromises: Promise<void>[] = [];

    const sectionAnalyses = [
      {
        condition:
          sectionsData.business?.text &&
          sectionsData.business.text.length > 500,
        analyze: () =>
          analyzeServices.analyzeBusinessSection(
            sectionsData.business.text,
            openai,
            companyName
          ),
        key: "business",
      },
      {
        condition:
          sectionsData.properties?.text &&
          sectionsData.properties.text.length > 50,
        analyze: () =>
          analyzeServices.analyzePropertySection(
            sectionsData.properties.text,
            openai,
            companyName
          ),
        key: "properties",
      },
      {
        condition:
          sectionsData.risk?.text && sectionsData.risk.text.length > 500,
        analyze: () =>
          analyzeServices.analyzeRiskSection(
            sectionsData.risk.text,
            openai,
            companyName
          ),
        key: "risks",
      },
      {
        condition:
          sectionsData.legal?.text && sectionsData.legal.text.length > 300,
        analyze: () =>
          analyzeServices.analyzeLegalSection(
            sectionsData.legal.text,
            openai,
            companyName
          ),
        key: "legal",
      },
      {
        condition:
          sectionsData.mdna?.text && sectionsData.mdna.text.length > 500,
        analyze: () =>
          analyzeServices.analyzeMdnaSection(
            sectionsData.mdna.text,
            openai,
            companyName
          ),
        key: "mdna",
      },
      {
        condition:
          sectionsData.marketRisk?.text &&
          sectionsData.marketRisk.text.length > 300,
        analyze: () =>
          analyzeServices.analyzeMarketRiskSection(
            sectionsData.marketRisk.text,
            openai,
            companyName
          ),
        key: "marketRisks",
      },
      {
        condition: sectionsData.financials?.text,
        analyze: () =>
          analyzeServices.analyzeFinancialSection(
            sectionsData.financials.text,
            openai,
            companyName
          ),
        key: "financials",
      },
      {
        condition:
          sectionsData.controls?.text &&
          sectionsData.controls.text.length > 300,
        analyze: () =>
          analyzeServices.analyzeControlsSection(
            sectionsData.controls.text,
            openai,
            companyName
          ),
        key: "controls",
      },
      {
        condition:
          sectionsData.directors?.text &&
          sectionsData.directors.text.length > 300,
        analyze: () =>
          analyzeServices.analyzeDirectorsSection(
            sectionsData.directors.text,
            openai,
            companyName
          ),
        key: "directors",
      },
    ];

    for (const section of sectionAnalyses) {
      if (section.condition) {
        analysisPromises.push(
          openaiRequestLimiter(async () => {
            await delay(2000); // Her AI isteğinden önce 2 saniye bekle
            try {
              const result = await section.analyze();
              if (result) {
                (analysis.sections as any)[section.key] = result;
                console.log(`✅ ${section.key} analyzed`);
              }
            } catch (error) {
              console.error(`❌ Failed to analyze ${section.key}:`, error);
              if (error instanceof Error && error.message.includes("429")) {
                console.log(
                  `⏳ Rate limit hit for ${section.key}, waiting 30s...`
                );
                await delay(30000); // Rate limit hatasında 30 saniye bekle ve tekrar dene
                try {
                  const result = await section.analyze();
                  if (result) {
                    (analysis.sections as any)[section.key] = result;
                    console.log(`✅ ${section.key} analyzed on retry`);
                  }
                } catch (retryError) {
                  console.error(
                    `❌ Retry failed for ${section.key}:`,
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
      `🤖 Running ${analysisPromises.length} AI analyses with concurrency limit of ${openaiRequestLimiter.concurrency}...`
    ); // p-limit'in concurrency özelliğini kullanabiliriz.

    const settledResults = await Promise.allSettled(analysisPromises);

    settledResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Promise at index ${index} rejected:`, result.reason);
      }
    });

    console.log(
      `📊 Analysis complete. Sections analyzed:`,
      Object.keys(analysis.sections)
    );

    return analysis;
  }

  /**
   * Analiz nesnesine, HTML'de işaretlenen alıntıların ID'lerini ekler.
   * Bu, önceki addExcerptIdsToAnalysis fonksiyonunun içeriğidir.
   * @param analysis SECAnalysis nesnesi.
   * @param excerptMap Alıntı metni ile ID'si arasındaki eşleşme haritası.
   * @returns Güncellenmiş SECAnalysis nesnesi.
   */
  private addExcerptIdsToAnalysis(
    analysis: SECAnalysis,
    excerptMap: Record<string, string>
  ): SECAnalysis {
    const updatedAnalysis = { ...analysis };

    // Helper to add ID to any object with an excerpt
    const addId = (
      obj: any,
      excerptField: string = "originalExcerpt",
      idField: string = "originalExcerptId"
    ) => {
      if (obj && obj[excerptField] && excerptMap[obj[excerptField]]) {
        obj[idField] = excerptMap[obj[excerptField]];
      }
    };

    // Helper to process arrays
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
      ); // Excerpts doğrudan string olduğu için sarmalıyoruz
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
