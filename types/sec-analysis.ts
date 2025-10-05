// types/sec-analysis.ts

export interface SECFiling {
  cik: string;
  ticker: string;
  companyName: string;
  filingType: "10-K" | "10-Q" | "8-K";
  filingDate: string;
  fiscalYear: string;
  htmlUrl: string;
}

export interface BusinessSection {
  summary: string;
  keyProducts: string[];
  markets: string[];
  competitivePosition: string;
  employees?: string;
  highlights: SectionHighlight[];
}

export interface RiskItem {
  id: string;
  category: "operational" | "financial" | "regulatory" | "market" | "strategic";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  highlights: SectionHighlight[];
}

export interface MDNASection {
  executiveSummary: string;
  keyTrends: string[];
  futureOutlook: string;
  liquidity: string;
  criticalAccounting: string;
  highlights: SectionHighlight[];
}

export interface FinancialMetric {
  name: string;
  value: string;
  change: string;
  analysis: string;
  period: string;
}

export interface FinancialSection {
  revenue: FinancialMetric;
  netIncome: FinancialMetric;
  eps: FinancialMetric;
  keyRatios: FinancialMetric[];
  highlights: SectionHighlight[];
}

export interface SectionHighlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  insightId: string;
  color: string;
}

export interface SECAnalysis {
  filing: SECFiling;
  sections: {
    business: BusinessSection;
    risks: RiskItem[];
    mdna: MDNASection;
    financials: FinancialSection;
  };
  generatedAt: string;
  htmlReport?: string;
}

export interface SECSearchRequest {
  ticker: string;
  filingType: "10-K" | "10-Q" | "8-K";
  year?: string;
}

export interface SECSearchResponse {
  filings: SECFiling[];
}
