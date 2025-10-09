// lib/sec-api-client.ts
import type {
  SECFiling,
  SECSearchRequest,
} from "@/app/api/analyze-sec/models/sec-analysis";

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
    // Always wait 500ms between requests
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
        cik: filing.cik,
        ticker: filing.ticker || request.ticker.toUpperCase(),
        companyName: filing.companyName,
        filingType: filing.formType,
        filingDate: filing.filedAt.split("T")[0],
        fiscalYear:
          filing.periodOfReport?.split("-")[0] || filing.filedAt.split("-")[0],
        htmlUrl: filing.linkToFilingDetails,
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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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

  async getAllSections(
    filing: SECFiling
  ): Promise<Record<string, { text: string; html: string }>> {
    console.log(
      `📥 Starting extraction for ${filing.ticker} ${filing.filingType}...`
    );

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
      exhibits: "15", // Item 15'i de ekledik
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

        sections[key] = { text, html: "" }; // HTML'i boş bırak, kullanmıyoruz
      } catch (error) {
        console.warn(`   ❌ Failed ${key} (Item ${itemCode}):`, error);
        sections[key] = { text: "", html: "" };
      }
    }

    // Finansal bilgileri hem Item 8'den hem de Item 15'ten birleştirebiliriz.
    // SEC API'nin extractor'ı "Item 8" olarak istediğimizde bazen "Item 15(a)(1)" içeriğini de dönebilir.
    // Ancak daha güvenli olmak için ikisini de alıp birleştirmek iyi bir stratejidir.
    if (sections.financials?.text && sections.exhibits?.text) {
      // Eğer Item 8'den ve Item 15'ten alınan finansal bilgiler varsa, bunları birleştirelim.
      // Tekrar eden kısımları ele almak için basit bir kontrol yapılabilir.
      // Burada basitçe birleştiriyoruz, daha gelişmiş bir deduplication gerekebilir.
      const combinedFinancials = `${sections.financials.text}\n\n${sections.exhibits.text}`;
      sections.financials.text = combinedFinancials;
      console.log(
        `   ✓ Financials combined from Item 8 and Item 15: ${combinedFinancials.length} chars`
      );
    } else if (sections.exhibits?.text && !sections.financials?.text) {
      // Sadece Item 15'te varsa, onu kullanalım
      sections.financials = sections.exhibits;
      console.log(
        `   ✓ Financials derived from Item 15: ${sections.financials.text.length} chars`
      );
    }
    // Eğer sadece Item 8 varsa, o zaten `sections.financials` içinde olacak.

    // İşimiz biten `exhibits` bölümünü (eğer finansal veriler için kullandıysak) boşaltabiliriz veya ayrı bir kategori olarak tutmaya devam edebiliriz.
    // Şu anki senaryoda, financials'ı birleştirdikten sonra exhibits'i ayrı tutmak mantıklı olabilir, çünkü içinde başka ekler de olabilir.
    // Ancak analiz tarafında financials'ı kullanacağımız için bu birleştirme yeterli.

    console.log(`✅ All sections extraction complete`);
    return sections;
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
