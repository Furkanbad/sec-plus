// app/api/analyze-sec/schemas/controlsSchema.ts
import { z } from "zod";

// Helper schemas
const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description cannot be empty.")
  .catch("No description available.")
  .default("No description available.");

const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty")
  .catch("No direct excerpt found.")
  .default("No direct excerpt found.");

// Schema for items that have a description and a mandatory excerpt (hala gerekli olanlar için)
const itemWithMandatoryExcerptSchema = z.object({
  description: descriptionSchema,
  excerpt: excerptSchema, // Bu alıntı hala zorunlu olacak
});

// Schema for material weaknesses (description, potential impact, mandatory excerpt)
const materialWeaknessSchema = z.object({
  description: descriptionSchema,
  potentialImpact: descriptionSchema,
  excerpt: excerptSchema, // Bu alıntı hala zorunlu olacak
});

// Main Controls Analysis Schema
export const controlsAnalysisSchema = z.object({
  title: z.string().trim().default("Internal Controls Analysis"),

  managementConclusionDisclosureControls: z.object({
    conclusion: descriptionSchema, // 'effective' veya 'Not reported' gibi
    excerpt: excerptSchema, // Bu alıntı hala zorunlu olacak
  }),

  managementReportICFR: z.object({
    assessment: descriptionSchema, // 'effective' veya 'Not reported' gibi
    excerpt: excerptSchema, // Bu alıntı hala zorunlu olacak
  }),

  materialWeaknessesICFR: z
    .array(materialWeaknessSchema)
    .default([])
    .transform((weaknesses) => {
      if (
        weaknesses.length === 0 ||
        (weaknesses.length === 1 &&
          weaknesses[0].description === "None reported.")
      ) {
        return [
          {
            description: "None reported.",
            potentialImpact: "Not applicable.",
            excerpt: "No material weaknesses in ICFR were reported.",
          },
        ];
      }
      return weaknesses;
    }),

  remediationEfforts: z
    .array(itemWithMandatoryExcerptSchema)
    .default([])
    .transform((efforts) => {
      if (
        efforts.length === 0 ||
        (efforts.length === 1 && efforts[0].description === "Not applicable.")
      ) {
        return [
          {
            description: "Not applicable.",
            excerpt:
              "No remediation efforts were discussed as no material weaknesses were reported.",
          },
        ];
      }
      return efforts;
    }),

  changesInICFR: descriptionSchema.default("None reported."), // ARTIK EXCERPT YOK

  auditorOpinionICFR: z.object({
    conclusion: descriptionSchema, // 'effective', 'adverse', 'Not applicable' gibi
    differenceFromManagement: descriptionSchema, // 'Not applicable' veya fark açıklaması
    excerpt: excerptSchema, // Bu alıntı hala zorunlu olacak
  }),

  keyTakeawaysConcerns: z
    .array(descriptionSchema)
    .default([])
    .transform((concerns) => {
      if (concerns.length === 0 || concerns.includes("None identified")) {
        return ["None identified."];
      }
      return concerns;
    }), // ARTIK EXCERPT YOK
});

export type ControlsAnalysis = z.infer<typeof controlsAnalysisSchema>;
