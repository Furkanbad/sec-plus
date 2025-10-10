// app/api/analyze-sec/models/sec-analysis.ts

import {
  BusinessAnalysis,
  ControlsAnalysis,
  DirectorsAnalysis,
  FinancialAnalysis,
  LegalAnalysis,
  MarketRiskAnalysis,
  MDAAnalysis,
  PropertyAnalysis,
  RiskAnalysis,
} from "../schemas";

/**
 * SEC'den gelen dosyalama bilgileri
 * API'den dönen veriyle uyumlu interface
 */
export interface SECFiling {
  id: string;
  cik: string;
  ticker: string;
  companyName: string;
  filingType: string;
  filedAt: string; // ISO timestamp (örn: "2024-11-01T16:30:00-05:00")
  filingDate: string; // Formatlanmış tarih (örn: "2024-11-01")
  fiscalYear: number;
  htmlUrl: string; // linkToFilingDetails olarak gelir API'den
  reportDate: string;
  accessionNumber: string;
}

/**
 * Analiz için gelen istek gövdesi
 */
export interface SECSearchRequest {
  ticker: string;
  filingType: string;
  year?: number;
}

/**
 * Genel analiz yapısı
 */
export interface SECAnalysis {
  filing: SECFiling;
  sections: {
    business?: BusinessAnalysis;
    risks?: RiskAnalysis;
    properties?: PropertyAnalysis;
    legal?: LegalAnalysis;
    mdna?: MDAAnalysis;
    marketRisks?: MarketRiskAnalysis;
    financials?: FinancialAnalysis;
    controls?: ControlsAnalysis;
    directors?: DirectorsAnalysis;
    [key: string]: any; // Dinamik bölümler için
  };
  generatedAt: string;
}

/**
 * Frontend'e dönen nihai sonuç
 */
export interface SECAnalysisResult {
  analysis: SECAnalysis;
  fullOriginalHtml: string;
  filingInfo: {
    ticker: string;
    filingType: string;
    year: number;
    companyName: string;
  };
}
