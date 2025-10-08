// components/sec-test-components/FinancialsSection.tsx
import { FinancialAnalysis } from "@/app/api/analyze-sec/schemas/financialsAnalysisSchema";

interface FinancialsSectionProps {
  data: FinancialAnalysis;
}

export function FinancialsSection({ data }: FinancialsSectionProps) {
  // Helper function to format change values
  const formatChange = (absolute: string, percentage: string) => {
    if (absolute === "N/A" && percentage === "N/A") return "N/A";
    if (absolute === "N/A") return percentage;
    if (percentage === "N/A") return absolute;
    return `${absolute} (${percentage})`;
  };

  // Helper function to render excerpt if available and meaningful
  const renderExcerpt = (excerpt?: string) => {
    // Check if excerpt exists and is meaningful (not a default value)
    const defaultValues = [
      "No direct excerpt found.",
      "No excerpt available.",
      "",
    ];

    if (excerpt && !defaultValues.includes(excerpt.trim())) {
      return (
        <div className="mt-2 border-l-2 border-teal-300 pl-2">
          <p className="text-xs italic text-gray-600">
            <span className="font-medium text-gray-700">Quote:</span> "{excerpt}
            "
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper function to render year-over-year comparison
  const renderYoYComparison = (
    label: string,
    current: { value: string; period: string },
    previous: { value: string; period: string },
    changeAbsolute: string,
    changePercentage: string,
    excerpt?: string
  ) => (
    <>
      <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
        <div>
          <span className="font-medium">{label}:</span>
        </div>
        <div>
          <span className="text-gray-600">{previous.period}: </span>
          <span className="font-semibold">{previous.value}</span>
        </div>
        <div>
          <span className="text-gray-600">{current.period}: </span>
          <span className="font-semibold">{current.value}</span>
          {changeAbsolute !== "N/A" && changePercentage !== "N/A" && (
            <span
              className={`text-xs ml-2 ${
                changeAbsolute.includes("-") ? "text-red-600" : "text-green-600"
              }`}
            >
              ({formatChange(changeAbsolute, changePercentage)})
            </span>
          )}
        </div>
      </div>
      {renderExcerpt(excerpt)}
    </>
  );

  return (
    <div className="mb-6 pb-4 border-b">
      <h4 className="text-lg font-medium text-teal-600 mb-2">
        Financial Analysis
      </h4>
      <p className="mb-4 text-sm text-gray-700">
        <strong>Report Title:</strong> {data.title}
      </p>

      {/* Revenue Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">Revenue Analysis</h5>
        {renderYoYComparison(
          "Revenue",
          data.revenueAnalysis.currentYear,
          data.revenueAnalysis.previousYear,
          data.revenueAnalysis.changeAbsolute,
          data.revenueAnalysis.changePercentage,
          data.revenueAnalysis.excerpt
        )}
        {data.revenueAnalysis.drivers !== "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Drivers:</strong> {data.revenueAnalysis.drivers}
          </p>
        )}
      </div>

      {/* COGS & Gross Profit Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          COGS & Gross Profit Analysis
        </h5>
        {renderYoYComparison(
          "COGS",
          data.cogsAndGrossProfitAnalysis.cogs.currentYear,
          data.cogsAndGrossProfitAnalysis.cogs.previousYear,
          "N/A",
          "N/A"
        )}
        {renderYoYComparison(
          "Gross Profit",
          data.cogsAndGrossProfitAnalysis.grossProfit.currentYear,
          data.cogsAndGrossProfitAnalysis.grossProfit.previousYear,
          data.cogsAndGrossProfitAnalysis.grossProfit.changeAbsolute,
          data.cogsAndGrossProfitAnalysis.grossProfit.changePercentage,
          data.cogsAndGrossProfitAnalysis.grossProfit.excerpt
        )}
        {data.cogsAndGrossProfitAnalysis.factors !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Factors:</strong> {data.cogsAndGrossProfitAnalysis.factors}
          </p>
        )}
        {renderExcerpt(data.cogsAndGrossProfitAnalysis.excerpt)}
      </div>

      {/* Operating Expenses Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          Operating Expenses Analysis
        </h5>
        {renderYoYComparison(
          "Total Operating Expenses",
          data.operatingExpensesAnalysis.totalOperatingExpenses.currentYear,
          data.operatingExpensesAnalysis.totalOperatingExpenses.previousYear,
          data.operatingExpensesAnalysis.totalOperatingExpenses.changeAbsolute,
          data.operatingExpensesAnalysis.totalOperatingExpenses
            .changePercentage,
          data.operatingExpensesAnalysis.totalOperatingExpenses.excerpt
        )}
        {data.operatingExpensesAnalysis.sgna && (
          <div className="ml-4">
            {renderYoYComparison(
              "SG&A",
              data.operatingExpensesAnalysis.sgna.currentYear,
              data.operatingExpensesAnalysis.sgna.previousYear,
              "N/A",
              "N/A"
            )}
          </div>
        )}
        {data.operatingExpensesAnalysis.rd && (
          <div className="ml-4">
            {renderYoYComparison(
              "R&D",
              data.operatingExpensesAnalysis.rd.currentYear,
              data.operatingExpensesAnalysis.rd.previousYear,
              "N/A",
              "N/A"
            )}
          </div>
        )}
        {data.operatingExpensesAnalysis.efficiencyComment !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Efficiency:</strong>{" "}
            {data.operatingExpensesAnalysis.efficiencyComment}
          </p>
        )}
        {renderExcerpt(data.operatingExpensesAnalysis.excerpt)}
      </div>

      {/* Operating Income (EBIT) Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          Operating Income (EBIT) Analysis
        </h5>
        {renderYoYComparison(
          "Operating Income",
          data.operatingIncomeEBITAnalysis.currentYear,
          data.operatingIncomeEBITAnalysis.previousYear,
          data.operatingIncomeEBITAnalysis.changeAbsolute,
          data.operatingIncomeEBITAnalysis.changePercentage,
          data.operatingIncomeEBITAnalysis.excerpt
        )}
        {data.operatingIncomeEBITAnalysis.trendComment !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Trend:</strong>{" "}
            {data.operatingIncomeEBITAnalysis.trendComment}
          </p>
        )}
      </div>

      {/* EBITDA Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">EBITDA Analysis</h5>
        {renderYoYComparison(
          "EBITDA",
          data.ebitdaAnalysis.currentYear,
          data.ebitdaAnalysis.previousYear,
          data.ebitdaAnalysis.changeAbsolute,
          data.ebitdaAnalysis.changePercentage,
          data.ebitdaAnalysis.excerpt
        )}
        {data.ebitdaAnalysis.significance !== "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Significance:</strong> {data.ebitdaAnalysis.significance}
          </p>
        )}
      </div>

      {/* Interest & Other Non-Operating Items */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          Interest & Other Non-Operating Items
        </h5>
        {renderYoYComparison(
          "Interest Expense",
          data.interestAndOtherNonOperatingItems.interestExpense.currentYear,
          data.interestAndOtherNonOperatingItems.interestExpense.previousYear,
          "N/A",
          "N/A"
        )}
        {renderYoYComparison(
          "Other Non-Operating",
          data.interestAndOtherNonOperatingItems.otherNonOperatingIncomeExpense
            .currentYear,
          data.interestAndOtherNonOperatingItems.otherNonOperatingIncomeExpense
            .previousYear,
          "N/A",
          "N/A"
        )}
        {data.interestAndOtherNonOperatingItems.impactComment !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Impact:</strong>{" "}
            {data.interestAndOtherNonOperatingItems.impactComment}
          </p>
        )}
        {renderExcerpt(data.interestAndOtherNonOperatingItems.excerpt)}
      </div>

      {/* Income Tax Expense Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          Income Tax Expense Analysis
        </h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="border-r pr-4">
            <p className="font-medium mb-1">
              {data.incomeTaxExpenseAnalysis.previousYear.period}
            </p>
            <p className="text-gray-700">
              Tax Expense:{" "}
              <span className="font-semibold">
                {data.incomeTaxExpenseAnalysis.previousYear.value}
              </span>
            </p>
            <p className="text-gray-700">
              Effective Rate:{" "}
              <span className="font-semibold">
                {data.incomeTaxExpenseAnalysis.effectiveTaxRatePreviousYear}
              </span>
            </p>
          </div>
          <div className="pl-4">
            <p className="font-medium mb-1">
              {data.incomeTaxExpenseAnalysis.currentYear.period}
            </p>
            <p className="text-gray-700">
              Tax Expense:{" "}
              <span className="font-semibold">
                {data.incomeTaxExpenseAnalysis.currentYear.value}
              </span>
            </p>
            <p className="text-gray-700">
              Effective Rate:{" "}
              <span className="font-semibold">
                {data.incomeTaxExpenseAnalysis.effectiveTaxRateCurrentYear}
              </span>
            </p>
          </div>
        </div>
        {data.incomeTaxExpenseAnalysis.taxRateComment !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Comment:</strong>{" "}
            {data.incomeTaxExpenseAnalysis.taxRateComment}
          </p>
        )}
        {renderExcerpt(data.incomeTaxExpenseAnalysis.excerpt)}
      </div>

      {/* Net Income Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          Net Income Analysis
        </h5>
        {renderYoYComparison(
          "Net Income",
          data.netIncomeAnalysis.currentYear,
          data.netIncomeAnalysis.previousYear,
          data.netIncomeAnalysis.changeAbsolute,
          data.netIncomeAnalysis.changePercentage,
          data.netIncomeAnalysis.excerpt
        )}
        {data.netIncomeAnalysis.contributors !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Contributors:</strong> {data.netIncomeAnalysis.contributors}
          </p>
        )}
      </div>

      {/* EPS Diluted Analysis */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          Earnings Per Share (Diluted) Analysis
        </h5>
        {renderYoYComparison(
          "EPS (Diluted)",
          data.epsDilutedAnalysis.currentYear,
          data.epsDilutedAnalysis.previousYear,
          data.epsDilutedAnalysis.changeAbsolute,
          data.epsDilutedAnalysis.changePercentage,
          data.epsDilutedAnalysis.excerpt
        )}
        {data.epsDilutedAnalysis.factorsBeyondNetIncome !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Factors Beyond Net Income:</strong>{" "}
            {data.epsDilutedAnalysis.factorsBeyondNetIncome}
          </p>
        )}
      </div>

      {/* Profitability Ratios */}
      <div className="mb-4 p-3 border rounded-md bg-teal-50">
        <h5 className="font-semibold text-teal-700 mb-2">
          Profitability Ratios
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Metric</th>
                <th className="text-center py-1">Previous Year</th>
                <th className="text-center py-1">Current Year</th>
                <th className="text-center py-1">Change</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Gross Profit Margin", key: "grossProfitMargin" },
                { name: "Operating Margin", key: "operatingMargin" },
                { name: "Net Profit Margin", key: "netProfitMargin" },
                { name: "EBITDA Margin", key: "ebitdaMargin" },
                { name: "ROA", key: "roa" },
                { name: "ROE", key: "roe" },
              ].map(({ name, key }) => {
                const metric =
                  data.profitabilityRatios[
                    key as keyof typeof data.profitabilityRatios
                  ];
                if (typeof metric === "object" && "currentYear" in metric) {
                  const prev = parseFloat(metric.previousYear) || 0;
                  const curr = parseFloat(metric.currentYear) || 0;
                  const change = curr - prev;
                  return (
                    <tr key={key} className="border-b">
                      <td className="py-1">{name}</td>
                      <td className="text-center py-1">
                        {metric.previousYear}
                      </td>
                      <td className="text-center py-1">{metric.currentYear}</td>
                      <td
                        className={`text-center py-1 ${
                          change > 0
                            ? "text-green-600"
                            : change < 0
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {change > 0 ? "+" : ""}
                        {change.toFixed(1)}%
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
        {data.profitabilityRatios.trendComment !==
          "No description available." && (
          <p className="text-sm text-gray-700 mt-3">
            <strong>Trend Analysis:</strong>{" "}
            {data.profitabilityRatios.trendComment}
          </p>
        )}
        {renderExcerpt(data.profitabilityRatios.excerpt)}
      </div>

      {/* Noteworthy Items - Always required excerpt */}
      {data.noteworthyItemsImpacts &&
        data.noteworthyItemsImpacts.length > 0 && (
          <div className="mb-4 p-3 border rounded-md bg-yellow-50">
            <h5 className="font-semibold text-yellow-700 mb-2">
              Noteworthy Items & Footnotes
            </h5>
            <ul className="space-y-3">
              {data.noteworthyItemsImpacts.map((item, index) => (
                <li key={index} className="border-l-4 border-yellow-400 pl-3">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">
                      {item.type.replace(/_/g, " ").toUpperCase()}
                    </p>
                    {item.recurring && (
                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                        Recurring
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {item.description}
                  </p>
                  {item.financialImpact && item.financialImpact !== "N/A" && (
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      Impact: {item.financialImpact}
                    </p>
                  )}
                  {/* Excerpt is mandatory for noteworthy items */}
                  <div className="mt-2 border-l-2 border-yellow-300 pl-2">
                    <p className="text-xs italic text-gray-600">
                      <span className="font-medium text-gray-700">
                        Supporting Evidence:
                      </span>{" "}
                      "{item.excerpt}"
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Key Insights - Always required excerpt */}
      <div className="p-3 border rounded-md bg-blue-50">
        <h5 className="font-semibold text-blue-700 mb-2">Key Insights</h5>
        <p className="text-sm text-gray-700">{data.keyInsights}</p>
        {/* keyInsightsExcerpt is mandatory */}
        <div className="mt-2 border-l-2 border-blue-300 pl-2">
          <p className="text-xs italic text-gray-600">
            <span className="font-medium text-gray-700">
              Supporting Evidence:
            </span>{" "}
            "{data.keyInsightsExcerpt}"
          </p>
        </div>
      </div>
    </div>
  );
}
