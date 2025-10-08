// components/sec-test-components/MarketRiskSection.tsx
import { MarketRiskAnalysis } from "@/app/api/analyze-sec/schemas";

// RiskCard'ı aynı dosya içinde tanımlıyoruz
interface RiskCardProps {
  title: string;
  exposure: string;
  potentialImpact: any;
  mitigationStrategies: string[];
  riskType: string;
}

function RiskCard({
  title,
  exposure,
  potentialImpact,
  mitigationStrategies,
  riskType,
}: RiskCardProps) {
  return (
    <div className="ml-4 mt-4 p-3 border rounded-md bg-indigo-50">
      <h5 className="font-semibold text-indigo-700">{title}:</h5>
      <p className="ml-2">
        <strong>Exposure:</strong> {exposure}
      </p>
      <p className="ml-2">
        <strong>Potential Impact:</strong> {potentialImpact.description}
      </p>
      {potentialImpact.sensitivityAnalysisDetails && (
        <div className="ml-4 text-sm text-gray-700">
          <p>
            Sensitivity:{" "}
            {potentialImpact.sensitivityAnalysisDetails.changePercentage} change
            {riskType === "currency" &&
              potentialImpact.sensitivityAnalysisDetails.currencyPair &&
              ` in ${potentialImpact.sensitivityAnalysisDetails.currencyPair}`}
            {riskType === "commodity" &&
              potentialImpact.sensitivityAnalysisDetails.commodity &&
              ` in ${potentialImpact.sensitivityAnalysisDetails.commodity}`}
            , impact on{" "}
            {potentialImpact.sensitivityAnalysisDetails.affectedMetric} by{" "}
            {potentialImpact.sensitivityAnalysisDetails.impactValue}
            {potentialImpact.sensitivityAnalysisDetails.period !== "N/A" &&
              ` over ${potentialImpact.sensitivityAnalysisDetails.period}`}
          </p>
        </div>
      )}
      {mitigationStrategies.length > 0 && (
        <div className="ml-2 mt-2">
          <h6 className="font-medium">Mitigation Strategies:</h6>
          <ul className="list-disc ml-5 text-sm">
            {mitigationStrategies.map((strategy, idx) => (
              <li key={idx}>{strategy}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface MarketRiskSectionProps {
  data: MarketRiskAnalysis;
}

export function MarketRiskSection({ data }: MarketRiskSectionProps) {
  return (
    <div className="mb-6 pb-4 border-b">
      <h4 className="text-lg font-medium text-indigo-600 mb-2">
        Market Risk Analysis
      </h4>
      <p className="mb-2">
        <strong>Title:</strong> {data.title}
      </p>
      <p className="mb-2">
        <strong>Summary & Philosophy:</strong>{" "}
        {data.overallSummaryAndPhilosophy.summary}
      </p>
      {data.overallSummaryAndPhilosophy.originalExcerpt && (
        <p className="text-sm italic text-gray-600 mb-2">
          Excerpt: {data.overallSummaryAndPhilosophy.originalExcerpt}
        </p>
      )}

      {/* Interest Rate Risk */}
      <RiskCard
        title="Interest Rate Risk"
        exposure={data.interestRateRisk.exposure}
        potentialImpact={data.interestRateRisk.potentialImpact}
        mitigationStrategies={data.interestRateRisk.mitigationStrategies}
        riskType="interest"
      />

      {/* Currency Risk */}
      <RiskCard
        title="Currency Risk"
        exposure={data.currencyRisk.exposure}
        potentialImpact={data.currencyRisk.potentialImpact}
        mitigationStrategies={data.currencyRisk.mitigationStrategies}
        riskType="currency"
      />

      {/* Commodity Price Risk */}
      <RiskCard
        title="Commodity Price Risk"
        exposure={data.commodityPriceRisk.exposure}
        potentialImpact={data.commodityPriceRisk.potentialImpact}
        mitigationStrategies={data.commodityPriceRisk.mitigationStrategies}
        riskType="commodity"
      />

      {/* Equity Price Risk */}
      <RiskCard
        title="Equity Price Risk"
        exposure={data.equityPriceRisk.exposure}
        potentialImpact={data.equityPriceRisk.potentialImpact}
        mitigationStrategies={data.equityPriceRisk.mitigationStrategies}
        riskType="equity"
      />

      {/* Derivative Financial Instruments */}
      <div className="ml-4 mt-4 p-3 border rounded-md bg-indigo-50">
        <h5 className="font-semibold text-indigo-700">
          Derivative Financial Instruments Usage:
        </h5>
        <p className="ml-2">
          <strong>Summary:</strong>{" "}
          {data.derivativeFinancialInstrumentsUsage.summary}
        </p>
        {data.derivativeFinancialInstrumentsUsage.typesOfDerivatives.length >
          0 && (
          <div className="ml-2 mt-2">
            <h6 className="font-medium">Types of Derivatives:</h6>
            <ul className="list-disc ml-5 text-sm">
              {data.derivativeFinancialInstrumentsUsage.typesOfDerivatives.map(
                (type, idx) => (
                  <li key={idx}>{type}</li>
                )
              )}
            </ul>
          </div>
        )}
        {data.derivativeFinancialInstrumentsUsage.objectives.length > 0 && (
          <div className="ml-2 mt-2">
            <h6 className="font-medium">Objectives:</h6>
            <ul className="list-disc ml-5 text-sm">
              {data.derivativeFinancialInstrumentsUsage.objectives.map(
                (obj, idx) => (
                  <li key={idx}>{obj}</li>
                )
              )}
            </ul>
          </div>
        )}
        {data.derivativeFinancialInstrumentsUsage.originalExcerpt && (
          <p className="text-xs italic text-gray-600 mt-2">
            Excerpt: {data.derivativeFinancialInstrumentsUsage.originalExcerpt}
          </p>
        )}
      </div>

      {/* Key Takeaways */}
      <div className="ml-4 mt-4 p-3 border rounded-md bg-indigo-50">
        <h5 className="font-semibold text-indigo-700">
          Key Takeaways, Concerns & Future Outlook:
        </h5>
        <ul className="list-disc ml-5 text-sm">
          {data.keyTakeawaysConcernsAndFutureOutlook.takeaways.map(
            (item, idx) => (
              <li key={idx}>{item}</li>
            )
          )}
        </ul>
        {data.keyTakeawaysConcernsAndFutureOutlook.originalExcerpt && (
          <p className="text-xs italic text-gray-600 mt-2">
            Excerpt: {data.keyTakeawaysConcernsAndFutureOutlook.originalExcerpt}
          </p>
        )}
      </div>
    </div>
  );
}
