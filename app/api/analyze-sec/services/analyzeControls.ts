// app/api/analyze-sec/services/analyzeControls.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  controlsAnalysisSchema,
  ControlsAnalysis,
} from "../schemas/controlsSchema"; // Doğru yolu ayarla

export async function analyzeControlsSection(
  text: string,
  openai: OpenAI,
  companyName: string
): Promise<ControlsAnalysis | null> {
  const prompt = `From the "Controls and Procedures" or "Internal Control Over Financial Reporting" section for ${
    companyName || "the company"
  }, provide a detailed analysis of the company's internal controls.

  **Crucial Instruction for Excerpts:**
  All 'excerpt' fields in this analysis are **mandatory** and must be **direct, verbatim quotes (1-3 sentences)** from the text that explicitly support the conclusion, assessment, weakness, remediation, or opinion provided. If a specific excerpt cannot be found for a mandatory field, state "No direct excerpt found." or use a placeholder string as per the schema. **Do not provide excerpts for fields where they are not explicitly requested in the JSON structure below.**

  Specifically, extract and analyze the following, ensuring all *requested* excerpts are direct quotes (1-3 sentences):
  1.  **Management's Conclusion on Disclosure Controls:**
      *   Summarize management's conclusion on the effectiveness of the company's disclosure controls and procedures as of the end of the reporting period. State if they are "effective", "not effective", or "Not reported" if no clear conclusion.
      *   **Include a concise 'excerpt' directly from the text supporting this conclusion.**
  2.  **Management's Report on Internal Control Over Financial Reporting (ICFR):**
      *   Summarize management's assessment of the effectiveness of the company's internal control over financial reporting. State if they are "effective", "not effective", or "Not reported" if no clear assessment.
      *   **Include a concise 'excerpt' directly from the text supporting this assessment.**
  3.  **Material Weaknesses in ICFR (if any):**
      *   List and describe any "material weaknesses" in Internal Control Over Financial Reporting identified by management at the end of the reporting period. For each weakness, provide a brief description and its potential impact.
      *   **For each material weakness, include a concise 'excerpt' directly from the text describing the weakness.**
      *   If "None reported," explicitly state this in the description and use a generic excerpt.
  4.  **Remediation Efforts for Material Weaknesses:**
      *   If material weaknesses were identified, describe the company's plans or actions taken to remediate (düzeltmek) these weaknesses.
      *   **For each remediation effort, include a concise 'excerpt' directly from the text.**
      *   State 'Not applicable' in the description if no material weaknesses were reported or no remediation efforts are discussed, and use a generic excerpt.
  5.  **Changes in Internal Control Over Financial Reporting:**
      *   Describe any material changes in internal control over financial reporting during the most recent fiscal quarter that have materially affected, or are reasonably likely to materially affect, the company’s internal control over financial reporting. State 'None reported' if no material changes are discussed.
      *   **(No excerpt specifically requested for this field unless a direct, short quote is highly illustrative of the change itself).**
  6.  **Independent Registered Public Accounting Firm's Opinion (if applicable):**
      *   If the company's independent auditor provided an opinion on the effectiveness of ICFR, summarize their conclusion (e.g., "effective", "adverse", "disclaimer").
      *   Note if the auditor's opinion differs from management's assessment. State 'Not applicable' if no difference.
      *   **Include a concise 'excerpt' directly from the text stating the auditor's conclusion.** If no auditor opinion is included (e.g., smaller reporting companies may be exempt), state 'Not applicable' in the conclusion and excerpt.
  7.  **Key Takeaways/Concerns:**
      *   Highlight any particularly noteworthy points, significant discrepancies between management and auditor, or ongoing concerns regarding the company's control environment. List each as a separate item. State 'None identified' if everything appears standard.
      *   **(No excerpt specifically requested for this field as it involves synthesis).**

  Text: ${text}

  Return JSON. Ensure all monetary values include currency (e.g., "$X million"), percentages include "%", and periods are clearly stated (e.g., "FY20XX").
  All 'excerpt' fields in the JSON structure below must contain a direct quote (1-3 sentences) or a specific "No direct excerpt found." string if genuinely absent from the text. For fields where an excerpt is not specified in the JSON, do not generate one.

  {
    "title": "Internal Controls Analysis",
    "managementConclusionDisclosureControls": {
      "conclusion": "Summary of management's conclusion (e.g., 'effective') or 'Not reported'.",
      "excerpt": "Direct quote (1-3 sentences) supporting conclusion or 'No direct excerpt found'."
    },
    "managementReportICFR": {
      "assessment": "Summary of management's assessment (e.g., 'effective') or 'Not reported'.",
      "excerpt": "Direct quote (1-3 sentences) supporting assessment or 'No direct excerpt found'."
    },
    "materialWeaknessesICFR": [
      {
        "description": "Description of material weakness or 'None reported'.",
        "potentialImpact": "Potential impact of the weakness or 'Not applicable'.",
        "excerpt": "Direct quote (1-3 sentences) describing the weakness or 'No direct excerpt found'."
      }
    ],
    "remediationEfforts": [
      {
        "description": "Description of remediation plan/action or 'Not applicable'.",
        "excerpt": "Direct quote (1-3 sentences) from the text or 'No direct excerpt found'."
      }
    ],
    "changesInICFR": "Description of material changes or 'None reported'.", // No excerpt here
    "auditorOpinionICFR": {
      "conclusion": "Summary of auditor's conclusion (e.g., 'effective' or 'adverse') or 'Not applicable'.",
      "differenceFromManagement": "Note if auditor's opinion differs or 'Not applicable'.",
      "excerpt": "Direct quote (1-3 sentences) or 'No direct excerpt found'."
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2" // or ["None identified."]] // No excerpt here
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
    console.log(
      "[analyzeControlsSection] Raw OpenAI response content:",
      JSON.stringify(rawParsedContent, null, 2)
    );
  } catch (parseError) {
    console.error(
      "[analyzeControlsSection] Failed to parse JSON from OpenAI response:",
      parseError
    );
    rawParsedContent = {};
  }

  try {
    console.log(
      "[analyzeControlsSection] Attempting Zod validation with rawParsedContent."
    );
    // Zod schema ile valide et ve default değerlerini uygula
    const validatedContent = controlsAnalysisSchema.parse(rawParsedContent);
    console.log(
      "[analyzeControlsSection] Zod validation successful. Returning validated content."
    );
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "[analyzeControlsSection] Zod Validation Error:",
        JSON.stringify(error.issues, null, 2)
      );
      // Validasyon hatası durumunda null döndür
      return null;
    }
    console.error(
      "[analyzeControlsSection] Unexpected error during validation or processing:",
      error
    );
    throw error;
  }
}
