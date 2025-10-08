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
  age: z.string().trim().default("N/A"), // Yaş string olarak tutulabilir (e.g., "55", "Not Reported")
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

export const directorsAnalysisSchema = z.object({
  title: z
    .string()
    .trim()
    .default("Board of Directors and Executive Officers Analysis"),
  boardCompositionOverview: z
    .object({
      totalDirectors: z.number().int().min(0).default(0),
      independentDirectorsPercentage: z
        .string()
        .regex(/^\d+%$/)
        .default("0%"),
      diversityComment: z.string().trim().default("Not discussed."),
      originalExcerpt: excerptSchema,
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
        isIndependent: director.isIndependent ?? false, // ?? ile undefined ve null kontrolü
        qualifications:
          director.qualifications || "No qualifications provided.",
      }));
    }),
  keyExecutiveOfficers: z
    .array(executiveOfficerSchema)
    .default([])
    .transform((officers) => {
      // Eğer LLM "None reported" gibi bir string döndürürse array boş kalır.
      // Ya da objelerin içinde "None reported" olabilir, onları da temizle.
      const filteredOfficers = officers.filter(
        (o) => o.name !== "None reported" && o.title !== "None reported"
      );
      if (filteredOfficers.length === 0) {
        return []; // Boş dizi döndür
      }
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
      // "None reported" gibi durumları filtrele
      const filteredCommittees = committees.filter(
        (c) => c.committeeName !== "None reported"
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
      assessment: z.string().trim().default("No specific assessment provided."),
      criteriaUsed: z.string().trim().default("Not specified."),
      ambiguousCases: z.string().trim().default("None."),
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
      // LLM'den gelen "None identified" gibi tek elemanlı dizileri boş diziye çevir
      const filteredConcerns = concerns.filter(
        (c) => c !== "None identified" && c.length > 0
      );
      return filteredConcerns.length === 0 ? [] : filteredConcerns;
    }),
});

export type DirectorsAnalysis = z.infer<typeof directorsAnalysisSchema>;
