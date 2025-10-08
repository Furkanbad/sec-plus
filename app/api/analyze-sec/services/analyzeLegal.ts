// app/api/analyze-sec/services/analyzeLegal.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  legalAnalysisSchema,
  LegalAnalysis,
} from "../schemas/legalAnalysisSchema"; // Doğru yolu ayarla

export async function analyzeLegalSection(
  text: string,
  openai: OpenAI,
  ticker: string = "the company"
): Promise<LegalAnalysis> {
  const prompt = `From the Legal Proceedings section for ${ticker}, provide a comprehensive analysis of significant legal matters.

  Specifically, extract and analyze the following, always providing a **single direct quote (1-3 sentences) from the text** for each key piece of information where specified (e.g., for summary, case details, financial impact).

  1.  **Overall Legal Summary:** Provide a brief overview (1-2 sentences) of the company's general legal landscape or state 'No material litigation reported'. **Include a single direct quote (1-3 sentences) that best represents this summary.**
  2.  **Material Legal Cases (if any):** For each material legal proceeding identified:
      *   **Case Title/Description:** A concise title and description of the case, including the parties involved. **Include a single direct quote (1-3 sentences) from the text that best describes the case title/description.**
      *   **Nature of Claim:** The type of claim (e.g., patent infringement, environmental violation, consumer class action, antitrust, regulatory inquiry). **Include a single direct quote (1-3 sentences) from the text that best describes the nature of the claim.**
      *   **Current Status:** The current stage of the proceeding (e.g., ongoing litigation, settlement discussions, appeal, concluded with judgment). **Include a single direct quote (1-3 sentences) from the text that best describes the current status.**
      *   **Company's Position:** A brief statement on the company's defense or position in the case. **Include a single direct quote (1-3 sentences) from the text that best describes the company's position.**
      *   **Potential Financial Impact:** A detailed assessment of the potential financial impact, including:
          *   Estimated range of loss, if disclosed.
          *   Any reserves/provisions set aside.
          *   Impact on earnings, cash flow, or financial condition.
          *   Whether the impact is covered by insurance.
          *   State 'Not estimable at this time' or 'No material impact expected' if explicitly stated. **Include a single direct quote (1-3 sentences) from the text that best describes the financial impact.**
      *   **Key Dates:** Any significant upcoming dates or past rulings mentioned.
  3.  **Regulatory Inquiries/Investigations (if separate):** Summarize any significant regulatory inquiries or investigations mentioned, their nature, and potential implications. State 'None reported' if not applicable. **Include a single direct quote (1-3 sentences) from the text that best describes these inquiries, if any.**
  4.  **Environmental Litigation (if specific):** Summarize any specific environmental litigation or regulatory actions, their status, and estimated costs. State 'None reported' if not applicable. **Include a single direct quote (1-3 sentences) from the text that best describes this litigation, if any.**
  5.  **Overall Risk Assessment:** Provide a concluding statement on the overall legal risk exposure for the company based on the information provided. State 'Low legal risk' or 'Moderate legal risk' if an assessment can be inferred, or 'Assessment not specified'. **Include a single direct quote (1-3 sentences) from the text that best supports this risk assessment.**

  Text: ${text}

  Return JSON. If no material litigation, only return the "overallLegalSummary" and "overallLegalSummaryExcerpt" indicating 'No material litigation reported' and 'No excerpt available.'.
  {
    "title": "Detailed Legal Proceedings Analysis",
    "overallLegalSummary": "Brief overview or 'No material litigation reported'.",
    "overallLegalSummaryExcerpt": "Direct quote (1-3 sentences) for the overall legal summary.",
    "materialCases": [
      {
        "caseTitle": "Title/Parties",
        "caseTitleExcerpt": "Direct quote (1-3 sentences) for case title.",
        "natureOfClaim": "Type of claim",
        "natureOfClaimExcerpt": "Direct quote (1-3 sentences) for nature of claim.",
        "currentStatus": "Stage of proceeding",
        "currentStatusExcerpt": "Direct quote (1-3 sentences) for current status.",
        "companyPosition": "Company's defense/position",
        "companyPositionExcerpt": "Direct quote (1-3 sentences) for company position.",
        "potentialFinancialImpact": {
          "estimatedLossRange": "e.g., '$X - $Y million' or 'Not estimable'",
          "reservesSetAside": "e.g., '$Z million' or 'None'",
          "impactDescription": "Description of impact on financials",
          "insuranceCoverage": "Yes|No|Not specified",
          "originalExcerpt": "Direct quote (1-3 sentences) for financial impact."
        },
        "keyDates": ["Date 1", "Date 2"]
      }
    ],
    "regulatoryInquiries": "Summary of regulatory inquiries or 'None reported'.",
    "regulatoryInquiriesExcerpt": "Direct quote (1-3 sentences) for regulatory inquiries.",
    "environmentalLitigation": "Summary of environmental litigation or 'None reported'.",
    "environmentalLitigationExcerpt": "Direct quote (1-3 sentences) for environmental litigation.",
    "overallRiskAssessment": "Concluding statement on legal risk exposure.",
    "overallRiskAssessmentExcerpt": "Direct quote (1-3 sentences) for overall risk assessment."
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  let rawParsedContent;
  try {
    rawParsedContent = JSON.parse(result.choices[0].message.content || "{}");
  } catch (parseError) {
    console.error("Failed to parse JSON from OpenAI response:", parseError);
    rawParsedContent = {};
  }

  try {
    const validatedContent = legalAnalysisSchema.parse(rawParsedContent);
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error in Legal Section:", error.issues);
      throw new Error(
        `Legal section analysis failed due to validation: ${error.message}`
      );
    }
    throw error;
  }
}
