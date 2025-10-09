// services.ts - analyzeMdnaSection'ı güncelleyin
import { z } from "zod";
import OpenAI from "openai";
import { mdaAnalysisSchema, MDAAnalysis } from "../schemas/mdaAnalysisSchema";

const MAX_MDNA_CHUNK_SIZE_TOKENS = 25000; // Güvenli bir chunk boyutu belirleyin, GPT-4o 128k destekler, ancak güvenlik için daha küçük tutulabilir.

async function countTokens(str: string): Promise<number> {
  // Basit bir tahmin. Daha doğru bir token sayımı için 'gpt-tokenizer' gibi bir kütüphane kullanılabilir.
  // Örneğin: import { encode } from 'gpt-tokenizer'; return encode(str).length;
  return Math.ceil(str.length / 4);
}

// Prompt oluşturucu helper fonksiyonları
interface SectionPromptConfig {
  sectionName: string;
  instructions: string;
  schemaFragment: string; // JSON şema yapısının bir parçası
}

const createSectionPrompt = (
  sectionConfig: SectionPromptConfig,
  chunkText: string,
  companyName: string
) => `
  Analyze the following text from the Management's Discussion and Analysis (MD&A) section for ${
    companyName || "the company"
  }.
  Your task is to extract information specifically for the **${
    sectionConfig.sectionName
  }** section based on the provided instructions.

  ${sectionConfig.instructions}

  Return the extracted information as a JSON object that strictly adheres to the following structure:
  ${sectionConfig.schemaFragment}

  Text to analyze:
  \`\`\`
  ${chunkText}
  \`\`\`

  Return JSON.
  `;

// Zod şemanızdan JSON şema fragmanlarını manuel olarak veya bir araçla çıkarmanız gerekebilir.
// Basitlik adına, burada manuel olarak yazacağım.
const businessOverviewInstructions = `
  Extract the executive summary, business description, key strategies, competitive strengths, operating segments, and recent developments.
  Provide summaries for each, and for recent developments, specify event, impact, and date if available.
  Collect any relevant excerpts that support the overall business overview.
`;
const businessOverviewSchemaFragment = `{
  "businessOverview": {
    "executiveSummary": "Summary of business, max 5 sentences.",
    "businessDescription": "Brief description of the company's core business.",
    "keyStrategies": ["Strategy 1", "Strategy 2"],
    "competitiveStrengths": ["Strength 1", "Strength 2"],
    "operatingSegments": [
      { "name": "Segment A", "description": "Description", "revenueContribution": "X%" }
    ],
    "recentDevelopments": [
      { "event": "Event 1", "impact": "Impact 1", "date": "YYYY-MM-DD" }
    ],
    "excerpts": ["Relevant excerpt 1", "Relevant excerpt 2"]
  }
}`;

const currentPeriodHighlightsInstructions = `
  Identify the fiscal year end, key achievements, challenges, and significant financial highlights for the current period.
  Include specific metrics, values, and trends.
  Provide a single, concise excerpt that summarizes the main highlights of the period.
`;
const currentPeriodHighlightsSchemaFragment = `{
  "currentPeriodHighlights": {
    "fiscalYearEnd": "YYYY-MM-DD",
    "keyAchievements": ["Achievement 1", "Achievement 2"],
    "challenges": ["Challenge 1", "Challenge 2"],
    "financialHighlights": [
      { "metric": "Revenue", "value": "$X", "trend": "Up/Down" }
    ],
    "excerpt": "A concise excerpt from the text."
  }
}`;

const resultsOfOperationsInstructions = `
  Perform a detailed analysis of the company's results of operations.
  Include overall performance summary, revenue analysis (total, by segment, drivers, geographic), cost analysis (cost of revenue, gross margin, operating expenses breakdown, cost drivers), and profitability analysis (operating income, net income, margins).
  Also include store metrics if applicable, and any comparative tables.
  Extract relevant excerpts for each sub-section where possible.
`;
const resultsOfOperationsSchemaFragment = `{
  "resultsOfOperations": {
    "overallPerformance": {
      "summary": "Overall performance summary.",
      "keyPoints": ["Key point 1"],
      "excerpts": ["Excerpt 1"]
    },
    "revenueAnalysis": {
      "totalRevenue": {
        "currentPeriod": {"value": "$X", "period": "YYYY"},
        "priorPeriod": {"value": "$Y", "period": "YYYY"},
        "change": {"absolute": "$Z", "percentage": "P%"},
        "commentary": "Revenue commentary.",
        "excerpt": "Relevant revenue excerpt."
      },
      "revenueBySegment": [
        { "segmentName": "Segment A", "revenue": {"currentPeriod": {"value": "$X", "period": "YYYY"}}}
      ],
      "revenueDrivers": [{"driver": "Driver 1", "impact": "Impact 1"}],
      "geographicRevenue": [{"region": "Region A", "revenue": "$X"}],
      "excerpts": ["Revenue analysis excerpt."]
    },
    "costAnalysis": { /* Similar structure to revenueAnalysis for costs */
      "costOfRevenue": { /* financialMetricSchema */ },
      "grossMargin": { /* financialMetricSchema */ },
      "operatingExpenses": {
        "total": { /* financialMetricSchema */ },
        "breakdown": [ { "category": "SG&A", "amount": "$X" } ]
      },
      "costDrivers": ["Driver 1"],
      "efficiencyMeasures": ["Measure 1"],
      "excerpts": ["Cost analysis excerpt."]
    },
    "profitabilityAnalysis": { /* Similar structure for profitability */
      "operatingIncome": { /* financialMetricSchema */ },
      "netIncome": { /* financialMetricSchema */ },
      "margins": { "grossMargin": "X%", "operatingMargin": "Y%", "netMargin": "Z%" },
      "nonGAAPReconciliation": [{"item": "Item 1", "amount": "$X"}],
      "excerpts": ["Profitability analysis excerpt."]
    },
    "storeMetrics": { /* storeMetricsSchema */ },
    "comparativeTables": [
      {
        "tableName": "Table 1",
        "metrics": [{"item": "Item A", "currentYear": "$X", "priorYear": "$Y"}],
        "footnotes": ["Footnote 1"]
      }
    ]
  }
}`;

const liquidityAndCapitalResourcesInstructions = `
  Analyze the company's liquidity and capital resources.
  Cover cash position, detailed cash flow analysis (operating, investing, financing), capital structure (debt, equity, credit facilities, covenants), and future capital needs with funding strategies and commitments.
  Include specific amounts, trends, and relevant excerpts.
`;
const liquidityAndCapitalResourcesSchemaFragment = `{
  "liquidityAndCapitalResources": {
    "cashPosition": {
      "currentCash": "$X",
      "narrative": "Narrative summary.",
      "excerpt": "Relevant excerpt."
    },
    "cashFlowAnalysis": {
      "operatingActivities": {"amount": "$X", "keyDrivers": ["Driver 1"]},
      "investingActivities": {"amount": "$X", "majorInvestments": [{"description": "Investment 1"}]},
      "financingActivities": {"amount": "$X", "debtActivity": "$Y"},
      "excerpts": ["Cash flow excerpt."]
    },
    "capitalStructure": {
      "totalDebt": "$X",
      "creditFacilities": [{"facility": "Facility 1", "available": "$Y"}],
      "excerpt": "Capital structure excerpt."
    },
    "futureCapitalNeeds": {
      "anticipatedNeeds": ["Need 1"],
      "fundingSources": ["Source 1"],
      "commitments": [{"type": "Type 1", "amount": "$X"}],
      "excerpt": "Future capital needs excerpt."
    }
  }
}`;

const marketTrendsAndOutlookInstructions = `
  Discuss industry trends, the competitive landscape, the regulatory environment (issues, impact, management response), and economic factors (factor, current impact, expected impact).
  Collect relevant excerpts for this section.
`;
const marketTrendsAndOutlookSchemaFragment = `{
  "marketTrendsAndOutlook": {
    "industryTrends": ["Trend 1", "Trend 2"],
    "competitiveLandscape": "Description of competitive landscape.",
    "regulatoryEnvironment": [
      { "issue": "Issue 1", "impact": "Impact 1" }
    ],
    "economicFactors": [
      { "factor": "Inflation", "currentImpact": "Impact" }
    ],
    "excerpts": ["Market trends excerpt."]
  }
}`;

const criticalAccountingPoliciesInstructions = `
  Identify 2-4 critical accounting policies or estimates.
  For each policy, provide its name, a description, key assumptions, and any sensitivity analysis.
  Include a direct excerpt for each policy.
`;
const criticalAccountingPoliciesSchemaFragment = `{
  "criticalAccountingPolicies": [
    {
      "policyName": "Policy 1",
      "description": "Description of policy.",
      "keyAssumptions": ["Assumption 1"],
      "sensitivityAnalysis": "Sensitivity details.",
      "excerpt": "Policy 1 excerpt."
    }
  ]
}`;

const knownTrendsAndUncertaintiesInstructions = `
  Identify significant known trends, uncertainties, and opportunities.
  For each, describe its nature, potential impact/benefit, and mitigation strategy.
  Include forward-looking statements (guidance, strategic initiatives, cautionary note) and relevant excerpts.
`;
const knownTrendsAndUncertaintiesSchemaFragment = `{
  "knownTrendsAndUncertainties": {
    "opportunities": [
      { "description": "Opportunity 1", "potentialImpact": "Impact 1" }
    ],
    "risks": [
      { "description": "Risk 1", "potentialImpact": "Impact 1" }
    ],
    "forwardLookingStatements": {
      "guidance": [{"metric": "Revenue", "target": "$X"}],
      "strategicInitiatives": ["Initiative 1"],
      "cautionaryNote": "Cautionary note."
    },
    "excerpts": ["Known trends excerpt."]
  }
}`;

const contractualObligationsInstructions = `
  Summarize significant contractual obligations and commitments.
  Categorize by type (e.g., Operating Leases, Purchase Obligations, Debt) and provide total amounts and timing.
  Include information on off-balance sheet arrangements and a relevant excerpt.
`;
const contractualObligationsSchemaFragment = `{
  "contractualObligations": {
    "summary": "Summary of obligations.",
    "obligations": [
      {
        "type": "Operating Leases",
        "total": "$X",
        "timing": {"within1Year": "$Y", "years1to3": "$Z"}
      }
    ],
    "offBalanceSheet": "Off-balance sheet details.",
    "excerpt": "Contractual obligations excerpt."
  }
}`;

const keyTakeawaysInstructions = `
  Provide overall key takeaways from the MD&A.
  Identify strengths, challenges, assess management's tone (e.g., Optimistic, Cautious), and list investor considerations.
  Collect relevant excerpts that summarize these takeaways.
`;
const keyTakeawaysSchemaFragment = `{
  "keyTakeaways": {
    "strengths": ["Strength 1"],
    "challenges": ["Challenge 1"],
    "managementTone": "Optimistic",
    "investorConsiderations": ["Consideration 1"],
    "excerpts": ["Key takeaways excerpt."]
  }
}`;

// Tüm bölümlerin bir listesi
const mdaSectionsConfig: SectionPromptConfig[] = [
  {
    sectionName: "Business Overview",
    instructions: businessOverviewInstructions,
    schemaFragment: businessOverviewSchemaFragment,
  },
  {
    sectionName: "Current Period Highlights",
    instructions: currentPeriodHighlightsInstructions,
    schemaFragment: currentPeriodHighlightsSchemaFragment,
  },
  {
    sectionName: "Results of Operations",
    instructions: resultsOfOperationsInstructions,
    schemaFragment: resultsOfOperationsSchemaFragment,
  },
  {
    sectionName: "Liquidity and Capital Resources",
    instructions: liquidityAndCapitalResourcesInstructions,
    schemaFragment: liquidityAndCapitalResourcesSchemaFragment,
  },
  {
    sectionName: "Market Trends and Business Environment",
    instructions: marketTrendsAndOutlookInstructions,
    schemaFragment: marketTrendsAndOutlookSchemaFragment,
  },
  {
    sectionName: "Critical Accounting Policies",
    instructions: criticalAccountingPoliciesInstructions,
    schemaFragment: criticalAccountingPoliciesSchemaFragment,
  },
  {
    sectionName: "Known Trends, Uncertainties, and Forward-Looking Statements",
    instructions: knownTrendsAndUncertaintiesInstructions,
    schemaFragment: knownTrendsAndUncertaintiesSchemaFragment,
  },
  {
    sectionName: "Contractual Obligations and Commitments",
    instructions: contractualObligationsInstructions,
    schemaFragment: contractualObligationsSchemaFragment,
  },
  {
    sectionName: "Overall MD&A Takeaways",
    instructions: keyTakeawaysInstructions,
    schemaFragment: keyTakeawaysSchemaFragment,
  },
];

// Ana analiz fonksiyonu
export async function analyzeMdnaSection(
  text: string,
  openai: OpenAI,
  companyName: string
): Promise<MDAAnalysis | null> {
  let fullAnalysis: Partial<MDAAnalysis> = {
    title: "Management's Discussion and Analysis",
  };

  const textTokens = await countTokens(text);
  console.log(`[analyzeMdnaSection] MD&A section total tokens: ${textTokens}`);

  // Metni daha küçük parçalara bölmek yerine, her bir bölüm için tüm metni gönderiyoruz.
  // Modelin uzun metinleri işleme yeteneği sayesinde bu genellikle daha iyi sonuç verir.
  // Ancak, MAX_MDNA_CHUNK_SIZE_TOKENS'ı aşarsa, bu yaklaşım çalışmayacaktır.
  // Daha büyük metinler için, her bir sub-prompt için metni chunk'lara bölmek ve sonra birleştirmek gerekebilir.
  // Mevcut MAX_MDNA_CHUNK_SIZE_TOKENS 25000 olduğundan, tüm metni tek seferde göndermek daha kolay olacaktır.
  // Eğer metin bu sınırı aşarsa, her bölüm için de chunking mantığı uygulanmalıdır.
  if (textTokens > MAX_MDNA_CHUNK_SIZE_TOKENS && textTokens > 100000) {
    // Çok uzun metinler için uyarı
    console.warn(
      `[analyzeMdnaSection] Warning: MD&A section is very long (${textTokens} tokens). Sending full text for each section might hit rate limits or context window limits. Consider more granular chunking per section or increasing MAX_MDNA_CHUNK_SIZE_TOKENS if using a model with larger context.`
    );
  }

  for (const sectionConfig of mdaSectionsConfig) {
    console.log(
      `[analyzeMdnaSection] Analyzing section: ${sectionConfig.sectionName}`
    );
    const sectionPrompt = createSectionPrompt(
      sectionConfig,
      text, // Tüm metni her bölüm için gönderiyoruz
      companyName
    );

    try {
      const result = await openai.chat.completions.create({
        model: "gpt-4o", // GPT-4o'nun 128k context'i var
        messages: [{ role: "user", content: sectionPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const rawParsedContent = JSON.parse(
        result.choices[0].message.content || "{}"
      );
      console.log(
        `[analyzeMdnaSection] Raw response for ${sectionConfig.sectionName}:`,
        JSON.stringify(rawParsedContent, null, 2)
      );

      // Gelen içeriği doğrudan fullAnalysis objesine atayalım.
      // Her prompt, ana şemanın bir bölümünü döndüreceği için (örn. {"businessOverview": {...}})
      // bu doğrudan atama işe yarar.
      Object.assign(fullAnalysis, rawParsedContent);
    } catch (sectionError) {
      console.error(
        `[analyzeMdnaSection] Error processing section ${sectionConfig.sectionName}:`,
        sectionError
      );
      // Hata durumunda ilgili bölüm boş veya varsayılan değerlerle kalacaktır.
    }
  }

  try {
    console.log(
      "[analyzeMdnaSection] Attempting Zod validation for full analysis..."
    );
    const validatedContent = mdaAnalysisSchema.parse(fullAnalysis);
    console.log(
      "[analyzeMdnaSection] Zod validation successful for full analysis."
    );

    // Listeleri deduplicate etme (knownTrendsUncertaintiesOpportunities, criticalAccountingPolicies)
    // Bu deduplicate mantığı, her bölümün kendi prompt'undan tekil listeler gelmesini varsayar.
    // Eğer farklı bölümler aynı tipte listeler döndürüyorsa, daha karmaşık bir birleştirme gerekir.
    if (validatedContent.knownTrendsAndUncertainties?.risks) {
      const uniqueRisks = new Map();
      validatedContent.knownTrendsAndUncertainties.risks.forEach((item) => {
        if (
          item.description &&
          item.description !== "No description available."
        ) {
          uniqueRisks.set(item.description, item);
        }
      });
      validatedContent.knownTrendsAndUncertainties.risks = Array.from(
        uniqueRisks.values()
      );
      if (validatedContent.knownTrendsAndUncertainties.risks.length === 0) {
        validatedContent.knownTrendsAndUncertainties.risks.push({
          description: "No specific risks were identified in the text.",
          potentialImpact: "N/A",
          mitigationStrategy: "N/A",
        });
      }
    }
    if (validatedContent.knownTrendsAndUncertainties?.opportunities) {
      const uniqueOpportunities = new Map();
      validatedContent.knownTrendsAndUncertainties.opportunities.forEach(
        (item) => {
          if (
            item.description &&
            item.description !== "No description available."
          ) {
            uniqueOpportunities.set(item.description, item);
          }
        }
      );
      validatedContent.knownTrendsAndUncertainties.opportunities = Array.from(
        uniqueOpportunities.values()
      );
      if (
        validatedContent.knownTrendsAndUncertainties.opportunities.length === 0
      ) {
        validatedContent.knownTrendsAndUncertainties.opportunities.push({
          description: "No specific opportunities were identified in the text.",
          potentialImpact: "N/A",
          timeline: "N/A",
        });
      }
    }

    if (validatedContent.criticalAccountingPolicies) {
      const uniquePolicies = new Map();
      validatedContent.criticalAccountingPolicies.forEach((item) => {
        if (item.policyName && item.policyName !== "None identified") {
          uniquePolicies.set(item.policyName, item);
        }
      });
      validatedContent.criticalAccountingPolicies = Array.from(
        uniquePolicies.values()
      );
      if (validatedContent.criticalAccountingPolicies.length === 0) {
        validatedContent.criticalAccountingPolicies.push({
          policyName: "None identified",
          description:
            "No critical accounting policies requiring subjective judgment were explicitly highlighted in this section.",
          keyAssumptions: [],
          excerpt: "No direct excerpt found.",
        });
      }
    }

    return validatedContent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "[analyzeMdnaSection] Zod Validation Error for full analysis:",
        JSON.stringify(error.issues, null, 2)
      );
      return null;
    }
    console.error(
      "[analyzeMdnaSection] Unexpected error during final validation or processing:",
      error
    );
    return null;
  }
}
