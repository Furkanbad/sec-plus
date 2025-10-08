// components/sec-analysis/RisksSection.tsx
import { RiskAnalysis } from "@/app/api/analyze-sec/schemas";

interface RisksSectionProps {
  data: RiskAnalysis;
}

export function RisksSection({ data }: RisksSectionProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <h4 className="text-lg font-medium text-red-600 mb-2">Risks Analysis</h4>
      <p>
        <strong>Overall Risk Summary:</strong> {data.overallRiskSummary}
      </p>
      {data.risks && data.risks.length > 0 && (
        <div>
          <h5 className="font-semibold mt-2">Identified Risks:</h5>
          <ul className="list-disc ml-5">
            {data.risks.map((risk: any, index: number) => (
              <li key={index} className="mb-2">
                <strong>{risk.title}</strong>
                (Category: {risk.category}, Severity: {risk.severity})
                <p className="text-sm italic text-gray-600">
                  {risk.description}
                </p>
                {risk.originalExcerpt &&
                  risk.originalExcerpt !== "No excerpt available." && (
                    <p className="text-xs text-gray-500">
                      Excerpt: {risk.originalExcerpt}
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
