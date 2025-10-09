// components/sec-test-components/MDASection.tsx
import { MDAAnalysis } from "@/app/api/analyze-sec/schemas";

interface MDASectionProps {
  data: MDAAnalysis;
}

export function MDASection({ data }: MDASectionProps) {
  return (
    <div className="mb-6 pb-4 border-b">
      <h4 className="text-lg font-medium text-orange-600 mb-2">
        Management's Discussion and Analysis
      </h4>

      {/* Executive Summary */}
      <div className="mb-4 p-3 bg-orange-50 rounded-lg">
        <h5 className="font-semibold text-orange-700 mb-1">
          Executive Summary
        </h5>
        <p className="text-sm text-gray-700">
          {data.executiveSummary.analysis}
        </p>
        {data.executiveSummary.excerpt !== "No excerpt available." &&
          data.executiveSummary.excerpt !== "None reported" && (
            <p className="text-xs italic text-gray-600 mt-2">
              "{data.executiveSummary.excerpt}"
            </p>
          )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Results of Operations */}
        <div className="p-3 bg-gray-50 rounded">
          <h5 className="font-semibold text-sm text-gray-700 mb-2">
            Operations Highlights
          </h5>
          <ul className="text-xs space-y-1">
            <li>
              <strong>Revenue:</strong>{" "}
              {data.resultsOfOperations.revenueAnalysis.substring(0, 100)}...
            </li>
            <li>
              <strong>Costs:</strong>{" "}
              {data.resultsOfOperations.costOfSalesAnalysis.substring(0, 100)}
              ...
            </li>
          </ul>
        </div>

        {/* Liquidity */}
        <div className="p-3 bg-gray-50 rounded">
          <h5 className="font-semibold text-sm text-gray-700 mb-2">
            Liquidity Status
          </h5>
          <p className="text-xs">
            {data.liquidityAndCapitalResources.currentLiquidity.substring(
              0,
              150
            )}
            ...
          </p>
        </div>
      </div>

      {/* Critical Accounting Policies - Only show first 2 */}
      {data.criticalAccountingPolicies &&
        data.criticalAccountingPolicies.length > 0 && (
          <div className="mb-4">
            <h5 className="font-semibold text-sm text-orange-700 mb-1">
              Critical Accounting Policies (
              {data.criticalAccountingPolicies.length})
            </h5>
            <ul className="list-disc ml-5 text-xs space-y-1">
              {data.criticalAccountingPolicies
                .slice(0, 2)
                .map((policy, index) => (
                  <li key={index}>
                    <strong>{policy.policyName}:</strong>{" "}
                    {policy.explanation.substring(0, 100)}...
                  </li>
                ))}
            </ul>
          </div>
        )}

      {/* Key Trends - Compact View */}
      {data.knownTrendsUncertaintiesOpportunities &&
        data.knownTrendsUncertaintiesOpportunities.length > 0 && (
          <div className="mb-4">
            <h5 className="font-semibold text-sm text-orange-700 mb-1">
              Key Trends & Opportunities
            </h5>
            <div className="flex flex-wrap gap-2">
              {data.knownTrendsUncertaintiesOpportunities.map((item, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-orange-100 rounded"
                >
                  {item.itemDescription}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Strategic Outlook - Brief */}
      {data.strategicOutlookAndFuturePlans !== "Not available." && (
        <div className="p-2 bg-blue-50 rounded">
          <p className="text-xs font-medium text-blue-800">
            Strategic Focus:{" "}
            {data.strategicOutlookAndFuturePlans.substring(0, 150)}...
          </p>
        </div>
      )}
    </div>
  );
}
