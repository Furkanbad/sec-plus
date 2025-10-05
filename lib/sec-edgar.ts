// lib/sec-edgar.ts
import { SECFiling, SECSearchRequest } from "@/types/sec-analysis";
import * as cheerio from "cheerio"; // Cheerio'yu import et

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
    const $ = cheerio.load(html); // Cheerio ile HTML'i yükle

    // --- Önemli Temizlik Adımları ---
    // iXBRL'de gizli (display: none) veya anlamsız <ix:*> etiketlerini kaldır
    $(
      "script, style, ix\\:hidden, ix\\:nonNumeric, ix\\:continuation, ix\\:fraction"
    ).remove();
    // Yaygın olarak boş veya anlamsız olan gizli div'leri kaldır
    $('[style*="display:none"]').remove();
    $("[hidden]").remove(); // HTML5 hidden attribute

    // Ana içerik alanını bulmaya çalış
    // Bu kısım SEC dosyalarının HTML yapısına göre en çok değişen yerdir.
    // Farklı dosyalarda farklı id/class isimleri olabilir.
    // 'wrapper_div', 'contentDiv', 'formSection', 'document' gibi isimleri deneyin.
    let contentArea = $(
      "div#formDiv, div#contentDiv, div.document, body"
    ).first();

    // Eğer ana içerik bulunamazsa, tüm body'yi kullan
    if (contentArea.length === 0) {
      contentArea = $("body").first();
    }

    // Geçici olarak, tüm metni çıkaralım
    let cleanText = contentArea.text();
    // Çoklu boşlukları tek boşluğa indirge, &nbsp; ve &amp; gibi HTML entity'lerini düzelt
    cleanText = cleanText
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

    console.log(`📄 Cleaned text length: ${cleanText.length} characters`);
    console.log("--- START OF CLEAN TEXT PREVIEW ---");
    console.log(cleanText.substring(0, 5000)); // İlk 5000 karakteri bas
    console.log("--- END OF CLEAN TEXT PREVIEW ---");

    // --- Bölüm Başlıklarını Bulma (Regex ile) ---
    // Bu regex'ler, temizlenmiş metin üzerinde çalışacak.
    // `(?:\n|^|\s)` ile başlangıçta satır başı veya boşluk arayarak eşleşmenin doğru yere olmasını sağlamaya çalışıyoruz.
    const sectionPatterns = [
      {
        key: "business",
        // Business için TOC sonrası özel bir durum olmayabilir, bu kalsın
        regex: /(?:\n|^|\s)(?:ITEM\s*1\.\s*BUSINESS|BUSINESS)(?:\s+|-|\n|$)/i,
        endRegex:
          /(?:\n|^|\s)(?:ITEM\s*1A|ITEM\s*2\.\s*PROPERTIES)(?:\s+|-|\n|$)/i,
      },
      {
        key: "risk",
        // Risk için de aynı şekilde
        regex:
          /(?:\n|^|\s)(?:ITEM\s*1A\.\s*RISK\s*FACTORS|RISK\s*FACTORS)(?:\s+|-|\n|$)/i,
        endRegex:
          /(?:\n|^|\s)(?:ITEM\s*1B|ITEM\s*2\.\s*PROPERTIES)(?:\s+|-|\n|$)/i,
      },
      {
        key: "mdna",
        // Başlangıç: Sayı veya herhangi bir karakterden sonra "ITEM 7"
        regex:
          /(?:^|[\s\S])(?:ITEM\s*7[\.\s-]*MANAGEMENT(?:['’]S)?\s+DISCUSSION\s+AND\s+ANALYSIS(?:\s+OF\s+FINANCIAL\s+CONDITION\s+AND\s+RESULTS\s+OF\s+OPERATIONS)?)(\d*)(?:[\s]+|$)/i,
        // Bitiş: Sayı veya herhangi bir karakterden sonra "ITEM 7A" veya "ITEM 8"
        endRegex:
          /(?:^|[\s\S])(?:ITEM\s*7A[\.\s-]*(\d*)|ITEM\s*8[\.\s-]*(\d*))(?:\s+|-|$)/i,
      },
      {
        key: "financials",
        // Başlangıç regex'i muhtemelen doğru
        regex:
          /(?:^|[\s\S])(?:ITEM\s*8[\.\s-]*FINANCIAL\s+STATEMENTS\s+AND\s+SUPPLEMENTARY\s+DATA)(\d*)(?:[\s]+|$)/i,
        // Bitiş: ITEM 9 veya ITEM 9A'yı ara, öncesinde her şey olabilir (sayfa numarası dahil)
        // Sonunda boşluk/tire yerine herhangi bir karakter veya dize sonu olabilir.
        endRegex:
          /(?:^|[\s\S])(?:ITEM\s*9[\.\s-]*(\d*)|ITEM\s*9A[\.\s-]*(\d*))(?:[\s\S]*?$|$)/i,
      },
    ];

    let contentText = cleanText; // Üzerinde arama yapacağımız metin
    let searchStartOffset = 0; // Metinde arama yapmaya başlanacak ofset

    // --- Yeni ve Geliştirilmiş TOC Atlama Mekanizması ---
    // TOC'un sonunu daha güvenilir bir şekilde bulmaya çalışalım.
    // Genellikle 'Table of Contents' kelimesinden sonra gelen ve
    // gerçek 'Item 1. Business' başlığının ilk geçtiği yere kadar olan kısmı atlamalıyız.
    const tocKeywordMatch = contentText.match(/Table\s*of\s*Contents/i);
    if (tocKeywordMatch && tocKeywordMatch.index !== undefined) {
      const afterToc = contentText.substring(
        tocKeywordMatch.index + tocKeywordMatch[0].length
      );

      // GÜNCELLENMİŞ REGEX:
      // 'Item 1.Business4' gibi durumları da yakalamak için daha esnek.
      // '.Business' kısmından sonra sayılar gelebileceğini varsayıyoruz.
      const realItem1Match = afterToc.match(
        /(?:\n|^|\s)ITEM\s*1\.\s*BUSINESS(?:[^\n\r]*?)(?:\s+|-|\n|$)/i
      );
      // [^\n\r]*? : Satır sonu olmayan herhangi bir karakteri (0 veya daha fazla) esnekçe eşleştirir.
      // Bu, 'Business' kelimesinden sonra gelen sayıyı veya herhangi bir metni yakalayarak,
      // gerçek içeriğin başladığı 'ITEM 1. BUSINESS' başlığına kadar olan kısmı doğru atlamamızı sağlar.

      if (realItem1Match && realItem1Match.index !== undefined) {
        searchStartOffset =
          tocKeywordMatch.index +
          tocKeywordMatch[0].length +
          realItem1Match.index;
        console.log(
          `📍 Adjusted content search start past TOC. New search start offset: ${searchStartOffset}`
        );
      } else {
        console.log(
          "📍 Could not find real 'Item 1. Business' after 'Table of Contents'. Searching from start."
        );
      }
    } else {
      console.log(
        "📍 'Table of Contents' keyword not found. Searching from start."
      );
    }

    // contentText'i artık doğru başlangıç noktasından itibaren ayırıyoruz
    contentText = cleanText.substring(searchStartOffset);
    console.log(
      `🔎 Actual content search area length: ${contentText.length} characters`
    );

    // Yeni: ContentText'in ITEM 6, 7, 8 ve 9 çevresindeki kısmını inceleyelim.
    // Bu kısım 262047 karakter olduğu için tümünü basmak pratik değil.
    // MD&A'nın beklenen konumunu tahmin edelim ve o bölgeyi bastıralım.

    // Tahmini başlangıç ofsetlerini bulmak için 'ITEM 6' veya 'ITEM 7' araması yapalım
    const item6Match = contentText.match(
      /(?:\n|^|\s)ITEM\s*6\.\s*\[RESERVED\](?:\s+|-|\n|$)/i
    );
    let debugStartIndex = 0;
    if (item6Match && item6Match.index !== undefined) {
      debugStartIndex = item6Match.index;
    } else {
      // Eğer ITEM 6 yoksa, ITEM 7'nin ilk geçtiği yere yakın bir yerden başla
      const item7StartMatch = contentText.match(
        /(?:\n|^|\s)ITEM\s*7\.\s*MANAGEMENT/i
      );
      if (item7StartMatch && item7StartMatch.index !== undefined) {
        debugStartIndex = Math.max(0, item7StartMatch.index - 500); // 500 karakter öncesinden başla
      }
    }

    console.log(
      "--- START OF TARGETED CONTENT TEXT PREVIEW (around ITEM 6-9) ---"
    );
    console.log(contentText.substring(debugStartIndex, debugStartIndex + 5000)); // Hedeflenen 5000 karakteri bas
    console.log("--- END OF TARGETED CONTENT TEXT PREVIEW ---");
    console.log(
      `🔎 Actual content search area length: ${contentText.length} characters`
    );

    for (const pattern of sectionPatterns) {
      const startMatch = contentText.match(pattern.regex);

      if (startMatch && startMatch.index !== undefined) {
        let startIndex = startMatch.index + startMatch[0].length;

        const searchTextForEnd = contentText.substring(startIndex);
        const endMatch = searchTextForEnd.match(pattern.endRegex);

        let endIndex;
        if (endMatch && endMatch.index !== undefined) {
          endIndex = startIndex + endMatch.index;
        } else {
          // Sonlandırma etiketi bulunamazsa veya son bölümse, belirli bir karakter uzunluğunu al
          // Maksimum 200,000 karakter, aksi halde çok uzun metin AI modelini yorabilir
          endIndex = Math.min(startIndex + 200000, contentText.length);
        }

        const sectionText = contentText.substring(startIndex, endIndex).trim();

        if (sectionText.length >= 0) {
          // Sadece anlamlı uzunluktaki bölümleri al
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
