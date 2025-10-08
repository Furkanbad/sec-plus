// types/sec-analysis.ts
import {
  BusinessAnalysis,
  MDAAnalysis,
  PropertyAnalysis,
  RiskAnalysis,
  LegalAnalysis,
  MarketRiskAnalysis,
  FinancialAnalysis,
  ControlsAnalysis,
  DirectorsAnalysis,
} from "@/app/api/analyze-sec/schemas";

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

// ANA SECAnalysis Arayüzü
export interface SECAnalysis {
  filing: SECFiling;
  sections: {
    business?: BusinessAnalysis;
    properties?: PropertyAnalysis;
    risks?: RiskAnalysis;
    legal?: LegalAnalysis;
    mdna?: MDAAnalysis;
    marketRisks?: MarketRiskAnalysis;
    financials?: FinancialAnalysis;
    controls?: ControlsAnalysis;
    directors?: DirectorsAnalysis;
  };
  generatedAt: string;
}
