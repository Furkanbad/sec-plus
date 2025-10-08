// components/sec-test-components/ControlsSection.tsx
import { ControlsAnalysis } from "@/app/api/analyze-sec/schemas"; // Doğru yolu ayarla, assuming schemas export ControlsAnalysis directly now

interface ControlsSectionProps {
  data: ControlsAnalysis;
}

export function ControlsSection({ data }: ControlsSectionProps) {
  const isExcerptValid = (excerpt: string | undefined) =>
    excerpt &&
    excerpt !== "No description available." &&
    excerpt !== "No direct excerpt found.";

  const renderDescriptionAndExcerpt = (
    description: string,
    excerpt: string | undefined, // excerpt can be undefined
    descriptionLabel: string = "Description"
  ) => (
    <>
      <p>
        <strong>{descriptionLabel}:</strong> {description}
      </p>
      {isExcerptValid(excerpt) && (
        <p className="text-sm italic text-gray-600 mb-2">Excerpt: {excerpt}</p>
      )}
    </>
  );

  return (
    <div className="mb-6 border-b pb-4">
      <h4 className="text-lg font-medium text-blue-600 mb-4">
        Internal Controls Analysis
      </h4>

      {/* Management's Conclusion on Disclosure Controls */}
      <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
        <h5 className="font-semibold text-md text-gray-800 mb-2">
          Management's Conclusion on Disclosure Controls
        </h5>
        {renderDescriptionAndExcerpt(
          data.managementConclusionDisclosureControls.conclusion,
          data.managementConclusionDisclosureControls.excerpt,
          "Conclusion"
        )}
      </div>

      {/* Management's Report on Internal Control Over Financial Reporting (ICFR) */}
      <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
        <h5 className="font-semibold text-md text-gray-800 mb-2">
          Management's Report on ICFR
        </h5>
        {renderDescriptionAndExcerpt(
          data.managementReportICFR.assessment,
          data.managementReportICFR.excerpt,
          "Assessment"
        )}
      </div>

      {/* Material Weaknesses in ICFR */}
      <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
        <h5 className="font-semibold text-md text-gray-800 mb-2">
          Material Weaknesses in ICFR
        </h5>
        {data.materialWeaknessesICFR &&
        data.materialWeaknessesICFR.length > 0 &&
        data.materialWeaknessesICFR[0].description !== "None reported." ? (
          <ul className="list-disc ml-5 space-y-2">
            {data.materialWeaknessesICFR.map((weakness, index) => (
              <li key={index}>
                <p>
                  <strong>Description:</strong> {weakness.description}
                </p>
                <p>
                  <strong>Potential Impact:</strong> {weakness.potentialImpact}
                </p>
                {isExcerptValid(weakness.excerpt) && (
                  <p className="text-sm italic text-gray-600">
                    Excerpt: {weakness.excerpt}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p>
              <strong>Description:</strong> None reported.
            </p>
            {data.materialWeaknessesICFR &&
              data.materialWeaknessesICFR.length > 0 &&
              isExcerptValid(data.materialWeaknessesICFR[0]?.excerpt) && (
                <span className="text-sm italic text-gray-600 block">
                  Excerpt: {data.materialWeaknessesICFR[0].excerpt}
                </span>
              )}
          </div>
        )}
      </div>

      {/* Remediation Efforts */}
      <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
        <h5 className="font-semibold text-md text-gray-800 mb-2">
          Remediation Efforts
        </h5>
        {data.remediationEfforts &&
        data.remediationEfforts.length > 0 &&
        data.remediationEfforts[0].description !== "Not applicable." ? (
          <ul className="list-disc ml-5 space-y-2">
            {data.remediationEfforts.map((effort, index) => (
              <li key={index}>
                {renderDescriptionAndExcerpt(
                  effort.description,
                  effort.excerpt
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <p>
              <strong>Description:</strong> Not applicable.
            </p>
            {data.remediationEfforts &&
              data.remediationEfforts.length > 0 &&
              isExcerptValid(data.remediationEfforts[0]?.excerpt) && (
                <span className="text-sm italic text-gray-600 block">
                  Excerpt: {data.remediationEfforts[0].excerpt}
                </span>
              )}
          </div>
        )}
      </div>

      {/* Changes in ICFR */}
      <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
        <h5 className="font-semibold text-md text-gray-800 mb-2">
          Changes in ICFR
        </h5>
        <p>
          <strong>Description:</strong> {data.changesInICFR}
        </p>
        {/* No excerpt field for changesInICFR in your schema, so we don't display one */}
      </div>

      {/* Independent Registered Public Accounting Firm's Opinion */}
      <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
        <h5 className="font-semibold text-md text-gray-800 mb-2">
          Auditor's Opinion on ICFR
        </h5>
        <p>
          <strong>Conclusion:</strong> {data.auditorOpinionICFR.conclusion}
        </p>
        <p>
          <strong>Difference from Management:</strong>{" "}
          {data.auditorOpinionICFR.differenceFromManagement}
        </p>
        {isExcerptValid(data.auditorOpinionICFR.excerpt) && (
          <p className="text-sm italic text-gray-600 mb-2">
            Excerpt: {data.auditorOpinionICFR.excerpt}
          </p>
        )}
      </div>

      {/* Key Takeaways/Concerns */}
      <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
        <h5 className="font-semibold text-md text-gray-800 mb-2">
          Key Takeaways/Concerns
        </h5>
        {data.keyTakeawaysConcerns &&
        data.keyTakeawaysConcerns.length > 0 &&
        data.keyTakeawaysConcerns[0] !== "None identified." ? (
          <ul className="list-disc ml-5 space-y-1">
            {data.keyTakeawaysConcerns.map((concern, index) => (
              <li key={index}>{concern}</li>
            ))}
          </ul>
        ) : (
          <p>None identified.</p>
        )}
        {/* No excerpt field for keyTakeawaysConcerns in your schema */}
      </div>
    </div>
  );
}
