// app/filing-viewer/components/FinancialsSection.tsx
import { FinancialAnalysis } from "@/app/api/analyze-sec/schemas";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { MetricCard } from "./shared/MetricCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";

interface FinancialsSectionProps {
  data: FinancialAnalysis;
  onExcerptClick: (id: string) => void;
}

export function FinancialsSection({
  data,
  onExcerptClick,
}: FinancialsSectionProps) {
  return (
    <CollapsibleCard
      title="Financial Performance"
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
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Revenue"
          current={data.revenueAnalysis?.currentYear?.value}
          previous={data.revenueAnalysis?.previousYear?.value}
          changePercentage={data.revenueAnalysis?.changePercentage}
        />
        <MetricCard
          label="Net Income"
          current={data.netIncomeAnalysis?.currentYear?.value}
          previous={data.netIncomeAnalysis?.previousYear?.value}
          changePercentage={data.netIncomeAnalysis?.changePercentage}
        />
        <MetricCard
          label="Operating Income"
          current={data.operatingIncomeEBITAnalysis?.currentYear?.value}
          previous={data.operatingIncomeEBITAnalysis?.previousYear?.value}
          changePercentage={data.operatingIncomeEBITAnalysis?.changePercentage}
        />
        <MetricCard
          label="EPS (Diluted)"
          current={data.epsDilutedAnalysis?.currentYear?.value}
          previous={data.epsDilutedAnalysis?.previousYear?.value}
          changePercentage={data.epsDilutedAnalysis?.changePercentage}
        />
      </div>

      {/* Revenue Analysis */}
      {data.revenueAnalysis && (
        <InfoBlock title="Revenue Analysis" variant="success">
          <p className="font-medium">Drivers: {data.revenueAnalysis.drivers}</p>
          <ExcerptLink
            excerptId={(data.revenueAnalysis as any).excerptId}
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}

      {/* Gross Profit */}
      {data.cogsAndGrossProfitAnalysis && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Cost of Goods Sold & Gross Profit
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Factors:</span>{" "}
              {data.cogsAndGrossProfitAnalysis.factors}
            </p>
            <ExcerptLink
              excerptId={(data.cogsAndGrossProfitAnalysis as any).excerptId}
              onClick={onExcerptClick}
            />
          </div>
        </div>
      )}

      {/* Operating Expenses */}
      {data.operatingExpensesAnalysis && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Operating Expenses
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Efficiency:</span>{" "}
              {data.operatingExpensesAnalysis.efficiencyComment}
            </p>
            <ExcerptLink
              excerptId={(data.operatingExpensesAnalysis as any).excerptId}
              onClick={onExcerptClick}
            />
          </div>
        </div>
      )}

      {/* Profitability Ratios */}
      {data.profitabilityRatios && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Profitability Ratios
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white border rounded-lg p-3">
              <div className="text-gray-500 mb-1">Gross Margin</div>
              <div className="font-semibold text-lg">
                {data.profitabilityRatios.grossProfitMargin?.currentYear}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {data.profitabilityRatios.grossProfitMargin?.previousYear}
              </div>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <div className="text-gray-500 mb-1">Operating Margin</div>
              <div className="font-semibold text-lg">
                {data.profitabilityRatios.operatingMargin?.currentYear}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {data.profitabilityRatios.operatingMargin?.previousYear}
              </div>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <div className="text-gray-500 mb-1">Net Margin</div>
              <div className="font-semibold text-lg">
                {data.profitabilityRatios.netProfitMargin?.currentYear}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {data.profitabilityRatios.netProfitMargin?.previousYear}
              </div>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <div className="text-gray-500 mb-1">ROE</div>
              <div className="font-semibold text-lg">
                {data.profitabilityRatios.roe?.currentYear}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {data.profitabilityRatios.roe?.previousYear}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              {data.profitabilityRatios.trendComment}
            </p>
            <ExcerptLink
              excerptId={(data.profitabilityRatios as any).excerptId}
              onClick={onExcerptClick}
            />
          </div>
        </div>
      )}

      {/* Noteworthy Items */}
      {data.noteworthyItemsImpacts &&
        data.noteworthyItemsImpacts.length > 0 &&
        data.noteworthyItemsImpacts[0].type !== "none_identified" && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Noteworthy Items
            </h4>
            <div className="space-y-2">
              {data.noteworthyItemsImpacts.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm">
                      {item.description}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.recurring
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.recurring ? "Recurring" : "One-time"}
                    </span>
                  </div>
                  {item.financialImpact && (
                    <div className="text-sm text-gray-700 mt-1">
                      Impact: {item.financialImpact}
                    </div>
                  )}
                  <ExcerptLink
                    excerptId={(item as any).excerptId}
                    onClick={onExcerptClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Key Insights */}
      <InfoBlock title="Key Insights" variant="info">
        <p>{data.keyInsights}</p>
        <ExcerptLink
          excerptId={(data as any).keyInsightsExcerptId}
          onClick={onExcerptClick}
        />
      </InfoBlock>
    </CollapsibleCard>
  );
}
