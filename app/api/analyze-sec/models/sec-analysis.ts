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

// SEC'den gelen dosyalama bilgileri
export interface SECFiling {
  id: string;
  ticker: string;
  filingType: string;
  filedAt: string;
  fiscalYear: number;
  htmlUrl: string;
  companyName: string;
  reportDate: string;
  accessionNumber: string;
}

// Analiz için gelen istek gövdesi
export interface SECSearchRequest {
  ticker: string;
  filingType: string;
  year?: number;
}

// Genel analiz yapısı
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
    [key: string]: any; // Dizin imzası
  };
  generatedAt: string;
}

// Frontend'e dönen nihai sonuç
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

// ... Diğer tüm `BusinessAnalysis`, `RiskAnalysis` vb. detaylı tipler buraya taşınabilir.
// Veya bu detaylı tipler `app/api/analyze-sec/schemas` dizinindeki kendi şema dosyalarından
// türetilerek dışa aktarılabilir ve burada birleştirilebilir.
