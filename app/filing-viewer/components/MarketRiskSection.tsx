// app/filing-viewer/components/MarketRiskSection.tsx
import { MarketRiskAnalysis } from "@/app/api/analyze-sec/schemas";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";

interface MarketRiskSectionProps {
  data: MarketRiskAnalysis;
  onExcerptClick: (id: string) => void;
}

export function MarketRiskSection({
  data,
  onExcerptClick,
}: MarketRiskSectionProps) {
  const RiskCard = ({
    title,
    risk,
    color,
  }: {
    title: string;
    risk: any;
    color: string;
  }) => {
    if (!risk || risk.exposure === "None reported") return null;

    return (
      <div
        className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}
      >
        <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Exposure:</span>
            <p className="mt-1 text-gray-700">{risk.exposure}</p>
            {(risk as any).originalExcerptId && (
              <ExcerptLink
                excerptId={(risk as any).originalExcerptId}
                onClick={onExcerptClick}
              />
            )}
          </div>

          {risk.potentialImpact && (
            <div>
              <span className="font-medium">Potential Impact:</span>
              <p className="mt-1 text-gray-700">
                {risk.potentialImpact.description}
              </p>
              {(risk.potentialImpact as any).originalExcerptId && (
                <ExcerptLink
                  excerptId={(risk.potentialImpact as any).originalExcerptId}
                  onClick={onExcerptClick}
                />
              )}
            </div>
          )}

          {risk.mitigationStrategies &&
            risk.mitigationStrategies.length > 0 && (
              <div>
                <span className="font-medium">Mitigation:</span>
                <ul className="mt-1 ml-4 list-disc text-gray-700">
                  {risk.mitigationStrategies.map(
                    (strategy: string, i: number) => (
                      <li key={i}>{strategy}</li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <CollapsibleCard
      title="Market Risk"
      icon={
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
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      }
    >
      {/* Overview */}
      {data.overallSummaryAndPhilosophy && (
        <InfoBlock title="Market Risk Philosophy" variant="info">
          <p>{data.overallSummaryAndPhilosophy.summary}</p>
          <ExcerptLink
            excerptId={
              (data.overallSummaryAndPhilosophy as any).originalExcerptId
            }
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}

      <div className="space-y-3">
        <RiskCard
          title="Interest Rate Risk"
          risk={data.interestRateRisk}
          color="blue"
        />
        <RiskCard
          title="Currency Risk"
          risk={data.currencyRisk}
          color="green"
        />
        <RiskCard
          title="Commodity Price Risk"
          risk={data.commodityPriceRisk}
          color="yellow"
        />
        <RiskCard
          title="Equity Price Risk"
          risk={data.equityPriceRisk}
          color="purple"
        />
      </div>

      {/* Derivatives */}
      {data.derivativeFinancialInstrumentsUsage &&
        data.derivativeFinancialInstrumentsUsage.summary !==
          "None reported" && (
          <InfoBlock title="Derivative Instruments" variant="default">
            <p className="mb-2">
              {data.derivativeFinancialInstrumentsUsage.summary}
            </p>

            {data.derivativeFinancialInstrumentsUsage.typesOfDerivatives
              ?.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Types:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.derivativeFinancialInstrumentsUsage.typesOfDerivatives.map(
                    (type, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-200 rounded text-xs"
                      >
                        {type}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {data.derivativeFinancialInstrumentsUsage.objectives?.length >
              0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Objectives:</span>
                <ul className="ml-4 mt-1 list-disc text-sm">
                  {data.derivativeFinancialInstrumentsUsage.objectives.map(
                    (obj, i) => (
                      <li key={i}>{obj}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            <ExcerptLink
              excerptId={
                (data.derivativeFinancialInstrumentsUsage as any)
                  .originalExcerptId
              }
              onClick={onExcerptClick}
            />
          </InfoBlock>
        )}

      {/* Key Takeaways */}
      {data.keyTakeawaysConcernsAndFutureOutlook && (
        <InfoBlock title="Key Takeaways" variant="warning">
          <ul className="space-y-1">
            {data.keyTakeawaysConcernsAndFutureOutlook.takeaways?.map(
              (takeaway, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>{takeaway}</span>
                </li>
              )
            )}
          </ul>
          <ExcerptLink
            excerptId={
              (data.keyTakeawaysConcernsAndFutureOutlook as any)
                .originalExcerptId
            }
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}
    </CollapsibleCard>
  );
}
