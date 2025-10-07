"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SECAnalysis } from "@/types/sec-analysis";
import DOMPurify from "dompurify";

interface ApiResponse {
  analysis: SECAnalysis;
  originalHtml: string;
}

type SectionKey =
  | "business"
  | "risks"
  | "legal"
  | "mdna"
  | "marketRisk"
  | "financials"
  | "controls"
  | "directors"
  | "compensation"
  | "ownership"
  | "relatedParty";

export default function SplitViewAnalyzer() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SECAnalysis | null>(null);
  const [originalHtml, setOriginalHtml] = useState("");

  const textViewerRef = useRef<HTMLDivElement>(null);

  const safeStr = (value: any): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      alert("Please enter a ticker symbol.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setOriginalHtml("");

    try {
      const response = await fetch("/api/analyze-sec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          filingType: "10-K",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to fetch analysis for ${ticker}`
        );
      }

      const data: ApiResponse = await response.json();

      if (!data.analysis || !data.analysis.sections) {
        throw new Error("Invalid analysis data received: missing sections.");
      }

      setAnalysis(data.analysis);
      setOriginalHtml(data.originalHtml || "");

      console.log("✅ State updated successfully with analysis data.");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("Analysis failed:", errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionKey: SectionKey) => {
    if (!textViewerRef.current) return;

    const searchTerms: Record<SectionKey, string[]> = {
      business: ["item 1.", "item 1 –", "item 1:", "item&#160;1"],
      risks: ["item 1a.", "item 1a –", "item 1a:", "item&#160;1a"],
      legal: ["item 3.", "item 3 –", "item 3:", "item&#160;3"],
      mdna: ["item 7.", "item 7 –", "item 7:", "item&#160;7"],
      marketRisk: ["item 7a.", "item 7a –", "item 7a:", "item&#160;7a"],
      financials: ["item 8.", "item 8 –", "item 8:", "item&#160;8"],
      controls: ["item 9a.", "item 9a –", "item 9a:", "item&#160;9a"],
      directors: ["item 10.", "item 10 –", "item 10:", "item&#160;10"],
      compensation: ["item 11.", "item 11 –", "item 11:", "item&#160;11"],
      ownership: ["item 12.", "item 12 –", "item 12:", "item&#160;12"],
      relatedParty: ["item 13.", "item 13 –", "item 13:", "item&#160;13"],
    };

    const terms = searchTerms[sectionKey];
    const allElements = Array.from(
      textViewerRef.current.querySelectorAll("h1, h2, h3, h4, p, div")
    );

    for (const el of allElements) {
      const text = (el.textContent || "").toLowerCase();

      for (const term of terms) {
        if (text.includes(term.toLowerCase())) {
          if (el instanceof HTMLElement) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });

            const originalBg = el.style.backgroundColor;
            const originalTrans = el.style.transition;

            el.style.backgroundColor = "#fffbce";
            el.style.transition = "background-color 0.8s ease-in-out";

            setTimeout(() => {
              el.style.backgroundColor = originalBg;
              el.style.transition = originalTrans;
            }, 2000);
          }
          return;
        }
      }
    }
  };

  const renderOriginalHtmlContent = () => {
    if (!originalHtml) return <div>Document content not available.</div>;

    try {
      const sanitizedHtml =
        typeof window !== "undefined"
          ? DOMPurify.sanitize(originalHtml, {
              ADD_TAGS: ["meta", "style"],
              ADD_ATTR: ["target", "rel", "style"],
            })
          : originalHtml;

      return (
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          className="prose prose-sm max-w-none sec-filing-content"
        />
      );
    } catch (error) {
      console.error("Error sanitizing or rendering HTML:", error);
      return (
        <div className="text-red-600">Error loading document content.</div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            SEC Filing Analyzer
          </h1>
        </div>
      </header>

      {analysis && (
        <div className="flex flex-1 overflow-hidden">
          <div
            ref={textViewerRef}
            className="w-1/2 overflow-y-auto bg-white border-r p-6"
          >
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white py-2 z-10 border-b">
              {analysis.filing.companyName || "Company Name N/A"} - 10-K
            </h2>
            {renderOriginalHtmlContent()}
          </div>
          <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
            <h2 className="text-xl font-bold mb-6 sticky top-0 bg-gray-50 py-2 z-10 border-b">
              AI Insights
            </h2>

            {/* Business Overview */}
            {analysis.sections?.business && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("business")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏢</span>
                  <h3 className="text-lg font-bold">Business Overview</h3>
                </div>
                <p className="text-gray-700 mb-3 text-sm whitespace-pre-wrap">
                  {safeStr(analysis.sections.business.summary)}
                </p>
                {analysis.sections.business.keyProducts &&
                  analysis.sections.business.keyProducts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">
                        Key Products:
                      </p>
                      <div className="space-y-1">
                        {analysis.sections.business.keyProducts
                          .slice(0, 4)
                          .map((product, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-medium">
                                {product.name}
                              </span>
                              {product.marketPosition && (
                                <span className="text-gray-600">
                                  {" "}
                                  - {product.marketPosition}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                {analysis.sections.business.competitiveAdvantages &&
                  analysis.sections.business.competitiveAdvantages.length >
                    0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">
                        Competitive Advantages:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.sections.business.competitiveAdvantages.map(
                          (adv, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {adv}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </Card>
            )}

            {/* Risk Factors */}
            {analysis.sections?.risks && analysis.sections.risks.length > 0 && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("risks")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-bold">
                    Risk Factors ({analysis.sections.risks.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {analysis.sections.risks.slice(0, 5).map((risk) => (
                    <div key={risk.id} className="p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{risk.title}</p>
                        <Badge
                          className={`text-xs ${
                            risk.severity === "high"
                              ? "bg-red-500 text-white"
                              : risk.severity === "medium"
                              ? "bg-yellow-500 text-gray-800"
                              : "bg-green-500 text-white"
                          }`}
                          variant="default"
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {risk.description}
                      </p>
                      {risk.mitigationStrategies &&
                        risk.mitigationStrategies !==
                          "None explicitly mentioned" && (
                          <p className="text-xs text-blue-600 italic">
                            Mitigation:{" "}
                            {Array.isArray(risk.mitigationStrategies)
                              ? risk.mitigationStrategies.join(", ")
                              : risk.mitigationStrategies}
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Legal Proceedings */}
            {analysis.sections?.legal && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("legal")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚖️</span>
                  <h3 className="text-lg font-bold">Legal Proceedings</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {analysis.sections.legal.overallLegalSummary}
                </p>
                {analysis.sections.legal.materialCases &&
                  analysis.sections.legal.materialCases.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold mb-2">
                        Material Cases:
                      </p>
                      {analysis.sections.legal.materialCases
                        .slice(0, 3)
                        .map((legalCase, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium">
                              {legalCase.caseTitle}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {legalCase.natureOfClaim}
                            </p>
                            <p className="text-xs text-gray-600">
                              Status: {legalCase.currentStatus}
                            </p>
                            {legalCase.potentialFinancialImpact
                              .estimatedLossRange !== "Not estimable" && (
                              <p className="text-xs text-red-600 mt-1">
                                Potential Loss:{" "}
                                {
                                  legalCase.potentialFinancialImpact
                                    .estimatedLossRange
                                }
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
              </Card>
            )}

            {/* Management Discussion and Analysis */}
            {analysis.sections?.mdna && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("mdna")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold">Management Discussion</h3>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">
                  {analysis.sections.mdna.executiveSummary}
                </p>
                {analysis.sections.mdna.knownTrendsUncertaintiesOpportunities &&
                  analysis.sections.mdna.knownTrendsUncertaintiesOpportunities
                    .length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">
                        Key Trends & Opportunities:
                      </p>
                      <div className="space-y-1">
                        {analysis.sections.mdna.knownTrendsUncertaintiesOpportunities
                          .slice(0, 3)
                          .map((item, i) => (
                            <div key={i} className="text-xs">
                              <p className="font-medium">
                                {item.itemDescription}
                              </p>
                              <p className="text-gray-600">
                                {item.impactBenefit}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </Card>
            )}

            {/* Market Risk */}
            {analysis.sections?.marketRisk && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("marketRisk")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📉</span>
                  <h3 className="text-lg font-bold">Market Risk</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  {analysis.sections.marketRisk.overallSummary}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {analysis.sections.marketRisk.interestRateRisk.exposure !==
                    "None reported" && (
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-xs font-semibold">
                        Interest Rate Risk
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {
                          analysis.sections.marketRisk.interestRateRisk
                            .potentialImpact
                        }
                      </p>
                    </div>
                  )}
                  {analysis.sections.marketRisk.currencyRisk.exposure !==
                    "None reported" && (
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs font-semibold">Currency Risk</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {
                          analysis.sections.marketRisk.currencyRisk
                            .potentialImpact
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Financials - Key Metrics */}
            {analysis.sections?.financials && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("financials")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-lg font-bold">Financial Performance</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Revenue</p>
                    <p className="text-lg font-bold">
                      {analysis.sections.financials.revenue.currentYear.value}
                    </p>
                    <p className="text-xs text-gray-600">
                      {analysis.sections.financials.revenue.changePercentage}{" "}
                      YoY
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">Net Income</p>
                    <p className="text-lg font-bold">
                      {analysis.sections.financials.netIncome.currentYear.value}
                    </p>
                    <p className="text-xs text-gray-600">
                      {analysis.sections.financials.netIncome.changePercentage}{" "}
                      YoY
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <p className="text-xs text-gray-600">EPS (Diluted)</p>
                    <p className="text-lg font-bold">
                      {
                        analysis.sections.financials.epsDiluted.currentYear
                          .value
                      }
                    </p>
                    <p className="text-xs text-gray-600">
                      {analysis.sections.financials.epsDiluted.changePercentage}{" "}
                      YoY
                    </p>
                  </div>
                </div>
                {analysis.sections.financials.profitMargins && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-semibold mb-2">
                      Profit Margins:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Gross</p>
                        <p className="font-medium">
                          {
                            analysis.sections.financials.profitMargins
                              .grossProfitMargin.currentYear
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Operating</p>
                        <p className="font-medium">
                          {
                            analysis.sections.financials.profitMargins
                              .operatingMargin.currentYear
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Net</p>
                        <p className="font-medium">
                          {
                            analysis.sections.financials.profitMargins
                              .netProfitMargin.currentYear
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {analysis.sections.financials.noteworthyItems &&
                  analysis.sections.financials.noteworthyItems.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">
                        ⚠️ Notable Items:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.financials.noteworthyItems.map(
                          (item, i) => (
                            <li key={i}>• {item.description}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </Card>
            )}

            {/* Internal Controls */}
            {analysis.sections?.controls && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("controls")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔒</span>
                  <h3 className="text-lg font-bold">Internal Controls</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {analysis.sections.controls.summary}
                </p>
                {(() => {
                  const weaknesses =
                    analysis.sections.controls.materialWeaknesses;
                  const weaknessArray = Array.isArray(weaknesses)
                    ? weaknesses
                    : typeof weaknesses === "string"
                    ? [weaknesses]
                    : [];
                  const filteredWeaknesses = weaknessArray.filter(
                    (w) => w && w !== "None reported"
                  );

                  return (
                    filteredWeaknesses.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-semibold text-red-800 mb-1">
                          🚨 Material Weaknesses:
                        </p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {filteredWeaknesses.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  );
                })()}
              </Card>
            )}

            {/* Executive Compensation */}
            {analysis.sections?.compensation && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("compensation")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💼</span>
                  <h3 className="text-lg font-bold">Executive Compensation</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {analysis.sections.compensation.summary}
                </p>
                {analysis.sections.compensation.ceoTotalComp && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">
                      CEO Total Compensation
                    </p>
                    <p className="text-lg font-bold">
                      {analysis.sections.compensation.ceoTotalComp}
                    </p>
                  </div>
                )}
                {(() => {
                  const flags = analysis.sections.compensation.redFlags;
                  const flagsArray = Array.isArray(flags)
                    ? flags
                    : typeof flags === "string"
                    ? [flags]
                    : [];
                  const filteredFlags = flagsArray.filter(
                    (f) => f && f !== "None identified"
                  );

                  return (
                    filteredFlags.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-semibold text-red-800 mb-1">
                          🚨 Red Flags:
                        </p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {filteredFlags.map((f, i) => (
                            <li key={i}>• {f}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  );
                })()}
              </Card>
            )}

            {/* Ownership Structure */}
            {analysis.sections?.ownership && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("ownership")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold">Ownership Structure</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {analysis.sections.ownership.summary}
                </p>
                {analysis.sections.ownership.insiderOwnership && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Insider Ownership</p>
                    <p className="text-lg font-bold">
                      {analysis.sections.ownership.insiderOwnership}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Related Party Transactions */}
            {analysis.sections?.relatedParty && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("relatedParty")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔗</span>
                  <h3 className="text-lg font-bold">
                    Related Party Transactions
                  </h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {analysis.sections.relatedParty.summary}
                </p>
                {analysis.sections.relatedParty.concerns &&
                  analysis.sections.relatedParty.concerns.filter(
                    (c) => c !== "None identified"
                  ).length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-semibold text-red-800 mb-1">
                        🚨 Concerns:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.relatedParty.concerns
                          .filter((c) => c !== "None identified")
                          .map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                      </ul>
                    </div>
                  )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Initial state: Input form */}
      {!analysis && !loading && (
        <div className="flex items-center justify-center flex-1">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Analyze SEC Filings
              </h2>
              <p className="text-gray-600">
                Enter a stock ticker to view AI-powered insights from 10-K
                filings.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg border p-6">
              <input
                type="text"
                placeholder="e.g., AAPL, MSFT"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnalyze();
                  }
                }}
                aria-label="Stock ticker input"
                autoFocus
              />
              <Button
                onClick={handleAnalyze}
                disabled={!ticker.trim() || loading}
                className="w-full py-3 text-base bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                {loading ? "Analyzing..." : "Analyze Filing"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center animate-bounce">
              <span className="text-3xl">📄</span>
            </div>
            <p className="font-semibold text-gray-700 text-lg">
              Analyzing SEC filing for {ticker || "ticker"}...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This might take a moment to process.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
