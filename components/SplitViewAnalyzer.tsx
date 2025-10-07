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

// Define SectionKey more robustly to match the analysis.sections keys
type SectionKey =
  | "business"
  | "risks" // Corrected from 'risk' to 'risks' to match SECAnalysis type
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

  // Helper to safely convert values to string, handles null/undefined
  const safeStr = (value: any): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    // For non-string objects/arrays, consider stringifying or returning a specific message
    // For now, we'll return an empty string for simplicity if it's not a string
    // You might want to adjust this based on expected types in your SECAnalysis
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

      // Basic validation for critical data
      if (!data.analysis || !data.analysis.sections) {
        throw new Error("Invalid analysis data received: missing sections.");
      }

      setAnalysis(data.analysis);
      // Ensure originalHtml is a string, default to empty
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

    // Use a more robust mapping for search terms
    const searchTerms: Record<SectionKey, string[]> = {
      business: ["item 1.", "item 1 –", "item 1:", "item&#160;1"],
      risks: ["item 1a.", "item 1a –", "item 1a:", "item&#160;1a"], // Corrected key
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
    // Query more specific headings if possible, e.g., 'h2', 'h3'
    // Or stick to all elements if the structure is inconsistent
    const allElements = Array.from(
      textViewerRef.current.querySelectorAll("h1, h2, h3, h4, p, div")
    );

    for (const el of allElements) {
      const text = (el.textContent || "").toLowerCase();

      for (const term of terms) {
        if (text.includes(term.toLowerCase())) {
          if (el instanceof HTMLElement) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });

            // Highlight animation for clarity
            const originalBg = el.style.backgroundColor;
            const originalTrans = el.style.transition;

            el.style.backgroundColor = "#fffbce"; // Lighter yellow for highlight
            el.style.transition = "background-color 0.8s ease-in-out";

            setTimeout(() => {
              el.style.backgroundColor = originalBg;
              el.style.transition = originalTrans;
            }, 2000);
          }
          return; // Found and scrolled, exit
        }
      }
    }
  };

  const renderOriginalHtmlContent = () => {
    if (!originalHtml) return <div>Document content not available.</div>;

    try {
      // DOMPurify should only run client-side
      const sanitizedHtml =
        typeof window !== "undefined"
          ? DOMPurify.sanitize(originalHtml, {
              ADD_TAGS: ["meta", "style"], // Allow style tags for better rendering
              ADD_ATTR: ["target", "rel", "style"], // Allow style attribute
            })
          : originalHtml; // Fallback for server-side if needed, though client-side render is key

      return (
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          // Added 'sec-filing-content' for potential styling hooks
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
          {" "}
          {/* Adjusted padding */}
          <h1 className="text-2xl font-bold text-gray-900">
            SEC Filing Analyzer
          </h1>
        </div>
      </header>

      {analysis && (
        <div className="flex flex-1 overflow-hidden">
          {" "}
          {/* Use flex-1 to occupy remaining height */}
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
            {analysis.sections?.business?.summary && (
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
                {/* Corrected mapping for keyProducts */}
                {analysis.sections.business.keyProducts &&
                  analysis.sections.business.keyProducts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">
                        Key Products:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.sections.business.keyProducts
                          .slice(0, 8)
                          .map((p: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {p}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
              </Card>
            )}

            {/* Risk Factors */}
            {/* Corrected key from 'risk' to 'risks' */}
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
                        <p className="font-semibold text-sm">
                          {safeStr(risk.title)}
                        </p>
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
                          {safeStr(risk.severity)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {safeStr(risk.description)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Legal Proceedings */}
            {analysis.sections?.legal?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("legal")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚖️</span>
                  <h3 className="text-lg font-bold">Legal Proceedings</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeStr(analysis.sections.legal.summary)}
                </p>
                {/* Corrected mapping for materialCases */}
                {analysis.sections.legal.materialCases &&
                  analysis.sections.legal.materialCases.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">
                        Material Cases:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {analysis.sections.legal.materialCases.map(
                          (c: string, i: number) => (
                            <li key={i}>• {c}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </Card>
            )}

            {/* Management Discussion and Analysis (MD&A) */}
            {analysis.sections?.mdna?.executiveSummary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("mdna")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold">Management Discussion</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeStr(analysis.sections.mdna.executiveSummary)}
                </p>
              </Card>
            )}

            {/* Market Risk */}
            {analysis.sections?.marketRisk?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("marketRisk")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📉</span>
                  <h3 className="text-lg font-bold">Market Risk</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeStr(analysis.sections.marketRisk.summary)}
                </p>
              </Card>
            )}

            {/* Financials - Key Metrics */}
            {analysis.sections?.financials?.revenue?.value ||
            analysis.sections?.financials?.netIncome?.value ||
            analysis.sections?.financials?.eps?.value ||
            (analysis.sections?.financials?.unusualItems &&
              analysis.sections.financials.unusualItems.length > 0) ? (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("financials")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-lg font-bold">Key Financial Metrics</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {analysis.sections.financials?.revenue?.value && (
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Revenue</p>
                      <p className="text-lg font-bold">
                        {safeStr(analysis.sections.financials.revenue.value)}
                      </p>
                    </div>
                  )}
                  {analysis.sections.financials?.netIncome?.value && (
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Net Income</p>
                      <p className="text-lg font-bold">
                        {safeStr(analysis.sections.financials.netIncome.value)}
                      </p>
                    </div>
                  )}
                  {analysis.sections.financials?.eps?.value && (
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600">EPS</p>
                      <p className="text-lg font-bold">
                        {safeStr(analysis.sections.financials.eps.value)}
                      </p>
                    </div>
                  )}
                </div>
                {/* Corrected mapping for unusualItems */}
                {analysis.sections.financials?.unusualItems &&
                  analysis.sections.financials.unusualItems.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">
                        ⚠️ Items to Review:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.financials.unusualItems.map(
                          (item: string, i: number) => (
                            <li key={i}>• {item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </Card>
            ) : null}

            {/* Internal Controls */}
            {analysis.sections?.controls?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("controls")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔒</span>
                  <h3 className="text-lg font-bold">Internal Controls</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeStr(analysis.sections.controls.summary)}
                </p>
                {/* Corrected logic for materialWeaknesses: Ensure it's an array */}
                {(() => {
                  const weaknesses =
                    analysis.sections.controls?.materialWeaknesses;
                  // Ensure 'weaknesses' is an array, if it's a string, convert it to an array with one element
                  const weaknessesArray = Array.isArray(weaknesses)
                    ? weaknesses
                    : typeof weaknesses === "string" && weaknesses
                    ? [weaknesses]
                    : [];

                  const filteredWeaknesses = weaknessesArray.filter(
                    (w: string) => w !== "None reported"
                  );

                  return (
                    filteredWeaknesses.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-xs font-semibold text-red-800 mb-1">
                          🚨 Material Weaknesses:
                        </p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {filteredWeaknesses.map((w: string, i: number) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  );
                })()}
              </Card>
            )}

            {/* Ownership Structure */}
            {analysis.sections?.ownership?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => scrollToSection("ownership")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold">Ownership Structure</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeStr(analysis.sections.ownership.summary)}
                </p>
                {analysis.sections.ownership?.insiderOwnership && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Insider Ownership</p>
                    <p className="text-lg font-bold">
                      {safeStr(analysis.sections.ownership.insiderOwnership)}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Related Party Transactions */}
            {analysis.sections?.relatedParty?.summary && (
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
                  {safeStr(analysis.sections.relatedParty.summary)}
                </p>
                {/* Corrected mapping for concerns */}
                {analysis.sections.relatedParty?.concerns &&
                  analysis.sections.relatedParty.concerns.filter(
                    (c) => c !== "None identified"
                  ).length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-semibold text-red-800 mb-1">
                        🚨 Concerns:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.relatedParty.concerns
                          .filter((c: string) => c !== "None identified")
                          .map((c: string, i: number) => (
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
          {" "}
          {/* Use flex-1 */}
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
              {" "}
              {/* Added shadow-lg */}
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
                disabled={!ticker.trim() || loading} // Disable button when loading too
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
          {" "}
          {/* Use flex-1 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center animate-bounce">
              {" "}
              {/* Changed pulse to bounce for variety */}
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
