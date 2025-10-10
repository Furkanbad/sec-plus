// app/filing-viewer/components/LegalSection.tsx
import { LegalAnalysis } from "@/app/api/analyze-sec/schemas";
import { InfoBlock } from "./shared/InfoBlock";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";

interface LegalSectionProps {
  data: LegalAnalysis;
  onExcerptClick: (id: string) => void;
}

export function LegalSection({ data, onExcerptClick }: LegalSectionProps) {
  return (
    <CollapsibleCard
      title="Legal Proceedings"
      badge={`${data.materialCases?.length || 0} Cases`}
      badgeColor="bg-purple-100 text-purple-800"
      icon={
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      }
    >
      {/* Overall Summary */}
      <InfoBlock title="Legal Summary" variant="info">
        <p>{data.overallLegalSummary}</p>
        <ExcerptLink
          excerptId={(data as any).overallLegalSummaryExcerptId}
          onClick={onExcerptClick}
        />
      </InfoBlock>

      {/* Material Cases */}
      {data.materialCases && data.materialCases.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Material Legal Cases</h4>
          {data.materialCases.map((legalCase, idx) => (
            <div
              key={idx}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <h5 className="font-semibold text-gray-900 mb-3">
                {legalCase.caseTitle}
              </h5>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Nature of Claim:
                  </span>
                  <p className="mt-1 text-gray-600">
                    {legalCase.natureOfClaim}
                  </p>
                  <ExcerptLink
                    excerptId={(legalCase as any).natureOfClaimExcerptId}
                    onClick={onExcerptClick}
                  />
                </div>

                <div>
                  <span className="font-medium text-gray-700">
                    Current Status:
                  </span>
                  <p className="mt-1 text-gray-600">
                    {legalCase.currentStatus}
                  </p>
                  <ExcerptLink
                    excerptId={(legalCase as any).currentStatusExcerptId}
                    onClick={onExcerptClick}
                  />
                </div>

                <div>
                  <span className="font-medium text-gray-700">
                    Company Position:
                  </span>
                  <p className="mt-1 text-gray-600">
                    {legalCase.companyPosition}
                  </p>
                  <ExcerptLink
                    excerptId={(legalCase as any).companyPositionExcerptId}
                    onClick={onExcerptClick}
                  />
                </div>

                {legalCase.potentialFinancialImpact && (
                  <div className="bg-white rounded p-3 border border-red-300">
                    <span className="font-medium text-gray-900">
                      Financial Impact:
                    </span>
                    <div className="mt-2 space-y-1 text-xs">
                      <div>
                        Loss Range:{" "}
                        {legalCase.potentialFinancialImpact.estimatedLossRange}
                      </div>
                      <div>
                        Reserves:{" "}
                        {legalCase.potentialFinancialImpact.reservesSetAside}
                      </div>
                      <div>
                        Insurance:{" "}
                        {legalCase.potentialFinancialImpact.insuranceCoverage}
                      </div>
                      <p className="mt-2">
                        {legalCase.potentialFinancialImpact.impactDescription}
                      </p>
                    </div>
                    <ExcerptLink
                      excerptId={
                        (legalCase.potentialFinancialImpact as any)
                          .originalExcerptId
                      }
                      onClick={onExcerptClick}
                    />
                  </div>
                )}

                {legalCase.keyDates && legalCase.keyDates.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Key Dates:
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {legalCase.keyDates.map((date, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regulatory Inquiries */}
      {data.regulatoryInquiries &&
        data.regulatoryInquiries !== "None reported" && (
          <InfoBlock title="Regulatory Inquiries" variant="warning">
            <p>{data.regulatoryInquiries}</p>
            <ExcerptLink
              excerptId={(data as any).regulatoryInquiriesExcerptId}
              onClick={onExcerptClick}
            />
          </InfoBlock>
        )}

      {/* Environmental */}
      {data.environmentalLitigation &&
        data.environmentalLitigation !== "None reported" && (
          <InfoBlock title="Environmental Litigation" variant="warning">
            <p>{data.environmentalLitigation}</p>
            <ExcerptLink
              excerptId={(data as any).environmentalLitigationExcerptId}
              onClick={onExcerptClick}
            />
          </InfoBlock>
        )}

      {/* Risk Assessment */}
      <InfoBlock title="Overall Risk Assessment" variant="error">
        <p>{data.overallRiskAssessment}</p>
        <ExcerptLink
          excerptId={(data as any).overallRiskAssessmentExcerptId}
          onClick={onExcerptClick}
        />
      </InfoBlock>
    </CollapsibleCard>
  );
}
