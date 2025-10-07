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

// Yeni FinancialMetric tanımı (Eğer profit analysis için ayrı bir tanım gerekirse)
export interface ProfitMetric {
  value: string;
  period: string;
}

export interface DetailedFinancialValue {
  currentYear: ProfitMetric;
  previousYear: ProfitMetric;
  changeAbsolute: string;
  changePercentage: string;
  // Diğer açıklamalar
  drivers?: string;
  factors?: string;
  efficiencyComment?: string;
  contributors?: string;
}

export interface ProfitMargin {
  currentYear: string; // "X%" formatında
  previousYear: string; // "Y%" formatında
}

export interface NoteworthyItem {
  description: string;
  type: "unusual_item" | "adjustment" | "footnote" | string;
}

export interface RiskFactor {
  id: string; // frontend'de listeler için benzersiz ID
  category:
    | "operational"
    | "financial"
    | "regulatory"
    | "market"
    | "strategic"
    | "cybersecurity"
    | "environmental"
    | "other"; // Genişletilmiş kategori
  title: string;
  description: string;
  potentialImpact: string; // Yeni eklendi
  mitigationStrategies: string | string[]; // Yeni eklendi, metin veya dizi olabilir
  severity: "high" | "medium" | "low";
  originalExcerpt: string; // Yeni ve zorunlu eklendi
}

export interface LegalCase {
  caseTitle: string;
  natureOfClaim: string;
  currentStatus: string;
  companyPosition: string;
  potentialFinancialImpact: {
    estimatedLossRange: string;
    reservesSetAside: string;
    impactDescription: string;
    insuranceCoverage: string; // "Yes|No|Not specified"
  };
  keyDates: string[];
}

export interface TrendUncertaintyOpportunity {
  itemDescription: string;
  impactBenefit: string;
}

export interface CriticalAccountingPolicy {
  policyName: string;
  explanation: string;
}

export interface MarketRiskDetail {
  exposure: string;
  potentialImpact: string;
  mitigationStrategies: string[]; // Artık string dizisi
}

// ANA SECAnalysis Arayüzü
export interface SECAnalysis {
  filing: SECFiling;
  sections: {
    business?: {
      summary: string;
      keyProducts: { name: string; marketPosition: string }[]; // Güncellendi
      markets: string[];
      competitiveAdvantages: string[]; // Yeni eklendi
      growthStrategiesOpportunities: string[]; // Yeni eklendi
    };
    risks?: RiskFactor[]; // RiskFactor arayüzü güncellendi
    legal?: {
      title: string; // Yeni eklendi
      overallLegalSummary: string; // Yeni eklendi
      materialCases?: LegalCase[]; // LegalCase arayüzü eklendi
      regulatoryInquiries?: string; // Yeni eklendi
      environmentalLitigation?: string; // Yeni eklendi
      overallRiskAssessment?: string; // Yeni eklendi
    };
    mdna?: {
      title: string; // Yeni eklendi
      executiveSummary: string;
      resultsOfOperations: {
        // Yeni alt obje
        revenueAnalysis: string;
        costOfSalesAnalysis: string;
        operatingExpensesAnalysis: string;
        otherIncomeExpense: string;
      };
      liquidityAndCapitalResources: {
        // Yeni alt obje
        currentLiquidity: string;
        capitalResources: string;
        cashFlowAnalysis: string;
        futureCapitalNeeds: string;
      };
      criticalAccountingPolicies: CriticalAccountingPolicy[]; // Yeni eklendi
      offBalanceSheetArrangements: string; // Yeni eklendi
      knownTrendsUncertaintiesOpportunities: TrendUncertaintyOpportunity[]; // Güncellendi
      strategicOutlookAndFuturePlans: string; // Güncellendi
    };
    marketRisk?: {
      title: string; // Yeni eklendi
      overallSummary: string; // Yeni eklendi
      interestRateRisk: MarketRiskDetail; // MarketRiskDetail arayüzü kullanıldı
      currencyRisk: MarketRiskDetail;
      commodityPriceRisk: MarketRiskDetail; // Yeni eklendi
      equityPriceRisk: MarketRiskDetail; // Yeni eklendi
      overallHedgingStrategy: string; // Yeni eklendi
      keyTakeawaysConcerns: string[]; // Yeni eklendi
    };
    financials?: {
      title: string; // Yeni eklendi
      revenue: DetailedFinancialValue; // DetailedFinancialValue arayüzü kullanıldı
      grossProfit: DetailedFinancialValue; // Yeni eklendi
      operatingIncome: DetailedFinancialValue; // Yeni eklendi
      netIncome: DetailedFinancialValue; // DetailedFinancialValue arayüzü kullanıldı
      epsDiluted: DetailedFinancialValue; // DetailedFinancialValue arayüzü kullanıldı
      profitMargins: {
        // Yeni alt obje
        grossProfitMargin: ProfitMargin;
        operatingMargin: ProfitMargin;
        netProfitMargin: ProfitMargin;
        trendComment: string;
      };
      noteworthyItems: NoteworthyItem[]; // NoteworthyItem arayüzü kullanıldı
      overallAnalysis: string; // Yeni eklendi
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
