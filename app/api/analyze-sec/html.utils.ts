// app/api/analyze-sec/html.utils.ts
import { load } from "cheerio";
import { SECAnalysis } from "@/app/api/analyze-sec/models/sec-analysis";

// Artık aşağıdaki şemalara doğrudan gerek kalmadığı için kaldırıldı.
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
// } from "@/app/api/analyze-sec/schemas";

export function fixImageUrls(htmlContent: string, secUrl: string): string {
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

/**
 * Enhanced normalize text - handles special characters and formats
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/€/g, "eur") // Euro symbol
    .replace(/£/g, "gbp") // Pound symbol
    .replace(/®/g, "") // Registered trademark
    .replace(/™/g, "") // Trademark
    .replace(/©/g, "") // Copyright
    .replace(/\u00a0/g, " ") // Non-breaking space
    .replace(/[\u2000-\u200f]/g, " ") // Various unicode spaces
    .trim();
}

// Ortak regex ayırıcı deseni: bir veya daha fazla boşluk veya araya serpiştirilmiş HTML etiketleri
const FLEXIBLE_SEPARATOR_PATTERN = "(?:<[^>]*>)?\\s+(?:<[^>]*>)?";

/**
 * Try exact match in regular text elements
 */
function tryExactMatch($: any, excerptText: string, id: string): boolean {
  const normalizedExcerpt = normalizeText(excerptText);
  let found = false;

  $("p, li, div, td, span, h1, h2, h3, h4, h5, h6, blockquote").each(
    (_: number, elem: any) => {
      if (found) return false;

      const $elem = $(elem);
      const elementText = $elem.text();
      const normalizedElementText = normalizeText(elementText);

      // Quick check - does element contain start of excerpt?
      if (
        !normalizedElementText.includes(
          normalizedExcerpt.substring(0, Math.min(30, normalizedExcerpt.length))
        )
      ) {
        return true; // Continue to next element
      }

      const originalHtml = $elem.html();
      if (!originalHtml) return true;

      // Create flexible regex for matching
      const excerptWords = normalizedExcerpt
        .split(/\s+/)
        .filter((w) => w.length > 0);
      if (excerptWords.length === 0) return true;

      const pattern = excerptWords
        .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(FLEXIBLE_SEPARATOR_PATTERN); // Use flexible separator

      const regex = new RegExp(pattern, "gi");

      // Try to match in text content
      if (regex.test(normalizeText(elementText))) {
        // Try to wrap it
        const newHtml = originalHtml.replace(
          regex,
          `<span id="${id}" class="highlight-excerpt">$&</span>`
        );

        if (newHtml !== originalHtml) {
          $elem.html(newHtml);
          found = true;
          console.log(`✓ Found exact match for excerpt: ${id}`);
          return false; // Exit loop
        }
      }
    }
  );

  return found;
}

/**
 * Try fuzzy matching for partial excerpts (60% threshold)
 */
function tryFuzzyMatch(
  $: any,
  excerptText: string,
  id: string,
  threshold: number = 0.6
): boolean {
  const normalizedExcerpt = normalizeText(excerptText);
  // Ensure partialLength is at least 30 characters, but not more than original length
  const partialLength = Math.min(
    normalizedExcerpt.length,
    Math.max(30, Math.floor(normalizedExcerpt.length * threshold))
  );

  if (partialLength < 30) return false; // Too short for meaningful fuzzy matching

  const partialExcerpt = normalizedExcerpt.substring(0, partialLength);
  let found = false;

  $("p, li, div, td, span, h1, h2, h3, h4, h5, h6, blockquote").each(
    (_: number, elem: any) => {
      if (found) return false;

      const $elem = $(elem);
      const elementText = $elem.text();
      const normalizedElementText = normalizeText(elementText);

      // Quick check - does element contain start of partial excerpt?
      if (
        !normalizedElementText.includes(
          partialExcerpt.substring(0, Math.min(30, partialExcerpt.length))
        )
      ) {
        return true; // Continue to next element
      }

      const originalHtml = $elem.html();
      if (!originalHtml) return true;

      const words = partialExcerpt.split(/\s+/).filter((w) => w.length > 0);
      if (words.length === 0) return true;

      // Use the flexible separator for fuzzy matching as well
      const pattern = words
        .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(FLEXIBLE_SEPARATOR_PATTERN);

      const regex = new RegExp(pattern, "gi");

      // Try to match in normalized text first
      if (regex.test(normalizeText(elementText))) {
        const newHtml = originalHtml.replace(
          regex,
          `<span id="${id}" class="highlight-excerpt" title="Partial match">$&</span>`
        );

        if (newHtml !== originalHtml) {
          $elem.html(newHtml);
          found = true;
          console.log(
            `✓ Found fuzzy match (${Math.round(
              threshold * 100
            )}%) for excerpt: ${id}`
          );
          return false;
        }
      }
    }
  );

  return found;
}

/**
 * Enhanced excerpt finding with multiple strategies
 */
function findAndWrapExcerpt($: any, excerptText: string, id: string): boolean {
  const normalizedExcerpt = normalizeText(excerptText);

  // Skip very short or placeholder excerpts
  if (
    normalizedExcerpt.length < 15 ||
    excerptText.includes("No excerpt") ||
    excerptText.includes("No direct excerpt") ||
    excerptText.includes("Not available") ||
    excerptText.includes("Not applicable")
  ) {
    return false;
  }

  // Strategy 1: Try exact match
  let found = tryExactMatch($, excerptText, id);
  if (found) return true;

  // Strategy 2: Try fuzzy match (60% threshold)
  if (normalizedExcerpt.length > 50) {
    found = tryFuzzyMatch($, excerptText, id, 0.6);
    if (found) return true;

    // Strategy 3: Try even more lenient fuzzy match (50% threshold)
    found = tryFuzzyMatch($, excerptText, id, 0.5);
    if (found) return true;
  }

  console.warn(
    `✗ Could not find excerpt (${id}): ${excerptText.substring(
      0,
      Math.min(80, excerptText.length)
    )}...`
  );
  return false;
}

export async function markExcerptsInOriginalHtml(
  htmlContent: string,
  analysis: SECAnalysis
): Promise<{ markedHtml: string; excerptMap: Record<string, string> }> {
  const $ = load(htmlContent);
  let excerptCounter = 0;
  const excerptMap: Record<string, string> = {};
  let foundCount = 0;
  let totalCount = 0;
  let skippedCount = 0;

  // Track used excerpts to prevent duplicates
  const usedExcerpts = new Set<string>();

  const processExcerpt = (excerpt: string | undefined): string | undefined => {
    if (
      !excerpt ||
      excerpt === "No excerpt available." ||
      excerpt === "No direct excerpt found." ||
      excerpt.includes("Not available") ||
      excerpt.includes("Not applicable")
    ) {
      return undefined;
    }

    // Check for duplicates
    const normalizedExcerpt = normalizeText(excerpt);
    if (usedExcerpts.has(normalizedExcerpt)) {
      skippedCount++;
      console.log(
        `⊘ Skipping duplicate excerpt: ${excerpt.substring(
          0,
          Math.min(50, excerpt.length)
        )}...`
      );
      return undefined;
    }

    totalCount++;
    const id = `excerpt-${++excerptCounter}`;
    const found = findAndWrapExcerpt($, excerpt, id);

    if (found) {
      foundCount++;
      usedExcerpts.add(normalizedExcerpt);
      excerptMap[excerpt] = id;
      return id;
    }

    return undefined;
  };

  /**
   * Recursively processes an object to find and mark excerpts.
   * Looks for properties named 'excerpt' or 'originalExcerpt' or arrays of objects that might contain them.
   */
  const _processExcerptsRecursively = (data: any) => {
    if (data === null || typeof data !== "object") {
      return;
    }

    if (Array.isArray(data)) {
      data.forEach((item) => _processExcerptsRecursively(item));
    } else {
      // Prioritize 'originalExcerpt' then 'excerpt'
      if (typeof data.originalExcerpt === "string") {
        processExcerpt(data.originalExcerpt);
      } else if (typeof data.excerpt === "string") {
        processExcerpt(data.excerpt);
      } else if (data.excerpts && Array.isArray(data.excerpts)) {
        // Handle arrays of excerpts directly
        data.excerpts.forEach((e: string) => processExcerpt(e));
      }

      // Recursively process other properties
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          // Avoid processing already handled top-level excerpt properties
          if (
            key === "excerpt" ||
            key === "originalExcerpt" ||
            key === "excerpts"
          ) {
            continue;
          }
          const value = data[key];
          if (value && typeof value === "object") {
            _processExcerptsRecursively(value);
          }
        }
      }
    }
  };

  // Start recursive processing from the main analysis object
  _processExcerptsRecursively(analysis.sections);

  // Enhanced reporting
  console.log(`\n📊 Excerpt Matching Summary:`);
  console.log(`   Total excerpts processed: ${totalCount}`);
  console.log(`   ✓ Successfully found & marked: ${foundCount}`);
  console.log(`   ⊘ Duplicates skipped: ${skippedCount}`);
  console.log(`   ✗ Not found: ${totalCount - foundCount}`);
  console.log(
    `   📈 Success rate: ${((foundCount / totalCount) * 100).toFixed(1)}%`
  );
  console.log(`   🔍 Unique excerpts marked: ${usedExcerpts.size}\n`);

  return { markedHtml: $.html(), excerptMap };
}
