// components/sec-analysis/BusinessSection.tsx
import { BusinessAnalysis } from "@/app/api/analyze-sec/schemas";

interface BusinessSectionProps {
  data: BusinessAnalysis;
}

export function BusinessSection({ data }: BusinessSectionProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <h4 className="text-lg font-medium text-blue-600 mb-2">
        Business Analysis
      </h4>
      <p>
        <strong>Summary:</strong> {data.summary}
      </p>
      <p className="text-sm italic text-gray-600 mb-4">
        Excerpt: {data.summaryExcerpt}
      </p>

      {/* Key Products */}
      {data.keyProducts && data.keyProducts.length > 0 && (
        <div className="mt-4">
          <h5 className="font-semibold">Key Products:</h5>
          <ul className="list-disc ml-5">
            {data.keyProducts.map((product, index) => (
              <li key={index}>
                <strong>{product.name}</strong> - {product.marketPosition}
                {product.originalExcerpt !== "No excerpt available." && (
                  <p className="text-xs text-gray-500 italic">
                    Excerpt: {product.originalExcerpt}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Markets */}
      {data.markets && data.markets.length > 0 && (
        <div className="mt-4">
          <h5 className="font-semibold">Geographic Markets:</h5>
          <ul className="list-disc ml-5">
            {data.markets.map((market, index) => (
              <li key={index}>{market}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitive Advantages */}
      {data.competitiveAdvantages && data.competitiveAdvantages.length > 0 && (
        <div className="mt-4">
          <h5 className="font-semibold">Competitive Advantages:</h5>
          <ul className="list-disc ml-5">
            {data.competitiveAdvantages.map((advantage, index) => (
              <li key={index}>
                <strong>{advantage.description}</strong>
                {advantage.originalExcerpt !== "No excerpt available." && (
                  <p className="text-xs text-gray-500 italic">
                    Excerpt: {advantage.originalExcerpt}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Growth Strategies & Opportunities */}
      {data.growthStrategiesOpportunities &&
        data.growthStrategiesOpportunities.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold">
              Growth Strategies & Opportunities:
            </h5>
            <ul className="list-disc ml-5">
              {data.growthStrategiesOpportunities.map((strategy, index) => (
                <li key={index}>
                  <strong>{strategy.description}</strong>
                  {strategy.originalExcerpt !== "No excerpt available." && (
                    <p className="text-xs text-gray-500 italic">
                      Excerpt: {strategy.originalExcerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Target Customers */}
      {data.targetCustomers && (
        <div className="mt-4">
          <h5 className="font-semibold">Target Customers:</h5>
          <p>{data.targetCustomers.description}</p>
          {data.targetCustomers.originalExcerpt !== "No excerpt available." && (
            <p className="text-xs text-gray-500 italic">
              Excerpt: {data.targetCustomers.originalExcerpt}
            </p>
          )}
        </div>
      )}

      {/* Partnerships & Collaborations */}
      {data.partnershipsCollaborations &&
        data.partnershipsCollaborations.length > 0 && (
          <div className="mt-4">
            <h5 className="font-semibold">Partnerships & Collaborations:</h5>
            <ul className="list-disc ml-5">
              {data.partnershipsCollaborations.map((partnership, index) => (
                <li key={index}>
                  <strong>{partnership.description}</strong>
                  {partnership.originalExcerpt !== "No excerpt available." && (
                    <p className="text-xs text-gray-500 italic">
                      Excerpt: {partnership.originalExcerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Business Model */}
      {data.businessModel && (
        <div className="mt-4">
          <h5 className="font-semibold">Business Model:</h5>
          <p>{data.businessModel.description}</p>
          {data.businessModel.originalExcerpt !== "No excerpt available." && (
            <p className="text-xs text-gray-500 italic">
              Excerpt: {data.businessModel.originalExcerpt}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
