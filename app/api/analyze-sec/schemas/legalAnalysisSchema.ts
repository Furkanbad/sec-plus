// app/api/analyze-sec/schemas/legalAnalysisSchema.ts
import { z } from "zod";

const excerptSchema = z
  .string()
  .trim()
  .min(1, "Excerpt cannot be empty")
  .catch("No excerpt available.")
  .default("No excerpt available.");

// PotentialFinancialImpact için özel bir şema
const potentialFinancialImpactSchema = z.object({
  estimatedLossRange: z.string().trim().default("Not estimable at this time"),
  reservesSetAside: z.string().trim().default("None"),
  impactDescription: z.string().trim().default("No material impact expected"),
  insuranceCoverage: z
    .enum(["Yes", "No", "Not specified", "unknown"])
    .default("Not specified"),
  originalExcerpt: excerptSchema, // Finansal etki için excerpt
});

// MaterialLegalCase için şema
const materialLegalCaseSchema = z.object({
  caseTitle: z
    .string()
    .trim()
    .min(1, "Case title cannot be empty.")
    .default("Untitled Legal Case"),
  caseTitleExcerpt: excerptSchema, // Case Title için excerpt
  natureOfClaim: z
    .string()
    .trim()
    .min(1, "Nature of claim cannot be empty.")
    .default("Not specified"),
  natureOfClaimExcerpt: excerptSchema, // Nature of Claim için excerpt
  currentStatus: z
    .string()
    .trim()
    .min(1, "Current status cannot be empty.")
    .default("Status not reported"),
  currentStatusExcerpt: excerptSchema, // Current Status için excerpt
  companyPosition: z.string().trim().default("Company's position not detailed"),
  companyPositionExcerpt: excerptSchema, // Company Position için excerpt
  potentialFinancialImpact: potentialFinancialImpactSchema.default({
    estimatedLossRange: "Not estimable at this time",
    reservesSetAside: "None",
    impactDescription: "No material impact expected",
    insuranceCoverage: "Not specified",
    originalExcerpt: "No excerpt available.", // nested default
  }),
  keyDates: z.array(z.string().trim()).default([]),
});

// Ana LegalAnalysis şeması
export const legalAnalysisSchema = z.object({
  title: z
    .literal("Detailed Legal Proceedings Analysis")
    .default("Detailed Legal Proceedings Analysis"),
  overallLegalSummary: z
    .string()
    .trim()
    .min(1, "Overall legal summary cannot be empty.")
    .default("No material litigation reported."),
  overallLegalSummaryExcerpt: excerptSchema, // Overall Summary için excerpt
  materialCases: z.array(materialLegalCaseSchema).default([]),
  regulatoryInquiries: z.string().trim().default("None reported"),
  regulatoryInquiriesExcerpt: excerptSchema, // Regulatory Inquiries için excerpt
  environmentalLitigation: z.string().trim().default("None reported"),
  environmentalLitigationExcerpt: excerptSchema, // Environmental Litigation için excerpt
  overallRiskAssessment: z.string().trim().default("Assessment not specified"),
  overallRiskAssessmentExcerpt: excerptSchema, // Overall Risk Assessment için excerpt
});

export type LegalAnalysis = z.infer<typeof legalAnalysisSchema>;
