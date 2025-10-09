// app/filing-viewer/page.tsx
"use client";

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { SECAnalysis } from "@/app/api/analyze-sec/models/sec-analysis";
import { BusinessAnalysis } from "@/app/api/analyze-sec/schemas/businessAnalysisSchema";
import { RiskAnalysis } from "@/app/api/analyze-sec/schemas/riskAnalysisSchema";
import { PropertyAnalysis } from "@/app/api/analyze-sec/schemas/propertyAnalysisSchema";
import { LegalAnalysis } from "@/app/api/analyze-sec/schemas/legalAnalysisSchema";
import { MDAAnalysis } from "@/app/api/analyze-sec/schemas/mdaAnalysisSchema";
import { MarketRiskAnalysis } from "@/app/api/analyze-sec/schemas/marketRiskAnalysisSchema";
import { FinancialAnalysis } from "@/app/api/analyze-sec/schemas/financialsAnalysisSchema";
import { ControlsAnalysis } from "@/app/api/analyze-sec/schemas/controlsSchema";
import { DirectorsAnalysis } from "@/app/api/analyze-sec/schemas/directorsAnalysisSchema";

interface FilingData {
  analysis: SECAnalysis;
  fullOriginalHtml: string;
  filingInfo: {
    ticker: string;
    filingType: string;
    year: string;
    companyName: string;
  };
  error?: string;
}

type TabType =
  | "business"
  | "risks"
  | "properties"
  | "legal"
  | "mda"
  | "financials"
  | "marketRisk"
  | "controls"
  | "directors";

export default function FilingViewerPage() {
  const [data, setData] = useState<FilingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("AAPL");
  const [filingType, setFilingType] = useState("10-K");
  const [year, setYear] = useState("2023");
  const [activeExcerptId, setActiveExcerptId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("business");

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    setActiveExcerptId(null);
    try {
      const response = await fetch("/api/analyze-sec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker, filingType, year }),
      });

      const result: FilingData = await response.json();
      if (response.ok && !result.error) {
        const sanitizedHtml = DOMPurify.sanitize(result.fullOriginalHtml, {
          ADD_TAGS: ["span"],
          ADD_ATTR: ["id", "class"],
        });
        setData({ ...result, fullOriginalHtml: sanitizedHtml });
      } else {
        setData({
          ...result,
          error: result.error || "Failed to fetch data",
        } as FilingData);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setData({
        analysis: {} as SECAnalysis,
        fullOriginalHtml: "",
        filingInfo: {
          ticker: ticker,
          filingType: filingType,
          year: year,
          companyName: "N/A",
        },
        error: error.message || "Network or server error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .highlight-excerpt {
        background-color: rgba(255, 255, 0, 0.2);
        border-bottom: 2px dashed #ffd700;
        transition: all 0.3s ease-in-out;
        cursor: pointer;
        padding: 0 2px;
      }
      .highlight-excerpt:hover {
        background-color: rgba(255, 255, 0, 0.4);
      }
      .highlight-excerpt.active-highlight {
        background-color: #ffeb3b;
        box-shadow: 0 0 15px #ffeb3b;
        animation: pulse 1.5s ease-in-out;
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 5px #ffeb3b; }
        50% { box-shadow: 0 0 20px #ffeb3b; }
        100% { box-shadow: 0 0 5px #ffeb3b; }
      }
      .sec-document table { 
        width: 100% !important; 
        border-collapse: collapse; 
      }
      .sec-document td, .sec-document th { 
        padding: 8px; 
        border: 1px solid #ddd; 
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const scrollToExcerpt = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      if (activeExcerptId) {
        const prevActive = document.getElementById(activeExcerptId);
        if (prevActive) {
          prevActive.classList.remove("active-highlight");
        }
      }

      element.classList.add("active-highlight");
      setActiveExcerptId(id);
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        element.classList.remove("active-highlight");
        setActiveExcerptId(null);
      }, 3000);
    }
  };

  // Business Section Insights
  const BusinessInsights = ({ business }: { business: BusinessAnalysis }) => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-semibold text-blue-800 mb-2">Business Summary</h4>
        <p className="text-sm text-gray-700 mb-2">{business.summary}</p>
        {(business as any).summaryExcerptId && (
          <button
            onClick={() => scrollToExcerpt((business as any).summaryExcerptId)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View in document
          </button>
        )}
      </div>

      {business.keyProducts && business.keyProducts.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
          <h4 className="font-semibold text-green-800 mb-2">Key Products</h4>
          {business.keyProducts.map((product, index) => (
            <div
              key={index}
              className="mb-2 pb-2 border-b border-green-200 last:border-0"
            >
              <p className="text-sm">
                <strong>{product.name}:</strong> {product.marketPosition}
              </p>
              {(product as any).originalExcerptId && (
                <button
                  onClick={() =>
                    scrollToExcerpt((product as any).originalExcerptId)
                  }
                  className="text-green-600 hover:text-green-800 text-xs mt-1"
                >
                  View excerpt →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {business.competitiveAdvantages &&
        business.competitiveAdvantages.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
            <h4 className="font-semibold text-purple-800 mb-2">
              Competitive Advantages
            </h4>
            {business.competitiveAdvantages.map((advantage, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm text-gray-700">{advantage.description}</p>
                {(advantage as any).originalExcerptId && (
                  <button
                    onClick={() =>
                      scrollToExcerpt((advantage as any).originalExcerptId)
                    }
                    className="text-purple-600 hover:text-purple-800 text-xs mt-1"
                  >
                    View excerpt →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );

  // Risk Section Insights
  const RiskInsights = ({ risks }: { risks: RiskAnalysis }) => (
    <div className="space-y-4">
      <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
        <h4 className="font-semibold text-red-800 mb-2">
          Overall Risk Summary
        </h4>
        <p className="text-sm text-gray-700">{risks.overallRiskSummary}</p>
      </div>

      {risks.risks &&
        risks.risks.map((risk, index) => {
          const severityColors: Record<string, string> = {
            high: "bg-red-100 border-red-500",
            medium: "bg-yellow-100 border-yellow-500",
            low: "bg-green-100 border-green-500",
          };

          const colorClass =
            severityColors[risk.severity] || "bg-gray-100 border-gray-500";

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${colorClass}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-gray-800">{risk.title}</h5>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    risk.severity === "high"
                      ? "bg-red-200 text-red-800"
                      : risk.severity === "medium"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {risk.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1">{risk.description}</p>
              <p className="text-xs text-gray-600">
                <strong>Category:</strong> {risk.category}
              </p>
              {(risk as any).originalExcerptId && (
                <button
                  onClick={() =>
                    scrollToExcerpt((risk as any).originalExcerptId)
                  }
                  className="text-red-600 hover:text-red-800 text-xs mt-2"
                >
                  View in document →
                </button>
              )}
            </div>
          );
        })}
    </div>
  );

  // Properties Section Insights
  const PropertiesInsights = ({
    properties,
  }: {
    properties: PropertyAnalysis;
  }) => (
    <div className="space-y-4">
      <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-400">
        <h4 className="font-semibold text-teal-800 mb-2">
          Properties Overview
        </h4>
        <p className="text-sm text-gray-700 mb-1">
          {properties.propertiesOverview?.summary}
        </p>
        <p className="text-xs text-gray-600">
          <strong>Ownership Type:</strong>{" "}
          {properties.propertiesOverview?.ownershipType}
        </p>
        {(properties.propertiesOverview as any)?.excerptId && (
          <button
            onClick={() =>
              scrollToExcerpt((properties.propertiesOverview as any).excerptId)
            }
            className="text-teal-600 hover:text-teal-800 text-xs mt-2"
          >
            View in document →
          </button>
        )}
      </div>

      {properties.keyProperties &&
        properties.keyProperties.map((property, index) => (
          <div
            key={index}
            className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400"
          >
            <h5 className="font-semibold text-gray-800 text-sm">
              {property.type}
            </h5>
            <p className="text-xs text-gray-600">{property.location}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <strong>Status:</strong> {property.status}
              </div>
              <div>
                <strong>Size:</strong> {property.size}
              </div>
              <div>
                <strong>Use:</strong> {property.primaryUse}
              </div>
              <div>
                <strong>Capacity:</strong> {property.capacity}
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  // Legal Section Insights
  const LegalInsights = ({ legal }: { legal: LegalAnalysis }) => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
        <h4 className="font-semibold text-purple-800 mb-2">Legal Summary</h4>
        <p className="text-sm text-gray-700">{legal.overallLegalSummary}</p>
        {(legal as any).overallLegalSummaryExcerptId && (
          <button
            onClick={() =>
              scrollToExcerpt((legal as any).overallLegalSummaryExcerptId)
            }
            className="text-purple-600 hover:text-purple-800 text-xs mt-2"
          >
            View in document →
          </button>
        )}
      </div>

      {legal.materialCases && legal.materialCases.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Material Cases</h4>
          {legal.materialCases.map((legalCase, index) => (
            <div
              key={index}
              className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400"
            >
              <h5 className="font-semibold text-sm text-red-800">
                {legalCase.caseTitle}
              </h5>
              <p className="text-xs text-gray-700 mt-1">
                <strong>Nature:</strong> {legalCase.natureOfClaim}
              </p>
              <p className="text-xs text-gray-700">
                <strong>Status:</strong> {legalCase.currentStatus}
              </p>
              {legalCase.potentialFinancialImpact && (
                <p className="text-xs text-gray-700">
                  <strong>Potential Impact:</strong>{" "}
                  {legalCase.potentialFinancialImpact.estimatedLossRange}
                </p>
              )}
              {(legalCase as any).caseTitleExcerptId && (
                <button
                  onClick={() =>
                    scrollToExcerpt((legalCase as any).caseTitleExcerptId)
                  }
                  className="text-red-600 hover:text-red-800 text-xs mt-2"
                >
                  View case details →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // MDA Section Insights
  const MDAInsights = ({ mda }: { mda: MDAAnalysis }) => (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {mda.businessOverview && (
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
          <h4 className="font-semibold text-orange-800 mb-2">
            Business Overview
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            {mda.businessOverview.executiveSummary}
          </p>
          {mda.businessOverview.keyStrategies && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-600">
                Key Strategies:
              </p>
              <ul className="text-xs text-gray-700 ml-4 list-disc">
                {mda.businessOverview.keyStrategies
                  .slice(0, 3)
                  .map((strategy, i) => (
                    <li key={i}>{strategy}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {mda.currentPeriodHighlights && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-semibold text-blue-800 mb-2">
            Period Highlights
          </h4>
          {mda.currentPeriodHighlights.keyAchievements && (
            <ul className="text-sm text-gray-700 list-disc ml-4">
              {mda.currentPeriodHighlights.keyAchievements
                .slice(0, 3)
                .map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
            </ul>
          )}
          {(mda.currentPeriodHighlights as any).excerptId && (
            <button
              onClick={() =>
                scrollToExcerpt((mda.currentPeriodHighlights as any).excerptId)
              }
              className="text-blue-600 hover:text-blue-800 text-xs mt-2"
            >
              View highlights →
            </button>
          )}
        </div>
      )}

      {mda.resultsOfOperations?.revenueAnalysis && (
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
          <h4 className="font-semibold text-green-800 mb-2">
            Revenue Analysis
          </h4>
          {mda.resultsOfOperations.revenueAnalysis.totalRevenue && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-600">Current:</p>
                <p className="font-semibold">
                  {
                    mda.resultsOfOperations.revenueAnalysis.totalRevenue
                      .currentPeriod?.value
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Prior:</p>
                <p className="font-semibold">
                  {
                    mda.resultsOfOperations.revenueAnalysis.totalRevenue
                      .priorPeriod?.value
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {mda.liquidityAndCapitalResources && (
        <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-400">
          <h4 className="font-semibold text-teal-800 mb-2">
            Liquidity & Capital
          </h4>
          {mda.liquidityAndCapitalResources.cashPosition?.currentCash && (
            <p className="text-sm text-gray-700">
              <strong>Current Cash:</strong>{" "}
              {mda.liquidityAndCapitalResources.cashPosition.currentCash}
            </p>
          )}
          {mda.liquidityAndCapitalResources.capitalStructure?.totalDebt && (
            <p className="text-sm text-gray-700">
              <strong>Total Debt:</strong>{" "}
              {mda.liquidityAndCapitalResources.capitalStructure.totalDebt}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Financials Section Insights
  const FinancialsInsights = ({
    financials,
  }: {
    financials: FinancialAnalysis;
  }) => (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-400">
        <h4 className="font-semibold text-emerald-800 mb-2">
          Financial Performance
        </h4>

        {/* Revenue */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600">Revenue:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Previous:</span>
              <p className="font-semibold">
                {financials.revenueAnalysis?.previousYear?.value}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Current:</span>
              <p className="font-semibold">
                {financials.revenueAnalysis?.currentYear?.value}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Change:</span>
              <p
                className={`font-semibold ${
                  financials.revenueAnalysis?.changePercentage?.includes("-")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {financials.revenueAnalysis?.changePercentage}
              </p>
            </div>
          </div>
          {(financials.revenueAnalysis as any)?.excerptId && (
            <button
              onClick={() =>
                scrollToExcerpt((financials.revenueAnalysis as any).excerptId)
              }
              className="text-emerald-600 hover:text-emerald-800 text-xs mt-1"
            >
              View details →
            </button>
          )}
        </div>

        {/* Net Income */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600">Net Income:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Previous:</span>
              <p className="font-semibold">
                {financials.netIncomeAnalysis?.previousYear?.value}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Current:</span>
              <p className="font-semibold">
                {financials.netIncomeAnalysis?.currentYear?.value}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Change:</span>
              <p
                className={`font-semibold ${
                  financials.netIncomeAnalysis?.changePercentage?.includes("-")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {financials.netIncomeAnalysis?.changePercentage}
              </p>
            </div>
          </div>
        </div>

        {/* EPS */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-600">EPS (Diluted):</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Previous:</span>
              <p className="font-semibold">
                {financials.epsDilutedAnalysis?.previousYear?.value}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Current:</span>
              <p className="font-semibold">
                {financials.epsDilutedAnalysis?.currentYear?.value}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Change:</span>
              <p
                className={`font-semibold ${
                  financials.epsDilutedAnalysis?.changePercentage?.includes("-")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {financials.epsDilutedAnalysis?.changePercentage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profitability Ratios */}
      {financials.profitabilityRatios && (
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
          <h4 className="font-semibold text-indigo-800 mb-2">
            Profitability Ratios
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-600">Gross Margin:</p>
              <p className="font-semibold">
                {financials.profitabilityRatios.grossProfitMargin?.currentYear}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Operating Margin:</p>
              <p className="font-semibold">
                {financials.profitabilityRatios.operatingMargin?.currentYear}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Net Margin:</p>
              <p className="font-semibold">
                {financials.profitabilityRatios.netProfitMargin?.currentYear}
              </p>
            </div>
            <div>
              <p className="text-gray-600">ROE:</p>
              <p className="font-semibold">
                {financials.profitabilityRatios.roe?.currentYear}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
        <h4 className="font-semibold text-yellow-800 mb-2">Key Insights</h4>
        <p className="text-sm text-gray-700">{financials.keyInsights}</p>
        {(financials as any).keyInsightsExcerptId && (
          <button
            onClick={() =>
              scrollToExcerpt((financials as any).keyInsightsExcerptId)
            }
            className="text-yellow-600 hover:text-yellow-800 text-xs mt-2"
          >
            View source →
          </button>
        )}
      </div>
    </div>
  );

  // Market Risk Section Insights
  const MarketRiskInsights = ({
    marketRisk,
  }: {
    marketRisk: MarketRiskAnalysis;
  }) => (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
        <h4 className="font-semibold text-indigo-800 mb-2">
          Market Risk Overview
        </h4>
        <p className="text-sm text-gray-700">
          {marketRisk.overallSummaryAndPhilosophy?.summary}
        </p>
        {(marketRisk.overallSummaryAndPhilosophy as any)?.originalExcerptId && (
          <button
            onClick={() =>
              scrollToExcerpt(
                (marketRisk.overallSummaryAndPhilosophy as any)
                  .originalExcerptId
              )
            }
            className="text-indigo-600 hover:text-indigo-800 text-xs mt-2"
          >
            View in document →
          </button>
        )}
      </div>

      {/* Interest Rate Risk */}
      {marketRisk.interestRateRisk && (
        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
          <h5 className="font-semibold text-blue-800 text-sm mb-1">
            Interest Rate Risk
          </h5>
          <p className="text-xs text-gray-700">
            {marketRisk.interestRateRisk.exposure}
          </p>
          {marketRisk.interestRateRisk.potentialImpact && (
            <p className="text-xs text-gray-600 mt-1">
              <strong>Impact:</strong>{" "}
              {marketRisk.interestRateRisk.potentialImpact.description}
            </p>
          )}
        </div>
      )}

      {/* Currency Risk */}
      {marketRisk.currencyRisk && (
        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
          <h5 className="font-semibold text-green-800 text-sm mb-1">
            Currency Risk
          </h5>
          <p className="text-xs text-gray-700">
            {marketRisk.currencyRisk.exposure}
          </p>
          {marketRisk.currencyRisk.potentialImpact && (
            <p className="text-xs text-gray-600 mt-1">
              <strong>Impact:</strong>{" "}
              {marketRisk.currencyRisk.potentialImpact.description}
            </p>
          )}
        </div>
      )}

      {/* Derivative Usage */}
      {marketRisk.derivativeFinancialInstrumentsUsage && (
        <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
          <h5 className="font-semibold text-purple-800 text-sm mb-1">
            Derivative Instruments
          </h5>
          <p className="text-xs text-gray-700">
            {marketRisk.derivativeFinancialInstrumentsUsage.summary}
          </p>
          {marketRisk.derivativeFinancialInstrumentsUsage.typesOfDerivatives
            ?.length > 0 && (
            <div className="mt-1">
              <p className="text-xs font-semibold text-gray-600">Types:</p>
              <ul className="text-xs text-gray-600 ml-3 list-disc">
                {marketRisk.derivativeFinancialInstrumentsUsage.typesOfDerivatives
                  .slice(0, 3)
                  .map((type, i) => (
                    <li key={i}>{type}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Controls Section Insights
  const ControlsInsights = ({ controls }: { controls: ControlsAnalysis }) => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-semibold text-blue-800 mb-2">
          Internal Controls Status
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-600">Disclosure Controls:</p>
            <p
              className={`text-sm font-semibold ${
                controls.managementConclusionDisclosureControls?.conclusion ===
                "effective"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {controls.managementConclusionDisclosureControls?.conclusion?.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">ICFR Assessment:</p>
            <p
              className={`text-sm font-semibold ${
                controls.managementReportICFR?.assessment === "effective"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {controls.managementReportICFR?.assessment?.toUpperCase()}
            </p>
          </div>
        </div>

        {(controls.managementConclusionDisclosureControls as any)
          ?.excerptId && (
          <button
            onClick={() =>
              scrollToExcerpt(
                (controls.managementConclusionDisclosureControls as any)
                  .excerptId
              )
            }
            className="text-blue-600 hover:text-blue-800 text-xs mt-2"
          >
            View assessment →
          </button>
        )}
      </div>

      {/* Material Weaknesses */}
      {controls.materialWeaknessesICFR &&
        controls.materialWeaknessesICFR.length > 0 &&
        controls.materialWeaknessesICFR[0].description !== "None reported." && (
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <h4 className="font-semibold text-red-800 mb-2">
              Material Weaknesses
            </h4>
            {controls.materialWeaknessesICFR.map((weakness, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm text-gray-700">{weakness.description}</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Impact:</strong> {weakness.potentialImpact}
                </p>
              </div>
            ))}
          </div>
        )}

      {/* Auditor Opinion */}
      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
        <h4 className="font-semibold text-gray-800 mb-2">Auditor Opinion</h4>
        <p
          className={`text-sm font-semibold ${
            controls.auditorOpinionICFR?.conclusion === "effective"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {controls.auditorOpinionICFR?.conclusion?.toUpperCase()}
        </p>
        {controls.auditorOpinionICFR?.differenceFromManagement !==
          "Not applicable." && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Differs from Management Assessment
          </p>
        )}
      </div>
    </div>
  );

  // Directors Section Insights
  const DirectorsInsights = ({
    directors,
  }: {
    directors: DirectorsAnalysis;
  }) => (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
        <h4 className="font-semibold text-indigo-800 mb-2">
          Board Composition
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-600">Total Directors:</p>
            <p className="font-semibold">
              {directors.boardCompositionOverview?.totalDirectors}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Independent:</p>
            <p className="font-semibold">
              {
                directors.boardCompositionOverview
                  ?.independentDirectorsPercentage
              }
            </p>
          </div>
        </div>
        {directors.boardCompositionOverview?.diversityComment &&
          directors.boardCompositionOverview.diversityComment !==
            "Not discussed." && (
            <p className="text-xs text-gray-700 mt-2">
              <strong>Diversity:</strong>{" "}
              {directors.boardCompositionOverview.diversityComment}
            </p>
          )}
        {(directors.boardCompositionOverview as any)?.originalExcerptId && (
          <button
            onClick={() =>
              scrollToExcerpt(
                (directors.boardCompositionOverview as any).originalExcerptId
              )
            }
            className="text-indigo-600 hover:text-indigo-800 text-xs mt-2"
          >
            View details →
          </button>
        )}
      </div>

      {/* Board Leadership */}
      <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
        <h4 className="font-semibold text-purple-800 mb-2">
          Leadership Structure
        </h4>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Chairman:</strong>{" "}
            {directors.boardLeadershipStructure?.chairman}
          </p>
          <p>
            <strong>CEO:</strong> {directors.boardLeadershipStructure?.ceo}
          </p>
          <p>
            <strong>Roles Combined:</strong>
            <span
              className={`ml-2 ${
                directors.boardLeadershipStructure?.rolesCombined
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {directors.boardLeadershipStructure?.rolesCombined ? "Yes" : "No"}
            </span>
          </p>
        </div>
      </div>

      {/* Board Committees */}
      {directors.boardCommittees && directors.boardCommittees.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-semibold text-blue-800 mb-2">Board Committees</h4>
          <div className="space-y-2">
            {directors.boardCommittees.slice(0, 3).map((committee, index) => (
              <div key={index} className="text-sm">
                <p className="font-semibold text-gray-700">
                  {committee.committeeName}
                </p>
                {committee.members && committee.members.length > 0 && (
                  <p className="text-xs text-gray-600">
                    Members:{" "}
                    {committee.members
                      .slice(0, 3)
                      .map((m) => m.name)
                      .join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Tab configuration
  const tabs = [
    {
      id: "business",
      label: "Business",
      show: !!data?.analysis?.sections?.business,
    },
    { id: "risks", label: "Risks", show: !!data?.analysis?.sections?.risks },
    {
      id: "properties",
      label: "Properties",
      show: !!data?.analysis?.sections?.properties,
    },
    { id: "legal", label: "Legal", show: !!data?.analysis?.sections?.legal },
    { id: "mda", label: "MD&A", show: !!data?.analysis?.sections?.mdna },
    {
      id: "financials",
      label: "Financials",
      show: !!data?.analysis?.sections?.financials,
    },
    {
      id: "marketRisk",
      label: "Market Risk",
      show: !!data?.analysis?.sections?.marketRisks,
    },
    {
      id: "controls",
      label: "Controls",
      show: !!data?.analysis?.sections?.controls,
    },
    {
      id: "directors",
      label: "Directors",
      show: !!data?.analysis?.sections?.directors,
    },
  ].filter((tab) => tab.show);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              SEC Filing Viewer
            </h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="px-3 py-2 border rounded-lg text-sm w-24"
              />
              <select
                value={filingType}
                onChange={(e) => setFilingType(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="10-K">10-K</option>
                <option value="10-Q">10-Q</option>
                <option value="8-K">8-K</option>
              </select>
              <input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-20"
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? "Loading..." : "Fetch Filing"}
              </button>
            </div>
          </div>

          {data && data.filingInfo && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{data.filingInfo.companyName}</span>{" "}
              •<span className="ml-2">{data.filingInfo.filingType}</span> •
              <span className="ml-2">Fiscal Year {data.filingInfo.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Fetching and analyzing SEC filing...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {data?.error && !loading && (
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{data.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {data && !loading && !data.error && (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel: Original SEC Document */}
          <div className="flex-1 overflow-auto bg-white border-r">
            <div className="p-6">
              <div
                className="sec-document prose max-w-none"
                dangerouslySetInnerHTML={{ __html: data.fullOriginalHtml }}
              />
            </div>
          </div>

          {/* Right Panel: AI Insights */}
          <div className="w-1/3 overflow-auto bg-gray-50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                AI Insights
              </h2>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 mb-4 border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {activeTab === "business" &&
                  data.analysis?.sections?.business && (
                    <BusinessInsights
                      business={data.analysis.sections.business}
                    />
                  )}
                {activeTab === "risks" && data.analysis?.sections?.risks && (
                  <RiskInsights risks={data.analysis.sections.risks} />
                )}
                {activeTab === "properties" &&
                  data.analysis?.sections?.properties && (
                    <PropertiesInsights
                      properties={data.analysis.sections.properties}
                    />
                  )}
                {activeTab === "legal" && data.analysis?.sections?.legal && (
                  <LegalInsights legal={data.analysis.sections.legal} />
                )}
                {activeTab === "mda" && data.analysis?.sections?.mdna && (
                  <MDAInsights mda={data.analysis.sections.mdna} />
                )}
                {activeTab === "financials" &&
                  data.analysis?.sections?.financials && (
                    <FinancialsInsights
                      financials={data.analysis.sections.financials}
                    />
                  )}
                {activeTab === "marketRisk" &&
                  data.analysis?.sections?.marketRisks && (
                    <MarketRiskInsights
                      marketRisk={data.analysis.sections.marketRisks}
                    />
                  )}
                {activeTab === "controls" &&
                  data.analysis?.sections?.controls && (
                    <ControlsInsights
                      controls={data.analysis.sections.controls}
                    />
                  )}
                {activeTab === "directors" &&
                  data.analysis?.sections?.directors && (
                    <DirectorsInsights
                      directors={data.analysis.sections.directors}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
