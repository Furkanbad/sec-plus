// components/sec-test-components/MDASection.tsx
import { MDAAnalysis } from "@/app/api/analyze-sec/schemas/mdaAnalysisSchema";

interface MDASectionProps {
  data: MDAAnalysis;
}

// Helper component for rendering excerpts
const ExcerptBlock = ({
  excerpt,
  variant = "default",
}: {
  excerpt?: string;
  variant?: "default" | "blue" | "green" | "teal" | "orange" | "indigo";
}) => {
  if (
    !excerpt ||
    excerpt === "No excerpt available." ||
    excerpt === "No direct excerpt found."
  )
    return null;

  const variants = {
    default: "border-l-orange-400 text-gray-700 bg-orange-50/50",
    blue: "border-l-blue-400 text-gray-700 bg-blue-50/50",
    green: "border-l-green-400 text-gray-700 bg-green-50/50",
    teal: "border-l-teal-400 text-gray-700 bg-teal-50/50",
    orange: "border-l-orange-400 text-gray-700 bg-orange-50/50",
    indigo: "border-l-indigo-400 text-gray-700 bg-indigo-50/50",
  };

  return (
    <blockquote
      className={`mt-3 pl-4 border-l-3 text-xs italic ${variants[variant]} p-3 rounded-r`}
    >
      "{excerpt}"
    </blockquote>
  );
};

export function MDASection({ data }: MDASectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <h4 className="text-3xl font-bold text-orange-600 border-b-2 border-orange-200 pb-2">
        {data.title}
      </h4>

      {/* Executive Summary */}
      {data.businessOverview && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-sm border border-orange-200">
          <h5 className="text-lg font-bold text-orange-800 mb-3 flex items-center">
            <span className="w-1.5 h-6 bg-orange-600 rounded-full mr-3"></span>
            Business Overview
          </h5>
          <p className="text-sm text-gray-800 leading-relaxed mb-2">
            {data.businessOverview.executiveSummary}
          </p>
          {data.businessOverview.businessDescription && (
            <p className="text-sm text-gray-700 leading-relaxed mt-3">
              <span className="font-semibold">Core Business:</span>{" "}
              {data.businessOverview.businessDescription}
            </p>
          )}
          {data.businessOverview.excerpts?.map((excerpt, idx) => (
            <ExcerptBlock key={idx} excerpt={excerpt} variant="orange" />
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Financial Highlights */}
        {data.currentPeriodHighlights && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Financial Highlights
            </h5>
            {data.currentPeriodHighlights.fiscalYearEnd && (
              <p className="text-xs text-gray-500 mb-3">
                {data.currentPeriodHighlights.fiscalYearEnd}
              </p>
            )}
            {data.currentPeriodHighlights.financialHighlights &&
              data.currentPeriodHighlights.financialHighlights.length > 0 && (
                <ul className="space-y-2.5">
                  {data.currentPeriodHighlights.financialHighlights
                    .slice(0, 4)
                    .map((item, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600 font-medium">
                            {item.metric}:
                          </span>
                          <span className="text-gray-900 font-semibold ml-2">
                            {item.value}
                          </span>
                        </div>
                        {item.trend && (
                          <span className="text-xs text-blue-600 mt-0.5 block">
                            {item.trend}
                          </span>
                        )}
                      </li>
                    ))}
                  {data.currentPeriodHighlights.financialHighlights.length >
                    4 && (
                    <li className="text-xs text-gray-400 pt-1">
                      +
                      {data.currentPeriodHighlights.financialHighlights.length -
                        4}{" "}
                      more metrics
                    </li>
                  )}
                </ul>
              )}
            <ExcerptBlock
              excerpt={data.currentPeriodHighlights.excerpt}
              variant="blue"
            />
          </div>
        )}

        {/* Results of Operations */}
        {data.resultsOfOperations?.overallPerformance && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Results of Operations
            </h5>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              {data.resultsOfOperations.overallPerformance.summary.length > 180
                ? `${data.resultsOfOperations.overallPerformance.summary.substring(
                    0,
                    180
                  )}...`
                : data.resultsOfOperations.overallPerformance.summary}
            </p>
            {data.resultsOfOperations.overallPerformance.keyPoints &&
              data.resultsOfOperations.overallPerformance.keyPoints.length >
                0 && (
                <ul className="space-y-1.5 mb-2">
                  {data.resultsOfOperations.overallPerformance.keyPoints
                    .slice(0, 3)
                    .map((point, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-600 flex items-start"
                      >
                        <span className="text-green-500 mr-2 mt-0.5">▪</span>
                        <span>
                          {point.length > 90
                            ? `${point.substring(0, 90)}...`
                            : point}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            {data.resultsOfOperations.overallPerformance.excerpts?.map(
              (excerpt, idx) => (
                <ExcerptBlock key={idx} excerpt={excerpt} variant="green" />
              )
            )}
          </div>
        )}

        {/* Liquidity & Cash Position */}
        {data.liquidityAndCapitalResources?.cashPosition && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
              Liquidity & Cash
            </h5>
            {data.liquidityAndCapitalResources.cashPosition.narrative && (
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {data.liquidityAndCapitalResources.cashPosition.narrative
                  .length > 180
                  ? `${data.liquidityAndCapitalResources.cashPosition.narrative.substring(
                      0,
                      180
                    )}...`
                  : data.liquidityAndCapitalResources.cashPosition.narrative}
              </p>
            )}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-2">
              {data.liquidityAndCapitalResources.cashPosition.currentCash && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Current Cash:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {data.liquidityAndCapitalResources.cashPosition.currentCash}
                  </span>
                </div>
              )}
              {data.liquidityAndCapitalResources.cashPosition
                .availableCredit && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Available Credit:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {
                      data.liquidityAndCapitalResources.cashPosition
                        .availableCredit
                    }
                  </span>
                </div>
              )}
            </div>
            <ExcerptBlock
              excerpt={data.liquidityAndCapitalResources.cashPosition.excerpt}
              variant="teal"
            />
          </div>
        )}
      </div>

      {/* Detailed Revenue Analysis */}
      {data.resultsOfOperations?.revenueAnalysis?.totalRevenue && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h5 className="text-lg font-bold text-green-700 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3"></span>
            Revenue Analysis
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            {data.resultsOfOperations.revenueAnalysis.totalRevenue
              .currentPeriod && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Current Period</p>
                <p className="text-lg font-bold text-green-700">
                  {
                    data.resultsOfOperations.revenueAnalysis.totalRevenue
                      .currentPeriod.value
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {
                    data.resultsOfOperations.revenueAnalysis.totalRevenue
                      .currentPeriod.period
                  }
                </p>
              </div>
            )}
            {data.resultsOfOperations.revenueAnalysis.totalRevenue
              .priorPeriod && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Prior Period</p>
                <p className="text-lg font-bold text-gray-700">
                  {
                    data.resultsOfOperations.revenueAnalysis.totalRevenue
                      .priorPeriod.value
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {
                    data.resultsOfOperations.revenueAnalysis.totalRevenue
                      .priorPeriod.period
                  }
                </p>
              </div>
            )}
            {data.resultsOfOperations.revenueAnalysis.totalRevenue.change && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Change</p>
                <p className="text-lg font-bold text-blue-700">
                  {
                    data.resultsOfOperations.revenueAnalysis.totalRevenue.change
                      .percentage
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {
                    data.resultsOfOperations.revenueAnalysis.totalRevenue.change
                      .absolute
                  }
                </p>
              </div>
            )}
          </div>
          {data.resultsOfOperations.revenueAnalysis.totalRevenue.commentary && (
            <p className="text-sm text-gray-700 mb-2">
              {data.resultsOfOperations.revenueAnalysis.totalRevenue.commentary}
            </p>
          )}
          <ExcerptBlock
            excerpt={
              data.resultsOfOperations.revenueAnalysis.totalRevenue.excerpt
            }
            variant="green"
          />
          {data.resultsOfOperations.revenueAnalysis.excerpts?.map(
            (excerpt, idx) => (
              <ExcerptBlock key={idx} excerpt={excerpt} variant="green" />
            )
          )}
        </div>
      )}

      {/* Cash Flow Analysis */}
      {data.liquidityAndCapitalResources?.cashFlowAnalysis && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h5 className="text-lg font-bold text-teal-700 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-3"></span>
            Cash Flow Analysis
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            {data.liquidityAndCapitalResources.cashFlowAnalysis
              .operatingActivities && (
              <div className="bg-teal-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-teal-800 mb-2">
                  Operating Activities
                </p>
                <p className="text-lg font-bold text-teal-700">
                  {
                    data.liquidityAndCapitalResources.cashFlowAnalysis
                      .operatingActivities.amount
                  }
                </p>
                {data.liquidityAndCapitalResources.cashFlowAnalysis
                  .operatingActivities.keyDrivers &&
                  data.liquidityAndCapitalResources.cashFlowAnalysis
                    .operatingActivities.keyDrivers.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {data.liquidityAndCapitalResources.cashFlowAnalysis.operatingActivities.keyDrivers
                        .slice(0, 2)
                        .map((driver, idx) => (
                          <li key={idx} className="text-xs text-teal-700">
                            • {driver}
                          </li>
                        ))}
                    </ul>
                  )}
              </div>
            )}
            {data.liquidityAndCapitalResources.cashFlowAnalysis
              .investingActivities && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-800 mb-2">
                  Investing Activities
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {
                    data.liquidityAndCapitalResources.cashFlowAnalysis
                      .investingActivities.amount
                  }
                </p>
              </div>
            )}
            {data.liquidityAndCapitalResources.cashFlowAnalysis
              .financingActivities && (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-purple-800 mb-2">
                  Financing Activities
                </p>
                <p className="text-lg font-bold text-purple-700">
                  {
                    data.liquidityAndCapitalResources.cashFlowAnalysis
                      .financingActivities.amount
                  }
                </p>
              </div>
            )}
          </div>
          {data.liquidityAndCapitalResources.cashFlowAnalysis.excerpts?.map(
            (excerpt, idx) => (
              <ExcerptBlock key={idx} excerpt={excerpt} variant="teal" />
            )
          )}
        </div>
      )}

      {/* Capital Structure */}
      {data.liquidityAndCapitalResources?.capitalStructure && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h5 className="text-lg font-bold text-teal-700 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-3"></span>
            Capital Structure
          </h5>
          {data.liquidityAndCapitalResources.capitalStructure.totalDebt && (
            <div className="bg-teal-50 rounded-lg p-4 mb-3">
              <p className="text-sm font-semibold text-teal-800">Total Debt</p>
              <p className="text-xl font-bold text-teal-700">
                {data.liquidityAndCapitalResources.capitalStructure.totalDebt}
              </p>
            </div>
          )}
          {data.liquidityAndCapitalResources.capitalStructure
            .creditFacilities &&
            data.liquidityAndCapitalResources.capitalStructure.creditFacilities
              .length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-sm font-semibold text-gray-800">
                  Credit Facilities
                </p>
                {data.liquidityAndCapitalResources.capitalStructure.creditFacilities.map(
                  (facility, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between"
                    >
                      <span className="text-sm text-gray-700">
                        {facility.facility}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {facility.available}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          <ExcerptBlock
            excerpt={data.liquidityAndCapitalResources.capitalStructure.excerpt}
            variant="teal"
          />
        </div>
      )}

      {/* Future Capital Needs */}
      {data.liquidityAndCapitalResources?.futureCapitalNeeds && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h5 className="text-lg font-bold text-teal-700 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full mr-3"></span>
            Future Capital Needs
          </h5>
          {data.liquidityAndCapitalResources.futureCapitalNeeds
            .anticipatedNeeds &&
            data.liquidityAndCapitalResources.futureCapitalNeeds
              .anticipatedNeeds.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Anticipated Needs
                </p>
                <ul className="space-y-1">
                  {data.liquidityAndCapitalResources.futureCapitalNeeds.anticipatedNeeds.map(
                    (need, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {need}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          {data.liquidityAndCapitalResources.futureCapitalNeeds
            .fundingSources &&
            data.liquidityAndCapitalResources.futureCapitalNeeds.fundingSources
              .length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Funding Sources
                </p>
                <ul className="space-y-1">
                  {data.liquidityAndCapitalResources.futureCapitalNeeds.fundingSources.map(
                    (source, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {source}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          <ExcerptBlock
            excerpt={
              data.liquidityAndCapitalResources.futureCapitalNeeds.excerpt
            }
            variant="teal"
          />
        </div>
      )}

      {/* Cost Analysis */}
      {data.resultsOfOperations?.costAnalysis?.excerpts &&
        data.resultsOfOperations.costAnalysis.excerpts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h5 className="text-lg font-bold text-orange-700 mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
              Cost Analysis
            </h5>
            {data.resultsOfOperations.costAnalysis.excerpts.map(
              (excerpt, idx) => (
                <ExcerptBlock key={idx} excerpt={excerpt} variant="orange" />
              )
            )}
          </div>
        )}

      {/* Profitability Analysis */}
      {data.resultsOfOperations?.profitabilityAnalysis?.excerpts &&
        data.resultsOfOperations.profitabilityAnalysis.excerpts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h5 className="text-lg font-bold text-green-700 mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3"></span>
              Profitability Analysis
            </h5>
            {data.resultsOfOperations.profitabilityAnalysis.excerpts.map(
              (excerpt, idx) => (
                <ExcerptBlock key={idx} excerpt={excerpt} variant="green" />
              )
            )}
          </div>
        )}

      {/* Market Trends & Business Environment */}
      {data.marketTrendsAndOutlook && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h5 className="text-lg font-bold text-orange-700 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
            Market Trends & Business Environment
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
            {data.marketTrendsAndOutlook.industryTrends &&
              data.marketTrendsAndOutlook.industryTrends.length > 0 && (
                <div>
                  <h6 className="font-semibold text-gray-800 mb-2 text-sm">
                    Industry Trends
                  </h6>
                  <ul className="space-y-1.5">
                    {data.marketTrendsAndOutlook.industryTrends
                      .slice(0, 3)
                      .map((trend, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-700 flex items-start"
                        >
                          <span className="text-orange-500 mr-2 mt-0.5">•</span>
                          <span>{trend}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            {data.marketTrendsAndOutlook.competitiveLandscape && (
              <div>
                <h6 className="font-semibold text-gray-800 mb-2 text-sm">
                  Competitive Landscape
                </h6>
                <p className="text-xs text-gray-700">
                  {data.marketTrendsAndOutlook.competitiveLandscape.length > 200
                    ? `${data.marketTrendsAndOutlook.competitiveLandscape.substring(
                        0,
                        200
                      )}...`
                    : data.marketTrendsAndOutlook.competitiveLandscape}
                </p>
              </div>
            )}
          </div>
          {data.marketTrendsAndOutlook.economicFactors &&
            data.marketTrendsAndOutlook.economicFactors.length > 0 && (
              <div className="mb-3 bg-gray-50 rounded-lg p-4">
                <h6 className="font-semibold text-gray-800 mb-2 text-sm">
                  Economic Factors
                </h6>
                <div className="flex flex-wrap gap-2">
                  {data.marketTrendsAndOutlook.economicFactors
                    .slice(0, 4)
                    .map((factor, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-700"
                      >
                        {factor.factor}
                      </span>
                    ))}
                </div>
              </div>
            )}
          {data.marketTrendsAndOutlook.excerpts?.map((excerpt, idx) => (
            <ExcerptBlock key={idx} excerpt={excerpt} variant="orange" />
          ))}
        </div>
      )}

      {/* Critical Accounting Policies */}
      {data.criticalAccountingPolicies &&
        data.criticalAccountingPolicies.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h5 className="text-lg font-bold text-orange-700 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
                Critical Accounting Policies
              </span>
              <span className="text-sm font-normal text-gray-500">
                {data.criticalAccountingPolicies.length} policies
              </span>
            </h5>
            <div className="space-y-4">
              {data.criticalAccountingPolicies
                .slice(0, 4)
                .map((policy, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-400"
                  >
                    <h6 className="font-semibold text-gray-800 mb-2">
                      {policy.policyName}
                    </h6>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {policy.description.length > 250
                        ? `${policy.description.substring(0, 250)}...`
                        : policy.description}
                    </p>
                    {policy.keyAssumptions &&
                      policy.keyAssumptions.length > 0 && (
                        <p className="text-xs text-gray-600 mb-2 pl-3 border-l-2 border-gray-300">
                          <span className="font-medium">Key Assumption:</span>{" "}
                          {policy.keyAssumptions[0].length > 120
                            ? `${policy.keyAssumptions[0].substring(0, 120)}...`
                            : policy.keyAssumptions[0]}
                        </p>
                      )}
                    <ExcerptBlock excerpt={policy.excerpt} variant="orange" />
                  </div>
                ))}
              {data.criticalAccountingPolicies.length > 4 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{data.criticalAccountingPolicies.length - 4} additional
                  policies not shown
                </p>
              )}
            </div>
          </div>
        )}

      {/* Contractual Obligations */}
      {data.contractualObligations && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h5 className="text-lg font-bold text-orange-700 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
            Contractual Obligations & Commitments
          </h5>
          {data.contractualObligations.summary && (
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {data.contractualObligations.summary}
            </p>
          )}
          {data.contractualObligations.obligations &&
            data.contractualObligations.obligations.length > 0 && (
              <div className="space-y-3 mb-3">
                {data.contractualObligations.obligations
                  .slice(0, 4)
                  .map((obligation, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {obligation.type}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {obligation.total}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          {data.contractualObligations.offBalanceSheet && (
            <div className="p-3 bg-blue-50 rounded-lg mb-3">
              <h6 className="font-semibold text-blue-800 text-xs mb-1">
                Off-Balance Sheet:
              </h6>
              <p className="text-xs text-blue-700">
                {data.contractualObligations.offBalanceSheet}
              </p>
            </div>
          )}
          <ExcerptBlock
            excerpt={data.contractualObligations.excerpt}
            variant="orange"
          />
        </div>
      )}

      {/* Risks & Opportunities */}
      {data.knownTrendsAndUncertainties && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h5 className="text-lg font-bold text-orange-700 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
            Trends, Risks & Opportunities
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            {data.knownTrendsAndUncertainties.opportunities &&
              data.knownTrendsAndUncertainties.opportunities.length > 0 && (
                <div>
                  <h6 className="font-semibold text-blue-700 mb-3 text-sm flex items-center">
                    <span className="mr-2">✓</span> Opportunities
                  </h6>
                  <div className="space-y-2">
                    {data.knownTrendsAndUncertainties.opportunities
                      .slice(0, 3)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                        >
                          <p className="text-xs text-blue-900">
                            {item.description.length > 120
                              ? `${item.description.substring(0, 120)}...`
                              : item.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {data.knownTrendsAndUncertainties.risks &&
              data.knownTrendsAndUncertainties.risks.length > 0 && (
                <div>
                  <h6 className="font-semibold text-red-700 mb-3 text-sm flex items-center">
                    <span className="mr-2">⚠</span> Risks
                  </h6>
                  <div className="space-y-2">
                    {data.knownTrendsAndUncertainties.risks
                      .slice(0, 3)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                          <p className="text-xs text-red-900">
                            {item.description.length > 120
                              ? `${item.description.substring(0, 120)}...`
                              : item.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>

          {data.knownTrendsAndUncertainties.forwardLookingStatements
            ?.strategicInitiatives &&
            data.knownTrendsAndUncertainties.forwardLookingStatements
              .strategicInitiatives.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200 mb-3">
                <h6 className="font-semibold text-indigo-800 mb-2 flex items-center">
                  <span className="mr-2">→</span> Strategic Initiatives
                </h6>
                <ul className="space-y-2">
                  {data.knownTrendsAndUncertainties.forwardLookingStatements.strategicInitiatives
                    .slice(0, 3)
                    .map((initiative, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-indigo-900 flex items-start"
                      >
                        <span className="text-indigo-500 mr-2 mt-0.5">▪</span>
                        <span>
                          {initiative.length > 150
                            ? `${initiative.substring(0, 150)}...`
                            : initiative}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

          {data.knownTrendsAndUncertainties.excerpts?.map((excerpt, idx) => (
            <ExcerptBlock key={idx} excerpt={excerpt} variant="indigo" />
          ))}
        </div>
      )}

      {/* Overall Takeaways */}
      {data.keyTakeaways && (
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 shadow-sm border border-teal-200">
          <h5 className="text-lg font-bold text-teal-800 mb-3 flex items-center">
            <span className="w-1.5 h-6 bg-teal-600 rounded-full mr-3"></span>
            Overall Takeaways
          </h5>
          <div className="space-y-3">
            {data.keyTakeaways.managementTone && (
              <p className="text-sm text-teal-900 leading-relaxed">
                <span className="font-semibold">Management Tone:</span>{" "}
                {data.keyTakeaways.managementTone}
              </p>
            )}
            {data.keyTakeaways.investorConsiderations &&
              data.keyTakeaways.investorConsiderations.length > 0 && (
                <div className="bg-white/60 rounded-lg p-4 mb-3">
                  <h6 className="font-semibold text-teal-800 text-sm mb-2">
                    Key Investor Considerations:
                  </h6>
                  <ul className="space-y-1.5">
                    {data.keyTakeaways.investorConsiderations
                      .slice(0, 4)
                      .map((consideration, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-teal-700 flex items-start"
                        >
                          <span className="text-teal-500 mr-2 mt-0.5">•</span>
                          <span>{consideration}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            {data.keyTakeaways.excerpts?.map((excerpt, idx) => (
              <ExcerptBlock key={idx} excerpt={excerpt} variant="teal" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
