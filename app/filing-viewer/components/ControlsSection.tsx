// app/filing-viewer/components/ControlsSection.tsx
import { ControlsAnalysis } from "@/app/api/analyze-sec/schemas";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";

interface ControlsSectionProps {
  data: ControlsAnalysis;
  onExcerptClick: (id: string) => void;
}

export function ControlsSection({
  data,
  onExcerptClick,
}: ControlsSectionProps) {
  const StatusBadge = ({ status }: { status: string }) => {
    const isEffective = status?.toLowerCase() === "effective";
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          isEffective
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <CollapsibleCard
      title="Internal Controls"
      icon={
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      }
    >
      {/* Controls Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-2">Disclosure Controls</div>
          <StatusBadge
            status={
              data.managementConclusionDisclosureControls?.conclusion || "N/A"
            }
          />
          <div className="mt-3">
            <ExcerptLink
              excerptId={
                (data.managementConclusionDisclosureControls as any)?.excerptId
              }
              onClick={onExcerptClick}
            />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-2">ICFR Assessment</div>
          <StatusBadge
            status={data.managementReportICFR?.assessment || "N/A"}
          />
          <div className="mt-3">
            <ExcerptLink
              excerptId={(data.managementReportICFR as any)?.excerptId}
              onClick={onExcerptClick}
            />
          </div>
        </div>
      </div>

      {/* Material Weaknesses */}
      {data.materialWeaknessesICFR &&
        data.materialWeaknessesICFR.length > 0 &&
        data.materialWeaknessesICFR[0].description !== "None reported." && (
          <InfoBlock title="Material Weaknesses" variant="error">
            {data.materialWeaknessesICFR.map((weakness, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <p className="font-medium">{weakness.description}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Impact: {weakness.potentialImpact}
                </p>
                <ExcerptLink
                  excerptId={(weakness as any).excerptId}
                  onClick={onExcerptClick}
                />
              </div>
            ))}
          </InfoBlock>
        )}

      {/* Remediation */}
      {data.remediationEfforts &&
        data.remediationEfforts.length > 0 &&
        data.remediationEfforts[0].description !== "Not applicable." && (
          <InfoBlock title="Remediation Efforts" variant="success">
            {data.remediationEfforts.map((effort, idx) => (
              <div key={idx} className="mb-2 last:mb-0">
                <p>{effort.description}</p>
                <ExcerptLink
                  excerptId={(effort as any).excerptId}
                  onClick={onExcerptClick}
                />
              </div>
            ))}
          </InfoBlock>
        )}

      {/* Changes */}
      {data.changesInICFR && data.changesInICFR !== "None reported." && (
        <InfoBlock title="Changes in ICFR" variant="warning">
          <p>{data.changesInICFR}</p>
        </InfoBlock>
      )}

      {/* Auditor Opinion */}
      {data.auditorOpinionICFR && (
        <InfoBlock title="Auditor Opinion" variant="info">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Conclusion:</span>
              <span className="ml-2">{data.auditorOpinionICFR.conclusion}</span>
            </div>
            {data.auditorOpinionICFR.differenceFromManagement !==
              "Not applicable." && (
              <div className="text-orange-600">
                ⚠️ {data.auditorOpinionICFR.differenceFromManagement}
              </div>
            )}
            <ExcerptLink
              excerptId={(data.auditorOpinionICFR as any).excerptId}
              onClick={onExcerptClick}
            />
          </div>
        </InfoBlock>
      )}

      {/* Key Takeaways */}
      {data.keyTakeawaysConcerns &&
        data.keyTakeawaysConcerns.length > 0 &&
        data.keyTakeawaysConcerns[0] !== "None identified." && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Concerns</h4>
            <ul className="space-y-1">
              {data.keyTakeawaysConcerns.map((concern, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </CollapsibleCard>
  );
}
