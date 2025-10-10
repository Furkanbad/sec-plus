// app/filing-viewer/components/DirectorsSection.tsx
import { DirectorsAnalysis } from "@/app/api/analyze-sec/schemas";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";

interface DirectorsSectionProps {
  data: DirectorsAnalysis;
  onExcerptClick: (id: string) => void;
}

export function DirectorsSection({
  data,
  onExcerptClick,
}: DirectorsSectionProps) {
  return (
    <CollapsibleCard
      title="Board of Directors"
      badge={`${data.boardCompositionOverview?.totalDirectors || 0} Directors`}
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
    >
      {/* Board Composition */}
      {data.boardCompositionOverview && (
        <InfoBlock title="Board Composition" variant="info">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <div className="text-sm text-gray-500">Total Directors</div>
              <div className="text-2xl font-bold">
                {data.boardCompositionOverview.totalDirectors}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Independent</div>
              <div className="text-2xl font-bold text-green-600">
                {data.boardCompositionOverview.independentDirectorsPercentage}
              </div>
            </div>
          </div>
          {data.boardCompositionOverview.diversityComment &&
            data.boardCompositionOverview.diversityComment !==
              "Not discussed." && (
              <p className="text-sm mt-2">
                <span className="font-medium">Diversity:</span>{" "}
                {data.boardCompositionOverview.diversityComment}
              </p>
            )}
          <ExcerptLink
            excerptId={(data.boardCompositionOverview as any).originalExcerptId}
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}

      {/* Leadership Structure */}
      {data.boardLeadershipStructure && (
        <InfoBlock title="Leadership Structure" variant="default">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Chairman:</span>
              <span>{data.boardLeadershipStructure.chairman}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">CEO:</span>
              <span>{data.boardLeadershipStructure.ceo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Roles Combined:</span>
              <span
                className={
                  data.boardLeadershipStructure.rolesCombined
                    ? "text-orange-600"
                    : "text-green-600"
                }
              >
                {data.boardLeadershipStructure.rolesCombined ? "Yes" : "No"}
              </span>
            </div>
            {data.boardLeadershipStructure.leadIndependentDirector &&
              data.boardLeadershipStructure.leadIndependentDirector !==
                "None" && (
                <div className="flex justify-between">
                  <span className="font-medium">Lead Independent:</span>
                  <span>
                    {data.boardLeadershipStructure.leadIndependentDirector}
                  </span>
                </div>
              )}
          </div>
          {data.boardLeadershipStructure.rationaleComment &&
            data.boardLeadershipStructure.rationaleComment !==
              "Not discussed." && (
              <p className="mt-2 text-sm text-gray-700">
                {data.boardLeadershipStructure.rationaleComment}
              </p>
            )}
          <ExcerptLink
            excerptId={(data.boardLeadershipStructure as any).originalExcerptId}
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}

      {/* Directors List */}
      {data.directors && data.directors.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Directors</h4>
          <div className="space-y-2">
            {data.directors.map((director, idx) => (
              <div key={idx} className="bg-white border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {director.name}
                    </h5>
                    <p className="text-sm text-gray-600">{director.title}</p>
                  </div>
                  <div className="text-right">
                    {director.age && director.age !== "N/A" && (
                      <div className="text-sm text-gray-500">
                        Age {director.age}
                      </div>
                    )}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                        director.isIndependent
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {director.isIndependent
                        ? "Independent"
                        : "Non-Independent"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  {director.qualifications}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Committees */}
      {data.boardCommittees && data.boardCommittees.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Board Committees</h4>
          <div className="space-y-3">
            {data.boardCommittees.map((committee, idx) => (
              <div
                key={idx}
                className="bg-purple-50 border border-purple-200 rounded-lg p-3"
              >
                <h5 className="font-medium text-gray-900 mb-1">
                  {committee.committeeName}
                </h5>
                <p className="text-sm text-gray-700 mb-2">
                  {committee.responsibilities}
                </p>
                {committee.members && committee.members.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Members:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {committee.members.map((member, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded text-xs ${
                            member.isIndependent
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Independence Assessment */}
      {data.directorIndependenceAssessment && (
        <InfoBlock title="Independence Assessment">
          <div className="space-y-2 text-sm">
            <p>{data.directorIndependenceAssessment.assessment}</p>
            <div>
              <span className="font-medium">Criteria:</span>
              <span className="ml-2">
                {data.directorIndependenceAssessment.criteriaUsed}
              </span>
            </div>
            {data.directorIndependenceAssessment.ambiguousCases &&
              data.directorIndependenceAssessment.ambiguousCases !==
                "None." && (
                <div>
                  <span className="font-medium">Ambiguous Cases:</span>
                  <p className="mt-1">
                    {data.directorIndependenceAssessment.ambiguousCases}
                  </p>
                </div>
              )}
          </div>
        </InfoBlock>
      )}

      {/* Key Takeaways */}
      {data.keyTakeawaysConcerns && data.keyTakeawaysConcerns.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Takeaways</h4>
          <ul className="space-y-1">
            {data.keyTakeawaysConcerns.map((takeaway, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 flex items-start gap-2"
              >
                <span className="text-purple-600 mt-1">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CollapsibleCard>
  );
}
