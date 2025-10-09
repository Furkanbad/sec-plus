// app/api/analyze-sec/html.utils.ts
import { load } from "cheerio";
import { SECAnalysis } from "@/app/api/analyze-sec/models/sec-analysis"; // Model yolunu güncelleyin
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
} from "@/app/api/analyze-sec/schemas"; // Şema yolunu güncelleyin

export function fixImageUrls(htmlContent: string, secUrl: string): string {
  // ... fixImageUrls içeriği buraya gelecek ...
  const $ = load(htmlContent);
  const baseUrl = secUrl.substring(0, secUrl.lastIndexOf("/"));
  $("img").each((_, elem) => {
    const $img = $(elem);
    const src = $img.attr("src");
    if (src && !src.startsWith("http") && !src.startsWith("data:")) {
      $img.attr("src", `${baseUrl}/${src}`);
    }
  });
  return $.html();
}

export async function markExcerptsInOriginalHtml(
  htmlContent: string,
  analysis: SECAnalysis
): Promise<{ markedHtml: string; excerptMap: Record<string, string> }> {
  // ... markExcerptsInOriginalHtml içeriği buraya gelecek ...
  const $ = load(htmlContent);
  let excerptCounter = 0;
  const excerptMap: Record<string, string> = {};

  const findAndWrapExcerpt = (
    $: any,
    excerptText: string,
    id: string
  ): void => {
    // ... findAndWrapExcerpt içeriği buraya gelecek ...
  };

  const processExcerpt = (excerpt: string | undefined): string | undefined => {
    if (
      !excerpt ||
      excerpt === "No excerpt available." ||
      excerpt === "No direct excerpt found."
    ) {
      return undefined;
    }
    const id = `excerpt-${++excerptCounter}`;
    findAndWrapExcerpt($, excerpt, id);
    excerptMap[excerpt] = id;
    return id;
  };

  // ... Analizin farklı bölümlerindeki (business, risks, legal, mdna vb.) tüm alıntıları tek tek processExcerpt ile işler ...
  // Business section
  if (analysis.sections.business) {
    const business = analysis.sections.business as BusinessAnalysis;
    processExcerpt(business.summaryExcerpt);
    // ... diğer business excerpts ...
  }
  // ... diğer sections ...

  return { markedHtml: $.html(), excerptMap };
}

// findAndWrapExcerpt fonksiyonunu da buraya taşıyın
function findAndWrapExcerpt($: any, excerptText: string, id: string) {
  // ... findAndWrapExcerpt içeriği buraya gelecek ...
}
