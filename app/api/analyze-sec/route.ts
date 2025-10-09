// app/api/analyze-sec/route.ts

// app/api/analyze-sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SECSearchRequest } from "@/app/api/analyze-sec/models/sec-analysis"; // Model yolunu güncelleyin
import { SECAnalysisService } from "@/app/api/analyze-sec/sec-analysis.service"; // Yeni servis

export async function POST(request: NextRequest) {
  try {
    const body: SECSearchRequest = await request.json();
    const { ticker, filingType } = body;

    // 1. Girdi Doğrulama
    if (!ticker || !filingType) {
      return NextResponse.json(
        { error: "Ticker and filing type required" },
        { status: 400 }
      );
    }

    // Servisi başlat (bağımlılıkları enjekte edilebilir)
    const analysisService = new SECAnalysisService();
    const result = await analysisService.analyzeFiling(body);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("SEC Analysis Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { OpenAI } from "openai";
// import { getSecApiClient } from "@/lib/sec-api.client";
// import { getOpenAIClient } from "@/lib/openai.client";
// import {
//   SECAnalysis,
//   SECFiling,
//   SECSearchRequest,
// } from "@/app/api/analyze-sec/models/sec-analysis";
// import * as analyzeServices from "./services";
// import pLimit from "p-limit";
// import { load } from "cheerio";
// import {
//   BusinessAnalysis,
//   RiskAnalysis,
//   LegalAnalysis,
//   MDAAnalysis,
//   MarketRiskAnalysis,
//   PropertyAnalysis,
//   FinancialAnalysis,
//   ControlsAnalysis,
//   DirectorsAnalysis,
// } from "./schemas";

// // Rate limit settings
// const OPENAI_CONCURRENT_REQUESTS = 1;
// const openaiRequestLimiter = pLimit(OPENAI_CONCURRENT_REQUESTS);
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// export async function POST(request: NextRequest) {
//   try {
//     const body: SECSearchRequest = await request.json();
//     const { ticker, filingType, year } = body;

//     if (!ticker || !filingType) {
//       return NextResponse.json(
//         { error: "Ticker and filing type required" },
//         { status: 400 }
//       );
//     }

//     const secApiClient = getSecApiClient();
//     const openai = getOpenAIClient();

//     const filings = await secApiClient.searchFilings({
//       ticker,
//       filingType,
//       year,
//     });

//     if (filings.length === 0) {
//       return NextResponse.json(
//         { error: `No ${filingType} filings found for ${ticker}` },
//         { status: 404 }
//       );
//     }

//     const filing = filings[0];

//     // Fetch original HTML
//     const originalHtmlResponse = await fetch(filing.htmlUrl);
//     if (!originalHtmlResponse.ok) {
//       throw new Error("Failed to fetch original SEC HTML");
//     }
//     let fullOriginalHtml = await originalHtmlResponse.text();

//     // Fix image URLs BEFORE marking excerpts
//     fullOriginalHtml = fixImageUrls(fullOriginalHtml, filing.htmlUrl);

//     // Get section data for AI analysis
//     const sectionsData = await secApiClient.getAllSections(filing);

//     console.log("📊 Section sizes for AI analysis:");
//     Object.entries(sectionsData).forEach(([key, value]) => {
//       console.log(`   ${key}: Text ${value.text.length} chars`);
//     });

//     // AI analysis
//     const analysis = await analyzeWithAI(
//       filing,
//       sectionsData,
//       openai,
//       filing.companyName
//     );

//     // Mark excerpts in original HTML
//     const { markedHtml, excerptMap } = await markExcerptsInOriginalHtml(
//       fullOriginalHtml,
//       analysis
//     );

//     // Update analysis with excerpt IDs
//     const updatedAnalysis = addExcerptIdsToAnalysis(analysis, excerptMap);

//     return NextResponse.json({
//       analysis: updatedAnalysis,
//       fullOriginalHtml: markedHtml,
//       filingInfo: {
//         ticker,
//         filingType,
//         year: filing.fiscalYear,
//         companyName: filing.companyName,
//       },
//     });
//   } catch (error: unknown) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Analysis failed";
//     console.error("SEC Analysis Error:", errorMessage);
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }

// function addExcerptIdsToAnalysis(
//   analysis: SECAnalysis,
//   excerptMap: Record<string, string>
// ): SECAnalysis {
//   const updatedAnalysis = { ...analysis };

//   // Helper to add ID to any object with an excerpt
//   const addId = (
//     obj: any,
//     excerptField: string = "originalExcerpt",
//     idField: string = "originalExcerptId"
//   ) => {
//     if (obj && obj[excerptField] && excerptMap[obj[excerptField]]) {
//       obj[idField] = excerptMap[obj[excerptField]];
//     }
//   };

//   // Helper to process arrays
//   const processArray = (
//     items: any[],
//     excerptField: string = "originalExcerpt",
//     idField: string = "originalExcerptId"
//   ) => {
//     items?.forEach((item) => addId(item, excerptField, idField));
//   };

//   // Business section
//   if (analysis.sections.business) {
//     const business = analysis.sections.business as any;
//     addId(business, "summaryExcerpt", "summaryExcerptId");
//     processArray(business.keyProducts);
//     processArray(business.competitiveAdvantages);
//     processArray(business.growthStrategiesOpportunities);
//     processArray(business.partnershipsCollaborations);
//     addId(business.targetCustomers);
//     addId(business.businessModel);
//   }

//   // Risk section
//   if (analysis.sections.risks) {
//     const risks = analysis.sections.risks as any;
//     processArray(risks.risks);
//   }

//   // Properties section
//   if (analysis.sections.properties) {
//     const properties = analysis.sections.properties as any;
//     addId(properties.propertiesOverview, "excerpt", "excerptId");
//   }

//   // Legal section
//   if (analysis.sections.legal) {
//     const legal = analysis.sections.legal as any;
//     addId(legal, "overallLegalSummaryExcerpt", "overallLegalSummaryExcerptId");
//     addId(legal, "regulatoryInquiriesExcerpt", "regulatoryInquiriesExcerptId");
//     addId(
//       legal,
//       "environmentalLitigationExcerpt",
//       "environmentalLitigationExcerptId"
//     );
//     addId(
//       legal,
//       "overallRiskAssessmentExcerpt",
//       "overallRiskAssessmentExcerptId"
//     );

//     legal.materialCases?.forEach((legalCase: any) => {
//       addId(legalCase, "caseTitleExcerpt", "caseTitleExcerptId");
//       addId(legalCase, "natureOfClaimExcerpt", "natureOfClaimExcerptId");
//       addId(legalCase, "currentStatusExcerpt", "currentStatusExcerptId");
//       addId(legalCase, "companyPositionExcerpt", "companyPositionExcerptId");
//       addId(legalCase.potentialFinancialImpact);
//     });
//   }

//   // MDA section
//   if (analysis.sections.mdna) {
//     const mda = analysis.sections.mdna as any;
//     processArray(mda.businessOverview?.excerpts, "excerpt", "excerptId");
//     addId(mda.currentPeriodHighlights, "excerpt", "excerptId");
//     processArray(
//       mda.resultsOfOperations?.overallPerformance?.excerpts,
//       "excerpt",
//       "excerptId"
//     );
//     addId(
//       mda.resultsOfOperations?.revenueAnalysis?.totalRevenue,
//       "excerpt",
//       "excerptId"
//     );
//     processArray(
//       mda.resultsOfOperations?.revenueAnalysis?.excerpts,
//       "excerpt",
//       "excerptId"
//     );
//     processArray(
//       mda.resultsOfOperations?.costAnalysis?.excerpts,
//       "excerpt",
//       "excerptId"
//     );
//     processArray(
//       mda.resultsOfOperations?.profitabilityAnalysis?.excerpts,
//       "excerpt",
//       "excerptId"
//     );
//     addId(
//       mda.liquidityAndCapitalResources?.cashPosition,
//       "excerpt",
//       "excerptId"
//     );
//     processArray(
//       mda.liquidityAndCapitalResources?.cashFlowAnalysis?.excerpts,
//       "excerpt",
//       "excerptId"
//     );
//     addId(
//       mda.liquidityAndCapitalResources?.capitalStructure,
//       "excerpt",
//       "excerptId"
//     );
//     addId(
//       mda.liquidityAndCapitalResources?.futureCapitalNeeds,
//       "excerpt",
//       "excerptId"
//     );
//     processArray(mda.marketTrendsAndOutlook?.excerpts, "excerpt", "excerptId");
//     processArray(mda.criticalAccountingPolicies, "excerpt", "excerptId");
//     addId(mda.contractualObligations, "excerpt", "excerptId");
//     processArray(
//       mda.knownTrendsAndUncertainties?.excerpts,
//       "excerpt",
//       "excerptId"
//     );
//     processArray(mda.keyTakeaways?.excerpts, "excerpt", "excerptId");
//   }

//   // Market Risk section
//   if (analysis.sections.marketRisks) {
//     const marketRisk = analysis.sections.marketRisks as any;
//     addId(marketRisk.overallSummaryAndPhilosophy);
//     addId(marketRisk.interestRateRisk);
//     addId(marketRisk.interestRateRisk?.potentialImpact);
//     addId(marketRisk.currencyRisk);
//     addId(marketRisk.currencyRisk?.potentialImpact);
//     addId(marketRisk.commodityPriceRisk);
//     addId(marketRisk.commodityPriceRisk?.potentialImpact);
//     addId(marketRisk.equityPriceRisk);
//     addId(marketRisk.equityPriceRisk?.potentialImpact);
//     addId(marketRisk.derivativeFinancialInstrumentsUsage);
//     addId(marketRisk.keyTakeawaysConcernsAndFutureOutlook);
//   }

//   // Financials section
//   if (analysis.sections.financials) {
//     const financials = analysis.sections.financials as any;
//     addId(financials.revenueAnalysis, "excerpt", "excerptId");
//     addId(
//       financials.cogsAndGrossProfitAnalysis?.grossProfit,
//       "excerpt",
//       "excerptId"
//     );
//     addId(financials.cogsAndGrossProfitAnalysis, "excerpt", "excerptId");
//     addId(
//       financials.operatingExpensesAnalysis?.totalOperatingExpenses,
//       "excerpt",
//       "excerptId"
//     );
//     addId(financials.operatingExpensesAnalysis, "excerpt", "excerptId");
//     addId(financials.operatingIncomeEBITAnalysis, "excerpt", "excerptId");
//     addId(financials.ebitdaAnalysis, "excerpt", "excerptId");
//     addId(financials.interestAndOtherNonOperatingItems, "excerpt", "excerptId");
//     addId(financials.incomeTaxExpenseAnalysis, "excerpt", "excerptId");
//     addId(financials.netIncomeAnalysis, "excerpt", "excerptId");
//     addId(financials.epsDilutedAnalysis, "excerpt", "excerptId");
//     addId(financials.profitabilityRatios, "excerpt", "excerptId");
//     processArray(financials.noteworthyItemsImpacts, "excerpt", "excerptId");
//     addId(financials, "keyInsightsExcerpt", "keyInsightsExcerptId");
//   }

//   // Controls section
//   if (analysis.sections.controls) {
//     const controls = analysis.sections.controls as any;
//     addId(
//       controls.managementConclusionDisclosureControls,
//       "excerpt",
//       "excerptId"
//     );
//     addId(controls.managementReportICFR, "excerpt", "excerptId");
//     processArray(controls.materialWeaknessesICFR, "excerpt", "excerptId");
//     processArray(controls.remediationEfforts, "excerpt", "excerptId");
//     addId(controls.auditorOpinionICFR, "excerpt", "excerptId");
//   }

//   // Directors section
//   if (analysis.sections.directors) {
//     const directors = analysis.sections.directors as any;
//     addId(directors.boardCompositionOverview);
//     addId(directors.boardLeadershipStructure);
//   }

//   return updatedAnalysis;
// }

// async function markExcerptsInOriginalHtml(
//   htmlContent: string,
//   analysis: SECAnalysis
// ): Promise<{ markedHtml: string; excerptMap: Record<string, string> }> {
//   const $ = load(htmlContent);

//   let excerptCounter = 0;
//   const excerptMap: Record<string, string> = {};

//   // Helper to find and wrap excerpt text
//   const processExcerpt = (excerpt: string | undefined): string | undefined => {
//     if (
//       !excerpt ||
//       excerpt === "No excerpt available." ||
//       excerpt === "No direct excerpt found."
//     ) {
//       return undefined;
//     }
//     const id = `excerpt-${++excerptCounter}`;
//     findAndWrapExcerpt($, excerpt, id);
//     excerptMap[excerpt] = id;
//     return id;
//   };

//   // Process Business Section
//   if (analysis.sections.business) {
//     const business = analysis.sections.business as BusinessAnalysis;
//     processExcerpt(business.summaryExcerpt);

//     business.keyProducts?.forEach((product) =>
//       processExcerpt(product.originalExcerpt)
//     );
//     business.competitiveAdvantages?.forEach((adv) =>
//       processExcerpt(adv.originalExcerpt)
//     );
//     business.growthStrategiesOpportunities?.forEach((strategy) =>
//       processExcerpt(strategy.originalExcerpt)
//     );
//     processExcerpt(business.targetCustomers?.originalExcerpt);
//     business.partnershipsCollaborations?.forEach((partner) =>
//       processExcerpt(partner.originalExcerpt)
//     );
//     processExcerpt(business.businessModel?.originalExcerpt);
//   }

//   // Process Risk Section
//   if (analysis.sections.risks) {
//     const risks = analysis.sections.risks as RiskAnalysis;
//     risks.risks?.forEach((risk) => processExcerpt(risk.originalExcerpt));
//   }

//   // Process Properties Section
//   if (analysis.sections.properties) {
//     const properties = analysis.sections.properties as PropertyAnalysis;
//     processExcerpt(properties.propertiesOverview?.excerpt);
//   }

//   // Process Legal Section
//   if (analysis.sections.legal) {
//     const legal = analysis.sections.legal as LegalAnalysis;
//     processExcerpt(legal.overallLegalSummaryExcerpt);
//     processExcerpt(legal.regulatoryInquiriesExcerpt);
//     processExcerpt(legal.environmentalLitigationExcerpt);
//     processExcerpt(legal.overallRiskAssessmentExcerpt);

//     legal.materialCases?.forEach((legalCase) => {
//       processExcerpt(legalCase.caseTitleExcerpt);
//       processExcerpt(legalCase.natureOfClaimExcerpt);
//       processExcerpt(legalCase.currentStatusExcerpt);
//       processExcerpt(legalCase.companyPositionExcerpt);
//       processExcerpt(legalCase.potentialFinancialImpact?.originalExcerpt);
//     });
//   }

//   // Process MDA Section
//   if (analysis.sections.mdna) {
//     const mda = analysis.sections.mdna as MDAAnalysis;
//     mda.businessOverview?.excerpts?.forEach((excerpt) =>
//       processExcerpt(excerpt)
//     );
//     processExcerpt(mda.currentPeriodHighlights?.excerpt);
//     mda.resultsOfOperations?.overallPerformance?.excerpts?.forEach((excerpt) =>
//       processExcerpt(excerpt)
//     );
//     processExcerpt(
//       mda.resultsOfOperations?.revenueAnalysis?.totalRevenue?.excerpt
//     );
//     mda.resultsOfOperations?.revenueAnalysis?.excerpts?.forEach((excerpt) =>
//       processExcerpt(excerpt)
//     );
//     mda.resultsOfOperations?.costAnalysis?.excerpts?.forEach((excerpt) =>
//       processExcerpt(excerpt)
//     );
//     mda.resultsOfOperations?.profitabilityAnalysis?.excerpts?.forEach(
//       (excerpt) => processExcerpt(excerpt)
//     );
//     processExcerpt(mda.liquidityAndCapitalResources?.cashPosition?.excerpt);
//     mda.liquidityAndCapitalResources?.cashFlowAnalysis?.excerpts?.forEach(
//       (excerpt) => processExcerpt(excerpt)
//     );
//     processExcerpt(mda.liquidityAndCapitalResources?.capitalStructure?.excerpt);
//     processExcerpt(
//       mda.liquidityAndCapitalResources?.futureCapitalNeeds?.excerpt
//     );
//     mda.marketTrendsAndOutlook?.excerpts?.forEach((excerpt) =>
//       processExcerpt(excerpt)
//     );
//     mda.criticalAccountingPolicies?.forEach((policy) =>
//       processExcerpt(policy.excerpt)
//     );
//     processExcerpt(mda.contractualObligations?.excerpt);
//     mda.knownTrendsAndUncertainties?.excerpts?.forEach((excerpt) =>
//       processExcerpt(excerpt)
//     );
//     mda.keyTakeaways?.excerpts?.forEach((excerpt) => processExcerpt(excerpt));
//   }

//   // Process Market Risk Section
//   if (analysis.sections.marketRisks) {
//     const marketRisk = analysis.sections.marketRisks as MarketRiskAnalysis;
//     processExcerpt(marketRisk.overallSummaryAndPhilosophy?.originalExcerpt);
//     processExcerpt(marketRisk.interestRateRisk?.originalExcerpt);
//     processExcerpt(
//       marketRisk.interestRateRisk?.potentialImpact?.originalExcerpt
//     );
//     processExcerpt(marketRisk.currencyRisk?.originalExcerpt);
//     processExcerpt(marketRisk.currencyRisk?.potentialImpact?.originalExcerpt);
//     processExcerpt(marketRisk.commodityPriceRisk?.originalExcerpt);
//     processExcerpt(
//       marketRisk.commodityPriceRisk?.potentialImpact?.originalExcerpt
//     );
//     processExcerpt(marketRisk.equityPriceRisk?.originalExcerpt);
//     processExcerpt(
//       marketRisk.equityPriceRisk?.potentialImpact?.originalExcerpt
//     );
//     processExcerpt(
//       marketRisk.derivativeFinancialInstrumentsUsage?.originalExcerpt
//     );
//     processExcerpt(
//       marketRisk.keyTakeawaysConcernsAndFutureOutlook?.originalExcerpt
//     );
//   }

//   // Process Financials Section
//   if (analysis.sections.financials) {
//     const financials = analysis.sections.financials as FinancialAnalysis;
//     processExcerpt(financials.revenueAnalysis?.excerpt);
//     processExcerpt(financials.cogsAndGrossProfitAnalysis?.grossProfit?.excerpt);
//     processExcerpt(financials.cogsAndGrossProfitAnalysis?.excerpt);
//     processExcerpt(
//       financials.operatingExpensesAnalysis?.totalOperatingExpenses?.excerpt
//     );
//     processExcerpt(financials.operatingExpensesAnalysis?.excerpt);
//     processExcerpt(financials.operatingIncomeEBITAnalysis?.excerpt);
//     processExcerpt(financials.ebitdaAnalysis?.excerpt);
//     processExcerpt(financials.interestAndOtherNonOperatingItems?.excerpt);
//     processExcerpt(financials.incomeTaxExpenseAnalysis?.excerpt);
//     processExcerpt(financials.netIncomeAnalysis?.excerpt);
//     processExcerpt(financials.epsDilutedAnalysis?.excerpt);
//     processExcerpt(financials.profitabilityRatios?.excerpt);
//     financials.noteworthyItemsImpacts?.forEach((item) =>
//       processExcerpt(item.excerpt)
//     );
//     processExcerpt(financials.keyInsightsExcerpt);
//   }

//   // Process Controls Section
//   if (analysis.sections.controls) {
//     const controls = analysis.sections.controls as ControlsAnalysis;
//     processExcerpt(controls.managementConclusionDisclosureControls?.excerpt);
//     processExcerpt(controls.managementReportICFR?.excerpt);
//     controls.materialWeaknessesICFR?.forEach((weakness) =>
//       processExcerpt(weakness.excerpt)
//     );
//     controls.remediationEfforts?.forEach((effort) =>
//       processExcerpt(effort.excerpt)
//     );
//     processExcerpt(controls.auditorOpinionICFR?.excerpt);
//   }

//   // Process Directors Section
//   if (analysis.sections.directors) {
//     const directors = analysis.sections.directors as DirectorsAnalysis;
//     processExcerpt(directors.boardCompositionOverview?.originalExcerpt);
//     processExcerpt(directors.boardLeadershipStructure?.originalExcerpt);
//   }

//   return { markedHtml: $.html(), excerptMap };
// }

// function findAndWrapExcerpt($: any, excerptText: string, id: string) {
//   const normalizedExcerpt = excerptText.replace(/\s+/g, " ").trim();

//   if (normalizedExcerpt.length < 15) {
//     return;
//   }

//   let found = false;

//   // Search in common text elements
//   $("p, li, div, td, span, h1, h2, h3, h4, h5, h6").each(
//     (i: number, elem: any) => {
//       const $elem = $(elem);
//       const elementText = $elem.text().replace(/\s+/g, " ").trim();
//       let originalHtmlContent = $elem.html();

//       if (!originalHtmlContent) return true;

//       // Quick check if element contains part of the excerpt
//       if (
//         !elementText.includes(
//           normalizedExcerpt.substring(0, Math.min(normalizedExcerpt.length, 50))
//         )
//       ) {
//         return true;
//       }

//       // Create flexible regex for matching
//       const escapedExcerpt = normalizedExcerpt
//         .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
//         .replace(/\s+/g, "\\s+");

//       const regex = new RegExp(`(${escapedExcerpt})`, "gi");

//       if (originalHtmlContent.match(regex)) {
//         const newHtmlContent = originalHtmlContent.replace(
//           regex,
//           `<span id="${id}" class="highlight-excerpt">$1</span>`
//         );
//         $elem.html(newHtmlContent);
//         found = true;
//         return false; // Exit .each() loop
//       }
//     }
//   );

//   if (!found) {
//     console.warn(
//       `Excerpt not found in HTML: "${excerptText.substring(
//         0,
//         100
//       )}..." (ID: ${id})`
//     );
//   }
// }

// async function analyzeWithAI(
//   filing: SECFiling,
//   sectionsData: Record<string, { text: string; html: string }>,
//   openai: OpenAI,
//   companyName: string
// ): Promise<SECAnalysis> {
//   const analysis: SECAnalysis = {
//     filing,
//     sections: {},
//     generatedAt: new Date().toISOString(),
//   };

//   const analysisPromises: Promise<void>[] = [];

//   const sectionAnalyses = [
//     {
//       condition:
//         sectionsData.business?.text && sectionsData.business.text.length > 500,
//       analyze: () =>
//         analyzeServices.analyzeBusinessSection(
//           sectionsData.business.text,
//           openai,
//           companyName
//         ),
//       key: "business",
//     },
//     {
//       condition:
//         sectionsData.properties?.text &&
//         sectionsData.properties.text.length > 50,
//       analyze: () =>
//         analyzeServices.analyzePropertySection(
//           sectionsData.properties.text,
//           openai,
//           companyName
//         ),
//       key: "properties",
//     },
//     {
//       condition: sectionsData.risk?.text && sectionsData.risk.text.length > 500,
//       analyze: () =>
//         analyzeServices.analyzeRiskSection(
//           sectionsData.risk.text,
//           openai,
//           companyName
//         ),
//       key: "risks",
//     },
//     {
//       condition:
//         sectionsData.legal?.text && sectionsData.legal.text.length > 300,
//       analyze: () =>
//         analyzeServices.analyzeLegalSection(
//           sectionsData.legal.text,
//           openai,
//           companyName
//         ),
//       key: "legal",
//     },
//     {
//       condition: sectionsData.mdna?.text && sectionsData.mdna.text.length > 500,
//       analyze: () =>
//         analyzeServices.analyzeMdnaSection(
//           sectionsData.mdna.text,
//           openai,
//           companyName
//         ),
//       key: "mdna",
//     },
//     {
//       condition:
//         sectionsData.marketRisk?.text &&
//         sectionsData.marketRisk.text.length > 300,
//       analyze: () =>
//         analyzeServices.analyzeMarketRiskSection(
//           sectionsData.marketRisk.text,
//           openai,
//           companyName
//         ),
//       key: "marketRisks",
//     },
//     {
//       condition: sectionsData.financials?.text,
//       analyze: () =>
//         analyzeServices.analyzeFinancialSection(
//           sectionsData.financials.text,
//           openai,
//           companyName
//         ),
//       key: "financials",
//     },
//     {
//       condition:
//         sectionsData.controls?.text && sectionsData.controls.text.length > 300,
//       analyze: () =>
//         analyzeServices.analyzeControlsSection(
//           sectionsData.controls.text,
//           openai,
//           companyName
//         ),
//       key: "controls",
//     },
//     {
//       condition:
//         sectionsData.directors?.text &&
//         sectionsData.directors.text.length > 300,
//       analyze: () =>
//         analyzeServices.analyzeDirectorsSection(
//           sectionsData.directors.text,
//           openai,
//           companyName
//         ),
//       key: "directors",
//     },
//   ];

//   for (const section of sectionAnalyses) {
//     if (section.condition) {
//       analysisPromises.push(
//         openaiRequestLimiter(async () => {
//           await delay(2000);
//           try {
//             const result = await section.analyze();
//             if (result) {
//               (analysis.sections as any)[section.key] = result;
//               console.log(`✅ ${section.key} analyzed`);
//             }
//           } catch (error) {
//             console.error(`❌ Failed to analyze ${section.key}:`, error);
//             if (error instanceof Error && error.message.includes("429")) {
//               console.log(
//                 `⏳ Rate limit hit for ${section.key}, waiting 30s...`
//               );
//               await delay(30000);
//               try {
//                 const result = await section.analyze();
//                 if (result) {
//                   (analysis.sections as any)[section.key] = result;
//                   console.log(`✅ ${section.key} analyzed on retry`);
//                 }
//               } catch (retryError) {
//                 console.error(
//                   `❌ Retry failed for ${section.key}:`,
//                   retryError
//                 );
//               }
//             }
//           }
//         })
//       );
//     }
//   }

//   console.log(
//     `🤖 Running ${analysisPromises.length} AI analyses with concurrency limit of ${OPENAI_CONCURRENT_REQUESTS}...`
//   );

//   const settledResults = await Promise.allSettled(analysisPromises);

//   settledResults.forEach((result, index) => {
//     if (result.status === "rejected") {
//       console.error(`Promise at index ${index} rejected:`, result.reason);
//     }
//   });

//   console.log(
//     `📊 Analysis complete. Sections analyzed:`,
//     Object.keys(analysis.sections)
//   );

//   return analysis;
// }
// function fixImageUrls(htmlContent: string, secUrl: string): string {
//   const $ = load(htmlContent);

//   // Get base URL from SEC filing URL
//   const baseUrl = secUrl.substring(0, secUrl.lastIndexOf("/"));

//   // Fix img src attributes
//   $("img").each((_, elem) => {
//     const $img = $(elem);
//     const src = $img.attr("src");

//     if (src && !src.startsWith("http") && !src.startsWith("data:")) {
//       $img.attr("src", `${baseUrl}/${src}`);
//     }
//   });

//   return $.html();
// }
