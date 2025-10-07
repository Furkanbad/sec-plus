// lib/sec-api-client.ts
import type { SECFiling, SECSearchRequest } from "@/types/sec-analysis";

const SEC_API_KEY = process.env.SEC_API_KEY!;

export class SECApiClient {
  /**
   * QUERY API - Filing ara
   */
  async searchFilings(request: SECSearchRequest): Promise<SECFiling[]> {
    const query = {
      query: `ticker:${request.ticker} AND formType:"${request.filingType}"`,
      from: "0",
      size: "3",
      sort: [{ filedAt: { order: "desc" } }],
    };

    const response = await fetch("https://api.sec-api.io", {
      method: "POST",
      headers: {
        Authorization: SEC_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SEC Query API failed: ${response.status} - ${errorText}`);
      throw new Error(`SEC Query API failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.filings || data.filings.length === 0) {
      return [];
    }

    return data.filings.map((filing: any) => ({
      cik: filing.cik,
      ticker: filing.ticker || request.ticker.toUpperCase(),
      companyName: filing.companyName,
      filingType: filing.formType,
      filingDate: filing.filedAt.split("T")[0],
      fiscalYear:
        filing.periodOfReport?.split("-")[0] || filing.filedAt.split("-")[0],
      htmlUrl: filing.linkToFilingDetails,
    }));
  }

  /**
   * EXTRACTOR API - Section çıkar
   */
  async extractSection(
    filingUrl: string,
    item: string,
    returnType: "text" | "html" = "text"
  ): Promise<string> {
    const url = new URL("https://api.sec-api.io/extractor");
    url.searchParams.append("url", filingUrl);
    url.searchParams.append("item", item);
    url.searchParams.append("type", returnType);
    url.searchParams.append("token", SEC_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `SEC Extractor API failed for item ${item} (type: ${returnType}): ${response.status} - ${errorText}`
      );
      throw new Error(
        `SEC Extractor API failed for item ${item} (type: ${returnType}): ${response.status}`
      );
    }

    return await response.text();
  }

  /**
   * Tüm kritik sections'ları sequential olarak al (rate limit için)
   */
  async getAllSections(
    filing: SECFiling
  ): Promise<Record<string, { text: string; html: string }>> {
    console.log(
      `Extracting sections from ${filing.ticker} ${filing.filingType}...`
    );

    const items = {
      business: "1",
      risk: "1A",
      legal: "3",
      mdna: "7",
      marketRisk: "7A",
      financials: "8",
      controls: "9A",
      directors: "10",
      compensation: "11",
      ownership: "12",
      relatedParty: "13",
    };

    const sections: Record<string, { text: string; html: string }> = {};

    // Sequential extraction to avoid rate limits
    for (const [key, itemCode] of Object.entries(items)) {
      try {
        console.log(`Extracting ${key} (Item ${itemCode})...`);
        const text = await this.extractSection(
          filing.htmlUrl,
          itemCode,
          "text"
        );

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 300));

        const html = await this.extractSection(
          filing.htmlUrl,
          itemCode,
          "html"
        );

        sections[key] = { text, html };
        console.log(`✓ ${key}: ${text.length} chars`);

        // Delay before next section
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.warn(`Failed to extract ${key} (Item ${itemCode}):`, error);
      }
    }

    return sections;
  }
}

export const secApiClient = new SECApiClient();
