// app/filing-viewer/components/TwoLayerFinancialsSection.tsx
import { TwoLayerFinancials } from "@/app/api/analyze-sec/schemas/TwoLayerFinancialsSchema";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";
import { useState } from "react";

interface TwoLayerFinancialsSectionProps {
  data: TwoLayerFinancials;
  onExcerptClick: (id: string) => void;
}

// Helper components
const MetricRow = ({
  label,
  current,
  previous,
  change,
  changePercent,
}: any) => {
  const isNegative = changePercent?.includes("-");
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-semibold text-gray-900">{current}</div>
          <div className="text-xs text-gray-500">Prev: {previous}</div>
        </div>
        {changePercent && (
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              isNegative
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {changePercent}
          </span>
        )}
      </div>
    </div>
  );
};

export function TwoLayerFinancialsSection({
  data,
  onExcerptClick,
}: TwoLayerFinancialsSectionProps) {
  const [activeTab, setActiveTab] = useState<"xbrl" | "narrative">("xbrl");

  return (
    <CollapsibleCard
      title="Financial Analysis (XBRL + Narrative)"
      icon={
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("xbrl")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "xbrl"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          📊 XBRL Metrics
        </button>
        <button
          onClick={() => setActiveTab("narrative")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "narrative"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          📝 Narrative Analysis
        </button>
      </div>

      {/* XBRL Tab */}
      {activeTab === "xbrl" && data.xbrlMetrics && (
        <div className="space-y-6">
          {/* Income Statement */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Income Statement
            </h4>
            <div className="space-y-1">
              <MetricRow
                label="Revenue"
                current={data.xbrlMetrics.incomeStatement.revenue.current}
                previous={data.xbrlMetrics.incomeStatement.revenue.previous}
                changePercent={
                  data.xbrlMetrics.incomeStatement.revenue.changePercentage
                }
              />
              <MetricRow
                label="Gross Profit"
                current={data.xbrlMetrics.incomeStatement.grossProfit.current}
                previous={data.xbrlMetrics.incomeStatement.grossProfit.previous}
                changePercent={
                  data.xbrlMetrics.incomeStatement.grossProfit.changePercentage
                }
              />
              <MetricRow
                label="Operating Income"
                current={
                  data.xbrlMetrics.incomeStatement.operatingIncome.current
                }
                previous={
                  data.xbrlMetrics.incomeStatement.operatingIncome.previous
                }
                changePercent={
                  data.xbrlMetrics.incomeStatement.operatingIncome
                    .changePercentage
                }
              />
              <MetricRow
                label="Net Income"
                current={data.xbrlMetrics.incomeStatement.netIncome.current}
                previous={data.xbrlMetrics.incomeStatement.netIncome.previous}
                changePercent={
                  data.xbrlMetrics.incomeStatement.netIncome.changePercentage
                }
              />
              <MetricRow
                label="EPS (Diluted)"
                current={data.xbrlMetrics.incomeStatement.eps.current}
                previous={data.xbrlMetrics.incomeStatement.eps.previous}
                changePercent={
                  data.xbrlMetrics.incomeStatement.eps.changePercentage
                }
              />
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Balance Sheet</h4>
            <div className="space-y-1">
              <MetricRow
                label="Total Assets"
                current={data.xbrlMetrics.balanceSheet.totalAssets.current}
                previous={data.xbrlMetrics.balanceSheet.totalAssets.previous}
                changePercent={
                  data.xbrlMetrics.balanceSheet.totalAssets.changePercentage
                }
              />
              <MetricRow
                label="Current Assets"
                current={data.xbrlMetrics.balanceSheet.currentAssets.current}
                previous={data.xbrlMetrics.balanceSheet.currentAssets.previous}
                changePercent={
                  data.xbrlMetrics.balanceSheet.currentAssets.changePercentage
                }
              />
              <MetricRow
                label="Total Liabilities"
                current={data.xbrlMetrics.balanceSheet.totalLiabilities.current}
                previous={
                  data.xbrlMetrics.balanceSheet.totalLiabilities.previous
                }
                changePercent={
                  data.xbrlMetrics.balanceSheet.totalLiabilities
                    .changePercentage
                }
              />
              <MetricRow
                label="Shareholders' Equity"
                current={
                  data.xbrlMetrics.balanceSheet.shareholdersEquity.current
                }
                previous={
                  data.xbrlMetrics.balanceSheet.shareholdersEquity.previous
                }
                changePercent={
                  data.xbrlMetrics.balanceSheet.shareholdersEquity
                    .changePercentage
                }
              />
            </div>
          </div>

          {/* Cash Flow */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Cash Flow</h4>
            <div className="space-y-1">
              <MetricRow
                label="Operating Cash Flow"
                current={data.xbrlMetrics.cashFlow.operatingCashFlow.current}
                previous={data.xbrlMetrics.cashFlow.operatingCashFlow.previous}
                changePercent={
                  data.xbrlMetrics.cashFlow.operatingCashFlow.changePercentage
                }
              />
              <MetricRow
                label="Investing Cash Flow"
                current={data.xbrlMetrics.cashFlow.investingCashFlow.current}
                previous={data.xbrlMetrics.cashFlow.investingCashFlow.previous}
                changePercent={
                  data.xbrlMetrics.cashFlow.investingCashFlow.changePercentage
                }
              />
              <MetricRow
                label="Financing Cash Flow"
                current={data.xbrlMetrics.cashFlow.financingCashFlow.current}
                previous={data.xbrlMetrics.cashFlow.financingCashFlow.previous}
                changePercent={
                  data.xbrlMetrics.cashFlow.financingCashFlow.changePercentage
                }
              />
            </div>
          </div>

          {/* Ratios */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Current Ratio</div>
              <div className="text-lg font-bold">
                {data.xbrlMetrics.liquidityRatios.currentRatio.current}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {data.xbrlMetrics.liquidityRatios.currentRatio.previous}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Gross Margin</div>
              <div className="text-lg font-bold">
                {data.xbrlMetrics.profitabilityRatios.grossMargin.current}
              </div>
              <div className="text-xs text-gray-500">
                Prev:{" "}
                {data.xbrlMetrics.profitabilityRatios.grossMargin.previous}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Net Margin</div>
              <div className="text-lg font-bold">
                {data.xbrlMetrics.profitabilityRatios.netMargin.current}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {data.xbrlMetrics.profitabilityRatios.netMargin.previous}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Narrative Tab */}
      {activeTab === "narrative" && data.narrativeAnalysis && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <InfoBlock title="Executive Summary" variant="info">
            <p className="text-gray-700 mb-2">
              {data.narrativeAnalysis.executiveSummary.overview}
            </p>
            {data.narrativeAnalysis.executiveSummary.keyHighlights.length >
              0 && (
              <ul className="list-disc ml-4 space-y-1">
                {data.narrativeAnalysis.executiveSummary.keyHighlights.map(
                  (highlight, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {highlight}
                    </li>
                  )
                )}
              </ul>
            )}
            <div className="mt-3">
              <ExcerptLink
                excerptId={
                  (data.narrativeAnalysis.executiveSummary as any).excerptId
                }
                onClick={onExcerptClick}
              />
            </div>
          </InfoBlock>

          {/* Key Insights */}
          {data.narrativeAnalysis.keyInsights.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
              <div className="space-y-2">
                {data.narrativeAnalysis.keyInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 border-l-4 ${
                      insight.significance === "high"
                        ? "bg-red-50 border-red-500"
                        : insight.significance === "medium"
                        ? "bg-yellow-50 border-yellow-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {insight.topic}
                    </div>
                    <p className="text-sm text-gray-700">{insight.summary}</p>
                    <div className="mt-2">
                      <ExcerptLink
                        excerptId={(insight as any).excerptId}
                        onClick={onExcerptClick}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commitments & Contingencies */}
          {data.narrativeAnalysis.commitmentsContingencies.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Commitments & Contingencies
              </h4>
              <div className="space-y-2">
                {data.narrativeAnalysis.commitmentsContingencies.map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {item.type}
                        </span>
                        {item.amount && (
                          <span className="text-sm font-semibold text-orange-700">
                            {item.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {item.description}
                      </p>
                      {item.timing && (
                        <p className="text-xs text-gray-600">
                          Timeline: {item.timing}
                        </p>
                      )}
                      <div className="mt-2">
                        <ExcerptLink
                          excerptId={(item as any).excerptId}
                          onClick={onExcerptClick}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Accounting Policies */}
          {data.narrativeAnalysis.accountingPolicies.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Significant Accounting Policies
              </h4>
              <div className="space-y-2">
                {data.narrativeAnalysis.accountingPolicies
                  .slice(0, 3)
                  .map((policy, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                    >
                      <div className="font-medium text-gray-900 mb-1">
                        {policy.policy}
                      </div>
                      <p className="text-sm text-gray-700">
                        {policy.description}
                      </p>
                      {policy.changes && (
                        <p className="text-xs text-orange-600 mt-1">
                          Change: {policy.changes}
                        </p>
                      )}
                      <div className="mt-2">
                        <ExcerptLink
                          excerptId={(policy as any).excerptId}
                          onClick={onExcerptClick}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Risks Identified */}
          {data.narrativeAnalysis.risksIdentified.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Risks Identified
              </h4>
              <div className="space-y-2">
                {data.narrativeAnalysis.risksIdentified.map((risk, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {risk.risk}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {risk.description}
                    </p>
                    {risk.mitigationStrategy && (
                      <p className="text-xs text-green-700">
                        <span className="font-medium">Mitigation:</span>{" "}
                        {risk.mitigationStrategy}
                      </p>
                    )}
                    <div className="mt-2">
                      <ExcerptLink
                        excerptId={(risk as any).excerptId}
                        onClick={onExcerptClick}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Assessment */}
          <InfoBlock title="Overall Assessment" variant="success">
            {data.narrativeAnalysis.overallAssessment.strengths.length > 0 && (
              <div className="mb-3">
                <span className="font-medium text-sm">Strengths:</span>
                <ul className="list-disc ml-4 mt-1">
                  {data.narrativeAnalysis.overallAssessment.strengths.map(
                    (s, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        {s}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            {data.narrativeAnalysis.overallAssessment.concerns.length > 0 && (
              <div className="mb-3">
                <span className="font-medium text-sm">Concerns:</span>
                <ul className="list-disc ml-4 mt-1">
                  {data.narrativeAnalysis.overallAssessment.concerns.map(
                    (c, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        {c}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            <p className="text-sm text-gray-700">
              {data.narrativeAnalysis.overallAssessment.summary}
            </p>
            <div className="mt-3">
              <ExcerptLink
                excerptId={
                  (data.narrativeAnalysis.overallAssessment as any).excerptId
                }
                onClick={onExcerptClick}
              />
            </div>
          </InfoBlock>
        </div>
      )}
    </CollapsibleCard>
  );
}
