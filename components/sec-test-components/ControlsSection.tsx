// components/sec-test-components/ControlsSection.tsx
import { ControlsAnalysis } from "@/app/api/analyze-sec/schemas";

interface ControlsSectionProps {
  data: ControlsAnalysis;
}

export function ControlsSection({ data }: ControlsSectionProps) {
  const isValidExcerpt = (excerpt: string | undefined) =>
    excerpt &&
    excerpt !== "No description available." &&
    excerpt !== "No direct excerpt found." &&
    excerpt !== "No excerpt available.";

  return (
    <div className="mb-6 border-b pb-4">
      <h4 className="text-lg font-medium text-blue-600 mb-4">
        Internal Controls Analysis
      </h4>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Management's Conclusion */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-sm text-blue-800 mb-1">
            Disclosure Controls
          </h5>
          <p className="text-sm">
            <span
              className={`font-medium ${
                data.managementConclusionDisclosureControls.conclusion ===
                "effective"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {data.managementConclusionDisclosureControls.conclusion.toUpperCase()}
            </span>
          </p>
          {isValidExcerpt(
            data.managementConclusionDisclosureControls.excerpt
          ) && (
            <p className="text-xs italic text-gray-600 mt-1">
              "{data.managementConclusionDisclosureControls.excerpt}"
            </p>
          )}
        </div>

        {/* Management's ICFR Assessment */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-sm text-blue-800 mb-1">
            ICFR Assessment
          </h5>
          <p className="text-sm">
            <span
              className={`font-medium ${
                data.managementReportICFR.assessment === "effective"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {data.managementReportICFR.assessment.toUpperCase()}
            </span>
          </p>
          {isValidExcerpt(data.managementReportICFR.excerpt) && (
            <p className="text-xs italic text-gray-600 mt-1">
              "{data.managementReportICFR.excerpt}"
            </p>
          )}
        </div>
      </div>

      {/* Material Weaknesses - Only show if there are actual weaknesses */}
      {data.materialWeaknessesICFR &&
        data.materialWeaknessesICFR.length > 0 &&
        data.materialWeaknessesICFR[0].description !== "None reported." && (
          <div className="mb-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
            <h5 className="font-semibold text-sm text-red-800 mb-2">
              ⚠️ Material Weaknesses Identified
            </h5>
            {data.materialWeaknessesICFR.map((weakness, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm">
                  <strong>Issue:</strong> {weakness.description}
                </p>
                <p className="text-sm">
                  <strong>Impact:</strong> {weakness.potentialImpact}
                </p>
                {isValidExcerpt(weakness.excerpt) && (
                  <p className="text-xs italic text-gray-600 mt-1">
                    "{weakness.excerpt}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Changes in ICFR - Only show if there are changes */}
      {data.changesInICFR && data.changesInICFR !== "None reported." && (
        <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
          <h5 className="font-semibold text-sm text-yellow-800 mb-1">
            Changes in ICFR
          </h5>
          <p className="text-sm">{data.changesInICFR}</p>
        </div>
      )}

      {/* Auditor's Opinion - Compact view */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-sm text-gray-800 mb-1">
          Auditor's Opinion
        </h5>
        <div className="flex items-center gap-4">
          <span
            className={`text-sm font-medium ${
              data.auditorOpinionICFR.conclusion === "effective"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {data.auditorOpinionICFR.conclusion.toUpperCase()}
          </span>
          {data.auditorOpinionICFR.differenceFromManagement !==
            "Not applicable." && (
            <span className="text-sm text-orange-600">
              ⚠️ Differs from Management
            </span>
          )}
        </div>
        {isValidExcerpt(data.auditorOpinionICFR.excerpt) && (
          <p className="text-xs italic text-gray-600 mt-2">
            "{data.auditorOpinionICFR.excerpt}"
          </p>
        )}
      </div>

      {/* Overall Status Summary */}
      <div className="mt-4 p-2 bg-green-100 rounded text-center">
        <p className="text-sm font-medium text-green-800">
          ✅ Internal Controls Status: EFFECTIVE
        </p>
      </div>
    </div>
  );
}
