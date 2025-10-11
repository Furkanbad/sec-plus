// app/filing-viewer/components/TwoLayerFinancialsSection.tsx
import {
  TwoLayerFinancials,
  IntegratedFinancialItem,
} from "@/app/api/analyze-sec/schemas/TwoLayerFinancialsSchema";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";

interface TwoLayerFinancialsSectionProps {
  data: TwoLayerFinancials;
  onExcerptClick: (id: string) => void;
}

// ENTEGRE FİNANSAL KALEM BİLEŞENİ
const IntegratedItemRow = ({
  item,
  onExcerptClick,
}: {
  item: IntegratedFinancialItem;
  onExcerptClick: (id: string) => void;
}) => {
  const hasMetric = item.metric && item.metric.current !== "N/A";
  const isNegative = item.metric?.changePercentage?.includes("-");

  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      {/* Header: Label ve Metrik */}
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-semibold text-gray-900">{item.label}</h5>
        {hasMetric && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {item.metric!.current}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {item.metric!.previous}
              </div>
            </div>
            {item.metric!.changePercentage && (
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  isNegative
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {item.metric!.changePercentage}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Narrative Summary */}
      {item.narrativeSummary && (
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
          {item.narrativeSummary}
        </p>
      )}

      {/* Relevant Policies */}
      {item.relevantPolicies.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Accounting Policies:
          </span>
          <div className="mt-2 space-y-2">
            {item.relevantPolicies.map((policy, i) => (
              <div
                key={i}
                className="bg-blue-50 border-l-4 border-blue-400 rounded p-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {policy.policy}
                    </span>
                    <p className="text-xs text-gray-700 mt-1">
                      {policy.description}
                    </p>
                    {policy.changes && (
                      <p className="text-xs text-orange-600 mt-1">
                        <span className="font-medium">Change:</span>{" "}
                        {policy.changes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <ExcerptLink
                    excerptId={(policy as any).excerptId}
                    onClick={onExcerptClick}
                    label="View policy source"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {item.keyInsights.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Key Insights:
          </span>
          <div className="mt-2 space-y-2">
            {item.keyInsights.map((insight, i) => (
              <div
                key={i}
                className={`rounded p-2 border-l-4 ${
                  insight.significance === "high"
                    ? "bg-red-50 border-red-500"
                    : insight.significance === "medium"
                    ? "bg-yellow-50 border-yellow-500"
                    : "bg-green-50 border-green-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {insight.significance === "high"
                      ? "🔴"
                      : insight.significance === "medium"
                      ? "🟡"
                      : "🟢"}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {insight.summary}
                  </span>
                </div>
                <ExcerptLink
                  excerptId={(insight as any).excerptId}
                  onClick={onExcerptClick}
                  label="View insight source"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {item.risks.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Risks:
          </span>
          <div className="mt-2 space-y-2">
            {item.risks.map((risk, i) => (
              <div
                key={i}
                className="bg-orange-50 border-l-4 border-orange-500 rounded p-2"
              >
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{risk.description}</p>
                    {risk.mitigationStrategy && (
                      <p className="text-xs text-gray-700 mt-1">
                        <span className="font-medium">Mitigation:</span>{" "}
                        {risk.mitigationStrategy}
                      </p>
                    )}
                    <div className="mt-2">
                      <ExcerptLink
                        excerptId={(risk as any).excerptId}
                        onClick={onExcerptClick}
                        label="View risk source"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Excerpt */}
      {item.excerpt &&
        !item.relevantPolicies.length &&
        !item.keyInsights.length && (
          <div className="mt-2">
            <ExcerptLink
              excerptId={(item as any).excerptId}
              onClick={onExcerptClick}
              label="View source"
            />
          </div>
        )}
    </div>
  );
};

export function TwoLayerFinancialsSection({
  data,
  onExcerptClick,
}: TwoLayerFinancialsSectionProps) {
  return (
    <CollapsibleCard
      title="Integrated Financial Analysis"
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
      <div className="space-y-8">
        {/* Executive Summary */}
        <InfoBlock title="Executive Summary" variant="info">
          <p className="text-gray-700 leading-relaxed mb-3">
            {data.executiveSummary.overview}
          </p>
          {data.executiveSummary.keyHighlights.length > 0 && (
            <ul className="list-disc ml-5 space-y-1 mb-3">
              {data.executiveSummary.keyHighlights.map((highlight, i) => (
                <li key={i} className="text-sm text-gray-700">
                  {highlight}
                </li>
              ))}
            </ul>
          )}
          <ExcerptLink
            excerptId={(data.executiveSummary as any).excerptId}
            onClick={onExcerptClick}
          />
        </InfoBlock>

        {/* INCOME STATEMENT */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Income Statement
          </h4>
          <div className="space-y-1">
            {Object.values(data.incomeStatement).map((item, idx) => (
              <IntegratedItemRow
                key={idx}
                item={item}
                onExcerptClick={onExcerptClick}
              />
            ))}
          </div>
        </div>

        {/* BALANCE SHEET */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-5">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Balance Sheet
          </h4>
          <div className="space-y-1">
            {Object.values(data.balanceSheet).map((item, idx) => (
              <IntegratedItemRow
                key={idx}
                item={item}
                onExcerptClick={onExcerptClick}
              />
            ))}
          </div>
        </div>

        {/* CASH FLOW */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-5">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Cash Flow Statement
          </h4>
          <div className="space-y-1">
            {Object.values(data.cashFlow).map((item, idx) => (
              <IntegratedItemRow
                key={idx}
                item={item}
                onExcerptClick={onExcerptClick}
              />
            ))}
          </div>
        </div>

        {/* KEY RATIOS */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-5">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-amber-600"
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
            Key Financial Ratios
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(data.ratios).map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 border-2 border-amber-200 shadow-sm"
              >
                <IntegratedItemRow
                  item={item}
                  onExcerptClick={onExcerptClick}
                />
              </div>
            ))}
          </div>
        </div>

        {/* COMMITMENTS & CONTINGENCIES */}
        {data.commitmentsContingencies.length > 0 && (
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Commitments & Contingencies
            </h4>
            <div className="space-y-3">
              {data.commitmentsContingencies.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {item.type}
                    </span>
                    {item.amount && (
                      <span className="text-lg font-bold text-orange-700">
                        {item.amount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {item.description}
                  </p>
                  {item.timing && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Timeline:</span>{" "}
                      {item.timing}
                    </p>
                  )}
                  {item.probability && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Probability:</span>{" "}
                      {item.probability}
                    </p>
                  )}
                  <div className="mt-3">
                    <ExcerptLink
                      excerptId={(item as any).excerptId}
                      onClick={onExcerptClick}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIGNIFICANT ACCOUNTING POLICIES */}
        {data.significantAccountingPolicies.length > 0 && (
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Significant Accounting Policies
            </h4>
            <div className="space-y-3">
              {data.significantAccountingPolicies.map((policy, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <h5 className="font-semibold text-gray-900 mb-2">
                    {policy.policy}
                  </h5>
                  <p className="text-sm text-gray-700 mb-2">
                    {policy.description}
                  </p>
                  {policy.changes && (
                    <p className="text-sm text-orange-600">
                      <span className="font-medium">Changes:</span>{" "}
                      {policy.changes}
                    </p>
                  )}
                  <div className="mt-3">
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

        {/* SUBSEQUENT EVENTS */}
        {data.subsequentEvents.length > 0 && (
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              Subsequent Events
            </h4>
            <div className="space-y-2">
              {data.subsequentEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {event.event}
                      </span>
                      {event.date && (
                        <span className="text-xs text-gray-600 ml-2">
                          ({event.date})
                        </span>
                      )}
                      <p className="text-sm text-gray-700 mt-1">
                        {event.impact}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ExcerptLink
                      excerptId={(event as any).excerptId}
                      onClick={onExcerptClick}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OVERALL ASSESSMENT */}
        <InfoBlock title="Overall Assessment" variant="success">
          {data.overallAssessment.strengths.length > 0 && (
            <div className="mb-4">
              <span className="font-semibold text-sm text-green-700">
                ✓ Strengths:
              </span>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                {data.overallAssessment.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.overallAssessment.concerns.length > 0 && (
            <div className="mb-4">
              <span className="font-semibold text-sm text-orange-700">
                ⚠ Concerns:
              </span>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                {data.overallAssessment.concerns.map((c, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.overallAssessment.unusualItems.length > 0 && (
            <div className="mb-4">
              <span className="font-semibold text-sm text-blue-700">
                ℹ Unusual Items:
              </span>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                {data.overallAssessment.unusualItems.map((u, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-gray-700 leading-relaxed border-t border-gray-200 pt-3">
            {data.overallAssessment.summary}
          </p>
          <div className="mt-3">
            <ExcerptLink
              excerptId={(data.overallAssessment as any).excerptId}
              onClick={onExcerptClick}
            />
          </div>
        </InfoBlock>
      </div>
    </CollapsibleCard>
  );
}
