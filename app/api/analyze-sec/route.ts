// app/api/analyze-sec/route.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getSecApiClient } from "@/lib/sec-api-client";
import { getOpenAIClient } from "@/utils/openai";
import { SECAnalysis, SECFiling, SECSearchRequest } from "@/types/sec-analysis";
import * as analyzeServices from "./services";
import pLimit from "p-limit";

// Rate limit ayarlarını optimize et
const OPENAI_CONCURRENT_REQUESTS = 1; // Aynı anda sadece 1 request
const openaiRequestLimiter = pLimit(OPENAI_CONCURRENT_REQUESTS);

// Her request arasına delay ekle
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  companyName: string
): Promise<SECAnalysis> {
  const analysis: SECAnalysis = {
    filing,
    sections: {},
    generatedAt: new Date().toISOString(),
  };

  const analysisPromises: Promise<void>[] = [];

  // Section analiz listesi
  const sectionAnalyses = [
    {
      condition:
        sectionsData.business?.text && sectionsData.business.text.length > 500,
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
      condition: sectionsData.risk?.text && sectionsData.risk.text.length > 500,
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
      condition: sectionsData.mdna?.text && sectionsData.mdna.text.length > 500,
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
        sectionsData.controls?.text && sectionsData.controls.text.length > 300,
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

  // Her section için analiz promise'i oluştur
  for (const section of sectionAnalyses) {
    if (section.condition) {
      analysisPromises.push(
        openaiRequestLimiter(async () => {
          await delay(2000); // Her request öncesi 2 saniye bekle
          try {
            const result = await section.analyze();
            if (result) {
              (analysis.sections as any)[section.key] = result;
              console.log(`✅ ${section.key} analyzed`);
            }
          } catch (error) {
            console.error(`❌ Failed to analyze ${section.key}:`, error);
            // Rate limit hatası alırsak, bekle ve tekrar dene
            if (error instanceof Error && error.message.includes("429")) {
              console.log(
                `⏳ Rate limit hit for ${section.key}, waiting 30s...`
              );
              await delay(30000);
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
    `🤖 Running ${analysisPromises.length} AI analyses with concurrency limit of ${OPENAI_CONCURRENT_REQUESTS}...`
  );

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
