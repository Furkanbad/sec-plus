// app/api/analyze-sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getSecApiClient } from "@/lib/sec-api-client";
import { getOpenAIClient } from "@/utils/openai";

import { SECAnalysis, SECFiling, SECSearchRequest } from "@/types/sec-analysis";

import * as analyzeServices from "./services";

export async function POST(request: NextRequest) {
  try {
    const body: SECSearchRequest = await request.json();
    const { ticker, filingType, year } = body;

    if (!ticker || !filingType) {
      return NextResponse.json(
        { error: "Ticker and filing type required" },
        { status: 400 }
      );
    }

    const secApiClient = getSecApiClient();
    const openai = getOpenAIClient();

    const filings = await secApiClient.searchFilings({
      ticker,
      filingType,
      year,
    });

    if (filings.length === 0) {
      return NextResponse.json(
        { error: `No ${filingType} filings found for ${ticker}` },
        { status: 404 }
      );
    }

    const filing = filings[0];

    const originalHtmlResponse = await fetch(filing.htmlUrl);
    if (!originalHtmlResponse.ok) {
      throw new Error("Failed to fetch original SEC HTML");
    }
    const originalHtml = await originalHtmlResponse.text();

    const sectionsData = await secApiClient.getAllSections(filing);

    Object.entries(sectionsData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.text.length} chars`);
    });

    // AI analysis
    const analysis = await analyzeWithAI(
      filing,
      sectionsData,
      openai,
      filing.companyName
    );

    return NextResponse.json({
      analysis,
      originalHtml,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("SEC Analysis Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function analyzeWithAI(
  filing: SECFiling,
  sectionsData: Record<string, { text: string; html: string }>,
  openai: OpenAI,
  companyName: string // Parametre ismini de companyName olarak değiştirelim
): Promise<SECAnalysis> {
  const analysis: SECAnalysis = {
    filing,
    sections: {},
    generatedAt: new Date().toISOString(),
  };

  // Process sections in parallel for speed
  const analysisPromises: Promise<void>[] = [];

  // Artık her bir analyze fonksiyonunu kendi servis dosyasından çağırıyoruz
  if (sectionsData.business?.text && sectionsData.business.text.length > 500) {
    analysisPromises.push(
      analyzeServices
        .analyzeBusinessSection(sectionsData.business.text, openai, companyName)
        .then((result) => {
          if (result) analysis.sections.business = result;
          console.log(`✅ business analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze business:`, error)
        )
    );
  }
  // Property section
  if (
    sectionsData.properties?.text &&
    sectionsData.properties.text.length > 50
  ) {
    analysisPromises.push(
      analyzeServices
        .analyzePropertySection(
          sectionsData.properties.text,
          openai,
          companyName // companyName'i buraya ekledik
        )
        .then((result) => {
          if (result) analysis.sections.properties = result;
          console.log(`✅ properties analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze properties:`, error)
        )
    );
  }

  // Risk section
  if (sectionsData.risk?.text && sectionsData.risk.text.length > 500) {
    // Minimum uzunluğu ayarlayabilirsiniz
    analysisPromises.push(
      analyzeServices // analyzeServices üzerinden çağrı yapıyoruz
        .analyzeRiskSection(sectionsData.risk.text, openai, companyName) // ticker parametresini de ekledik
        .then((result) => {
          if (result) analysis.sections.risks = result;
          console.log(`✅ risks analyzed`);
        })
        .catch((error) => console.error(`❌ Failed to analyze risks:`, error))
    );
  }

  // Legal section
  if (sectionsData.legal?.text && sectionsData.legal.text.length > 300) {
    analysisPromises.push(
      analyzeServices // Buradan analyzeServices'i çağırıyoruz
        .analyzeLegalSection(sectionsData.legal.text, openai, companyName) // ticker'ı companyName olarak ilettik
        .then((result) => {
          if (result) analysis.sections.legal = result;
          console.log(`✅ legal analyzed`);
        })
        .catch((error) => console.error(`❌ Failed to analyze legal:`, error))
    );
  }

  // MD&A section
  if (sectionsData.mdna?.text && sectionsData.mdna.text.length > 500) {
    analysisPromises.push(
      analyzeServices // analyzeServices üzerinden çağrı yapıyoruz
        .analyzeMdnaSection(sectionsData.mdna.text, openai, companyName)
        .then((result) => {
          if (result) analysis.sections.mdna = result;
          console.log(`✅ mdna analyzed`);
        })
        .catch((error) => console.error(`❌ Failed to analyze mdna:`, error))
    );
  }

  // Market Risk section
  if (
    sectionsData.marketRisk?.text &&
    sectionsData.marketRisk.text.length > 300
  ) {
    analysisPromises.push(
      analyzeServices // analyzeServices üzerinden çağrı yapıyoruz
        .analyzeMarketRiskSection(
          sectionsData.marketRisk.text,
          openai,
          companyName // companyName'i buraya ekledik
        )
        .then((result) => {
          if (result) analysis.sections.marketRisks = result;
          console.log(`✅ marketRisk analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze marketRisk:`, error)
        )
    );
  }

  // Financials section: Artık analyzeFinancialsSection tüm chunk yönetimini kendi içinde yapıyor.
  if (
    sectionsData.financials?.text &&
    sectionsData.financials.text.length > 500
  ) {
    analysisPromises.push(
      analyzeServices
        .analyzeFinancialSection(
          sectionsData.financials.text,
          openai,
          companyName
        )
        .then((result) => {
          // ÖNEMLİ: result'ın null olup olmadığını kontrol edin
          if (result) {
            analysis.sections.financials = result;
            console.log(`✅ financials analyzed and assigned successfully.`);
          } else {
            console.warn(`⚠️ financials analysis returned null or undefined.`);
          }
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze financials in route.ts:`, error)
        )
    );
  }

  if (sectionsData.controls?.text && sectionsData.controls.text.length > 300) {
    analysisPromises.push(
      analyzeServices
        .analyzeControlsSection(sectionsData.controls.text, openai, companyName) // companyName'i ekledik
        .then((result) => {
          if (result) analysis.sections.controls = result;
          console.log(`✅ controls analyzed`);
        })
        .catch((error) =>
          console.error(`❌ Failed to analyze controls:`, error)
        )
    );
  }

  const settledResults = await Promise.allSettled(analysisPromises);

  settledResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Promise at index ${index} rejected with reason:`,
        result.reason
      );
    }
  });

  console.log(
    `[analyzeWithAI] Final analysis object before return:`,
    JSON.stringify(analysis, null, 2)
  );

  // Wait for all analyses to complete
  console.log(
    `🤖 Running ${analysisPromises.length} AI analyses in parallel...`
  );
  await Promise.all(analysisPromises);

  return analysis;
}

// // Directors section
// if (
//   sectionsData.directors?.text &&
//   sectionsData.directors.text.length > 300
// ) {
//   analysisPromises.push(
//     analyzeServices
//       .analyzeDirectorsSection(
//         sectionsData.directors.text,
//         openai,
//         companyName
//       )
//       .then((result) => {
//         if (result) analysis.sections.directors = result;
//         console.log(`✅ directors analyzed`);
//       })
//       .catch((error) =>
//         console.error(`❌ Failed to analyze directors:`, error)
//       )
//   );
// }

// // Compensation section
// if (
//   sectionsData.compensation?.text &&
//   sectionsData.compensation.text.length > 300
// ) {
//   analysisPromises.push(
//     analyzeCompensationSection(sectionsData.compensation.text, openai)
//       .then((result) => {
//         if (result) analysis.sections.compensation = result;
//         console.log(`✅ compensation analyzed`);
//       })
//       .catch((error) =>
//         console.error(`❌ Failed to analyze compensation:`, error)
//       )
//   );
// }

// // Ownership section
// if (
//   sectionsData.ownership?.text &&
//   sectionsData.ownership.text.length > 300
// ) {
//   analysisPromises.push(
//     analyzeOwnershipSection(sectionsData.ownership.text, openai)
//       .then((result) => {
//         if (result) analysis.sections.ownership = result;
//         console.log(`✅ ownership analyzed`);
//       })
//       .catch((error) =>
//         console.error(`❌ Failed to analyze ownership:`, error)
//       )
//   );
// }

// // Related Party section
// if (
//   sectionsData.relatedParty?.text &&
//   sectionsData.relatedParty.text.length > 300
// ) {
//   analysisPromises.push(
//     analyzeRelatedPartySection(sectionsData.relatedParty.text, openai)
//       .then((result) => {
//         if (result) analysis.sections.relatedParty = result;
//         console.log(`✅ relatedParty analyzed`);
//       })
//       .catch((error) =>
//         console.error(`❌ Failed to analyze relatedParty:`, error)
//       )
//   );
// }
