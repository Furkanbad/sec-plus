// components/sec-test-components/MDASection.tsx
import { MDAAnalysis } from "@/app/api/analyze-sec/schemas/mdaAnalysisSchema"; // Doğru yolu kullanın

interface MDASectionProps {
  data: MDAAnalysis;
}

export function MDASection({ data }: MDASectionProps) {
  return (
    <div className="mb-6 pb-4 border-b">
      <h4 className="text-2xl font-bold text-orange-700 mb-4">{data.title}</h4>

      {/* 1. Business Overview - Executive Summary */}
      <div className="mb-6 p-4 bg-orange-50 rounded-lg shadow-sm border border-orange-200">
        <h5 className="font-bold text-orange-800 mb-2">Executive Summary</h5>
        <p className="text-sm text-gray-800 leading-relaxed">
          {data.businessOverview.executiveSummary}
        </p>
        {data.businessOverview.excerpts &&
          data.businessOverview.excerpts.length > 0 &&
          data.businessOverview.excerpts[0] !== "No excerpt available." && (
            <p className="text-xs italic text-gray-600 mt-3 p-2 bg-orange-100 rounded">
              "{data.businessOverview.excerpts[0]}"
            </p>
          )}
      </div>

      {/* Key Financial and Operational Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Current Period Highlights - Financial */}
        {data.currentPeriodHighlights && (
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <h5 className="font-semibold text-base text-gray-800 mb-2">
              Financial Highlights ({data.currentPeriodHighlights.fiscalYearEnd}
              )
            </h5>
            <ul className="text-sm space-y-1 text-gray-700">
              {data.currentPeriodHighlights.financialHighlights
                .slice(0, 3) // İlk 3 taneyi göster
                .map((item, index) => (
                  <li key={index}>
                    <strong>{item.metric}:</strong> {item.value}{" "}
                    {item.trend && (
                      <span className="text-xs text-blue-600">
                        ({item.trend})
                      </span>
                    )}
                  </li>
                ))}
              {data.currentPeriodHighlights.financialHighlights.length > 3 && (
                <li className="text-xs text-gray-500">
                  ... more financial highlights
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Results of Operations - Overall Performance Summary */}
        {data.resultsOfOperations?.overallPerformance && (
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <h5 className="font-semibold text-base text-gray-800 mb-2">
              Results of Operations
            </h5>
            <p className="text-sm text-gray-700 leading-snug">
              {data.resultsOfOperations.overallPerformance.summary.substring(
                0,
                150
              )}
              ...
            </p>
            {data.resultsOfOperations.overallPerformance.keyPoints.length >
              0 && (
              <ul className="list-disc ml-4 text-xs mt-2 text-gray-600">
                {data.resultsOfOperations.overallPerformance.keyPoints
                  .slice(0, 2)
                  .map((point, idx) => (
                    <li key={idx}>{point.substring(0, 70)}...</li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {/* Liquidity - Cash Position Summary */}
        {data.liquidityAndCapitalResources?.cashPosition && (
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <h5 className="font-semibold text-base text-gray-800 mb-2">
              Liquidity & Cash Position
            </h5>
            <p className="text-sm text-gray-700 leading-snug">
              {data.liquidityAndCapitalResources.cashPosition.narrative.substring(
                0,
                150
              )}
              ...
            </p>
            <ul className="text-xs mt-2 text-gray-600 space-y-1">
              <li>
                <strong>Current Cash:</strong>{" "}
                {data.liquidityAndCapitalResources.cashPosition.currentCash}
              </li>
              {data.liquidityAndCapitalResources.cashPosition
                .availableCredit && (
                <li>
                  <strong>Available Credit:</strong>{" "}
                  {
                    data.liquidityAndCapitalResources.cashPosition
                      .availableCredit
                  }
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* 6. Critical Accounting Policies - Only show first 2 or 3 policies */}
      {data.criticalAccountingPolicies &&
        data.criticalAccountingPolicies.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h5 className="font-bold text-orange-700 mb-3">
              Critical Accounting Policies (
              {data.criticalAccountingPolicies.length})
            </h5>
            <ul className="list-disc ml-5 text-sm space-y-2 text-gray-800">
              {data.criticalAccountingPolicies
                .slice(0, 3)
                .map((policy, index) => (
                  <li key={index}>
                    <p>
                      <strong>{policy.policyName}:</strong>{" "}
                      {policy.description.substring(0, 150)}...
                    </p>
                    {policy.keyAssumptions &&
                      policy.keyAssumptions.length > 0 && (
                        <span className="text-xs text-gray-600 block mt-1">
                          Key Assumption:{" "}
                          {policy.keyAssumptions[0].substring(0, 80)}...
                        </span>
                      )}
                  </li>
                ))}
              {data.criticalAccountingPolicies.length > 3 && (
                <li className="text-xs text-gray-500">
                  ... more critical accounting policies
                </li>
              )}
            </ul>
          </div>
        )}

      {/* 7. Known Trends, Uncertainties, and Forward-Looking Statements - Risks & Opportunities */}
      {data.knownTrendsAndUncertainties && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h5 className="font-bold text-orange-700 mb-3">
            Known Trends, Risks & Opportunities
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.knownTrendsAndUncertainties.opportunities.length > 0 && (
              <div>
                <h6 className="font-semibold text-blue-700 mb-2 text-sm">
                  Opportunities
                </h6>
                <div className="flex flex-wrap gap-2">
                  {data.knownTrendsAndUncertainties.opportunities
                    .slice(0, 3)
                    .map((item, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {item.description.substring(0, 50)}...
                      </span>
                    ))}
                </div>
              </div>
            )}
            {data.knownTrendsAndUncertainties.risks.length > 0 && (
              <div>
                <h6 className="font-semibold text-red-700 mb-2 text-sm">
                  Risks
                </h6>
                <div className="flex flex-wrap gap-2">
                  {data.knownTrendsAndUncertainties.risks
                    .slice(0, 3)
                    .map((item, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full"
                      >
                        {item.description.substring(0, 50)}...
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
          {data.knownTrendsAndUncertainties.forwardLookingStatements
            .strategicInitiatives.length > 0 && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800">
              <h6 className="font-semibold text-indigo-700 mb-1">
                Strategic Initiatives:
              </h6>
              <ul className="list-disc ml-4">
                {data.knownTrendsAndUncertainties.forwardLookingStatements.strategicInitiatives
                  .slice(0, 2)
                  .map((initiative, idx) => (
                    <li key={idx}>{initiative.substring(0, 100)}...</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 9. Overall MD&A Takeaways - Brief */}
      {data.keyTakeaways && (
        <div className="p-4 bg-teal-50 rounded-lg shadow-sm border border-teal-200">
          <h5 className="font-bold text-teal-800 mb-2">Overall Takeaways</h5>
          <p className="text-sm text-teal-700 leading-snug">
            <span className="font-semibold">Management Tone:</span>{" "}
            {data.keyTakeaways.managementTone}.
          </p>
          {data.keyTakeaways.investorConsiderations.length > 0 && (
            <div className="mt-2">
              <h6 className="font-semibold text-teal-700 text-xs">
                Investor Focus:
              </h6>
              <ul className="list-disc ml-4 text-xs text-teal-600">
                {data.keyTakeaways.investorConsiderations
                  .slice(0, 2)
                  .map((consideration, idx) => (
                    <li key={idx}>{consideration}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
