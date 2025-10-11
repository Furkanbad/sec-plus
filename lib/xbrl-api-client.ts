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
      const url = `${this.baseUrl}?xbrl-url=${encodeURIComponent(xbrlUrl)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: this.apiKey,
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
  extractKeyMetrics(xbrlData: XBRLFinancialData): any {
    console.log("📊 [extractKeyMetrics] Starting extraction...");

    const extractLastTwoPeriods = (
      items: any[]
    ): { current: number; previous: number } | null => {
      if (!items || items.length < 2) return null;

      const sortedItems = [...items]
        .filter(
          (item) => item.period && item.value !== undefined && !item.segment
        )
        .sort((a, b) => {
          const dateA =
            a.period.endDate || a.period.instant || a.period.startDate;
          const dateB =
            b.period.endDate || b.period.instant || b.period.startDate;
          return dateB.localeCompare(dateA);
        });

      if (sortedItems.length >= 2) {
        return {
          current: parseFloat(sortedItems[0].value),
          previous: parseFloat(sortedItems[1].value),
        };
      }
      return null;
    };

    const extractFromFields = (statement: any, fields: string[]) => {
      for (const field of fields) {
        if (statement?.[field]) {
          const result = extractLastTwoPeriods(statement[field]);
          if (result) {
            console.log(`   ✓ Found ${field}:`, result);
            return result;
          }
        }
      }
      return null;
    };

    // Extract periods
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
    }

    console.log("📊 Extracting Income Statement...");
    const revenue = extractFromFields(xbrlData.StatementsOfIncome, [
      "Revenues",
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "SalesRevenueNet",
    ]);

    const cogs = extractFromFields(xbrlData.StatementsOfIncome, [
      "CostOfGoodsAndServicesSold",
      "CostOfRevenue",
      "CostOfGoodsSold",
    ]);

    const grossProfit = extractFromFields(xbrlData.StatementsOfIncome, [
      "GrossProfit",
    ]);

    const opex = extractFromFields(xbrlData.StatementsOfIncome, [
      "OperatingExpenses",
      "OperatingExpensesAbstract",
    ]);

    const operatingIncome = extractFromFields(xbrlData.StatementsOfIncome, [
      "OperatingIncomeLoss",
      "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
    ]);

    const netIncome = extractFromFields(xbrlData.StatementsOfIncome, [
      "NetIncomeLoss",
      "ProfitLoss",
    ]);

    const eps = extractFromFields(xbrlData.StatementsOfIncome, [
      "EarningsPerShareDiluted",
      "EarningsPerShareBasic",
    ]);

    console.log("📊 Extracting Balance Sheet...");
    const totalAssets = extractFromFields(xbrlData.BalanceSheets, ["Assets"]);

    const currentAssets = extractFromFields(xbrlData.BalanceSheets, [
      "AssetsCurrent",
    ]);

    const totalLiabilities = extractFromFields(xbrlData.BalanceSheets, [
      "Liabilities",
    ]);

    const currentLiabilities = extractFromFields(xbrlData.BalanceSheets, [
      "LiabilitiesCurrent",
    ]);

    const equity = extractFromFields(xbrlData.BalanceSheets, [
      "StockholdersEquity",
      "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
    ]);

    const cash = extractFromFields(xbrlData.BalanceSheets, [
      "CashAndCashEquivalentsAtCarryingValue",
      "Cash",
    ]);

    const debt = extractFromFields(xbrlData.BalanceSheets, [
      "LongTermDebt",
      "DebtCurrent",
    ]);

    console.log("📊 Extracting Cash Flow...");
    const operatingCashFlow = extractFromFields(
      xbrlData.StatementsOfCashFlows,
      ["NetCashProvidedByUsedInOperatingActivities"]
    );

    const investingCashFlow = extractFromFields(
      xbrlData.StatementsOfCashFlows,
      ["NetCashProvidedByUsedInInvestingActivities"]
    );

    const financingCashFlow = extractFromFields(
      xbrlData.StatementsOfCashFlows,
      ["NetCashProvidedByUsedInFinancingActivities"]
    );

    const capex = extractFromFields(xbrlData.StatementsOfCashFlows, [
      "PaymentsToAcquirePropertyPlantAndEquipment",
      "CapitalExpenditures",
    ]);

    // Calculate Free Cash Flow if possible
    let freeCashFlow = null;
    if (operatingCashFlow && capex) {
      freeCashFlow = {
        current: operatingCashFlow.current - Math.abs(capex.current),
        previous: operatingCashFlow.previous - Math.abs(capex.previous),
      };
    }

    const metrics = {
      // Income Statement
      revenue,
      cogs,
      grossProfit,
      opex,
      operatingIncome,
      netIncome,
      eps,

      // Balance Sheet
      totalAssets,
      currentAssets,
      totalLiabilities,
      currentLiabilities,
      equity,
      cash,
      debt,

      // Cash Flow
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      capex,
      freeCashFlow,

      periods,
    };

    console.log("📊 [extractKeyMetrics] Metrics summary:");
    console.log(`   - Revenue: ${revenue ? "✅" : "❌"}`);
    console.log(`   - COGS: ${cogs ? "✅" : "❌"}`);
    console.log(`   - Gross Profit: ${grossProfit ? "✅" : "❌"}`);
    console.log(`   - Operating Income: ${operatingIncome ? "✅" : "❌"}`);
    console.log(`   - Net Income: ${netIncome ? "✅" : "❌"}`);
    console.log(`   - EPS: ${eps ? "✅" : "❌"}`);
    console.log(`   - Total Assets: ${totalAssets ? "✅" : "❌"}`);
    console.log(`   - Current Assets: ${currentAssets ? "✅" : "❌"}`);
    console.log(`   - Total Liabilities: ${totalLiabilities ? "✅" : "❌"}`);
    console.log(
      `   - Current Liabilities: ${currentLiabilities ? "✅" : "❌"}`
    );
    console.log(`   - Equity: ${equity ? "✅" : "❌"}`);
    console.log(`   - Operating Cash Flow: ${operatingCashFlow ? "✅" : "❌"}`);
    console.log(`   - Investing Cash Flow: ${investingCashFlow ? "✅" : "❌"}`);
    console.log(`   - Financing Cash Flow: ${financingCashFlow ? "✅" : "❌"}`);

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
