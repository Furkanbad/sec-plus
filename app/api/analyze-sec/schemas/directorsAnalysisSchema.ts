// app/api/analyze-sec/schemas/directorsAnalysisSchema.ts
import { z } from "zod";

const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty")
  .catch("No excerpt available.")
  .default("No excerpt available.");

const directorSchema = z.object({
  name: z.string().trim().default("N/A"),
  title: z.string().trim().default("N/A"),
  age: z.string().trim().default("N/A"),
  isIndependent: z.boolean().default(false),
  qualifications: z.string().trim().default("No qualifications provided."),
});

const executiveOfficerSchema = z.object({
  name: z.string().trim().default("N/A"),
  title: z.string().trim().default("N/A"),
});

const committeeMemberSchema = z.object({
  name: z.string().trim().default("N/A"),
  isIndependent: z.boolean().default(false),
});

const boardCommitteeSchema = z.object({
  committeeName: z.string().trim().default("N/A"),
  responsibilities: z.string().trim().default("No responsibilities detailed."),
  members: z
    .array(committeeMemberSchema)
    .default([])
    .transform((members) =>
      members.map((member) => ({
        name: member.name || "N/A",
        isIndependent: member.isIndependent || false,
      }))
    ),
});

export const directorsAnalysisSchema = z
  .object({
    title: z
      .string()
      .trim()
      .default("Board of Directors and Executive Officers Analysis"),
    boardCompositionOverview: z
      .object({
        totalDirectors: z.number().int().min(0).default(0),
        independentDirectorsPercentage: z.string().default("0%"),
        diversityComment: z.string().trim().default("Not discussed."),
        originalExcerpt: excerptSchema,
      })
      .transform((overview) => {
        // If excerpt is a placeholder, clean it up
        if (overview.originalExcerpt.includes("Direct quote")) {
          overview.originalExcerpt = "No excerpt available.";
        }
        return overview;
      })
      .default({
        totalDirectors: 0,
        independentDirectorsPercentage: "0%",
        diversityComment: "Not discussed.",
        originalExcerpt: "No excerpt available.",
      }),
    directors: z
      .array(directorSchema)
      .default([])
      .transform((directors) => {
        return directors.map((director) => ({
          name: director.name || "N/A",
          title: director.title || "N/A",
          age: director.age || "N/A",
          isIndependent: director.isIndependent ?? false,
          qualifications:
            director.qualifications || "No qualifications provided.",
        }));
      }),
    keyExecutiveOfficers: z
      .array(executiveOfficerSchema)
      .default([])
      .transform((officers) => {
        const filteredOfficers = officers.filter(
          (o) =>
            o.name !== "None reported" &&
            o.title !== "None reported" &&
            o.name !== "N/A"
        );
        return filteredOfficers.map((officer) => ({
          name: officer.name || "N/A",
          title: officer.title || "N/A",
        }));
      }),
    boardLeadershipStructure: z
      .object({
        chairman: z.string().trim().default("N/A"),
        ceo: z.string().trim().default("N/A"),
        rolesCombined: z.boolean().default(false),
        leadIndependentDirector: z.string().trim().default("None"),
        rationaleComment: z.string().trim().default("Not discussed."),
        originalExcerpt: excerptSchema,
      })
      .transform((structure) => {
        // Clean up placeholder excerpts
        if (structure.originalExcerpt.includes("Direct quote")) {
          structure.originalExcerpt = "No excerpt available.";
        }
        // If chairman is "Not specified" but we have a CEO, infer they might be combined
        if (structure.chairman === "Not specified" && structure.ceo !== "N/A") {
          structure.chairman = "Not specified";
        }
        return structure;
      })
      .default({
        chairman: "N/A",
        ceo: "N/A",
        rolesCombined: false,
        leadIndependentDirector: "None",
        rationaleComment: "Not discussed.",
        originalExcerpt: "No excerpt available.",
      }),
    boardCommittees: z
      .array(boardCommitteeSchema)
      .default([])
      .transform((committees) => {
        const filteredCommittees = committees.filter(
          (c) =>
            c.committeeName !== "None reported" && c.committeeName !== "N/A"
        );
        return filteredCommittees.map((committee) => ({
          committeeName: committee.committeeName || "N/A",
          responsibilities:
            committee.responsibilities || "No responsibilities detailed.",
          members: committee.members || [],
        }));
      }),
    directorIndependenceAssessment: z
      .object({
        assessment: z
          .string()
          .trim()
          .default("No specific assessment provided."),
        criteriaUsed: z.string().trim().default("Not specified."),
        ambiguousCases: z.string().trim().default("None."),
      })
      .transform((assessment) => {
        // Clean up placeholder text
        if (assessment.criteriaUsed.includes("e.g.")) {
          assessment.criteriaUsed = "Not specified.";
        }
        return assessment;
      })
      .default({
        assessment: "No specific assessment provided.",
        criteriaUsed: "Not specified.",
        ambiguousCases: "None.",
      }),
    boardSkillsAndExperience: z
      .object({
        summary: z.string().trim().default("Not explicitly detailed."),
      })
      .default({
        summary: "Not explicitly detailed.",
      }),
    keyTakeawaysConcerns: z
      .array(z.string().trim().min(1, "Takeaway/concern cannot be empty."))
      .default([])
      .transform((concerns) => {
        const filteredConcerns = concerns.filter(
          (c) => c !== "None identified" && c.length > 0
        );
        return filteredConcerns.length === 0 ? [] : filteredConcerns;
      }),
  })
  // Post-process to calculate totalDirectors from directors array if it's 0
  .transform((data) => {
    if (
      data.boardCompositionOverview.totalDirectors === 0 &&
      data.directors.length > 0
    ) {
      data.boardCompositionOverview.totalDirectors = data.directors.length;

      // Calculate independent percentage
      const independentCount = data.directors.filter(
        (d) => d.isIndependent
      ).length;
      if (data.directors.length > 0) {
        const percentage = Math.round(
          (independentCount / data.directors.length) * 100
        );
        data.boardCompositionOverview.independentDirectorsPercentage = `${percentage}%`;
      }
    }
    return data;
  });

export type DirectorsAnalysis = z.infer<typeof directorsAnalysisSchema>;
