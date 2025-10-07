// types/sec-analysis.ts
export interface SECSearchRequest {
  ticker: string;
  filingType: string;
  year?: string;
}

export interface SECFiling {
  cik: string;
  ticker: string;
  companyName: string;
  filingType: string;
  filingDate: string;
  fiscalYear: string;
  htmlUrl: string;
}

export interface FinancialMetric {
  name?: string;
  value: string;
  change: string;
  analysis?: string;
  period: string;
}

export interface RiskFactor {
  id: string;
  category:
    | "operational"
    | "financial"
    | "regulatory"
    | "market"
    | "strategic"
    | string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low" | string;
  highlights?: string[];
}

export interface SECAnalysis {
  filing: SECFiling;
  sections: {
    business?: {
      summary: string;
      keyProducts: string[];
      markets: string[];
      competitivePosition: string;
      highlights?: string[];
    };
    risks?: RiskFactor[];
    legal?: {
      summary: string;
      materialCases?: string[];
      potentialImpact?: string;
    };
    mdna?: {
      executiveSummary: string;
      keyTrends: string[];
      futureOutlook: string;
      liquidity: string;
      criticalAccounting?: string;
      highlights?: string[];
    };
    marketRisk?: {
      summary: string;
      currencyRisk?: string;
      interestRateRisk?: string;
      hedgingStrategy?: string;
    };
    financials?: {
      revenue: FinancialMetric;
      netIncome: FinancialMetric;
      eps: FinancialMetric;
      unusualItems?: string[];
      accountingChanges?: string;
      keyRatios?: { name: string; value: string; analysis: string }[];
      highlights?: string[];
    };
    controls?: {
      summary: string;
      materialWeaknesses?: string[];
      assessment?: string;
    };
    directors?: {
      summary: string;
      keyExecutives?: string[];
      boardIndependence?: string;
    };
    compensation?: {
      summary: string;
      ceoTotalComp?: string;
      topExecutives?: string[];
      performanceBased?: string;
      redFlags?: string[];
    };
    ownership?: {
      summary: string;
      majorShareholders?: string[];
      insiderOwnership?: string;
    };
    relatedParty?: {
      summary: string;
      transactions?: string[];
      concerns?: string[];
    };
  };
  generatedAt: string;
}
