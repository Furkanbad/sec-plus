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
  | "risk"
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

  const safeString = (value: any): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const flattenData = (obj: any): any => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const flattened: any = {};
          for (const key in item) {
            flattened[key] =
              typeof item[key] === "object" &&
              item[key] !== null &&
              !Array.isArray(item[key])
                ? JSON.stringify(item[key])
                : item[key];
          }
          return flattened;
        }
        return item;
      });
    }

    const flattened: any = {};
    for (const key in obj) {
      const value = obj[key];

      if (Array.isArray(value)) {
        flattened[key] = flattenData(value);
      } else if (typeof value === "object" && value !== null) {
        // Known nested structures that should be preserved
        const knownStructures = ["revenue", "netIncome", "eps"];
        if (knownStructures.includes(key)) {
          flattened[key] = flattenData(value);
        } else {
          // For unknown objects, stringify to be safe
          flattened[key] = JSON.stringify(value);
        }
      } else {
        flattened[key] = value;
      }
    }
    return flattened;
  };

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;

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

      console.log(
        "BEFORE FLATTEN:",
        JSON.stringify(data.analysis.sections.business, null, 2)
      );

      // Flatten nested objects to prevent React errors
      const flattenedAnalysis = {
        ...data.analysis,
        sections: flattenData(data.analysis.sections),
      };

      console.log(
        "AFTER FLATTEN:",
        JSON.stringify(flattenedAnalysis.sections.business, null, 2)
      );

      setAnalysis(flattenedAnalysis);
      setOriginalHtml(data.originalHtml || "");
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
      business: ["item 1.", "item 1 ", "item 1—", "item&#160;1"],
      risk: ["item 1a", "item 1a.", "item 1a—", "item&#160;1a"],
      legal: ["item 3", "item 3.", "item 3—", "item&#160;3"],
      mdna: ["item 7", "item 7.", "item 7—", "item&#160;7"],
      marketRisk: ["item 7a", "item 7a.", "item 7a—", "item&#160;7a"],
      financials: ["item 8", "item 8.", "item 8—", "item&#160;8"],
      controls: ["item 9a", "item 9a.", "item 9a—", "item&#160;9a"],
      directors: ["item 10", "item 10.", "item 10—", "item&#160;10"],
      compensation: ["item 11", "item 11.", "item 11—", "item&#160;11"],
      ownership: ["item 12", "item 12.", "item 12—", "item&#160;12"],
      relatedParty: ["item 13", "item 13.", "item 13—", "item&#160;13"],
    };

    const terms = searchTerms[sectionKey];
    const allElements = Array.from(textViewerRef.current.querySelectorAll("*"));

    for (const el of allElements) {
      const text = (el.textContent || "").toLowerCase();

      for (const term of terms) {
        if (text.includes(term.toLowerCase())) {
          if (el instanceof HTMLElement) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });

            const originalBg = el.style.backgroundColor;
            const originalTrans = el.style.transition;

            el.style.backgroundColor = "#fef3c7";
            el.style.transition = "background-color 1s ease-in-out";

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
    if (!originalHtml) return null;

    const sanitizedHtml = DOMPurify.sanitize(originalHtml);

    return (
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        className="prose prose-sm max-w-none"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-2xl font-semibold text-gray-900">
            SEC Filing Analyzer
          </h1>
        </div>
      </header>

      {analysis && (
        <div className="flex h-[calc(100vh-80px)]">
          <div
            ref={textViewerRef}
            className="w-1/2 overflow-y-auto bg-white border-r p-6"
          >
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white py-2 z-10 border-b">
              {analysis.filing.companyName} - 10-K
            </h2>
            {renderOriginalHtmlContent()}
          </div>

          <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
            <h2 className="text-xl font-bold mb-6 sticky top-0 bg-gray-50 py-2 z-10 border-b">
              AI Insights
            </h2>

            {analysis.sections.business?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("business")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏢</span>
                  <h3 className="text-lg font-bold">Business Overview</h3>
                </div>
                <p className="text-gray-700 mb-3 text-sm whitespace-pre-wrap">
                  {safeString(analysis.sections.business.summary)}
                </p>

                {analysis.sections.business.keyProducts?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-2">Key Products:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.sections.business.keyProducts
                        .slice(0, 8)
                        .map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {safeString(p)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {analysis.sections.risks && analysis.sections.risks.length > 0 && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("risk")}
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
                          {safeString(risk.title)}
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
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {safeString(risk.description)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {analysis.sections.legal?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("legal")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚖️</span>
                  <h3 className="text-lg font-bold">Legal Proceedings</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeString(analysis.sections.legal.summary)}
                </p>
                {analysis.sections.legal.materialCases &&
                  analysis.sections.legal.materialCases.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">
                        Material Cases:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {analysis.sections.legal.materialCases.map((c, i) => (
                          <li key={i}>• {safeString(c)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </Card>
            )}

            {analysis.sections.mdna?.executiveSummary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("mdna")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold">Management Discussion</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeString(analysis.sections.mdna.executiveSummary)}
                </p>
              </Card>
            )}

            {analysis.sections.marketRisk?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("marketRisk")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📉</span>
                  <h3 className="text-lg font-bold">Market Risk</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeString(analysis.sections.marketRisk.summary)}
                </p>
              </Card>
            )}

            {analysis.sections.financials?.revenue?.value && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("financials")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-lg font-bold">Key Metrics</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Revenue</p>
                    <p className="text-lg font-bold">
                      {safeString(analysis.sections.financials.revenue.value)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">Net Income</p>
                    <p className="text-lg font-bold">
                      {safeString(analysis.sections.financials.netIncome.value)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <p className="text-xs text-gray-600">EPS</p>
                    <p className="text-lg font-bold">
                      {safeString(analysis.sections.financials.eps.value)}
                    </p>
                  </div>
                </div>
                {analysis.sections.financials.unusualItems &&
                  Array.isArray(analysis.sections.financials.unusualItems) &&
                  analysis.sections.financials.unusualItems.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">
                        ⚠️ Items to Review:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.financials.unusualItems.map(
                          (item, i) => (
                            <li key={i}>• {safeString(item)}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </Card>
            )}

            {analysis.sections.controls?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("controls")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔒</span>
                  <h3 className="text-lg font-bold">Internal Controls</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeString(analysis.sections.controls.summary)}
                </p>
                {analysis.sections.controls.materialWeaknesses &&
                  Array.isArray(
                    analysis.sections.controls.materialWeaknesses
                  ) &&
                  analysis.sections.controls.materialWeaknesses.length > 0 &&
                  analysis.sections.controls.materialWeaknesses[0] !==
                    "None reported" && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-semibold text-red-800 mb-1">
                        🚨 Material Weaknesses:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.controls.materialWeaknesses.map(
                          (w, i) => (
                            <li key={i}>• {safeString(w)}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </Card>
            )}

            {analysis.sections.directors?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("directors")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👔</span>
                  <h3 className="text-lg font-bold">Board & Management</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeString(analysis.sections.directors.summary)}
                </p>
              </Card>
            )}

            {analysis.sections.compensation?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("compensation")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💵</span>
                  <h3 className="text-lg font-bold">Executive Compensation</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  {safeString(analysis.sections.compensation.summary)}
                </p>
                {analysis.sections.compensation.ceoTotalComp && (
                  <div className="p-3 bg-indigo-50 rounded">
                    <p className="text-xs text-gray-600">CEO Total Comp</p>
                    <p className="text-lg font-bold">
                      {safeString(analysis.sections.compensation.ceoTotalComp)}
                    </p>
                  </div>
                )}
                {analysis.sections.compensation.redFlags &&
                  Array.isArray(analysis.sections.compensation.redFlags) &&
                  analysis.sections.compensation.redFlags.length > 0 &&
                  analysis.sections.compensation.redFlags[0] !==
                    "None identified" && (
                    <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                      <p className="text-xs font-semibold text-orange-800 mb-1">
                        ⚠️ Concerns:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.compensation.redFlags.map((f, i) => (
                          <li key={i}>• {safeString(f)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </Card>
            )}

            {analysis.sections.ownership?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("ownership")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold">Ownership Structure</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeString(analysis.sections.ownership.summary)}
                </p>
                {analysis.sections.ownership.insiderOwnership && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Insider Ownership</p>
                    <p className="text-lg font-bold">
                      {safeString(analysis.sections.ownership.insiderOwnership)}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {analysis.sections.relatedParty?.summary && (
              <Card
                className="mb-6 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => scrollToSection("relatedParty")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔗</span>
                  <h3 className="text-lg font-bold">
                    Related Party Transactions
                  </h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {safeString(analysis.sections.relatedParty.summary)}
                </p>
                {analysis.sections.relatedParty.concerns &&
                  Array.isArray(analysis.sections.relatedParty.concerns) &&
                  analysis.sections.relatedParty.concerns.length > 0 &&
                  analysis.sections.relatedParty.concerns[0] !==
                    "None identified" && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-xs font-semibold text-red-800 mb-1">
                        🚨 Concerns:
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {analysis.sections.relatedParty.concerns.map((c, i) => (
                          <li key={i}>• {safeString(c)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </Card>
            )}
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                Analyze SEC Filings
              </h2>
              <p className="text-gray-600">
                Enter a stock ticker to view AI-powered insights
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <input
                type="text"
                placeholder="Enter ticker symbol"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                disabled={!ticker.trim()}
                className="w-full py-3 text-base"
              >
                Analyze Filing
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
              <span className="text-3xl">📄</span>
            </div>
            <p className="font-semibold text-gray-700">
              Analyzing SEC filing for {ticker}...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This might take a moment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
