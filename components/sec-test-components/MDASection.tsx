// components/sec-analysis/MDASection.tsx
import { MDAAnalysis } from "@/app/api/analyze-sec/schemas";

interface MDASectionProps {
  data: MDAAnalysis;
}

export function MDASection({ data }: MDASectionProps) {
  return (
    <div className="mb-6 pb-4">
      <h4 className="text-lg font-medium text-orange-600 mb-2">
        Management's Discussion and Analysis (MD&A)
      </h4>
      <p className="mb-2">
        <strong>Title:</strong> {data.title}
      </p>

      <div className="mb-4">
        <h5 className="font-semibold mt-2 text-orange-700">
          Executive Summary:
        </h5>
        <p>{data.executiveSummary.analysis}</p>
        {data.executiveSummary.excerpt !== "No excerpt available." && (
          <p className="text-sm italic text-gray-600">
            Excerpt: {data.executiveSummary.excerpt}
          </p>
        )}
      </div>

      <div className="mb-4 p-3 border rounded-md bg-orange-50">
        <h5 className="font-semibold text-orange-700">
          Results of Operations:
        </h5>
        <div className="space-y-1 ml-3 mt-1">
          <p>
            <strong>Revenue Analysis:</strong>{" "}
            {data.resultsOfOperations.revenueAnalysis}
          </p>
          <p>
            <strong>Cost of Sales:</strong>{" "}
            {data.resultsOfOperations.costOfSalesAnalysis}
          </p>
          <p>
            <strong>Operating Expenses:</strong>{" "}
            {data.resultsOfOperations.operatingExpensesAnalysis}
          </p>
          {data.resultsOfOperations.otherIncomeExpense !== "None reported" && (
            <p>
              <strong>Other Income/Expense:</strong>{" "}
              {data.resultsOfOperations.otherIncomeExpense}
            </p>
          )}
          {data.resultsOfOperations.segmentInformation !== "Not applicable" && (
            <p>
              <strong>Segment Information:</strong>{" "}
              {data.resultsOfOperations.segmentInformation}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 p-3 border rounded-md bg-orange-50">
        <h5 className="font-semibold text-orange-700">
          Liquidity and Capital Resources:
        </h5>
        <div className="space-y-1 ml-3 mt-1">
          <p>
            <strong>Current Liquidity:</strong>{" "}
            {data.liquidityAndCapitalResources.currentLiquidity}
          </p>
          <p>
            <strong>Capital Resources:</strong>{" "}
            {data.liquidityAndCapitalResources.capitalResources}
          </p>
          <p>
            <strong>Cash Flow Analysis:</strong>{" "}
            {data.liquidityAndCapitalResources.cashFlowAnalysis}
          </p>
          <p>
            <strong>Future Capital Needs:</strong>{" "}
            {
              data.liquidityAndCapitalResources
                .futureCapitalNeedsAndFundingStrategies.analysis
            }
          </p>
        </div>
      </div>

      {/* Other MDA sections... */}
    </div>
  );
}
