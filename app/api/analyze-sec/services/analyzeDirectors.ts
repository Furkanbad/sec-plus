// app/api/analyze-sec/services/analyzeDirectors.ts
import { z } from "zod";
import OpenAI from "openai";
import {
  directorsAnalysisSchema,
  DirectorsAnalysis,
} from "../schemas/directorsAnalysisSchema";
import {
  EXCERPT_INSTRUCTION,
  JSON_EXCERPT_INSTRUCTION,
} from "../constants/llm-instructions";

export async function analyzeDirectorsSection(
  text: string,
  openai: OpenAI,
  companyName: string // Şirket adını dinamik olarak almak için companyName parametresi ekliyoruz
): Promise<DirectorsAnalysis> {
  const prompt = `${EXCERPT_INSTRUCTION}
  From the "Directors and Executive Officers" or "Board of Directors" section for ${
    companyName || "the company"
  }, provide a detailed analysis of the company's board composition, governance structure, and key leadership.

  For **Board Composition Overview** and **Board Leadership Structure**, include a concise, 1-3 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Board Composition Overview:**
      *   Summarize the overall composition of the board, including total number of directors and a brief comment on diversity if explicitly mentioned (e.g., gender, background).
      *   State the percentage of independent directors.
      *   Provide a single direct quote (1-3 sentences) from the text that best summarizes the board's composition.
  2.  **List of Directors:**
      *   For each director, provide their name, current position(s) at the company (if any, e.g., CEO), age, and indicate if they are considered "independent" (true/false).
      *   Briefly summarize their key qualifications, expertise, and primary professional background/experience that makes them valuable to the board.
  3.  **Key Executive Officers (Non-Board Members but significant):**
      *   List key executive officers who are NOT board members (e.g., CFO, COO, other EVPs) including their name and title. State 'None reported' if only board members are listed in the section.
  4.  **Board Leadership Structure:**
      *   Identify who serves as the Chairman of the Board and the CEO.
      *   State whether the roles of Chairman and CEO are combined or separate (true/false for combined).
      *   If the roles are separate, identify the Lead Independent Director (if any).
      *   Comment on the rationale or implications of the chosen leadership structure if discussed.
      *   Provide a single direct quote (1-3 sentences) from the text that best describes the board leadership structure.
  5.  **Board Committees:**
      *   Identify the key standing committees of the board (e.g., Audit Committee, Compensation Committee, Nominating and Governance Committee).
      *   For each committee, list its primary responsibilities and the names of its members, noting if the members are independent (true/false).
      *   State 'None reported' if committee details are not available in this section.
  6.  **Director Independence Assessment:**
      *   Provide a concise assessment of the board's overall independence, referencing the criteria used (e.g., NASDAQ or NYSE rules).
      *   Comment on any directors where independence might be ambiguous or requires special consideration if discussed.
  7.  **Board Skills and Experience:**
      *   Summarize the collective skills, experience, and competencies represented on the board as a whole (e.g., financial expertise, industry experience, cybersecurity, ESG, global operations). This often appears as a board skills matrix or general commentary.
      *   State 'Not explicitly detailed' if a specific skills summary is not provided.
  8.  **Key Takeaways/Concerns:**
      *   Highlight any particularly noteworthy points, potential governance risks (e.g., lack of diversity, over-tenured directors, weak committee oversight), or strengths identified in the board structure. State 'None identified' if everything appears standard.

  Text: ${text}

  ${JSON_EXCERPT_INSTRUCTION}

  Return JSON.
  {
    "title": "Board of Directors and Executive Officers Analysis",
    "boardCompositionOverview": {
      "totalDirectors": 0,
      "independentDirectorsPercentage": "0%",
      "diversityComment": "Not discussed.",
      "originalExcerpt": "Direct quote (1-3 sentences) that best summarizes board composition."
    },
    "directors": [
      {
        "name": "Director Name",
        "title": "Board Title (e.g., Chair) / Company Position (e.g., CEO)",
        "age": "XX",
        "isIndependent": true,
        "qualifications": "Brief summary of key expertise and background."
      }
    ],
    "keyExecutiveOfficers": [
      {
        "name": "Executive Name",
        "title": "Executive Title (e.g., CFO, COO)"
      }
    ],
    "boardLeadershipStructure": {
      "chairman": "Name of Chairman",
      "ceo": "Name of CEO",
      "rolesCombined": true,
      "leadIndependentDirector": "Name or 'None'",
      "rationaleComment": "Comment on leadership structure rationale or 'Not discussed'.",
      "originalExcerpt": "Direct quote (1-3 sentences) that best describes leadership structure."
    },
    "boardCommittees": [
      {
        "committeeName": "Audit Committee",
        "responsibilities": "Primary duties.",
        "members": [
          {"name": "Member Name", "isIndependent": true}
        ]
      }
    ],
    "directorIndependenceAssessment": {
      "assessment": "Concise assessment of board independence.",
      "criteriaUsed": "e.g., NASDAQ rules, NYSE rules.",
      "ambiguousCases": "Comment on ambiguous cases or 'None'."
    },
    "boardSkillsAndExperience": {
      "summary": "Summary of collective skills/expertise or 'Not explicitly detailed'."
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
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
    const validatedContent = directorsAnalysisSchema.parse(rawParsedContent);
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error in Directors Section:", error.issues);
      throw new Error(
        `Directors section analysis failed due to validation: ${error.message}`
      );
    }
    throw error;
  }
}
