import React from "react";
import { DirectorsAnalysis } from "@/app/api/analyze-sec/schemas/directorsAnalysisSchema";

interface DirectorsSectionProps {
  data: DirectorsAnalysis;
}

export const DirectorsSection: React.FC<DirectorsSectionProps> = ({ data }) => {
  // Helper to check if text is a placeholder
  const isPlaceholder = (text: string) => {
    return (
      text.includes("Direct quote") ||
      text.includes("e.g.") ||
      text === "No excerpt available." ||
      text === "Not discussed." ||
      text === "Not specified." ||
      text === "N/A"
    );
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        Board of Directors and Executive Officers Analysis
      </h3>

      {/* Board Composition Overview */}
      {data.boardCompositionOverview.totalDirectors > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Board Composition Overview
          </h4>
          <p>
            <strong>Total Directors:</strong>{" "}
            {data.boardCompositionOverview.totalDirectors}
          </p>
          <p>
            <strong>Independent Directors:</strong>{" "}
            {data.boardCompositionOverview.independentDirectorsPercentage}
          </p>
          {!isPlaceholder(data.boardCompositionOverview.diversityComment) && (
            <p>
              <strong>Diversity:</strong>{" "}
              {data.boardCompositionOverview.diversityComment}
            </p>
          )}
          {!isPlaceholder(data.boardCompositionOverview.originalExcerpt) && (
            <p className="text-sm italic text-gray-600 mt-1">
              <span className="font-medium">Quote:</span>{" "}
              {data.boardCompositionOverview.originalExcerpt}
            </p>
          )}
        </div>
      )}

      {/* Directors List */}
      {data.directors && data.directors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Directors
          </h4>
          <div className="space-y-2">
            {data.directors.map((director, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">
                  {director.name}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded ${
                      director.isIndependent
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {director.isIndependent ? "Independent" : "Non-Independent"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  {director.title !== "N/A" && `Title: ${director.title}`}
                  {director.age !== "N/A" && `, Age: ${director.age}`}
                </p>
                {director.qualifications !== "No qualifications provided." && (
                  <p className="text-sm mt-1">{director.qualifications}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Executive Officers */}
      {data.keyExecutiveOfficers && data.keyExecutiveOfficers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Key Executive Officers (Non-Board)
          </h4>
          <ul className="space-y-1">
            {data.keyExecutiveOfficers.map((officer, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <span>
                  <strong>{officer.name}</strong> - {officer.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Board Leadership Structure */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          Board Leadership Structure
        </h4>
        <div className="bg-blue-50 p-3 rounded">
          {data.boardLeadershipStructure.chairman !== "N/A" && (
            <p>
              <strong>Chairman:</strong>{" "}
              {data.boardLeadershipStructure.chairman}
            </p>
          )}
          {data.boardLeadershipStructure.ceo !== "N/A" && (
            <p>
              <strong>CEO:</strong> {data.boardLeadershipStructure.ceo}
            </p>
          )}
          <p>
            <strong>Chairman/CEO Roles Combined:</strong>{" "}
            <span
              className={`font-medium ${
                data.boardLeadershipStructure.rolesCombined
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {data.boardLeadershipStructure.rolesCombined ? "Yes" : "No"}
            </span>
          </p>
          {data.boardLeadershipStructure.leadIndependentDirector !== "None" && (
            <p>
              <strong>Lead Independent Director:</strong>{" "}
              {data.boardLeadershipStructure.leadIndependentDirector}
            </p>
          )}
          {!isPlaceholder(data.boardLeadershipStructure.rationaleComment) && (
            <p className="text-sm mt-2">
              {data.boardLeadershipStructure.rationaleComment}
            </p>
          )}
          {!isPlaceholder(data.boardLeadershipStructure.originalExcerpt) && (
            <p className="text-sm italic text-gray-600 mt-2">
              <span className="font-medium">Quote:</span>{" "}
              {data.boardLeadershipStructure.originalExcerpt}
            </p>
          )}
        </div>
      </div>

      {/* Board Committees */}
      {data.boardCommittees && data.boardCommittees.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Board Committees
          </h4>
          <div className="space-y-2">
            {data.boardCommittees.map((committee, index) => (
              <div
                key={index}
                className="border-l-4 border-indigo-400 pl-3 py-2 bg-indigo-50"
              >
                <p className="font-medium text-indigo-800">
                  {committee.committeeName}
                </p>
                {committee.responsibilities !==
                  "No responsibilities detailed." && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Responsibilities:</strong>{" "}
                    {committee.responsibilities}
                  </p>
                )}
                {committee.members && committee.members.length > 0 && (
                  <div className="mt-1">
                    <p className="text-sm font-medium">Members:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {committee.members.map((member, memIndex) => (
                        <span
                          key={memIndex}
                          className="text-xs px-2 py-1 bg-white rounded border"
                        >
                          {member.name}
                          {member.isIndependent && (
                            <span className="ml-1 text-green-600">✓</span>
                          )}
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

      {/* Independence Assessment - Only show if meaningful data */}
      {(!isPlaceholder(data.directorIndependenceAssessment.assessment) ||
        !isPlaceholder(data.directorIndependenceAssessment.criteriaUsed)) && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Director Independence Assessment
          </h4>
          {!isPlaceholder(data.directorIndependenceAssessment.assessment) && (
            <p className="text-sm">
              {data.directorIndependenceAssessment.assessment}
            </p>
          )}
          {!isPlaceholder(data.directorIndependenceAssessment.criteriaUsed) && (
            <p className="text-sm">
              <strong>Criteria:</strong>{" "}
              {data.directorIndependenceAssessment.criteriaUsed}
            </p>
          )}
          {data.directorIndependenceAssessment.ambiguousCases !== "None." &&
            !isPlaceholder(
              data.directorIndependenceAssessment.ambiguousCases
            ) && (
              <p className="text-sm">
                <strong>Special Cases:</strong>{" "}
                {data.directorIndependenceAssessment.ambiguousCases}
              </p>
            )}
        </div>
      )}

      {/* Board Skills - Only show if not placeholder */}
      {!isPlaceholder(data.boardSkillsAndExperience.summary) && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Board Skills and Experience
          </h4>
          <p className="text-sm">{data.boardSkillsAndExperience.summary}</p>
        </div>
      )}

      {/* Key Takeaways/Concerns */}
      {data.keyTakeawaysConcerns && data.keyTakeawaysConcerns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Key Takeaways
          </h4>
          <ul className="list-disc pl-5 text-sm">
            {data.keyTakeawaysConcerns.map((concern, index) => (
              <li key={index} className="text-gray-700">
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
