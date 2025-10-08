import { z } from "zod";
import OpenAI from "openai";
import { mdaAnalysisSchema, MDAAnalysis } from "../schemas/mdaAnalysisSchema";

export async function analyzeMdnaSection(
  text: string,
  openai: OpenAI,
  companyName: string
): Promise<MDAAnalysis> {
  const prompt = `Analyze the Management's Discussion and Analysis (MD&A) section for the company ${
    companyName || "the company"
  } in detail.
  Extract the following comprehensive information, providing specific numbers, percentages, and years where available.

  For the **Executive Summary**, **Future Capital Needs & Funding Strategies**, **Critical Accounting Policies**, **Off-Balance Sheet Arrangements**, and **Known Trends, Uncertainties, and Opportunities** sections, provide a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes. For other sections, provide the detailed analysis without an excerpt.

  1.  **Executive Summary of Operations and Financial Condition:** Provide a narrative summary (4-6 sentences) of the company's financial performance (revenues, profitability, key drivers of change) and financial condition (liquidity, capital resources) for the most recent periods presented. Include actual numbers and year-over-year comparisons.
  2.  **Results of Operations - Detailed Analysis:**
      *   **Revenue Analysis:** Describe key factors and trends influencing revenue (e.g., product mix, pricing, volume, geographic performance). Include specific numbers and growth rates.
      *   **Cost of Sales/Gross Profit Analysis:** Explain significant changes in cost of sales and gross profit margins.
      *   **Operating Expenses Analysis:** Detail major changes and drivers in operating expenses (e.g., R&D, SG&A) and their impact on profitability.
      *   **Other Income/Expense:** Summarize any material non-operating income or expenses. If none are reported, state 'None reported'.
      *   **Segment Information (if applicable):** If the company reports segment data, analyze the performance of each major segment (revenue, profit, key trends). State 'Not applicable' if not reported.
  3.  **Liquidity and Capital Resources:**
      *   **Current Liquidity:** Summarize the company's short-term liquidity, including cash and equivalents, working capital, and operating cash flows. Provide relevant figures and trends.
      *   **Capital Resources:** Describe the company's long-term capital structure, significant debt obligations, and access to capital markets. Detail any material debt covenants or restrictions.
      *   **Cash Flow Analysis:** Briefly analyze cash flows from operating, investing, and financing activities, highlighting major uses and sources of cash.
      *   **Future Capital Needs & Funding Strategies:** Identify any stated future capital expenditure plans (CAPEX), significant funding needs, and the company's strategies to meet these needs (e.g., debt, equity, internal cash generation). If none are reported, state 'None reported'.
  4.  **Critical Accounting Policies and Estimates:**
      *   Identify 2-4 of the most critical accounting policies or estimates that require management's subjective judgment and could have a material impact on financial results.
      *   Briefly explain why these policies are considered critical and the nature of the estimation uncertainty, including potential impacts of different assumptions.
  5.  **Off-Balance Sheet Arrangements:** Describe any material off-balance sheet arrangements (e.g., guarantees, securitized assets, unconsolidated entities, VIEs) and their potential impact on liquidity, capital resources, or results of operations. If none are reported, state 'None reported'.
  6.  **Contractual Obligations and Commercial Commitments:**
      *   Summarize significant contractual obligations (e.g., lease commitments, purchase obligations, long-term debt principal payments) and their timing. If no material obligations are discussed, state 'None reported'.
  7.  **Known Trends, Uncertainties, and Opportunities:**
      *   Identify 3-5 significant known trends, demands, commitments, events, uncertainties, **or opportunities** that are reasonably likely to have a material effect on the company's future financial condition or operating results.
      *   For each, briefly describe its nature and potential impact/benefit, and any management responses or mitigation strategies.
  8.  **Inflation and Changing Prices:**
      *   Discuss any material impact of inflation or changing prices on the company's operations and financial results, and management's strategies to mitigate these effects. If not discussed, state 'Not discussed'.
  9.  **Strategic Outlook and Future Plans:**
      *   Summarize the company's strategic vision, significant future plans (e.g., expansion, new products, strategic initiatives, market entries, M&A), and expected challenges as discussed by management.
      *   Mention any identified forward-looking statements or risks associated with them, but also highlight potential benefits and growth drivers of these plans.

  Text: ${text}

  Return JSON.
  {
    "title": "Comprehensive Management's Discussion and Analysis",
    "executiveSummary": {
      "analysis": "A 4-6 sentence narrative summary of financial performance and condition with specific numbers and comparisons.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text."
    },
    "resultsOfOperations": {
      "revenueAnalysis": "Detailed analysis of revenue changes and drivers with numbers.",
      "costOfSalesAnalysis": "Explanation of changes in COGS and gross margins.",
      "operatingExpensesAnalysis": "Analysis of operating expense changes and impact on profitability.",
      "otherIncomeExpense": "Summary of material non-operating items or 'None reported'.",
      "segmentInformation": "Performance analysis of major segments or 'Not applicable'."
    },
    "liquidityAndCapitalResources": {
      "currentLiquidity": "Summary of short-term liquidity with figures and trends.",
      "capitalResources": "Description of long-term capital structure, debt, and covenants.",
      "cashFlowAnalysis": "Brief analysis of operating, investing, and financing cash flows.",
      "futureCapitalNeedsAndFundingStrategies": {
        "analysis": "Identified future CAPEX, funding needs, and strategies or 'None reported'.",
        "excerpt": "A 1-2 sentence supporting excerpt from the text or 'None reported'."
      }
    },
    "criticalAccountingPolicies": [
      {
        "policyName": "Name of policy",
        "explanation": "Why it's critical and estimation uncertainty, including potential impacts.",
        "excerpt": "A 1-2 sentence supporting excerpt from the text."
      }
    ],
    "offBalanceSheetArrangements": {
      "analysis": "Description of arrangements and their potential impact or 'None reported'.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text or 'None reported'."
    },
    "contractualObligationsAndCommercialCommitments": "Summary of significant contractual obligations and timing or 'None reported'.",
    "knownTrendsUncertaintiesOpportunities": [
      {
        "itemDescription": "Description of trend, uncertainty, or opportunity.",
        "impactBenefit": "Potential material effect/benefit and management response.",
        "excerpt": "A 1-2 sentence supporting excerpt from the text."
      }
    ],
    "inflationAndChangingPrices": "Impact of inflation/changing prices and mitigation strategies or 'Not discussed'.",
    "strategicOutlookAndFuturePlans": "Summary of company's strategic vision, future plans, benefits, and challenges."
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
    // Eğer LLM geçerli JSON döndürmezse, boş bir obje ile devam et
    rawParsedContent = {};
  }

  try {
    // Zod schema ile valide et ve default değerlerini uygula
    const validatedContent = mdaAnalysisSchema.parse(rawParsedContent);
    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error in MD&A Section:", error.issues);
      throw new Error(
        `MD&A section analysis failed due to validation: ${error.message}`
      );
    }
    throw error;
  }
}
