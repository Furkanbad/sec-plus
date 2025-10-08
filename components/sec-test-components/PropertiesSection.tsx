// components/sec-analysis/PropertiesSection.tsx
import { PropertyAnalysis } from "@/app/api/analyze-sec/schemas";

interface PropertiesSectionProps {
  data: PropertyAnalysis;
}

export function PropertiesSection({ data }: PropertiesSectionProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <h4 className="text-lg font-medium text-green-600 mb-2">
        Properties Analysis
      </h4>
      <p>
        <strong>Overview:</strong> {data.propertiesOverview?.summary}
      </p>
      <p className="text-sm italic text-gray-600">
        Excerpt: {data.propertiesOverview?.excerpt}
      </p>
      {data.keyProperties && data.keyProperties.length > 0 && (
        <div>
          <h5 className="font-semibold mt-2">Key Properties:</h5>
          <ul className="list-disc ml-5">
            {data.keyProperties.map((prop: any, index: number) => (
              <li key={index}>
                {prop.type} - {prop.location} ({prop.status})
                {prop.size && `, Size: ${prop.size}`}
                {prop.primaryUse && `, Primary Use: ${prop.primaryUse}`}
                {prop.originalExcerpt &&
                  prop.originalExcerpt !== "No excerpt available." && (
                    <p className="text-xs text-gray-500">
                      Excerpt: {prop.originalExcerpt}
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
