// app/api/analyze-sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getSecApiClient } from "@/lib/sec-api-client";
import { getOpenAIClient } from "@/utils/openai";

import { SECAnalysis, SECFiling, SECSearchRequest } from "@/types/sec-analysis";

import * as analyzeServices from "./services"; // Buradaki analyzeServices sizin analyzeFinancialSection ve analyzeMdnaSection'ı içeren dosyanız olmalı.

// p-limit kütüphanesini import edin
import pLimit from "p-limit";

// OpenAI API istekleri için paralel limitleyici tanımlayın.
// Bu değeri, OpenAI organizasyonunuzun TPM (Tokens Per Minute) ve RPM (Requests Per Minute) limitlerine göre ayarlayın.
// gpt-4o için 30000 TPM limiti ve büyük context penceresi düşünüldüğünde, aynı anda 2-4 request genellikle güvenli bir başlangıç noktasıdır.
// Daha yüksek limitleriniz varsa bu sayıyı artırabilirsiniz.
const OPENAI_CONCURRENT_REQUESTS = 2; // Aynı anda maksimum 2 OpenAI isteği
const openaiRequestLimiter = pLimit(OPENAI_CONCURRENT_REQUESTS);

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

    console.log("📊 Section sizes:");
    Object.entries(sectionsData).forEach(([key, value]) => {
      console.log(`   ${key}: ${value.text.length} chars`);
    });

    // DEBUG: Financials section'ı detaylı logla (Item 8 ve Item 15 birleşimi)
    if (sectionsData.financials) {
      console.log("\n🔍 FINANCIALS DEBUG:");
      console.log("Length:", sectionsData.financials.text.length, "chars");
      console.log(
        "First 500 chars:",
        sectionsData.financials.text.substring(0, 500)
      );
      console.log(
        "Last 500 chars:",
        sectionsData.financials.text.substring(
          Math.max(0, sectionsData.financials.text.length - 500)
        )
      );
      // console.log("Full text:", sectionsData.financials.text); // Çok uzun olabileceği için yorum satırına alındı
      console.log("---END FINANCIALS DEBUG---\n");
    }

    // AI analysis
    const analysis = await analyzeWithAI(
      filing,
      sectionsData,
      openai,
      filing.companyName
    );

    // Debug bilgisini response'a ekle
    const debugInfo = {
      financialsRawText: sectionsData.financials?.text || "No financials data",
      financialsLength: sectionsData.financials?.text.length || 0,
      exhibitsLength: sectionsData.exhibits?.text.length || 0, // Exhibits bilgisini de ekleyelim
    };

    return NextResponse.json({
      analysis,
      originalHtml,
      debug: debugInfo, // Debug bilgisi ekle
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
  companyName: string
): Promise<SECAnalysis> {
  const analysis: SECAnalysis = {
    filing,
    sections: {},
    generatedAt: new Date().toISOString(),
  };

  const analysisPromises: Promise<void>[] = [];

  // ÖNEMLİ: Her bir analyzeService çağrısını openaiRequestLimiter ile sarıyoruz.
  // Limiter, aynı anda sadece `OPENAI_CONCURRENT_REQUESTS` sayısı kadar Promise'ın çalışmasına izin verecek.

  // Business section
  if (sectionsData.business?.text && sectionsData.business.text.length > 500) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzeBusinessSection(
            sectionsData.business.text,
            openai,
            companyName
          )
          .then((result) => {
            if (result) {
              analysis.sections.business = result;
              console.log(`✅ business analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze business:`, error);
          })
      )
    );
  }

  // Property section
  if (
    sectionsData.properties?.text &&
    sectionsData.properties.text.length > 50
  ) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzePropertySection(
            sectionsData.properties.text,
            openai,
            companyName
          )
          .then((result) => {
            if (result) {
              analysis.sections.properties = result;
              console.log(`✅ properties analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze properties:`, error);
          })
      )
    );
  }

  // Risk section
  if (sectionsData.risk?.text && sectionsData.risk.text.length > 500) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzeRiskSection(sectionsData.risk.text, openai, companyName)
          .then((result) => {
            if (result) {
              analysis.sections.risks = result;
              console.log(`✅ risks analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze risks:`, error);
          })
      )
    );
  }

  // Legal section
  if (sectionsData.legal?.text && sectionsData.legal.text.length > 300) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzeLegalSection(sectionsData.legal.text, openai, companyName)
          .then((result) => {
            if (result) {
              analysis.sections.legal = result;
              console.log(`✅ legal analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze legal:`, error);
          })
      )
    );
  }

  // MD&A section
  if (sectionsData.mdna?.text && sectionsData.mdna.text.length > 500) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzeMdnaSection(sectionsData.mdna.text, openai, companyName)
          .then((result) => {
            if (result) {
              analysis.sections.mdna = result;
              console.log(`✅ mdna analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze mdna:`, error);
          })
      )
    );
  }

  // Market Risk section
  if (
    sectionsData.marketRisk?.text &&
    sectionsData.marketRisk.text.length > 300
  ) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzeMarketRiskSection(
            sectionsData.marketRisk.text,
            openai,
            companyName
          )
          .then((result) => {
            if (result) {
              analysis.sections.marketRisks = result;
              console.log(`✅ marketRisk analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze marketRisk:`, error);
          })
      )
    );
  }

  // Financials section - Item 8 ve Item 15'ten birleştirilmiş veri kullanılacak
  if (sectionsData.financials?.text) {
    console.log(
      `📊 Attempting to analyze financials (${sectionsData.financials.text.length} chars from combined Item 8/15)...`
    );

    analysisPromises.push(
      openaiRequestLimiter(() =>
        // Burada da limiter'ı kullanıyoruz!
        analyzeServices
          .analyzeFinancialSection(
            sectionsData.financials.text,
            openai,
            companyName
          )
          .then((result) => {
            if (result) {
              analysis.sections.financials = result;
              console.log(`✅ financials analyzed successfully.`);
            } else {
              console.warn(
                `⚠️ financials analysis returned null or undefined.`
              );
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze financials:`, error);
          })
      )
    );
  }

  // Controls section
  if (sectionsData.controls?.text && sectionsData.controls.text.length > 300) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzeControlsSection(
            sectionsData.controls.text,
            openai,
            companyName
          )
          .then((result) => {
            if (result) {
              analysis.sections.controls = result;
              console.log(`✅ controls analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze controls:`, error);
          })
      )
    );
  }

  // Directors section
  if (
    sectionsData.directors?.text &&
    sectionsData.directors.text.length > 300
  ) {
    analysisPromises.push(
      openaiRequestLimiter(() =>
        analyzeServices
          .analyzeDirectorsSection(
            sectionsData.directors.text,
            openai,
            companyName
          )
          .then((result) => {
            if (result) {
              analysis.sections.directors = result;
              console.log(`✅ directors analyzed`);
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to analyze directors:`, error);
          })
      )
    );
  }

  console.log(
    `🤖 Running ${analysisPromises.length} AI analyses with a concurrency limit of ${OPENAI_CONCURRENT_REQUESTS}...`
  );

  // Promise.allSettled'ı çağırıyoruz. p-limit burada devreye girerek
  // Promise'ların ne zaman başlayacağını kontrol edecek.
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
    `📊 Analysis complete. Sections analyzed:`,
    Object.keys(analysis.sections)
  );

  return analysis;
}
