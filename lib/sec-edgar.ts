// lib/sec-edgar.ts
import { SECFiling, SECSearchRequest } from "@/types/sec-analysis";

const SEC_BASE_URL = "https://www.sec.gov";
const USER_AGENT = "SEC Plus+ info@secplus.com"; // SEC requires user agent

// CIK lookup cache (ticker -> CIK mapping)
const CIK_CACHE: Record<string, string> = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  GOOGL: "0001652044",
  TSLA: "0001318605",
  AMZN: "0001018724",
  META: "0001326801",
  NVDA: "0001045810",
};

export class SECEdgarClient {
  private headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  };

  /**
   * Get CIK from ticker symbol
   */
  async getCIK(ticker: string): Promise<string> {
    const upperTicker = ticker.toUpperCase();

    // Check cache first
    if (CIK_CACHE[upperTicker]) {
      return CIK_CACHE[upperTicker];
    }

    // Fetch from SEC company tickers JSON
    try {
      const response = await fetch(
        `${SEC_BASE_URL}/files/company_tickers.json`,
        { headers: this.headers }
      );
      const data = await response.json();

      // Find ticker in the list
      const company = Object.values(data).find(
        (item: any) => item.ticker === upperTicker
      );

      if (company) {
        const cik = String((company as any).cik_str).padStart(10, "0");
        CIK_CACHE[upperTicker] = cik;
        return cik;
      }

      throw new Error(`Ticker ${ticker} not found`);
    } catch (error) {
      throw new Error(`Failed to lookup CIK for ${ticker}: ${error}`);
    }
  }

  /**
   * Search for filings (with retry for rate limiting)
   */
  async searchFilings(request: SECSearchRequest): Promise<SECFiling[]> {
    const cik = await this.getCIK(request.ticker);
    const url = `https://data.sec.gov/submissions/CIK${cik}.json`;

    for (let retry = 0; retry < 3; retry++) {
      try {
        await this.delay(retry * 1000); // Delay between retries

        const response = await fetch(url, { headers: this.headers });

        if (!response.ok) {
          if (response.status === 429 && retry < 2) continue; // Retry on rate limit
          throw new Error(`SEC API returned ${response.status}`);
        }

        const data = await response.json();
        const filings: SECFiling[] = [];
        const recent = data.filings?.recent;

        if (!recent) return filings;

        const forms = recent.form || [];
        const dates = recent.filingDate || [];
        const accessions = recent.accessionNumber || [];
        const primaryDocuments = recent.primaryDocument || [];

        for (let i = 0; i < forms.length; i++) {
          if (forms[i] === request.filingType) {
            const filingDate = dates[i];
            const fiscalYear = filingDate.split("-")[0];

            if (request.year && fiscalYear !== request.year) continue;

            const accession = accessions[i].replace(/-/g, "");
            const primaryDoc = primaryDocuments[i];
            const htmlUrl = `https://www.sec.gov/Archives/edgar/data/${cik.replace(
              /^0+/,
              ""
            )}/${accession}/${primaryDoc}`;

            filings.push({
              cik,
              ticker: request.ticker.toUpperCase(),
              companyName: data.name || "",
              filingType: request.filingType,
              filingDate,
              fiscalYear,
              htmlUrl,
            });

            if (filings.length >= 3) break;
          }
        }

        return filings;
      } catch (error) {
        if (retry === 2) throw new Error(`Failed after 3 attempts: ${error}`);
      }
    }
    return [];
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch filing HTML content
   */
  async fetchFilingHTML(filing: SECFiling): Promise<string> {
    for (let retry = 0; retry < 3; retry++) {
      try {
        await this.delay(retry * 1000);

        const response = await fetch(filing.htmlUrl, { headers: this.headers });

        if (!response.ok) {
          if (response.status === 429 && retry < 2) continue;
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        return await response.text();
      } catch (error) {
        if (retry === 2) throw new Error(`Failed to fetch HTML: ${error}`);
      }
    }
    return "";
  }

  /**
   * Parse 10-K sections from HTML
   */
  parseSections(html: string): Record<string, string> {
    const sections: Record<string, string> = {};

    // Remove script and style tags
    let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    // Convert to text but preserve some structure
    const cleanText = cleanHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

    console.log(`📄 Total text length: ${cleanText.length} characters`);

    // Skip Table of Contents by finding "PART I" or first actual content
    const tocEnd = cleanText.search(
      /(?:PART\s+I[^\w]|Item\s+1\.\s+Business\s+[A-Z])/i
    );
    const startFrom = tocEnd > 0 ? tocEnd : 0;
    const contentText = cleanText.substring(startFrom);

    console.log(`📍 Starting content search from position: ${startFrom}`);

    // More flexible section patterns - look for actual content, not TOC
    const sectionPatterns = [
      {
        key: "business",
        regex:
          /(?:^|\n)\s*ITEM\s*1[\.\s]+(?:BUSINESS|Description of Business)[\s\n]+(?=[A-Z])/i,
        endRegex: /(?:^|\n)\s*ITEM\s*1A/i,
      },
      {
        key: "risk",
        regex: /(?:^|\n)\s*ITEM\s*1A[\.\s]+RISK\s*FACTORS[\s\n]+(?=[A-Z])/i,
        endRegex: /(?:^|\n)\s*ITEM\s*(?:1B|2)/i,
      },
      {
        key: "mdna",
        regex:
          /(?:^|\n)\s*ITEM\s*7[\.\s]+(?:MANAGEMENT|Management).?S?\s+(?:DISCUSSION|Discussion)[\s\n]+(?=[A-Z])/i,
        endRegex: /(?:^|\n)\s*ITEM\s*(?:7A|8)/i,
      },
      {
        key: "financials",
        regex:
          /(?:^|\n)\s*ITEM\s*8[\.\s]+FINANCIAL\s+STATEMENTS[\s\n]+(?=[A-Z])/i,
        endRegex: /(?:^|\n)\s*ITEM\s*(?:9|9A)/i,
      },
    ];

    for (const pattern of sectionPatterns) {
      const startMatch = contentText.match(pattern.regex);

      if (startMatch && startMatch.index !== undefined) {
        let startIndex = startMatch.index + startMatch[0].length;

        // Find end of section
        const searchText = contentText.substring(startIndex);
        const endMatch = searchText.match(pattern.endRegex);

        let endIndex;
        if (endMatch && endMatch.index !== undefined) {
          endIndex = startIndex + endMatch.index;
        } else {
          endIndex = Math.min(startIndex + 120000, contentText.length);
        }

        const sectionText = contentText.substring(startIndex, endIndex).trim();

        // Only add if substantial content
        if (sectionText.length > 1000) {
          sections[pattern.key] = sectionText;
          console.log(`✅ Found ${pattern.key}: ${sectionText.length} chars`);
          console.log(`   Preview: ${sectionText.substring(0, 150)}...`);
        } else {
          console.log(
            `⚠️ Section ${pattern.key} found but too short: ${sectionText.length} chars`
          );
        }
      } else {
        console.log(`❌ Section ${pattern.key} not found`);
      }
    }

    return sections;
  }

  /**
   * Get clean text from HTML (for debugging)
   */
  getCleanText(html: string): string {
    let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    return cleanHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const secClient = new SECEdgarClient();
