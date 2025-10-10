// app/filing-viewer/components/RiskSection.tsx
import { RiskAnalysis } from "@/app/api/analyze-sec/schemas";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";

interface RiskSectionProps {
  data: RiskAnalysis;
  onExcerptClick: (id: string) => void;
}

export function RiskSection({ data, onExcerptClick }: RiskSectionProps) {
  const severityColors: any = {
    high: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    medium: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
    low: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
  };

  return (
    <CollapsibleCard
      title="Risk Factors"
      badge={`${data.risks?.length || 0} Risks`}
      badgeColor="bg-red-100 text-red-800"
      icon={
        <svg
          className="w-6 h-6 text-red-600"
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
      }
    >
      {/* Overall Summary */}
      <InfoBlock title="Overall Risk Assessment" variant="warning">
        <p>{data.overallRiskSummary}</p>
      </InfoBlock>

      {/* Individual Risks */}
      <div className="space-y-3">
        {data.risks?.map((risk, idx) => {
          const colors = severityColors[risk.severity];
          return (
            <div
              key={idx}
              className={`border-l-4 ${colors.border} bg-gray-50 rounded-r-lg p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-gray-900 flex-1">
                  {risk.title}
                </h5>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} ml-3`}
                >
                  {risk.severity.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">{risk.category}</span>
                </div>

                <div>
                  <span className="font-medium text-gray-700">
                    Description:
                  </span>
                  <p className="mt-1 text-gray-600">{risk.description}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">
                    Potential Impact:
                  </span>
                  <p className="mt-1 text-gray-600">{risk.potentialImpact}</p>
                </div>

                {risk.mitigationStrategies &&
                  risk.mitigationStrategies !==
                    "None explicitly mentioned." && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Mitigation:
                      </span>
                      <p className="mt-1 text-gray-600">
                        {risk.mitigationStrategies}
                      </p>
                    </div>
                  )}
              </div>

              <div className="mt-3">
                <ExcerptLink
                  excerptId={(risk as any).originalExcerptId}
                  onClick={onExcerptClick}
                />
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleCard>
  );
}
