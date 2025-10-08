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
      <p className="text-sm italic text-gray-600">
        Excerpt: {data.summaryExcerpt}
      </p>
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
    </div>
  );
}
