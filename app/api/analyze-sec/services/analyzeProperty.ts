import { z } from "zod";
import OpenAI from "openai";
import {
  propertyAnalysisSchema,
  PropertyAnalysis,
} from "../schemas/propertyAnalysisSchema";

export async function analyzePropertySection(
  text: string,
  openai: OpenAI,
  companyName: string
): Promise<PropertyAnalysis> {
  const prompt = `Analyze the "Item 2 - Properties" section for ${companyName}. Provide a detailed analysis of the company's significant physical properties, facilities, and real estate holdings.

  For the **Properties Overview**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Properties Overview:**
      *   Provide a general summary of the company's property types, their primary uses, and geographic distribution.
      *   Mention whether properties are primarily owned or leased.
      *   Include a single direct quote (1-3 sentences) from the text that best summarizes the properties overview.
  2.  **Key Properties List:**
      *   For each significant property or type of property (e.g., headquarters, major manufacturing plants, significant distribution centers, retail store footprints), provide:
          *   **Type:** (e.g., Office, Manufacturing Plant, Retail Store, Data Center)
          *   **Location:** (e.g., City, State, Country)
          *   **Size (if available):** (e.g., square footage, acreage)
          *   **Status:** IMPORTANT - Use EXACTLY one of these four values: "Owned", "Leased", "Mixed", or "Not specified"
          *   **Primary Use:** (e.g., Corporate Headquarters, Production, R&D, Distribution, Retail Sales)
          *   **Capacity (if relevant):** (e.g., production capacity, storage capacity)
          *   **Notes:** Any other relevant details about the property.
      *   If no significant properties are detailed, provide an empty array for "keyProperties".
  3.  **Property Strategy and Utilization:**
      *   Comment on the company's overall strategy regarding its properties (e.g., optimizing space, expanding, consolidating).
      *   Discuss how well the properties appear to be utilized or if there are plans for expansion/contraction. State 'Not explicitly detailed' if strategy is not discussed.
  4.  **Key Takeaways/Concerns:**
      *   Highlight any particularly noteworthy points, strengths, or potential concerns related to the company's properties (e.g., significant property portfolio, reliance on key facilities, geographic concentration, significant lease obligations, underutilized assets). If none are identified, return an array with "None identified".

  Text: ${text}

  Return JSON. CRITICAL: For the "status" field, you MUST use EXACTLY one of these four values: "Owned", "Leased", "Mixed", "Not specified". Do not use any other variations like "Owned/Leased", "Own", "Lease", etc.
  
  For "ownershipType", use EXACTLY one of: "Primarily Owned", "Primarily Leased", "Mixed", "Not specified".
  
  {
    "title": "Properties Analysis",
    "propertiesOverview": {
      "summary": "General summary of property types, uses, and geographic distribution.",
      "ownershipType": "Primarily Owned", "Primarily Leased", "Mixed", or "Not specified",
      "excerpt": "A 1-3 sentence supporting excerpt from the text that best summarizes the properties overview."
    },
    "keyProperties": [
      {
        "type": "Office / Manufacturing Plant / Retail Store / etc.",
        "location": "City, State, Country",
        "size": "e.g., 150,000 sq ft, 50 acres, 'Not disclosed'",
        "status": "Owned" OR "Leased" OR "Mixed" OR "Not specified",
        "primaryUse": "Corporate Headquarters / Production / R&D / etc.",
        "capacity": "e.g., 100,000 units/year, 'Not disclosed'",
        "notes": "Any other relevant details or 'None'."
      }
    ],
    "propertyStrategyAndUtilization": {
      "strategy": "Comment on property strategy or 'Not explicitly detailed'.",
      "utilization": "Comment on utilization or 'Not explicitly detailed'."
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2", "None identified (if no concerns)"]
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
    const validatedContent = propertyAnalysisSchema.parse(rawParsedContent);
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error in Property Section:", error.issues);
      // Validation hatası durumunda default değerlerle devam et
      return {
        title: "Properties Analysis",
        propertiesOverview: {
          summary:
            "Property analysis could not be completed due to data issues.",
          ownershipType: "Not specified",
          excerpt: "No excerpt available.",
        },
        keyProperties: [],
        propertyStrategyAndUtilization: {
          strategy: "Not explicitly detailed.",
          utilization: "Not explicitly detailed.",
        },
        keyTakeawaysConcerns: [
          "Analysis could not be completed due to validation errors.",
        ],
      };
    }
    throw error;
  }
}
