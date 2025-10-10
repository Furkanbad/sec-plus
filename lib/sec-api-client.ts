// lib/sec-api-client.ts
import type {
  SECFiling,
  SECSearchRequest,
} from "@/app/api/analyze-sec/models/sec-analysis";
import { getXbrlApiClient, type XBRLFinancialData } from "./xbrl-api-client";

export class SECApiClient {
  private apiKey: string;
  private rateLimit = {
    requestsPerMinute: 10,
    lastRequestTime: 0,
    requestCount: 0,
  };

  constructor() {
    const key = process.env.SEC_API_KEY;
    if (!key) {
      throw new Error("SEC_API_KEY is not defined in environment variables");
    }
    this.apiKey = key;
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.rateLimit.lastRequestTime;

    if (timeSinceLastRequest < 60000) {
      this.rateLimit.requestCount++;
      if (this.rateLimit.requestCount >= this.rateLimit.requestsPerMinute) {
        const waitTime = 60000 - timeSinceLastRequest;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.rateLimit.requestCount = 0;
      }
    } else {
      this.rateLimit.requestCount = 0;
    }

    this.rateLimit.lastRequestTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async searchFilings(request: SECSearchRequest): Promise<SECFiling[]> {
    await this.enforceRateLimit();

    const query = {
      query: `ticker:${request.ticker} AND formType:"${request.filingType}"`,
      from: "0",
      size: "3",
      sort: [{ filedAt: { order: "desc" } }],
    };

    try {
      const response = await fetch("https://api.sec-api.io", {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `SEC Query API failed (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.filings || data.filings.length === 0) {
        return [];
      }

      return data.filings.map((filing: any) => ({
        id: filing.id || `${filing.cik}-${filing.accessionNo}`,
        cik: filing.cik,
        ticker: filing.ticker || request.ticker.toUpperCase(),
        companyName: filing.companyName,
        filingType: filing.formType,
        filedAt: filing.filedAt,
        filingDate: filing.filedAt.split("T")[0],
        fiscalYear: parseInt(
          filing.periodOfReport?.split("-")[0] || filing.filedAt.split("-")[0]
        ),
        htmlUrl: filing.linkToFilingDetails,
        reportDate: filing.periodOfReport || filing.filedAt.split("T")[0],
        accessionNumber: filing.accessionNo || "",
      }));
    } catch (error) {
      console.error("SEC API search error:", error);
      throw error;
    }
  }

  async extractSection(
    filingUrl: string,
    item: string,
    returnType: "text" | "html" = "text"
  ): Promise<string> {
    await this.enforceRateLimit();

    const url = new URL("https://api.sec-api.io/extractor");
    url.searchParams.append("url", filingUrl);
    url.searchParams.append("item", item);
    url.searchParams.append("type", returnType);
    url.searchParams.append("token", this.apiKey);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `SEC Extractor API failed for item ${item} (${response.status}): ${errorText}`
        );
      }

      return await response.text();
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error(`⏱️ Timeout for item ${item} after 30 seconds`);
        throw new Error(`Request timeout for item ${item}`);
      }
      console.error(`SEC extraction error for item ${item}:`, error);
      throw error;
    }
  }

  /**
   * XBRL URL'ini bulmak için filing'i inceler
   */
  async getXbrlUrl(filing: SECFiling): Promise<string | null> {
    try {
      console.log(`🔍 Looking for XBRL data file for ${filing.ticker}...`);

      const htmlUrl = filing.htmlUrl;

      // Method 1: .htm -> _htm.xml dönüşümü
      let xbrlUrl = htmlUrl.replace(/\.htm$/, "_htm.xml");

      try {
        const response = await fetch(xbrlUrl, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("xml")) {
            console.log(`✓ Found XBRL data file: ${xbrlUrl}`);
            return xbrlUrl;
          }
        }
      } catch (e) {
        // Method 1 failed, try Method 2
      }

      // Method 2: FilingSummary.xml'den bul
      const baseUrl = htmlUrl.substring(0, htmlUrl.lastIndexOf("/"));
      const filingSummaryUrl = `${baseUrl}/FilingSummary.xml`;

      try {
        const summaryResponse = await fetch(filingSummaryUrl, {
          signal: AbortSignal.timeout(5000),
        });

        if (summaryResponse.ok) {
          const summaryText = await summaryResponse.text();

          const htmXmlMatch = summaryText.match(
            /<HtmlFileName>([^<]+_htm\.xml)<\/HtmlFileName>/i
          );
          if (htmXmlMatch) {
            const xbrlFile = htmXmlMatch[1];
            const fullXbrlUrl = `${baseUrl}/${xbrlFile}`;
            console.log(
              `✓ Found XBRL data file from FilingSummary: ${fullXbrlUrl}`
            );
            return fullXbrlUrl;
          }

          const xmlMatch = summaryText.match(
            /<XmlFileName>([^<]+\.xml)<\/XmlFileName>/i
          );
          if (xmlMatch && !xmlMatch[1].includes("FilingSummary")) {
            const xbrlFile = xmlMatch[1];
            const fullXbrlUrl = `${baseUrl}/${xbrlFile}`;
            console.log(
              `✓ Found XBRL data file from XmlFileName: ${fullXbrlUrl}`
            );
            return fullXbrlUrl;
          }
        }
      } catch (e) {
        // Method 2 failed
      }

      // Method 3: Diğer pattern'ler
      const patterns = [
        htmlUrl.replace(/\.htm$/, ".xml"),
        htmlUrl.replace(/-\d{8}\.htm$/, (match) =>
          match.replace(".htm", "_htm.xml")
        ),
      ];

      for (const pattern of patterns) {
        try {
          const response = await fetch(pattern, {
            method: "GET",
            signal: AbortSignal.timeout(3000),
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("xml")) {
              console.log(`✓ Found XBRL data file using pattern: ${pattern}`);
              return pattern;
            }
          }
        } catch (e) {
          continue;
        }
      }

      console.warn(`⚠️ Could not find XBRL data file for ${filing.ticker}`);
      return null;
    } catch (error) {
      console.error("Error finding XBRL URL:", error);
      return null;
    }
  }

  /**
   * Yapılandırılmış XBRL finansal verilerini al
   */
  async getStructuredFinancials(filing: SECFiling) {
    try {
      const xbrlUrl = await this.getXbrlUrl(filing);

      if (!xbrlUrl) {
        console.warn(
          "⚠️ No XBRL data available, falling back to text extraction"
        );
        return null;
      }

      const xbrlClient = getXbrlApiClient();
      const xbrlData = await xbrlClient.getFinancialData(xbrlUrl);
      const keyMetrics = xbrlClient.extractKeyMetrics(xbrlData);

      console.log("📊 XBRL Key Metrics:");
      if (keyMetrics.revenue) {
        console.log(
          "   Revenue (current):",
          xbrlClient.formatFinancialNumber(keyMetrics.revenue.current)
        );
        console.log(
          "   Revenue (previous):",
          xbrlClient.formatFinancialNumber(keyMetrics.revenue.previous)
        );
      }
      if (keyMetrics.netIncome) {
        console.log(
          "   Net Income (current):",
          xbrlClient.formatFinancialNumber(keyMetrics.netIncome.current)
        );
        console.log(
          "   Net Income (previous):",
          xbrlClient.formatFinancialNumber(keyMetrics.netIncome.previous)
        );
      }
      if (keyMetrics.totalAssets) {
        console.log(
          "   Total Assets (current):",
          xbrlClient.formatFinancialNumber(keyMetrics.totalAssets.current)
        );
      }
      if (keyMetrics.operatingCashFlow) {
        console.log(
          "   Operating Cash Flow (current):",
          xbrlClient.formatFinancialNumber(keyMetrics.operatingCashFlow.current)
        );
      }

      return {
        raw: xbrlData,
        metrics: keyMetrics,
        formatter: xbrlClient,
      };
    } catch (error) {
      console.error("❌ Error getting structured financials:", error);
      return null;
    }
  }

  /**
   * Tüm bölümleri çeker (XBRL dahil)
   */
  async getAllSections(
    filing: SECFiling,
    includeXbrl: boolean = true
  ): Promise<{
    sections: Record<string, { text: string; html: string }>;
    xbrlData?: {
      raw: XBRLFinancialData;
      metrics: any;
      formatter: any;
    } | null;
  }> {
    console.log(
      `📥 Starting extraction for ${filing.ticker} ${filing.filingType}...`
    );

    // XBRL verilerini al
    let xbrlData = null;
    if (includeXbrl) {
      console.log("📊 Attempting to fetch XBRL structured data...");
      xbrlData = await this.getStructuredFinancials(filing);

      if (xbrlData) {
        console.log("✓ XBRL data successfully retrieved");
      } else {
        console.log("⚠️ XBRL data not available, will rely on text extraction");
      }
    }

    const items = {
      business: "1",
      properties: "2",
      risk: "1A",
      legal: "3",
      marketForEquity: "5",
      mdna: "7",
      marketRisk: "7A",
      financials: "8",
      disagreementsWithAccountants: "9",
      controls: "9A",
      otherInformation: "9B",
      directors: "10",
      compensation: "11",
      ownership: "12",
      relatedParty: "13",
      principalAccountantFees: "14",
      exhibits: "15",
    };

    const sections: Record<string, { text: string; html: string }> = {};

    for (const [key, itemCode] of Object.entries(items)) {
      try {
        console.log(`   Extracting ${key} (Item ${itemCode})...`);
        const text = await this.extractSection(
          filing.htmlUrl,
          itemCode,
          "text"
        );
        console.log(`   ✓ ${key}: ${text.length} chars`);

        sections[key] = { text, html: "" };
      } catch (error) {
        console.warn(`   ❌ Failed ${key} (Item ${itemCode}):`, error);
        sections[key] = { text: "", html: "" };
      }
    }

    // Item 8 ve Item 15'i birleştir
    if (sections.financials?.text && sections.exhibits?.text) {
      const combinedFinancials = `${sections.financials.text}\n\n--- Additional Financial Information from Exhibits ---\n\n${sections.exhibits.text}`;
      sections.financials.text = combinedFinancials;
      console.log(
        `   ✓ Financials combined from Item 8 and Item 15: ${combinedFinancials.length} chars`
      );
    } else if (sections.exhibits?.text && !sections.financials?.text) {
      sections.financials = sections.exhibits;
      console.log(
        `   ✓ Financials derived from Item 15: ${sections.financials.text.length} chars`
      );
    }

    // XBRL özeti ekle
    if (xbrlData && xbrlData.metrics) {
      const xbrlSummary = this.formatXbrlSummary(xbrlData);
      sections.financials.text = `${xbrlSummary}\n\n--- Detailed Financial Statements ---\n\n${sections.financials.text}`;
      console.log(`   ✓ Added XBRL summary to financials section`);
    }

    console.log(`✅ All sections extraction complete`);

    return {
      sections,
      xbrlData,
    };
  }

  /**
   * XBRL metriklerini okunabilir özet haline getirir
   */
  private formatXbrlSummary(xbrlData: {
    raw: XBRLFinancialData;
    metrics: any;
    formatter: any;
  }): string {
    const { metrics, formatter } = xbrlData;
    const lines: string[] = [];

    lines.push("=== STRUCTURED FINANCIAL DATA (XBRL) ===\n");

    if (metrics.periods && metrics.periods.length >= 2) {
      lines.push(
        `Periods: ${metrics.periods[0]} (current) vs ${metrics.periods[1]} (previous)\n`
      );
    }

    if (metrics.revenue) {
      const change =
        ((metrics.revenue.current - metrics.revenue.previous) /
          metrics.revenue.previous) *
        100;
      lines.push(`Revenue:`);
      lines.push(
        `  Current: ${formatter.formatFinancialNumber(metrics.revenue.current)}`
      );
      lines.push(
        `  Previous: ${formatter.formatFinancialNumber(
          metrics.revenue.previous
        )}`
      );
      lines.push(`  Change: ${change.toFixed(2)}%\n`);
    }

    if (metrics.netIncome) {
      const change =
        ((metrics.netIncome.current - metrics.netIncome.previous) /
          Math.abs(metrics.netIncome.previous)) *
        100;
      lines.push(`Net Income:`);
      lines.push(
        `  Current: ${formatter.formatFinancialNumber(
          metrics.netIncome.current
        )}`
      );
      lines.push(
        `  Previous: ${formatter.formatFinancialNumber(
          metrics.netIncome.previous
        )}`
      );
      lines.push(`  Change: ${change.toFixed(2)}%\n`);
    }

    if (metrics.totalAssets) {
      lines.push(`Total Assets:`);
      lines.push(
        `  Current: ${formatter.formatFinancialNumber(
          metrics.totalAssets.current
        )}`
      );
      lines.push(
        `  Previous: ${formatter.formatFinancialNumber(
          metrics.totalAssets.previous
        )}\n`
      );
    }

    if (metrics.totalLiabilities) {
      lines.push(`Total Liabilities:`);
      lines.push(
        `  Current: ${formatter.formatFinancialNumber(
          metrics.totalLiabilities.current
        )}`
      );
      lines.push(
        `  Previous: ${formatter.formatFinancialNumber(
          metrics.totalLiabilities.previous
        )}\n`
      );
    }

    if (metrics.operatingCashFlow) {
      lines.push(`Operating Cash Flow:`);
      lines.push(
        `  Current: ${formatter.formatFinancialNumber(
          metrics.operatingCashFlow.current
        )}`
      );
      lines.push(
        `  Previous: ${formatter.formatFinancialNumber(
          metrics.operatingCashFlow.previous
        )}\n`
      );
    }

    lines.push("==========================================\n");

    return lines.join("\n");
  }
}

// Singleton instance
let secApiClientInstance: SECApiClient | null = null;

export const getSecApiClient = (): SECApiClient => {
  if (!secApiClientInstance) {
    secApiClientInstance = new SECApiClient();
  }
  return secApiClientInstance;
};
