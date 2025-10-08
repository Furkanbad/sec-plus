import React from "react";
import { DirectorsAnalysis } from "@/app/api/analyze-sec/schemas/directorsAnalysisSchema"; // Doğru yolu kontrol edin

interface DirectorsSectionProps {
  data: DirectorsAnalysis;
}

export const DirectorsSection: React.FC<DirectorsSectionProps> = ({ data }) => {
  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        {data.title || "Board of Directors and Executive Officers Analysis"}
      </h3>

      {/* Board Composition Overview */}
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
        <p>
          <strong>Diversity Comment:</strong>{" "}
          {data.boardCompositionOverview.diversityComment}
        </p>
        <p className="text-sm italic text-gray-600 mt-1">
          <span className="font-medium">Excerpt:</span>{" "}
          {data.boardCompositionOverview.originalExcerpt}
        </p>
      </div>

      {/* Directors List */}
      {data.directors && data.directors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Directors
          </h4>
          <ul className="list-disc pl-5">
            {data.directors.map((director, index) => (
              <li key={index} className="mb-2">
                <strong>{director.name}</strong> (
                {director.isIndependent ? "Independent" : "Non-Independent"})
                <br />
                Title: {director.title}, Age: {director.age}
                <br />
                Qualifications: {director.qualifications}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Executive Officers */}
      {data.keyExecutiveOfficers && data.keyExecutiveOfficers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Key Executive Officers (Non-Board Members)
          </h4>
          <ul className="list-disc pl-5">
            {data.keyExecutiveOfficers.map((officer, index) => (
              <li key={index}>
                <strong>{officer.name}</strong> - {officer.title}
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
        <p>
          <strong>Chairman:</strong> {data.boardLeadershipStructure.chairman}
        </p>
        <p>
          <strong>CEO:</strong> {data.boardLeadershipStructure.ceo}
        </p>
        <p>
          <strong>Roles Combined:</strong>{" "}
          {data.boardLeadershipStructure.rolesCombined ? "Yes" : "No"}
        </p>
        {data.boardLeadershipStructure.leadIndependentDirector !== "None" && (
          <p>
            <strong>Lead Independent Director:</strong>{" "}
            {data.boardLeadershipStructure.leadIndependentDirector}
          </p>
        )}
        <p>
          <strong>Rationale:</strong>{" "}
          {data.boardLeadershipStructure.rationaleComment}
        </p>
        <p className="text-sm italic text-gray-600 mt-1">
          <span className="font-medium">Excerpt:</span>{" "}
          {data.boardLeadershipStructure.originalExcerpt}
        </p>
      </div>

      {/* Board Committees */}
      {data.boardCommittees && data.boardCommittees.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Board Committees
          </h4>
          {data.boardCommittees.map((committee, index) => (
            <div
              key={index}
              className="ml-4 mb-3 p-3 border-l-2 border-blue-300 bg-blue-50"
            >
              <p className="font-medium text-blue-800">
                Committee: {committee.committeeName}
              </p>
              <p className="text-sm">
                Responsibilities: {committee.responsibilities}
              </p>
              {committee.members && committee.members.length > 0 && (
                <ul className="list-disc pl-5 text-sm mt-1">
                  <strong>Members:</strong>
                  {committee.members.map((member, memIndex) => (
                    <li key={memIndex}>
                      {member.name} (
                      {member.isIndependent ? "Independent" : "Non-Independent"}
                      )
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Director Independence Assessment */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          Director Independence Assessment
        </h4>
        <p>{data.directorIndependenceAssessment.assessment}</p>
        <p className="text-sm">
          <strong>Criteria Used:</strong>{" "}
          {data.directorIndependenceAssessment.criteriaUsed}
        </p>
        {data.directorIndependenceAssessment.ambiguousCases !== "None." && (
          <p className="text-sm">
            <strong>Ambiguous Cases:</strong>{" "}
            {data.directorIndependenceAssessment.ambiguousCases}
          </p>
        )}
      </div>

      {/* Board Skills and Experience */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          Board Skills and Experience
        </h4>
        <p>{data.boardSkillsAndExperience.summary}</p>
      </div>

      {/* Key Takeaways/Concerns */}
      {data.keyTakeawaysConcerns && data.keyTakeawaysConcerns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Key Takeaways / Concerns
          </h4>
          <ul className="list-disc pl-5 text-red-700">
            {data.keyTakeawaysConcerns.map((concern, index) => (
              <li key={index}>{concern}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
