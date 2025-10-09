import { z } from "zod";

const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty")
  .catch("No excerpt available.")
  .default("No excerpt available.");

const keyPropertySchema = z.object({
  type: z.string().trim().default("Not specified"),
  location: z.string().trim().default("Not specified"),
  size: z.string().trim().default("Not disclosed"),
  status: z
    .string()
    .trim()
    .transform((val) => {
      // LLM'den gelebilecek farklı değerleri normalize et
      const lowerVal = val.toLowerCase();
      if (lowerVal.includes("own")) return "Owned";
      if (lowerVal.includes("lease") || lowerVal.includes("rent"))
        return "Leased";
      if (lowerVal.includes("mix") || lowerVal.includes("both")) return "Mixed";
      // Tanımlanamayan veya boş değerler için
      return "Not specified";
    })
    .default("Not specified"),
  primaryUse: z.string().trim().default("Not specified"),
  capacity: z.string().trim().default("Not disclosed"),
  notes: z.string().trim().default("None"),
});

export const propertyAnalysisSchema = z.object({
  title: z.literal("Properties Analysis").default("Properties Analysis"),
  propertiesOverview: z
    .object({
      summary: z.string().trim().default("No general summary available."),
      ownershipType: z
        .string()
        .trim()
        .transform((val) => {
          // LLM'den gelebilecek farklı değerleri normalize et
          const lowerVal = val.toLowerCase();
          if (
            lowerVal.includes("primarily owned") ||
            lowerVal.includes("mostly owned")
          )
            return "Primarily Owned";
          if (
            lowerVal.includes("primarily leased") ||
            lowerVal.includes("mostly leased")
          )
            return "Primarily Leased";
          if (lowerVal.includes("mix") || lowerVal.includes("both"))
            return "Mixed";
          return "Not specified";
        })
        .default("Not specified"),
      excerpt: excerptSchema,
    })
    .default({
      summary: "No general summary available.",
      ownershipType: "Not specified",
      excerpt: "No excerpt available.",
    }),
  keyProperties: z
    .array(keyPropertySchema)
    .default([])
    .transform((properties) => {
      return properties.map((prop) => ({
        type: prop.type || "Not specified",
        location: prop.location || "Not specified",
        size: prop.size || "Not disclosed",
        status: prop.status || "Not specified",
        primaryUse: prop.primaryUse || "Not specified",
        capacity: prop.capacity || "Not disclosed",
        notes: prop.notes || "None",
      }));
    }),
  propertyStrategyAndUtilization: z
    .object({
      strategy: z.string().trim().default("Not explicitly detailed."),
      utilization: z.string().trim().default("Not explicitly detailed."),
    })
    .default({
      strategy: "Not explicitly detailed.",
      utilization: "Not explicitly detailed.",
    }),
  keyTakeawaysConcerns: z
    .array(z.string().trim().min(1, "Takeaway/Concern cannot be empty."))
    .default([])
    .transform((concerns) =>
      concerns.length === 0
        ? ["None identified"]
        : concerns.filter((c) => c !== "None identified")
    )
    .refine((val) => val.length > 0, {
      message: "Key takeaways/concerns cannot be empty",
    })
    .catch(["None identified"])
    .default(["None identified"]),
});

export type PropertyAnalysis = z.infer<typeof propertyAnalysisSchema>;
