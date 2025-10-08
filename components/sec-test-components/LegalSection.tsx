// components/sec-analysis/LegalSection.tsx
import { LegalAnalysis } from "@/app/api/analyze-sec/schemas";

interface LegalSectionProps {
  data: LegalAnalysis;
}

export function LegalSection({ data }: LegalSectionProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <h4 className="text-lg font-medium text-purple-600 mb-2">
        Legal Analysis
      </h4>
      <p>
        <strong>Overall Legal Summary:</strong> {data.overallLegalSummary}
      </p>
      <p className="text-sm italic text-gray-600">
        Excerpt: {data.overallLegalSummaryExcerpt}
      </p>

      {data.materialCases && data.materialCases.length > 0 && (
        <div className="mt-4">
          <h5 className="font-semibold mb-2">Material Legal Cases:</h5>
          <ul className="list-disc ml-5">
            {data.materialCases.map((legalCase, index) => (
              <li
                key={index}
                className="mb-3 p-2 border-l-4 border-purple-300 pl-4 bg-purple-50"
              >
                <strong>Case:</strong> {legalCase.caseTitle}
                {legalCase.caseTitleExcerpt !== "No excerpt available." && (
                  <p className="text-sm text-gray-600 italic">
                    Excerpt: {legalCase.caseTitleExcerpt}
                  </p>
                )}
                <p>
                  <strong>Nature of Claim:</strong> {legalCase.natureOfClaim}
                </p>
                {legalCase.natureOfClaimExcerpt !== "No excerpt available." && (
                  <p className="text-sm text-gray-600 italic">
                    Excerpt: {legalCase.natureOfClaimExcerpt}
                  </p>
                )}
                <p>
                  <strong>Status:</strong> {legalCase.currentStatus}
                </p>
                <p>
                  <strong>Company Position:</strong> {legalCase.companyPosition}
                </p>
                <div className="ml-3 mt-2 text-sm">
                  <p>
                    <strong>Potential Financial Impact:</strong>
                  </p>
                  <ul className="list-disc ml-5">
                    <li>
                      Estimated Loss Range:{" "}
                      {legalCase.potentialFinancialImpact.estimatedLossRange}
                    </li>
                    <li>
                      Reserves Set Aside:{" "}
                      {legalCase.potentialFinancialImpact.reservesSetAside}
                    </li>
                    <li>
                      Impact Description:{" "}
                      {legalCase.potentialFinancialImpact.impactDescription}
                    </li>
                    <li>
                      Insurance Coverage:{" "}
                      {legalCase.potentialFinancialImpact.insuranceCoverage}
                    </li>
                  </ul>
                </div>
                {legalCase.keyDates && legalCase.keyDates.length > 0 && (
                  <p className="text-sm mt-1">
                    <strong>Key Dates:</strong> {legalCase.keyDates.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div>
          <p>
            <strong>Regulatory Inquiries:</strong> {data.regulatoryInquiries}
          </p>
          {data.regulatoryInquiriesExcerpt !== "No excerpt available." && (
            <p className="text-sm italic text-gray-600">
              Excerpt: {data.regulatoryInquiriesExcerpt}
            </p>
          )}
        </div>

        <div>
          <p>
            <strong>Environmental Litigation:</strong>{" "}
            {data.environmentalLitigation}
          </p>
          {data.environmentalLitigationExcerpt !== "No excerpt available." && (
            <p className="text-sm italic text-gray-600">
              Excerpt: {data.environmentalLitigationExcerpt}
            </p>
          )}
        </div>

        <div>
          <p>
            <strong>Overall Risk Assessment:</strong>{" "}
            {data.overallRiskAssessment}
          </p>
          {data.overallRiskAssessmentExcerpt !== "No excerpt available." && (
            <p className="text-sm italic text-gray-600">
              Excerpt: {data.overallRiskAssessmentExcerpt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
