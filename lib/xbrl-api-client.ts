// lib/xbrl-api-client.ts

/**
 * XBRL API'den dönen her bir veri item'ı
 */
interface XBRLItem {
  decimals?: string;
  unitRef?: string;
  period?: {
    startDate?: string;
    endDate?: string;
    instant?: string;
  };
  segment?:
    | {
        dimension: string;
        value: string;
      }
    | Array<{
        dimension: string;
        value: string;
      }>;
  value: string | number;
}

/**
 * Balance Sheet - Her GAAP item bir array
 */
interface XBRLBalanceSheet {
  [key: string]: XBRLItem[];
}

/**
 * Income Statement - Her GAAP item bir array
 */
interface XBRLIncomeStatement {
  [key: string]: XBRLItem[];
}

/**
 * Cash Flow - Her GAAP item bir array
 */
interface XBRLCashFlow {
  [key: string]: XBRLItem[];
}

export interface XBRLFinancialData {
  // Cover page (company info)
  CoverPage?: {
    DocumentType?: string;
    DocumentPeriodEndDate?: string;
    EntityRegistrantName?: string;
    EntityIncorporationStateCountryCode?: string;
    EntityTaxIdentificationNumber?: string;
    TradingSymbol?: string | XBRLItem | XBRLItem[];
    DocumentFiscalYearFocus?: string;
    DocumentFiscalPeriodFocus?: string;
    CurrentFiscalYearEndDate?: string;
    [key: string]: any;
  };

  // Balance Sheet - Her item bir array
  BalanceSheets?: XBRLBalanceSheet;

  // Income Statement - Her item bir array
  StatementsOfIncome?: XBRLIncomeStatement;

  // Cash Flow Statement - Her item bir array
  StatementsOfCashFlows?: XBRLCashFlow;

  // Diğer statement'lar
  [key: string]: any;
}

export class XBRLApiClient {
  private apiKey: string;
  private baseUrl = "https://api.sec-api.io/xbrl-to-json";

  constructor() {
    const key = process.env.SEC_API_KEY;
    if (!key) {
      throw new Error("SEC_API_KEY is not defined in environment variables");
    }
    this.apiKey = key;
  }

  /**
   * XBRL dosyasından finansal verileri çeker
   */
  async getFinancialData(xbrlUrl: string): Promise<XBRLFinancialData> {
    console.log(`📊 Fetching XBRL data from: ${xbrlUrl}`);

    try {
      // Parametre adı "xbrl-url" olmalı (tire ile, camelCase değil)
      const url = `${this.baseUrl}?xbrl-url=${encodeURIComponent(xbrlUrl)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: this.apiKey, // Token'ı header'da gönder
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`XBRL API failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`✓ XBRL data fetched successfully`);
      console.log(`📊 XBRL data structure:`, {
        hasBalanceSheets: !!data.BalanceSheets,
        hasStatementsOfIncome: !!data.StatementsOfIncome,
        hasStatementsOfCashFlows: !!data.StatementsOfCashFlows,
        hasCoverPage: !!data.CoverPage,
        topLevelKeys: Object.keys(data).slice(0, 10),
      });

      // İlk revenue item'ı sample olarak logla
      if (
        data.StatementsOfIncome
          ?.RevenueFromContractWithCustomerExcludingAssessedTax
      ) {
        console.log(
          `📊 Sample revenue item:`,
          JSON.stringify(
            data.StatementsOfIncome
              .RevenueFromContractWithCustomerExcludingAssessedTax[0],
            null,
            2
          )
        );
      }

      return data;
    } catch (error) {
      console.error("❌ Error fetching XBRL data:", error);
      throw error;
    }
  }

  /**
   * XBRL verilerinden ana finansal metrikleri çıkarır
   */
  extractKeyMetrics(xbrlData: XBRLFinancialData): {
    revenue: { current: number; previous: number } | null;
    netIncome: { current: number; previous: number } | null;
    totalAssets: { current: number; previous: number } | null;
    totalLiabilities: { current: number; previous: number } | null;
    operatingCashFlow: { current: number; previous: number } | null;
    periods: string[];
  } {
    console.log("📊 [extractKeyMetrics] Starting extraction...");

    // Helper: XBRL array'inden en son 2 period'u çıkar
    const extractLastTwoPeriods = (
      items: any[]
    ): { current: number; previous: number } | null => {
      if (!items || items.length < 2) {
        console.log(`   ⚠️ Not enough items: ${items?.length || 0}`);
        return null;
      }

      // Period'ları tarih sırasına göre sırala (en yeni en başta)
      const sortedItems = [...items]
        .filter((item) => item.period && item.value !== undefined)
        .sort((a, b) => {
          const dateA =
            a.period.endDate || a.period.instant || a.period.startDate;
          const dateB =
            b.period.endDate || b.period.instant || b.period.startDate;
          return dateB.localeCompare(dateA);
        });

      if (sortedItems.length < 2) {
        console.log(`   ⚠️ Not enough sorted items: ${sortedItems.length}`);
        return null;
      }

      // Segment olmayan (toplam) değerleri bul
      const mainItems = sortedItems.filter((item) => !item.segment);

      if (mainItems.length >= 2) {
        const result = {
          current: parseFloat(mainItems[0].value),
          previous: parseFloat(mainItems[1].value),
        };
        console.log(`   ✓ Found main items:`, result);
        return result;
      }

      // Fallback: Tüm itemleri kullan
      if (sortedItems.length >= 2) {
        const result = {
          current: parseFloat(sortedItems[0].value),
          previous: parseFloat(sortedItems[1].value),
        };
        console.log(`   ⚠️ Using fallback with segments:`, result);
        return result;
      }

      return null;
    };

    // Helper: Birden fazla field adını dene
    const extractFromFields = (statement: any, fields: string[]) => {
      console.log(`   🔍 Trying fields: ${fields.join(", ")}`);
      for (const field of fields) {
        if (statement && statement[field]) {
          console.log(
            `   ✓ Found field: ${field} with ${statement[field].length} items`
          );
          const result = extractLastTwoPeriods(statement[field]);
          if (result) return result;
        }
      }
      console.log(`   ❌ No matching fields found`);
      return null;
    };

    // Period listesini oluştur
    const periods: string[] = [];
    if (xbrlData.StatementsOfIncome) {
      const allPeriods = new Set<string>();
      Object.values(xbrlData.StatementsOfIncome).forEach((items: any) => {
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (item.period) {
              const periodStr =
                item.period.endDate ||
                item.period.instant ||
                `${item.period.startDate}-${item.period.endDate}`;
              allPeriods.add(periodStr);
            }
          });
        }
      });
      periods.push(...Array.from(allPeriods).sort().reverse().slice(0, 2));
      console.log(`📅 Periods found: ${periods.join(", ")}`);
    }

    const metrics = {
      revenue: extractFromFields(xbrlData.StatementsOfIncome, [
        "Revenues",
        "RevenueFromContractWithCustomerExcludingAssessedTax",
        "SalesRevenueNet",
        "RevenueFromContractWithCustomerIncludingAssessedTax",
      ]),
      netIncome: extractFromFields(xbrlData.StatementsOfIncome, [
        "NetIncomeLoss",
        "ProfitLoss",
        "NetIncomeLossAvailableToCommonStockholdersBasic",
      ]),
      totalAssets: extractFromFields(xbrlData.BalanceSheets, [
        "Assets",
        "AssetsCurrent",
      ]),
      totalLiabilities: extractFromFields(xbrlData.BalanceSheets, [
        "Liabilities",
        "LiabilitiesCurrent",
      ]),
      operatingCashFlow: extractFromFields(xbrlData.StatementsOfCashFlows, [
        "NetCashProvidedByUsedInOperatingActivities",
        "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
      ]),
      periods,
    };

    console.log(
      "📊 [extractKeyMetrics] Final metrics:",
      JSON.stringify(metrics, null, 2)
    );
    return metrics;
  }

  /**
   * Sayıyı okunabilir formata çevirir
   */
  formatFinancialNumber(value: number, unit: string = "USD"): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue >= 1_000_000_000) {
      return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
    } else if (absValue >= 1_000_000) {
      return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
    } else if (absValue >= 1_000) {
      return `${sign}$${(absValue / 1_000).toFixed(2)}K`;
    }
    return `${sign}$${absValue.toFixed(2)}`;
  }
}

// Singleton instance
let xbrlApiClientInstance: XBRLApiClient | null = null;

export const getXbrlApiClient = (): XBRLApiClient => {
  if (!xbrlApiClientInstance) {
    xbrlApiClientInstance = new XBRLApiClient();
  }
  return xbrlApiClientInstance;
};
