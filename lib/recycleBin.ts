async function analyzeBusinessSection(text: string, openai: OpenAI) {
  const prompt = `Analyze this Business section for ${
    process.env.COMPANY_NAME || "the company"
  }:
1. What does the company do? (specific products/services) Provide a comprehensive yet concise summary (4-5 sentences) and **a single direct quote (1-3 sentences) from the text that best captures the company's core business.**
2. Key products by name and their market position. For each product, provide its name, market position (if any), and **a single direct quote (1-3 sentences) from the text that best describes it or its market position.**
3. Geographic markets of operation.
4. **Identify and describe 2-3 key competitive advantages** (e.g., proprietary technology, brand strength, cost leadership, network effect, distribution channels). For each advantage, provide a concise description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text that best illustrates this advantage.**
5. **Identify any significant growth strategies or market opportunities** explicitly mentioned (e.g., new market entry, product innovation, acquisitions). For each strategy/opportunity, provide a concise description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text that best describes it.**
6. **Identify the company's target customers or segments.** Provide a brief description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text that best illustrates this.**
7. **Highlight any significant partnerships or collaborations** mentioned. For each, provide a brief description (1-2 sentences) and **a single direct quote (1-3 sentences) from the text.**
8. **Analyze the company's overall business model.** Provide a concise description (2-3 sentences) of how the company generates revenue and creates value, along with **a single direct quote (1-3 sentences) from the text that best illustrates its business model.**

Text: ${text}

Return JSON:
{
  "summary": "4-5 sentences with specifics about what the company does, providing a comprehensive yet concise overview.",
  "summaryExcerpt": "Direct quote (1-3 sentences) from the text that best captures the company's core business.",
  "keyProducts": [
    {"name": "product name", "marketPosition": "brief statement", "originalExcerpt": "Direct quote (1-3 sentences) for this product."}
  ],
  "markets": ["geographic markets"],
  "competitiveAdvantages": [
    {"description": "concise description of advantage 1", "originalExcerpt": "Direct quote (1-3 sentences) for advantage 1."},
    {"description": "concise description of advantage 2", "originalExcerpt": "Direct quote (1-3 sentences) for advantage 2."}
  ],
  "growthStrategiesOpportunities": [
    {"description": "concise description of strategy/opportunity 1", "originalExcerpt": "Direct quote (1-3 sentences) for strategy/opportunity 1."},
    {"description": "concise description of strategy/opportunity 2", "originalExcerpt": "Direct quote (1-3 sentences) for strategy/opportunity 2."}
  ],
  "targetCustomers": {
    "description": "concise description of target customers/segments",
    "originalExcerpt": "Direct quote (1-3 sentences) for target customers."
  },
  "partnershipsCollaborations": [
    {"description": "concise description of partnership 1", "originalExcerpt": "Direct quote (1-3 sentences) for partnership 1."}
  ],
  "businessModel": {
    "description": "concise description of how the company generates revenue and creates value (2-3 sentences).",
    "originalExcerpt": "Direct quote (1-3 sentences) for business model."
  }
}`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Her zaman 'originalExcerpt' alanının doluluk kontrolünü yapalım ve boşsa varsayılan atayalım.
  // Bu, UI'da null veya undefined hatalarını önler.

  // summaryExcerpt
  parsedContent.summaryExcerpt =
    parsedContent.summaryExcerpt || "No excerpt available for summary.";

  // keyProducts
  if (!Array.isArray(parsedContent.keyProducts)) {
    parsedContent.keyProducts = parsedContent.keyProducts
      ? [parsedContent.keyProducts]
      : [];
  }
  parsedContent.keyProducts.forEach((item: any) => {
    item.name = item.name || "N/A";
    item.marketPosition = item.marketPosition || "N/A";
    item.originalExcerpt = item.originalExcerpt || "No excerpt available.";
  });

  // markets
  parsedContent.markets = Array.isArray(parsedContent.markets)
    ? parsedContent.markets
    : parsedContent.markets
    ? [parsedContent.markets]
    : [];
  if (parsedContent.markets.length === 0) {
    parsedContent.markets.push("Not specified");
  }

  // competitiveAdvantages
  if (!Array.isArray(parsedContent.competitiveAdvantages)) {
    parsedContent.competitiveAdvantages = parsedContent.competitiveAdvantages
      ? [parsedContent.competitiveAdvantages]
      : [];
  }
  parsedContent.competitiveAdvantages.forEach((item: any) => {
    item.description = item.description || "No description available.";
    item.originalExcerpt =
      item.originalExcerpt || item.description || "No excerpt available.";
  });

  // growthStrategiesOpportunities
  if (!Array.isArray(parsedContent.growthStrategiesOpportunities)) {
    parsedContent.growthStrategiesOpportunities =
      parsedContent.growthStrategiesOpportunities
        ? [parsedContent.growthStrategiesOpportunities]
        : [];
  }
  parsedContent.growthStrategiesOpportunities.forEach((item: any) => {
    item.description = item.description || "No description available.";
    item.originalExcerpt =
      item.originalExcerpt || item.description || "No excerpt available.";
  });

  // targetCustomers
  parsedContent.targetCustomers = parsedContent.targetCustomers || {};
  parsedContent.targetCustomers.description =
    parsedContent.targetCustomers.description || "Not specified.";
  parsedContent.targetCustomers.originalExcerpt =
    parsedContent.targetCustomers.originalExcerpt || "No excerpt available.";

  // partnershipsCollaborations
  if (!Array.isArray(parsedContent.partnershipsCollaborations)) {
    parsedContent.partnershipsCollaborations =
      parsedContent.partnershipsCollaborations
        ? [parsedContent.partnershipsCollaborations]
        : [];
  }
  parsedContent.partnershipsCollaborations.forEach((item: any) => {
    item.description = item.description || "No description available.";
    item.originalExcerpt =
      item.originalExcerpt || item.description || "No excerpt available.";
  });

  // businessModel
  parsedContent.businessModel = parsedContent.businessModel || {};
  parsedContent.businessModel.description =
    parsedContent.businessModel.description || "Not specified.";
  parsedContent.businessModel.originalExcerpt =
    parsedContent.businessModel.originalExcerpt || "No excerpt available.";

  return parsedContent;
}

async function analyzePropertySection(text: string, openai: OpenAI) {
  const prompt = `From the "Item 2 - Properties" section, provide a detailed analysis of the company's significant physical properties, facilities, and real estate holdings.

  For the **Properties Overview**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Properties Overview:**
      *   Provide a general summary of the company's property types, their primary uses, and geographic distribution.
      *   Mention whether properties are primarily owned or leased.
  2.  **Key Properties List:**
      *   For each significant property or type of property (e.g., headquarters, major manufacturing plants, significant distribution centers, retail store footprints), provide:
          *   **Type:** (e.g., Office, Manufacturing Plant, Retail Store, Data Center)
          *   **Location:** (e.g., City, State, Country)
          *   **Size (if available):** (e.g., square footage, acreage)
          *   **Status:** (Owned / Leased)
          *   **Primary Use:** (e.g., Corporate Headquarters, Production, R&D, Distribution, Retail Sales)
          *   **Capacity (if relevant):** (e.g., production capacity, storage capacity)
          *   **Notes:** Any other relevant details about the property.
      *   If no significant properties are detailed, state 'None specifically detailed'.
  3.  **Property Strategy and Utilization:**
      *   Comment on the company's overall strategy regarding its properties (e.g., optimizing space, expanding, consolidating).
      *   Discuss how well the properties appear to be utilized or if there are plans for expansion/contraction. State 'Not explicitly detailed' if strategy is not discussed.
  4.  **Key Takeaways/Concerns:**
      *   Highlight any particularly noteworthy points, strengths, or potential concerns related to the company's properties (e.g., significant property portfolio, reliance on key facilities, geographic concentration, significant lease obligations, underutilized assets). State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON.
  {
    "title": "Properties Analysis",
    "propertiesOverview": {
      "summary": "General summary of property types, uses, and geographic distribution.",
      "ownershipType": "Primarily Owned / Primarily Leased / Mixed / Not specified.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text or 'None applicable'."
    },
    "keyProperties": [
      {
        "type": "Office / Manufacturing Plant / Retail Store / etc.",
        "location": "City, State, Country",
        "size": "e.g., 150,000 sq ft, 50 acres, 'Not disclosed'",
        "status": "Owned / Leased",
        "primaryUse": "Corporate Headquarters / Production / R&D / etc.",
        "capacity": "e.g., 100,000 units/year, 'Not disclosed'",
        "notes": "Any other relevant details or 'None'."
      }
    ],
    "propertyStrategyAndUtilization": {
      "strategy": "Comment on property strategy or 'Not explicitly detailed'.",
      "utilization": "Comment on utilization or 'Not explicitly detailed'."
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "keyProperties");
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific boolean values)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (typeof item !== "string") {
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // Boyut (size) ve kapasite gibi alanları string'e çevir
          const sizeCapacityFields = ["size", "capacity"];
          sizeCapacityFields.forEach((field) => {
            if (
              obj[key][field] !== undefined &&
              typeof obj[key][field] !== "string" &&
              typeof obj[key][field] !== "number"
            ) {
              obj[key][field] = String(obj[key][field]);
            }
          });
          // Yalnızca propertiesOverview içindeki excerpt'ı kontrol et
          if (
            key === "propertiesOverview" &&
            obj[key].excerpt !== undefined &&
            typeof obj[key].excerpt !== "string"
          ) {
            obj[key].excerpt = String(obj[key].excerpt);
          }
        }
      } else if (typeof obj[key] !== "string" && obj[key] !== null) {
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}

async function analyzeRiskSection(text: string, openai: OpenAI) {
  const prompt = `From the Risk Factors section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed analysis by extracting 8-15 specific risks.
  For each risk, provide the following information:

  1.  **Category:** Classify the risk as 'operational', 'financial', 'regulatory', 'market', 'strategic', 'cybersecurity', 'environmental', or 'other'.
  2.  **Title:** A concise, descriptive title for the risk.
  3.  **Description:** A 2-4 sentence summary describing the nature of the risk and why it's a concern for the company.
  4.  **Potential Impact:** Describe the specific ways this risk could adversely affect the company's business, financial condition, or results of operations (e.g., "could lead to decreased revenue," "increase operating costs," "result in regulatory fines").
  5.  **Mitigation Strategies (if mentioned):** Briefly describe any specific strategies, controls, or plans the company mentions to mitigate or manage this risk. State 'None explicitly mentioned' if no strategy is detailed.
  6.  **Severity:** Assign a severity level based on the likely impact and probability: 'high', 'medium', or 'low'.
  7.  **Original Text Excerpt:** A short, direct quote (1-3 sentences) from the original text that best encapsulates the risk. **This field is mandatory.**

  Text: ${text}

  Return JSON. Ensure 'risks' is an array of objects.
  {
    "title": "Detailed Risk Factors Analysis",
    "risks": [
      {
        "category": "operational|financial|regulatory|market|strategic|cybersecurity|environmental|other",
        "title": "Concise risk title",
        "description": "2-4 sentence detailed description of the risk.",
        "potentialImpact": "Specific adverse effects on business/financials.",
        "mitigationStrategies": "Description of mitigation efforts or 'None explicitly mentioned'.",
        "severity": "high|medium|low",
        "originalExcerpt": "Direct quote from the text (1-3 sentences) that best represents the risk."
      }
    ],
    "overallRiskSummary": "A concluding statement on the company's general risk profile, highlighting the most significant identified risks."
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = result.choices[0].message.content || "{}";

    let data;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      console.error("Risk JSON parsing error, attempting to fix...");

      const fixedContent = content
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/\n/g, " ")
        .replace(/\t/g, " ");

      try {
        data = JSON.parse(fixedContent);
      } catch (secondError) {
        console.error(
          "Failed to parse risk analysis even after cleanup:",
          secondError
        );
        return [
          {
            id: "risk-0",
            category: "other",
            title: "Risk Analysis Error",
            description:
              "Unable to parse risk analysis due to formatting issues. Please review the original document.",
            potentialImpact: "See original document for details",
            mitigationStrategies: "None explicitly mentioned",
            severity: "medium",
            originalExcerpt:
              "Risk analysis could not be completed due to technical issues.",
          },
        ];
      }
    }

    const risks = Array.isArray(data.risks) ? data.risks : [];
    return risks.map((r: any, i: number) => ({
      id: `risk-${i}`,
      category: r.category || "other",
      title: r.title || "Untitled Risk",
      description: r.description || "No description available",
      potentialImpact: r.potentialImpact || "Impact not specified",
      mitigationStrategies:
        r.mitigationStrategies || "None explicitly mentioned",
      severity: r.severity || "medium",
      originalExcerpt: r.originalExcerpt || "No excerpt available",
      ...r,
    }));
  } catch (error) {
    console.error("Failed to analyze risks:", error);
    return [];
  }
}

async function analyzeLegalSection(text: string, openai: OpenAI) {
  const prompt = `From the Legal Proceedings section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a comprehensive analysis of significant legal matters.

  Specifically, extract and analyze the following:
  1.  **Overall Legal Summary:** Provide a brief overview (1-2 sentences) of the company's general legal landscape or state 'No material litigation reported'.
  2.  **Material Legal Cases (if any):** For each material legal proceeding identified:
      *   **Case Title/Description:** A concise title and description of the case, including the parties involved.
      *   **Nature of Claim:** The type of claim (e.g., patent infringement, environmental violation, consumer class action, antitrust, regulatory inquiry).
      *   **Current Status:** The current stage of the proceeding (e.g., ongoing litigation, settlement discussions, appeal, concluded with judgment).
      *   **Company's Position:** A brief statement on the company's defense or position in the case.
      *   **Potential Financial Impact:** A detailed assessment of the potential financial impact, including:
          *   Estimated range of loss, if disclosed.
          *   Any reserves/provisions set aside.
          *   Impact on earnings, cash flow, or financial condition.
          *   Whether the impact is covered by insurance.
          *   State 'Not estimable at this time' or 'No material impact expected' if explicitly stated.
      *   **Key Dates:** Any significant upcoming dates or past rulings mentioned.
  3.  **Regulatory Inquiries/Investigations (if separate):** Summarize any significant regulatory inquiries or investigations mentioned, their nature, and potential implications. State 'None reported' if not applicable.
  4.  **Environmental Litigation (if specific):** Summarize any specific environmental litigation or regulatory actions, their status, and estimated costs. State 'None reported' if not applicable.
  5.  **Overall Risk Assessment:** Provide a concluding statement on the overall legal risk exposure for the company based on the information provided. State 'Low legal risk' or 'Moderate legal risk' if an assessment can be inferred, or 'Assessment not specified'.

  Text: ${text}

  Return JSON. If no material litigation, only return the "overallLegalSummary" indicating 'No material litigation reported'.
  {
    "title": "Detailed Legal Proceedings Analysis",
    "overallLegalSummary": "Brief overview or 'No material litigation reported'.",
    "materialCases": [
      {
        "caseTitle": "Title/Parties",
        "natureOfClaim": "Type of claim",
        "currentStatus": "Stage of proceeding",
        "companyPosition": "Company's defense/position",
        "potentialFinancialImpact": {
          "estimatedLossRange": "e.g., '$X - $Y million' or 'Not estimable'",
          "reservesSetAside": "e.g., '$Z million' or 'None'",
          "impactDescription": "Description of impact on financials",
          "insuranceCoverage": "Yes|No|Not specified"
        },
        "keyDates": ["Date 1", "Date 2"]
      }
    ],
    "regulatoryInquiries": "Summary of regulatory inquiries or 'None reported'.",
    "environmentalLitigation": "Summary of environmental litigation or 'None reported'.",
    "overallRiskAssessment": "Concluding statement on legal risk exposure."
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Ensure materialCases and keyDates are arrays
  if (!Array.isArray(parsedContent.materialCases)) {
    parsedContent.materialCases = parsedContent.materialCases
      ? [parsedContent.materialCases]
      : [];
  }
  parsedContent.materialCases.forEach((caseItem: any) => {
    if (!Array.isArray(caseItem.keyDates)) {
      caseItem.keyDates = caseItem.keyDates ? [caseItem.keyDates] : [];
    }
  });

  return parsedContent;
}
async function analyzeMdnaSection(text: string, openai: OpenAI) {
  const prompt = `Analyze the Management's Discussion and Analysis (MD&A) section for the company ${
    process.env.COMPANY_NAME || "the company"
  } in detail.
  Extract the following comprehensive information, providing specific numbers, percentages, and years where available.

  For the **Executive Summary**, **Critical Accounting Policies**, **Off-Balance Sheet Arrangements**, **Known Trends, Uncertainties, and Opportunities**, and **Future Capital Needs & Funding Strategies** sections, provide a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes. For other sections, provide the detailed analysis without an excerpt.

  1.  **Executive Summary of Operations and Financial Condition:** Provide a narrative summary (4-6 sentences) of the company's financial performance (revenues, profitability, key drivers of change) and financial condition (liquidity, capital resources) for the most recent periods presented. Include actual numbers and year-over-year comparisons.
  2.  **Results of Operations - Detailed Analysis:**
      *   **Revenue Analysis:** Describe key factors and trends influencing revenue (e.g., product mix, pricing, volume, geographic performance). Include specific numbers and growth rates.
      *   **Cost of Sales/Gross Profit Analysis:** Explain significant changes in cost of sales and gross profit margins.
      *   **Operating Expenses Analysis:** Detail major changes and drivers in operating expenses (e.g., R&D, SG&A) and their impact on profitability.
      *   **Other Income/Expense:** Summarize any material non-operating income or expenses.
      *   **Segment Information (if applicable):** If the company reports segment data, analyze the performance of each major segment (revenue, profit, key trends). State 'Not applicable' if not reported.
  3.  **Liquidity and Capital Resources:**
      *   **Current Liquidity:** Summarize the company's short-term liquidity, including cash and equivalents, working capital, and operating cash flows. Provide relevant figures and trends.
      *   **Capital Resources:** Describe the company's long-term capital structure, significant debt obligations, and access to capital markets. Detail any material debt covenants or restrictions.
      *   **Cash Flow Analysis:** Briefly analyze cash flows from operating, investing, and financing activities, highlighting major uses and sources of cash.
      *   **Future Capital Needs & Funding Strategies:** Identify any stated future capital expenditure plans (CAPEX), significant funding needs, and the company's strategies to meet these needs (e.g., debt, equity, internal cash generation).
  4.  **Critical Accounting Policies and Estimates:**
      *   Identify 2-4 of the most critical accounting policies or estimates that require management's subjective judgment and could have a material impact on financial results.
      *   Briefly explain why these policies are considered critical and the nature of the estimation uncertainty, including potential impacts of different assumptions.
  5.  **Off-Balance Sheet Arrangements:** Describe any material off-balance sheet arrangements (e.g., guarantees, securitized assets, unconsolidated entities, VIEs) and their potential impact on liquidity, capital resources, or results of operations. State 'None reported' if not applicable.
  6.  **Contractual Obligations and Commercial Commitments:**
      *   Summarize significant contractual obligations (e.g., lease commitments, purchase obligations, long-term debt principal payments) and their timing. State 'None reported' if no material obligations are discussed.
  7.  **Known Trends, Uncertainties, and Opportunities:**
      *   Identify 3-5 significant known trends, demands, commitments, events, uncertainties, **or opportunities** that are reasonably likely to have a material effect on the company's future financial condition or operating results.
      *   For each, briefly describe its nature and potential impact/benefit, and any management responses or mitigation strategies.
  8.  **Inflation and Changing Prices:**
      *   Discuss any material impact of inflation or changing prices on the company's operations and financial results, and management's strategies to mitigate these effects. State 'Not discussed' if not applicable.
  9.  **Strategic Outlook and Future Plans:**
      *   Summarize the company's strategic vision, significant future plans (e.g., expansion, new products, strategic initiatives, market entries, M&A), and expected challenges as discussed by management.
      *   Mention any identified forward-looking statements or risks associated with them, but also highlight potential benefits and growth drivers of these plans.

  Text: ${text}

  Return JSON. Ensure 'executiveSummary' is a plain string. Only the specified sections should include an 'excerpt' key.
  {
    "title": "Comprehensive Management's Discussion and Analysis",
    "executiveSummary": {
      "summary": "A 4-6 sentence narrative summary of financial performance and condition with specific numbers and comparisons.",
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

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Ensure arrays are correctly handled
  if (!Array.isArray(parsedContent.criticalAccountingPolicies)) {
    parsedContent.criticalAccountingPolicies =
      parsedContent.criticalAccountingPolicies
        ? [parsedContent.criticalAccountingPolicies]
        : [];
  }
  if (!Array.isArray(parsedContent.knownTrendsUncertaintiesOpportunities)) {
    parsedContent.knownTrendsUncertaintiesOpportunities =
      parsedContent.knownTrendsUncertaintiesOpportunities
        ? [parsedContent.knownTrendsUncertaintiesOpportunities]
        : [];
  }

  // Clean up potential non-string issues for summary/analysis and specified excerpts
  for (const key of Object.keys(parsedContent)) {
    const item = parsedContent[key];
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      // Handle objects like executiveSummary, offBalanceSheetArrangements, futureCapitalNeedsAndFundingStrategies
      if (item.summary !== undefined && typeof item.summary !== "string") {
        console.warn(
          `OpenAI returned non-string for ${key}.summary. Stringifying it.`
        );
        item.summary = String(item.summary);
      }
      if (item.analysis !== undefined && typeof item.analysis !== "string") {
        console.warn(
          `OpenAI returned non-string for ${key}.analysis. Stringifying it.`
        );
        item.analysis = String(item.analysis);
      }
      if (item.excerpt !== undefined && typeof item.excerpt !== "string") {
        console.warn(
          `OpenAI returned non-string for ${key}.excerpt. Stringifying it.`
        );
        item.excerpt = String(item.excerpt);
      }
    } else if (Array.isArray(item)) {
      // Handle arrays like criticalAccountingPolicies, knownTrendsUncertaintiesOpportunities
      for (const entry of item) {
        if (
          entry.explanation !== undefined &&
          typeof entry.explanation !== "string"
        ) {
          console.warn(
            `OpenAI returned non-string for array item explanation. Stringifying it.`
          );
          entry.explanation = String(entry.explanation);
        }
        if (
          entry.impactBenefit !== undefined &&
          typeof entry.impactBenefit !== "string"
        ) {
          console.warn(
            `OpenAI returned non-string for array item impactBenefit. Stringifying it.`
          );
          entry.impactBenefit = String(entry.impactBenefit);
        }
        if (entry.excerpt !== undefined && typeof entry.excerpt !== "string") {
          console.warn(
            `OpenAI returned non-string for array item excerpt. Stringifying it.`
          );
          entry.excerpt = String(entry.excerpt);
        }
      }
    } else if (typeof item !== "string" && item !== null) {
      // Handle direct string fields like revenueAnalysis if they accidentally become non-string
      console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
      parsedContent[key] = String(item);
    }
  }

  return parsedContent;
}
async function analyzeMarketRiskSection(text: string, openai: OpenAI) {
  const prompt = `From the Market Risk section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed analysis of market risk exposures, including their potential impact, the company's mitigation strategies, and any reported sensitivity analyses.

  Specifically, extract and analyze the following:
  1.  **Overall Market Risk Summary & Philosophy:** Provide a concise overview (3-4 sentences) of the company's primary market risk exposures, including its general philosophy or framework for managing these risks.
  2.  **Interest Rate Risk:**
      *   Describe the company's exposure to changes in interest rates (e.g., variable-rate debt, floating-rate investments, cash equivalents, interest rate-sensitive assets/liabilities).
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact (e.g., on pre-tax earnings, cash flows, fair value of debt) of a hypothetical change in interest rates (e.g., "A 1% increase in interest rates would impact pre-tax earnings by $X million over the next year"). State the specific percentage change and the financial metric affected.
      *   Detail any strategies or instruments used to mitigate interest rate risk (e.g., interest rate swaps, fixed-rate debt conversion, natural hedges).
      *   State 'None reported' if no significant interest rate risk or mitigation is mentioned.
  3.  **Foreign Currency Exchange Rate Risk:**
      *   Describe the company's exposure to fluctuations in foreign currency exchange rates, distinguishing between **transaction risk** (e.g., foreign-denominated sales/purchases, operating expenses) and **translation risk** (e.g., consolidating foreign subsidiary financial statements).
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact (e.g., on revenue, net income, shareholders' equity) of a hypothetical change in exchange rates (e.g., "A 10% weakening of the Euro against the USD would impact revenue by $Y million"). State the specific percentage change, currencies, and the financial metric affected.
      *   Detail any strategies or instruments used to mitigate currency risk (e.g., foreign currency forward contracts, options, natural hedges, functional currency management).
      *   State 'None reported' if no significant currency risk or mitigation is mentioned.
  4.  **Commodity Price Risk (if applicable):**
      *   Describe any significant exposure to changes in commodity prices (e.g., raw materials for production, energy costs, finished product prices tied to commodities). Identify the key commodities involved.
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact of a hypothetical change in commodity prices.
      *   Detail any strategies or instruments used to mitigate commodity price risk (e.g., long-term supply contracts with fixed prices, commodity futures/options, vertical integration).
      *   State 'None reported' if no significant commodity price risk or mitigation is mentioned.
  5.  **Equity Price Risk (if applicable):**
      *   Describe any significant exposure to changes in equity prices (e.g., marketable equity securities investments, deferred compensation plans tied to company stock or other equities, stock-based compensation liabilities).
      *   **Quantified Potential Impact (Sensitivity Analysis):** Clearly state and quantify, if possible, the potential financial impact of a hypothetical change in equity prices.
      *   Detail any strategies or instruments used to mitigate equity price risk.
      *   State 'None reported' if no significant equity price risk or mitigation is mentioned.
  6.  **Derivative Financial Instruments Usage:**
      *   Summarize the company's use of derivative financial instruments across all risk categories.
      *   Specify the primary types of derivatives used (e.g., swaps, forwards, options, futures).
      *   State the primary objectives for using derivatives (e.g., hedging specific exposures, managing overall portfolio risk, fair value hedges, cash flow hedges).
      *   Mention if hedge accounting is applied and its general impact.
      *   State 'None reported' if derivatives are not materially discussed.
  7.  **Key Takeaways/Concerns & Future Outlook:**
      *   Highlight any particularly noteworthy points, significant vulnerabilities, unusual hedging practices, or unhedged material exposures identified in the section.
      *   Include any forward-looking statements or management commentary on the future outlook of market risks or risk management strategies. State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON. Ensure all financial impacts include currency and unit.
  {
    "title": "Detailed Market Risk Analysis",
    "overallSummaryAndPhilosophy": "A concise overview of primary market risk exposures and management philosophy.",
    "interestRateRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact (e.g., 'A 1% increase in interest rates would impact pre-tax earnings by $X million over the next year') or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '1%'",
          "affectedMetric": "e.g., 'pre-tax earnings'",
          "impactValue": "e.g., '$X million'",
          "period": "e.g., 'next year' or 'annual'"
        }
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"]
    },
    "currencyRisk": {
      "exposure": "Description of exposure (transaction and translation risk) or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '10%'",
          "currencyPair": "e.g., 'EUR/USD'",
          "affectedMetric": "e.g., 'revenue'",
          "impactValue": "e.g., '$Y million'"
        }
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"]
    },
    "commodityPriceRisk": {
      "exposure": "Description of exposure including key commodities or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '10%'",
          "commodity": "e.g., 'crude oil'",
          "affectedMetric": "e.g., 'cost of goods sold'",
          "impactValue": "e.g., '$Z million'"
        }
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"]
    },
    "equityPriceRisk": {
      "exposure": "Description of exposure or 'None reported'.",
      "potentialImpact": {
        "description": "Quantified potential financial impact or 'Not specified'.",
        "sensitivityAnalysisDetails": {
          "changePercentage": "e.g., '10%'",
          "affectedMetric": "e.g., 'net income'",
          "impactValue": "e.g., '$A million'"
        }
      },
      "mitigationStrategies": ["Strategy 1", "Strategy 2"]
    },
    "derivativeFinancialInstrumentsUsage": {
      "summary": "Summary of derivative use, types, objectives, and hedge accounting or 'None reported'.",
      "typesOfDerivatives": ["Type 1", "Type 2"],
      "objectives": ["Objective 1", "Objective 2"]
    },
    "keyTakeawaysConcernsAndFutureOutlook": ["Concern 1", "Concern 2", "Future outlook commentary"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key] ? [obj[key]] : [];
    }
  };

  // Ensure mitigationStrategies and other array fields are arrays
  ensureArray(parsedContent.interestRateRisk, "mitigationStrategies");
  ensureArray(parsedContent.currencyRisk, "mitigationStrategies");
  ensureArray(parsedContent.commodityPriceRisk, "mitigationStrategies");
  ensureArray(parsedContent.equityPriceRisk, "mitigationStrategies");
  ensureArray(
    parsedContent.derivativeFinancialInstrumentsUsage,
    "typesOfDerivatives"
  );
  ensureArray(parsedContent.derivativeFinancialInstrumentsUsage, "objectives");
  ensureArray(parsedContent, "keyTakeawaysConcernsAndFutureOutlook");

  // Recursive function to clean up non-string values within objects/arrays
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (typeof item !== "string") {
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
        }
      } else if (
        typeof obj[key] !== "string" &&
        obj[key] !== null &&
        key !== "changePercentage" &&
        key !== "impactValue"
      ) {
        // Exclude specific numeric fields from string conversion if they are expected to be numbers
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}
async function analyzeFinancialsSection(text: string, openai: OpenAI) {
  const prompt = `From the Financial Statements section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed breakdown of profitability for the most recent two fiscal years and year-over-year comparisons.

  For each item identified in **"Noteworthy Items/Footnotes Impacting Profitability"**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information for that item. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Revenue Analysis:**
      *   Value for the most recent fiscal year (Current Year) and the previous fiscal year (Previous Year).
      *   Absolute change and percentage change year-over-year.
      *   The specific reporting periods (e.g., FY20XX vs FY20XY).
      *   Explain the primary drivers for any significant change, specifically mentioning contributions from volume, pricing, and product/service mix if discussed.
  2.  **Cost of Goods Sold (COGS) & Gross Profit Analysis:**
      *   COGS value for Current Year and Previous Year.
      *   Gross Profit value for Current Year and Previous Year.
      *   Absolute change and percentage change in Gross Profit year-over-year.
      *   Explain primary factors affecting COGS and gross margin, such as raw material costs, labor, production efficiency, or pricing strategies.
  3.  **Operating Expenses Analysis:**
      *   Total Operating Expenses value for Current Year and Previous Year.
      *   Break down major components like Selling, General & Administrative (SG&A) and Research & Development (R&D) expenses for both years, if available.
      *   Absolute change and percentage change in Total Operating Expenses year-over-year.
      *   Comment on operational efficiency changes and the key drivers of expense fluctuations.
  4.  **Operating Income (EBIT) Analysis:**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Comment on the overall operational profitability trend.
  5.  **EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization):**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Briefly explain its significance or drivers of change, if different from EBIT.
  6.  **Interest Expense & Other Non-Operating Items:**
      *   Summarize significant interest expenses, other non-operating income/expenses, and their impact on pre-tax income for both years.
  7.  **Income Tax Expense:**
      *   Value for Current Year and Previous Year.
      *   Effective tax rate for both years.
      *   Comment on any significant changes in tax rate or unusual tax items.
  8.  **Net Income (Profit/Loss) Analysis:**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Highlight key contributors (positive or negative) to net income fluctuations.
  9.  **Earnings Per Share (EPS) - Diluted:**
      *   Value for Current Year and Previous Year.
      *   Absolute change and percentage change year-over-year.
      *   Mention any significant factors affecting EPS beyond net income (e.g., share buybacks, new issuances).
  10. **Profitability Ratios:**
      *   Calculate and provide Gross Profit Margin, Operating Margin, Net Profit Margin, EBITDA Margin, Return on Assets (ROA), and Return on Equity (ROE) for both Current Year and Previous Year.
      *   Comment on the trends and implications of these ratios.
  11. **Noteworthy Items/Footnotes Impacting Profitability:**
      *   Identify and summarize any unusual or non-recurring items, significant adjustments, one-time gains/losses, restructuring charges, impairments, or critical information mentioned in footnotes that significantly impacted profitability.
      *   For each item, specify its estimated financial impact and whether it's recurring. If nothing unusual, state 'None identified'.

  Text: ${text}

  Return JSON. Ensure all monetary values include currency (e.g., "$X million"), percentages include "%", and periods are clearly stated (e.g., "FY20XX").

  {
    "title": "Detailed Profitability Analysis and Year-over-Year Comparison",
    "revenueAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "drivers": "Explanation of revenue changes including volume, pricing, mix."
    },
    "cogsAndGrossProfitAnalysis": {
      "cogs": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "grossProfit": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"},
        "changeAbsolute": "$Z million",
        "changePercentage": "A%"
      },
      "factors": "Explanation of COGS and gross margin factors."
    },
    "operatingExpensesAnalysis": {
      "totalOperatingExpenses": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"},
        "changeAbsolute": "$Z million",
        "changePercentage": "A%"
      },
      "sgna": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "rd": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "efficiencyComment": "Comment on operational efficiency and drivers of change."
    },
    "operatingIncomeEBITAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "trendComment": "Comment on overall operational profitability trend."
    },
    "ebitdaAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "significance": "Brief explanation of significance or drivers of change."
    },
    "interestAndOtherNonOperatingItems": {
      "interestExpense": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "otherNonOperatingIncomeExpense": {
        "currentYear": {"value": "$X million", "period": "FY20XX"},
        "previousYear": {"value": "$Y million", "period": "FY20XY"}
      },
      "impactComment": "Summary of impact on pre-tax income."
    },
    "incomeTaxExpenseAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "effectiveTaxRateCurrentYear": "X%",
      "effectiveTaxRatePreviousYear": "Y%",
      "taxRateComment": "Comment on significant changes in tax rate or unusual items."
    },
    "netIncomeAnalysis": {
      "currentYear": {"value": "$X million", "period": "FY20XX"},
      "previousYear": {"value": "$Y million", "period": "FY20XY"},
      "changeAbsolute": "$Z million",
      "changePercentage": "A%",
      "contributors": "Key contributors to net income fluctuations."
    },
    "epsDilutedAnalysis": {
      "currentYear": {"value": "$X", "period": "FY20XX"},
      "previousYear": {"value": "$Y", "period": "FY20XY"},
      "changeAbsolute": "$Z",
      "changePercentage": "A%",
      "factorsBeyondNetIncome": "Significant factors affecting EPS beyond net income."
    },
    "profitabilityRatios": {
      "grossProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "operatingMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "netProfitMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "ebitdaMargin": {"currentYear": "X%", "previousYear": "Y%"},
      "roa": {"currentYear": "X%", "previousYear": "Y%"},
      "roe": {"currentYear": "X%", "previousYear": "Y%"},
      "trendComment": "Comment on margin and ratio trends and implications."
    },
    "noteworthyItemsImpacts": [
      {
        "description": "Summary of unusual item 1 or footnote, including its financial impact.",
        "type": "unusual_item|adjustment|one_time_gain_loss|restructuring_charge|impairment|footnote",
        "financialImpact": "$I million (non-recurring)",
        "recurring": false,
        "excerpt": "A 1-2 sentence supporting excerpt from the text."
      }
    ],
    "keyInsights": "A concluding summary highlighting the most significant findings regarding profitability for the period."
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "noteworthyItemsImpacts");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific numeric values if needed)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (typeof item !== "string") {
              // If array contains primitive non-strings
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
        }
      } else if (
        typeof obj[key] !== "string" &&
        obj[key] !== null &&
        key !== "recurring"
      ) {
        // 'recurring' is boolean
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}
async function analyzeControlsSection(text: string, openai: OpenAI) {
  const prompt = `From the "Controls and Procedures" or "Internal Control Over Financial Reporting" section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed analysis of the company's internal controls.

  Specifically, extract and analyze the following:
  1.  **Management's Conclusion on Disclosure Controls:**
      *   Summarize management's conclusion on the effectiveness of the company's disclosure controls and procedures as of the end of the reporting period. State if they are "effective" or not.
      *   Include a concise, 1-2 sentence 'excerpt' directly from the text supporting this conclusion.
  2.  **Management's Report on Internal Control Over Financial Reporting (ICFR):**
      *   Summarize management's assessment of the effectiveness of the company's internal control over financial reporting. State if they are "effective" or not.
      *   Include a concise, 1-2 sentence 'excerpt' directly from the text supporting this assessment.
  3.  **Material Weaknesses in ICFR (if any):**
      *   List and describe any "material weaknesses" in Internal Control Over Financial Reporting identified by management at the end of the reporting period. For each weakness, provide a brief description and its potential impact.
      *   For each material weakness, include a concise, 1-2 sentence 'excerpt' directly from the text describing the weakness.
      *   If "None reported," explicitly state this.
  4.  **Remediation Efforts for Material Weaknesses:**
      *   If material weaknesses were identified, describe the company's plans or actions taken to remediate (düzeltmek) these weaknesses.
      *   For each remediation effort, include a concise, 1-2 sentence 'excerpt' directly from the text.
      *   State 'Not applicable' if no material weaknesses were reported or no remediation efforts are discussed.
  5.  **Changes in Internal Control Over Financial Reporting:**
      *   Describe any material changes in internal control over financial reporting during the most recent fiscal quarter that have materially affected, or are reasonably likely to materially affect, the company’s internal control over financial reporting.
      *   State 'None reported' if no material changes are discussed.
  6.  **Independent Registered Public Accounting Firm's Opinion (if applicable):**
      *   If the company's independent auditor provided an opinion on the effectiveness of ICFR, summarize their conclusion.
      *   Note if the auditor's opinion differs from management's assessment.
      *   Include a concise, 1-2 sentence 'excerpt' directly from the text stating the auditor's conclusion.
      *   State 'Not applicable' if no auditor opinion on ICFR is included (e.g., smaller reporting companies may be exempt).
  7.  **Key Takeaways/Concerns:**
      *   Highlight any particularly noteworthy points, significant discrepancies between management and auditor, or ongoing concerns regarding the company's control environment. State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON. Ensure all excerpts are direct quotes.
  {
    "title": "Internal Controls Analysis",
    "managementConclusionDisclosureControls": {
      "conclusion": "Summary of management's conclusion (e.g., 'effective') or 'Not reported'.",
      "excerpt": "1-2 sentence supporting excerpt or 'Not reported'."
    },
    "managementReportICFR": {
      "assessment": "Summary of management's assessment (e.g., 'effective') or 'Not reported'.",
      "excerpt": "1-2 sentence supporting excerpt or 'Not reported'."
    },
    "materialWeaknessesICFR": [
      {
        "description": "Description of material weakness.",
        "potentialImpact": "Potential impact of the weakness.",
        "excerpt": "1-2 sentence excerpt describing the weakness."
      }
    ],
    "remediationEfforts": [
      {
        "description": "Description of remediation plan/action.",
        "excerpt": "1-2 sentence excerpt from the text."
      }
    ],
    "changesInICFR": "Description of material changes or 'None reported'.",
    "auditorOpinionICFR": {
      "conclusion": "Summary of auditor's conclusion (e.g., 'effective' or 'adverse') or 'Not applicable'.",
      "differenceFromManagement": "Note if auditor's opinion differs or 'Not applicable'.",
      "excerpt": "1-2 sentence excerpt or 'Not applicable'."
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "materialWeaknessesICFR");
  ensureArray(parsedContent, "remediationEfforts");
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (typeof item !== "string") {
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
        }
      } else if (typeof obj[key] !== "string" && obj[key] !== null) {
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}
async function analyzeDirectorsSection(text: string, openai: OpenAI) {
  const prompt = `From the "Directors and Executive Officers" or "Board of Directors" section for ${
    process.env.COMPANY_NAME || "the company"
  }, provide a detailed analysis of the company's board composition, governance structure, and key leadership.

  For **Board Composition Overview** and **Board Leadership Structure**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Board Composition Overview:**
      *   Summarize the overall composition of the board, including total number of directors and a brief comment on diversity if explicitly mentioned (e.g., gender, background).
      *   State the percentage of independent directors.
  2.  **List of Directors:**
      *   For each director, provide their name, current position(s) at the company (if any, e.g., CEO), age, and indicate if they are considered "independent."
      *   Briefly summarize their key qualifications, expertise, and primary professional background/experience that makes them valuable to the board.
  3.  **Key Executive Officers (Non-Board Members but significant):**
      *   List key executive officers who are NOT board members (e.g., CFO, COO, other EVPs) including their name and title. State 'None reported' if only board members are listed in the section.
  4.  **Board Leadership Structure:**
      *   Identify who serves as the Chairman of the Board and the CEO.
      *   State whether the roles of Chairman and CEO are combined or separate.
      *   If the roles are separate, identify the Lead Independent Director (if any).
      *   Comment on the rationale or implications of the chosen leadership structure if discussed.
  5.  **Board Committees:**
      *   Identify the key standing committees of the board (e.g., Audit Committee, Compensation Committee, Nominating and Governance Committee).
      *   For each committee, list its primary responsibilities and the names of its members, noting if the members are independent.
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

  Return JSON.
  {
    "title": "Board of Directors and Executive Officers Analysis",
    "boardCompositionOverview": {
      "totalDirectors": "Number",
      "independentDirectorsPercentage": "X%",
      "diversityComment": "Brief comment on diversity or 'Not discussed'.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text." // Sadece burada var
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
      "excerpt": "A 1-2 sentence supporting excerpt from the text." // Sadece burada var
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
      // excerpt kaldırıldı
    },
    "boardSkillsAndExperience": {
      "summary": "Summary of collective skills/expertise or 'Not explicitly detailed'."
      // excerpt kaldırıldı
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "directors");
  ensureArray(parsedContent, "keyExecutiveOfficers");
  ensureArray(parsedContent, "boardCommittees");
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Ensure members array within boardCommittees
  parsedContent.boardCommittees.forEach((committee: any) => {
    ensureArray(committee, "members");
  });

  // Recursive function to clean up non-string values within objects/arrays (excluding specific boolean values)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (typeof item !== "string") {
              // If array contains primitive non-strings
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // Check for 'summary' or 'assessment' and ensure they are strings
          if (
            obj[key].summary !== undefined &&
            typeof obj[key].summary !== "string"
          ) {
            obj[key].summary = String(obj[key].summary);
          }
          if (
            obj[key].assessment !== undefined &&
            typeof obj[key].assessment !== "string"
          ) {
            obj[key].assessment = String(obj[key].assessment);
          }
          // Yalnızca belirli yerlerdeki excerpt'ları kontrol et
          if (
            ["boardCompositionOverview", "boardLeadershipStructure"].includes(
              key
            )
          ) {
            // Sadece bu ikisi için excerpt'ı kontrol et
            if (
              obj[key].excerpt !== undefined &&
              typeof obj[key].excerpt !== "string"
            ) {
              obj[key].excerpt = String(obj[key].excerpt);
            }
          }
        }
      } else if (
        typeof obj[key] !== "string" &&
        obj[key] !== null &&
        key !== "isIndependent" &&
        key !== "rolesCombined"
      ) {
        // Exclude booleans
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}

async function analyzeCompensationSection(text: string, openai: OpenAI) {
  const prompt = `From the "Executive Compensation" section, provide a detailed analysis of the company's executive compensation philosophy, structure, and key components.

  For the **Compensation Philosophy and Objectives**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Compensation Philosophy and Objectives:**
      *   Summarize the stated philosophy and objectives behind the company's executive compensation program (e.g., attract, retain, motivate, align with shareholder interests, pay-for-performance).
  2.  **Key Compensation Components:**
      *   Identify and describe the main components of executive compensation (e.g., base salary, annual cash incentives/bonuses, long-term equity incentives, retirement benefits, perquisites).
  3.  **CEO Compensation Summary:**
      *   State the CEO's total compensation for the most recently reported fiscal year.
      *   Break down the CEO's compensation by major components (e.g., base salary, bonus, stock awards, option awards, non-equity incentive plan compensation, change in pension value, all other compensation). If exact breakdown is not available, provide an estimate or 'Not explicitly detailed'.
  4.  **Other Named Executive Officers (NEOs) Compensation:**
      *   List the other Named Executive Officers (typically the next top 3-4 highest paid executives, excluding the CEO) and their reported total compensation for the most recent fiscal year. If individual breakdowns are available, include them. If not, state 'Not explicitly detailed'.
  5.  **Performance-Based Compensation:**
      *   Describe how the company links compensation to performance.
      *   Identify key performance metrics used (e.g., EPS, revenue growth, TSR, operational targets).
      *   Estimate or state the approximate percentage of executive compensation that is performance-based, if explicitly mentioned.
  6.  **Clawback Policies and Stock Ownership Guidelines:**
      *   Describe any clawback policies in place (situations where compensation must be returned).
      *   Describe any stock ownership guidelines or requirements for executives. State 'None reported' if not mentioned.
  7.  **Key Takeaways/Potential Concerns:**
      *   Highlight any particularly noteworthy points, strengths, or potential red flags/concerns related to executive compensation (e.g., excessive pay, weak link to performance, complex structure, lack of transparency, significant perquisites, alignment with industry peers). State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON.
  {
    "title": "Executive Compensation Analysis",
    "compensationPhilosophy": {
      "summary": "Summary of compensation philosophy and objectives.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text." // Buraya eklendi
    },
    "keyCompensationComponents": [
      {
        "componentName": "Base Salary",
        "description": "Fixed cash compensation."
      }
    ],
    "ceoCompensation": {
      "fiscalYear": "YYYY",
      "totalCompensation": "Amount",
      "breakdown": {
        "baseSalary": "Amount",
        "bonus": "Amount",
        "stockAwards": "Amount",
        "optionAwards": "Amount",
        "nonEquityIncentiveComp": "Amount",
        "pensionValueChange": "Amount",
        "allOtherComp": "Amount",
        "notes": "Any additional details or 'Not explicitly detailed' if breakdown isn't granular."
      }
    },
    "otherNamedExecutiveOfficersComp": [
      {
        "name": "Executive Name",
        "title": "Title",
        "totalCompensation": "Amount",
        "notes": "Any individual breakdown details or 'Not explicitly detailed'."
      }
    ],
    "performanceBasedCompensation": {
      "description": "How compensation is linked to performance.",
      "performanceMetrics": ["Metric 1", "Metric 2"],
      "performanceBasedPercentage": "X% or 'Not explicitly detailed'."
    },
    "clawbackPolicies": "Description of policies or 'None reported'.",
    "stockOwnershipGuidelines": "Description of guidelines or 'None reported'.",
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "keyCompensationComponents");
  ensureArray(parsedContent, "otherNamedExecutiveOfficersComp");
  ensureArray(parsedContent.performanceBasedCompensation, "performanceMetrics");
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific numeric values for compensation)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (
              typeof item !== "string" &&
              key !== "performanceMetrics"
            ) {
              // performanceMetrics'i stringify etmeyelim
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // CEO Compensation breakdown'daki sayısal alanları kontrol et, string olmayanları string yap
          if (
            key === "breakdown" ||
            key === "ceoCompensation" ||
            key === "otherNamedExecutiveOfficersComp"
          ) {
            const numericFields = [
              "baseSalary",
              "bonus",
              "stockAwards",
              "optionAwards",
              "nonEquityIncentiveComp",
              "pensionValueChange",
              "allOtherComp",
              "totalCompensation",
            ];
            numericFields.forEach((field) => {
              if (
                obj[key][field] !== undefined &&
                typeof obj[key][field] !== "string" &&
                typeof obj[key][field] !== "number"
              ) {
                obj[key][field] = String(obj[key][field]);
              }
            });
          }
          // Yalnızca compensationPhilosophy içindeki excerpt'ı kontrol et
          if (
            key === "compensationPhilosophy" &&
            obj[key].excerpt !== undefined &&
            typeof obj[key].excerpt !== "string"
          ) {
            obj[key].excerpt = String(obj[key].excerpt);
          }
        }
      } else if (
        typeof obj[key] !== "string" &&
        obj[key] !== null &&
        !["totalCompensation"].includes(key)
      ) {
        // Belirli sayısal alanları hariç tut
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}

async function analyzeOwnershipSection(text: string, openai: OpenAI) {
  const prompt = `From the "Security Ownership of Certain Beneficial Owners and Management" or "Principal Shareholders" section, provide a detailed analysis of the company's ownership structure, including major shareholders and insider holdings.

  For the **Overview of Ownership Structure**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Overview of Ownership Structure:**
      *   Provide a general summary of the company's ownership landscape (e.g., widely held, controlled by a few large institutions or a founding family).
      *   Mention the total number of shares outstanding if available.
  2.  **Major Shareholders (5% or More Beneficial Ownership):**
      *   List all beneficial owners (individuals or institutions) holding 5% or more of the company's voting securities.
      *   For each major shareholder, provide their name, the number of shares beneficially owned, and their percentage of total shares outstanding.
      *   Indicate if the shareholder is an institution, mutual fund, or individual.
  3.  **Management and Director Ownership (Insider Ownership):**
      *   List each director, nominee for director, and Named Executive Officer individually. For each, state the number of shares beneficially owned and their percentage of total shares outstanding.
      *   Provide the collective beneficial ownership of all directors and executive officers as a group (total shares and total percentage).
      *   Identify any significant individual holdings within management/board that suggest control or strong alignment.
  4.  **Ownership Type Distribution (Optional/If Available):**
      *   If the text provides a breakdown, summarize the distribution of ownership by type (e.g., institutional, retail, insider). State 'Not explicitly detailed' if not provided.
  5.  **Voting Power Dynamics:**
      *   Comment on the concentration of voting power.
      *   Identify if any single shareholder or group holds a controlling interest (e.g., >50% of voting shares).
      *   Discuss potential implications of the ownership structure on corporate governance (e.g., shareholder activism risk, control over board elections).
  6.  **Key Takeaways/Concerns:**
      *   Highlight any particularly noteworthy points, strengths, or potential red flags/concerns related to the ownership structure (e.g., high insider ownership indicating alignment, low insider ownership, concentrated power leading to potential minority shareholder oppression, potential for activist investors). State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON.
  {
    "title": "Ownership Structure Analysis",
    "ownershipOverview": {
      "summary": "General summary of ownership landscape.",
      "totalSharesOutstanding": "Number or 'Not available'.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text." 
    },
    "majorShareholders": [
      {
        "name": "Shareholder Name (e.g., BlackRock, Vanguard)",
        "sharesOwned": "Number",
        "percentage": "X%",
        "type": "Institution / Individual / Fund"
      }
    ],
    "managementAndDirectorOwnership": {
      "individualHoldings": [
        {
          "name": "Director/Officer Name",
          "sharesOwned": "Number",
          "percentage": "X%",
          "isDirector": true,
          "isOfficer": false
        }
      ],
      "groupHoldings": {
        "totalSharesOwned": "Number",
        "totalPercentage": "X%"
      },
      "significantIndividualHoldingsComment": "Comment on any individual holdings suggesting control or alignment, or 'None'."
    },
    "ownershipTypeDistribution": {
      "institutionalOwnership": "X% or 'Not explicitly detailed'.",
      "retailOwnership": "X% or 'Not explicitly detailed'.",
      "insiderOwnership": "X% or 'Not explicitly detailed'.",
      "notes": "Any additional breakdown details or 'Not explicitly detailed'."
    },
    "votingPowerDynamics": {
      "concentrationComment": "Comment on concentration of voting power.",
      "controllingInterest": "Name of controlling party or 'None'.",
      "implications": "Discussion of governance implications."
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "majorShareholders");
  if (parsedContent.managementAndDirectorOwnership) {
    ensureArray(
      parsedContent.managementAndDirectorOwnership,
      "individualHoldings"
    );
  }
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific boolean values)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (
              typeof item !== "string" &&
              key !== "isDirector" &&
              key !== "isOfficer"
            ) {
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // Belirli numerik alanların string olması gerekebilir (örneğin "X%")
          const numericOrPercentageFields = [
            "sharesOwned",
            "percentage",
            "totalSharesOutstanding",
            "institutionalOwnership",
            "retailOwnership",
            "insiderOwnership",
          ];
          numericOrPercentageFields.forEach((field) => {
            if (
              obj[key][field] !== undefined &&
              typeof obj[key][field] !== "string" &&
              typeof obj[key][field] !== "number"
            ) {
              obj[key][field] = String(obj[key][field]);
            }
          });
          // Yalnızca ownershipOverview içindeki excerpt'ı kontrol et
          if (
            key === "ownershipOverview" &&
            obj[key].excerpt !== undefined &&
            typeof obj[key].excerpt !== "string"
          ) {
            obj[key].excerpt = String(obj[key].excerpt);
          }
        }
      } else if (
        typeof obj[key] !== "string" &&
        obj[key] !== null &&
        key !== "isDirector" &&
        key !== "isOfficer"
      ) {
        // Booleans hariç
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}

async function analyzeRelatedPartySection(text: string, openai: OpenAI) {
  const prompt = `From the "Certain Relationships and Related Party Transactions" or similar section, provide a detailed analysis of the company's related party transactions, including a summary of the policies, descriptions of significant transactions, and any identified concerns.

  For the **Overview of Related Party Transactions**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Overview of Related Party Transactions:**
      *   Provide a general summary of the company's engagement in related party transactions.
      *   State if the company reports having any related party transactions, or 'None reported' if explicitly stated.
  2.  **Related Party Transaction Policies:**
      *   Describe the company's policies and procedures for the review, approval, or ratification of related party transactions.
      *   Identify which body (e.g., Audit Committee, independent directors) is responsible for oversight.
      *   State 'Not explicitly detailed' if policies are not described.
  3.  **List of Significant Related Party Transactions:**
      *   For each significant related party transaction, provide the following details:
          *   **Description:** A clear summary of the transaction (e.g., sale of goods, lease agreement, loan, consulting services).
          *   **Related Party:** Name of the individual or entity involved (e.g., Director X, CEO's family member, a company where Director Y is a principal).
          *   **Relationship:** Describe the nature of the relationship (e.g., director, executive, 5% shareholder, family member).
          *   **Amount/Value:** The monetary value or estimated value of the transaction.
          *   **Approval Process:** How the transaction was reviewed and approved (e.g., approved by Audit Committee, disinterested directors).
      *   If no transactions are reported, list 'None reported'.
  4.  **Key Takeaways/Potential Concerns:**
      *   Highlight any particularly noteworthy points, strengths (e.g., robust approval policies), or potential red flags/concerns related to related party transactions (e.g., high volume, significant value, lack of clear approval process, transactions not at arm's length, potential for conflicts of interest, perceived benefit to related party over company). State 'None identified' if everything appears standard or if no transactions are reported.

  Text: ${text}

  Return JSON.
  {
    "title": "Related Party Transactions Analysis",
    "overview": {
      "summary": "General summary of related party transactions, or 'None reported'.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text or 'None applicable'." // Buraya eklendi
    },
    "policies": {
      "description": "Company's policies for reviewing/approving related party transactions, or 'Not explicitly detailed'.",
      "oversightBody": "Body responsible for oversight (e.g., Audit Committee) or 'Not explicitly detailed'."
    },
    "transactions": [
      {
        "description": "Clear summary of the transaction.",
        "relatedParty": "Name of individual or entity.",
        "relationship": "Nature of relationship (e.g., Director, CEO's family).",
        "amountValue": "Monetary value or 'Not disclosed'.",
        "approvalProcess": "How the transaction was approved or 'Not disclosed'."
      }
    ],
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "transactions");
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific boolean values)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (typeof item !== "string") {
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // Belirli numerik alanların string olması gerekebilir (Amount/Value)
          if (
            obj[key].amountValue !== undefined &&
            typeof obj[key].amountValue !== "string" &&
            typeof obj[key].amountValue !== "number"
          ) {
            obj[key].amountValue = String(obj[key].amountValue);
          }
          // Yalnızca overview içindeki excerpt'ı kontrol et
          if (
            key === "overview" &&
            obj[key].excerpt !== undefined &&
            typeof obj[key].excerpt !== "string"
          ) {
            obj[key].excerpt = String(obj[key].excerpt);
          }
        }
      } else if (typeof obj[key] !== "string" && obj[key] !== null) {
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}

async function analyzeCompensationSection(text: string, openai: OpenAI) {
  const prompt = `From the "Executive Compensation" section, provide a detailed analysis of the company's executive compensation philosophy, structure, and key components.

  For the **Compensation Philosophy and Objectives**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Compensation Philosophy and Objectives:**
      *   Summarize the stated philosophy and objectives behind the company's executive compensation program (e.g., attract, retain, motivate, align with shareholder interests, pay-for-performance).
  2.  **Key Compensation Components:**
      *   Identify and describe the main components of executive compensation (e.g., base salary, annual cash incentives/bonuses, long-term equity incentives, retirement benefits, perquisites).
  3.  **CEO Compensation Summary:**
      *   State the CEO's total compensation for the most recently reported fiscal year.
      *   Break down the CEO's compensation by major components (e.g., base salary, bonus, stock awards, option awards, non-equity incentive plan compensation, change in pension value, all other compensation). If exact breakdown is not available, provide an estimate or 'Not explicitly detailed'.
  4.  **Other Named Executive Officers (NEOs) Compensation:**
      *   List the other Named Executive Officers (typically the next top 3-4 highest paid executives, excluding the CEO) and their reported total compensation for the most recent fiscal year. If individual breakdowns are available, include them. If not, state 'Not explicitly detailed'.
  5.  **Performance-Based Compensation:**
      *   Describe how the company links compensation to performance.
      *   Identify key performance metrics used (e.g., EPS, revenue growth, TSR, operational targets).
      *   Estimate or state the approximate percentage of executive compensation that is performance-based, if explicitly mentioned.
  6.  **Clawback Policies and Stock Ownership Guidelines:**
      *   Describe any clawback policies in place (situations where compensation must be returned).
      *   Describe any stock ownership guidelines or requirements for executives. State 'None reported' if not mentioned.
  7.  **Key Takeaways/Potential Concerns:**
      *   Highlight any particularly noteworthy points, strengths, or potential red flags/concerns related to executive compensation (e.g., excessive pay, weak link to performance, complex structure, lack of transparency, significant perquisites, alignment with industry peers). State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON.
  {
    "title": "Executive Compensation Analysis",
    "compensationPhilosophy": {
      "summary": "Summary of compensation philosophy and objectives.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text." // Buraya eklendi
    },
    "keyCompensationComponents": [
      {
        "componentName": "Base Salary",
        "description": "Fixed cash compensation."
      }
    ],
    "ceoCompensation": {
      "fiscalYear": "YYYY",
      "totalCompensation": "Amount",
      "breakdown": {
        "baseSalary": "Amount",
        "bonus": "Amount",
        "stockAwards": "Amount",
        "optionAwards": "Amount",
        "nonEquityIncentiveComp": "Amount",
        "pensionValueChange": "Amount",
        "allOtherComp": "Amount",
        "notes": "Any additional details or 'Not explicitly detailed' if breakdown isn't granular."
      }
    },
    "otherNamedExecutiveOfficersComp": [
      {
        "name": "Executive Name",
        "title": "Title",
        "totalCompensation": "Amount",
        "notes": "Any individual breakdown details or 'Not explicitly detailed'."
      }
    ],
    "performanceBasedCompensation": {
      "description": "How compensation is linked to performance.",
      "performanceMetrics": ["Metric 1", "Metric 2"],
      "performanceBasedPercentage": "X% or 'Not explicitly detailed'."
    },
    "clawbackPolicies": "Description of policies or 'None reported'.",
    "stockOwnershipGuidelines": "Description of guidelines or 'None reported'.",
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "keyCompensationComponents");
  ensureArray(parsedContent, "otherNamedExecutiveOfficersComp");
  ensureArray(parsedContent.performanceBasedCompensation, "performanceMetrics");
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific numeric values for compensation)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (
              typeof item !== "string" &&
              key !== "performanceMetrics"
            ) {
              // performanceMetrics'i stringify etmeyelim
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // CEO Compensation breakdown'daki sayısal alanları kontrol et, string olmayanları string yap
          if (
            key === "breakdown" ||
            key === "ceoCompensation" ||
            key === "otherNamedExecutiveOfficersComp"
          ) {
            const numericFields = [
              "baseSalary",
              "bonus",
              "stockAwards",
              "optionAwards",
              "nonEquityIncentiveComp",
              "pensionValueChange",
              "allOtherComp",
              "totalCompensation",
            ];
            numericFields.forEach((field) => {
              if (
                obj[key][field] !== undefined &&
                typeof obj[key][field] !== "string" &&
                typeof obj[key][field] !== "number"
              ) {
                obj[key][field] = String(obj[key][field]);
              }
            });
          }
          // Yalnızca compensationPhilosophy içindeki excerpt'ı kontrol et
          if (
            key === "compensationPhilosophy" &&
            obj[key].excerpt !== undefined &&
            typeof obj[key].excerpt !== "string"
          ) {
            obj[key].excerpt = String(obj[key].excerpt);
          }
        }
      } else if (
        typeof obj[key] !== "string" &&
        obj[key] !== null &&
        !["totalCompensation"].includes(key)
      ) {
        // Belirli sayısal alanları hariç tut
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}

async function analyzeOwnershipSection(text: string, openai: OpenAI) {
  const prompt = `From the "Security Ownership of Certain Beneficial Owners and Management" or "Principal Shareholders" section, provide a detailed analysis of the company's ownership structure, including major shareholders and insider holdings.

  For the **Overview of Ownership Structure**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Overview of Ownership Structure:**
      *   Provide a general summary of the company's ownership landscape (e.g., widely held, controlled by a few large institutions or a founding family).
      *   Mention the total number of shares outstanding if available.
  2.  **Major Shareholders (5% or More Beneficial Ownership):**
      *   List all beneficial owners (individuals or institutions) holding 5% or more of the company's voting securities.
      *   For each major shareholder, provide their name, the number of shares beneficially owned, and their percentage of total shares outstanding.
      *   Indicate if the shareholder is an institution, mutual fund, or individual.
  3.  **Management and Director Ownership (Insider Ownership):**
      *   List each director, nominee for director, and Named Executive Officer individually. For each, state the number of shares beneficially owned and their percentage of total shares outstanding.
      *   Provide the collective beneficial ownership of all directors and executive officers as a group (total shares and total percentage).
      *   Identify any significant individual holdings within management/board that suggest control or strong alignment.
  4.  **Ownership Type Distribution (Optional/If Available):**
      *   If the text provides a breakdown, summarize the distribution of ownership by type (e.g., institutional, retail, insider). State 'Not explicitly detailed' if not provided.
  5.  **Voting Power Dynamics:**
      *   Comment on the concentration of voting power.
      *   Identify if any single shareholder or group holds a controlling interest (e.g., >50% of voting shares).
      *   Discuss potential implications of the ownership structure on corporate governance (e.g., shareholder activism risk, control over board elections).
  6.  **Key Takeaways/Concerns:**
      *   Highlight any particularly noteworthy points, strengths, or potential red flags/concerns related to the ownership structure (e.g., high insider ownership indicating alignment, low insider ownership, concentrated power leading to potential minority shareholder oppression, potential for activist investors). State 'None identified' if everything appears standard.

  Text: ${text}

  Return JSON.
  {
    "title": "Ownership Structure Analysis",
    "ownershipOverview": {
      "summary": "General summary of ownership landscape.",
      "totalSharesOutstanding": "Number or 'Not available'.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text." 
    },
    "majorShareholders": [
      {
        "name": "Shareholder Name (e.g., BlackRock, Vanguard)",
        "sharesOwned": "Number",
        "percentage": "X%",
        "type": "Institution / Individual / Fund"
      }
    ],
    "managementAndDirectorOwnership": {
      "individualHoldings": [
        {
          "name": "Director/Officer Name",
          "sharesOwned": "Number",
          "percentage": "X%",
          "isDirector": true,
          "isOfficer": false
        }
      ],
      "groupHoldings": {
        "totalSharesOwned": "Number",
        "totalPercentage": "X%"
      },
      "significantIndividualHoldingsComment": "Comment on any individual holdings suggesting control or alignment, or 'None'."
    },
    "ownershipTypeDistribution": {
      "institutionalOwnership": "X% or 'Not explicitly detailed'.",
      "retailOwnership": "X% or 'Not explicitly detailed'.",
      "insiderOwnership": "X% or 'Not explicitly detailed'.",
      "notes": "Any additional breakdown details or 'Not explicitly detailed'."
    },
    "votingPowerDynamics": {
      "concentrationComment": "Comment on concentration of voting power.",
      "controllingInterest": "Name of controlling party or 'None'.",
      "implications": "Discussion of governance implications."
    },
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "majorShareholders");
  if (parsedContent.managementAndDirectorOwnership) {
    ensureArray(
      parsedContent.managementAndDirectorOwnership,
      "individualHoldings"
    );
  }
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific boolean values)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (
              typeof item !== "string" &&
              key !== "isDirector" &&
              key !== "isOfficer"
            ) {
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // Belirli numerik alanların string olması gerekebilir (örneğin "X%")
          const numericOrPercentageFields = [
            "sharesOwned",
            "percentage",
            "totalSharesOutstanding",
            "institutionalOwnership",
            "retailOwnership",
            "insiderOwnership",
          ];
          numericOrPercentageFields.forEach((field) => {
            if (
              obj[key][field] !== undefined &&
              typeof obj[key][field] !== "string" &&
              typeof obj[key][field] !== "number"
            ) {
              obj[key][field] = String(obj[key][field]);
            }
          });
          // Yalnızca ownershipOverview içindeki excerpt'ı kontrol et
          if (
            key === "ownershipOverview" &&
            obj[key].excerpt !== undefined &&
            typeof obj[key].excerpt !== "string"
          ) {
            obj[key].excerpt = String(obj[key].excerpt);
          }
        }
      } else if (
        typeof obj[key] !== "string" &&
        obj[key] !== null &&
        key !== "isDirector" &&
        key !== "isOfficer"
      ) {
        // Booleans hariç
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}

async function analyzeRelatedPartySection(text: string, openai: OpenAI) {
  const prompt = `From the "Certain Relationships and Related Party Transactions" or similar section, provide a detailed analysis of the company's related party transactions, including a summary of the policies, descriptions of significant transactions, and any identified concerns.

  For the **Overview of Related Party Transactions**, include a concise, 1-2 sentence 'excerpt' directly from the text that explicitly supports or introduces the key information in that section. This excerpt will be used for verification purposes.

  Specifically, extract and analyze the following:
  1.  **Overview of Related Party Transactions:**
      *   Provide a general summary of the company's engagement in related party transactions.
      *   State if the company reports having any related party transactions, or 'None reported' if explicitly stated.
  2.  **Related Party Transaction Policies:**
      *   Describe the company's policies and procedures for the review, approval, or ratification of related party transactions.
      *   Identify which body (e.g., Audit Committee, independent directors) is responsible for oversight.
      *   State 'Not explicitly detailed' if policies are not described.
  3.  **List of Significant Related Party Transactions:**
      *   For each significant related party transaction, provide the following details:
          *   **Description:** A clear summary of the transaction (e.g., sale of goods, lease agreement, loan, consulting services).
          *   **Related Party:** Name of the individual or entity involved (e.g., Director X, CEO's family member, a company where Director Y is a principal).
          *   **Relationship:** Describe the nature of the relationship (e.g., director, executive, 5% shareholder, family member).
          *   **Amount/Value:** The monetary value or estimated value of the transaction.
          *   **Approval Process:** How the transaction was reviewed and approved (e.g., approved by Audit Committee, disinterested directors).
      *   If no transactions are reported, list 'None reported'.
  4.  **Key Takeaways/Potential Concerns:**
      *   Highlight any particularly noteworthy points, strengths (e.g., robust approval policies), or potential red flags/concerns related to related party transactions (e.g., high volume, significant value, lack of clear approval process, transactions not at arm's length, potential for conflicts of interest, perceived benefit to related party over company). State 'None identified' if everything appears standard or if no transactions are reported.

  Text: ${text}

  Return JSON.
  {
    "title": "Related Party Transactions Analysis",
    "overview": {
      "summary": "General summary of related party transactions, or 'None reported'.",
      "excerpt": "A 1-2 sentence supporting excerpt from the text or 'None applicable'." // Buraya eklendi
    },
    "policies": {
      "description": "Company's policies for reviewing/approving related party transactions, or 'Not explicitly detailed'.",
      "oversightBody": "Body responsible for oversight (e.g., Audit Committee) or 'Not explicitly detailed'."
    },
    "transactions": [
      {
        "description": "Clear summary of the transaction.",
        "relatedParty": "Name of individual or entity.",
        "relationship": "Nature of relationship (e.g., Director, CEO's family).",
        "amountValue": "Monetary value or 'Not disclosed'.",
        "approvalProcess": "How the transaction was approved or 'Not disclosed'."
      }
    ],
    "keyTakeawaysConcerns": ["Concern 1", "Concern 2"]
  }`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const parsedContent = JSON.parse(result.choices[0].message.content || "{}");

  // Helper to ensure array fields are arrays
  const ensureArray = (obj: any, key: any) => {
    if (obj && !Array.isArray(obj[key])) {
      obj[key] = obj[key]
        ? Array.isArray(obj[key])
          ? obj[key]
          : [obj[key]]
        : [];
    }
  };

  ensureArray(parsedContent, "transactions");
  ensureArray(parsedContent, "keyTakeawaysConcerns");

  // Recursive function to clean up non-string values within objects/arrays (excluding specific boolean values)
  const cleanStringValues = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item) => {
            if (typeof item === "object" && item !== null) {
              cleanStringValues(item);
            } else if (typeof item !== "string") {
              console.warn(
                `OpenAI returned non-string for array item in ${key}. Stringifying it.`
              );
              obj[key] = obj[key].map((i: any) =>
                typeof i === "string" ? i : String(i)
              );
            }
          });
        } else {
          cleanStringValues(obj[key]);
          // Belirli numerik alanların string olması gerekebilir (Amount/Value)
          if (
            obj[key].amountValue !== undefined &&
            typeof obj[key].amountValue !== "string" &&
            typeof obj[key].amountValue !== "number"
          ) {
            obj[key].amountValue = String(obj[key].amountValue);
          }
          // Yalnızca overview içindeki excerpt'ı kontrol et
          if (
            key === "overview" &&
            obj[key].excerpt !== undefined &&
            typeof obj[key].excerpt !== "string"
          ) {
            obj[key].excerpt = String(obj[key].excerpt);
          }
        }
      } else if (typeof obj[key] !== "string" && obj[key] !== null) {
        console.warn(`OpenAI returned non-string for ${key}. Stringifying it.`);
        obj[key] = String(obj[key]);
      }
    }
  };

  cleanStringValues(parsedContent);

  return parsedContent;
}
