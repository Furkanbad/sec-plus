"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SECAnalysis } from "@/types/sec-analysis";

export default function SECAnalyzerPage() {
  const [ticker, setTicker] = useState("");
  const [filingType, setFilingType] = useState<"10-K" | "10-Q" | "8-K">("10-K");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<SECAnalysis | null>(null);
  const [rawHTML, setRawHTML] = useState<string>("");
  const [showRawHTML, setShowRawHTML] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      setError("Please enter a ticker symbol");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze-sec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          filingType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.analysis);
      setRawHTML(data.rawHTML || "");
      setDebugInfo(data.debug || null);
    } catch (err: any) {
      setError(err.message || "Failed to analyze filing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C213A]">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <h1 className="text-xl font-normal text-gray-900">
                <span className="font-semibold text-[#0C213A]">SEC</span>{" "}
                Analyzer
              </h1>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-12">
        {/* Search Interface */}
        <Card className="mb-8 shadow-xl">
          <CardHeader>
            <CardTitle>Analyze SEC Filing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter ticker (e.g., AAPL)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C213A]"
              />
              <select
                value={filingType}
                onChange={(e) => setFilingType(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C213A]"
              >
                <option value="10-K">10-K (Annual)</option>
                <option value="10-Q">10-Q (Quarterly)</option>
                <option value="8-K">8-K (Current)</option>
              </select>
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-[#0C213A] hover:bg-[#0A1A2E]"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="shadow-lg">
            <CardContent className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#0C213A] to-blue-800 flex items-center justify-center text-3xl animate-pulse">
                🤖
              </div>
              <p className="font-semibold text-gray-900 mb-2 text-lg">
                Analyzing SEC filing...
              </p>
              <p className="text-sm text-gray-600">
                Fetching from EDGAR and processing sections
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Raw HTML Toggle */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Debug: Raw HTML</span>
                  <Button
                    onClick={() => setShowRawHTML(!showRawHTML)}
                    variant="outline"
                    size="sm"
                  >
                    {showRawHTML ? "Hide HTML" : "Show HTML"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showRawHTML && (
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <p className="text-xs text-gray-500 mb-2">
                      First 500,000 characters | Total:{" "}
                      {rawHTML.length.toLocaleString()} chars
                    </p>
                    <pre className="text-xs whitespace-pre-wrap break-words text-gray-700">
                      {rawHTML}
                    </pre>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Debug Info (when no sections found) */}
            {debugInfo && debugInfo.cleanTextSample && (
              <Card className="shadow-xl border-2 border-yellow-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    Debug: Content Sample
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                      No sections were found in this filing. Here's a sample of
                      the cleaned text from position 68864:
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap break-words text-gray-700">
                      {debugInfo.cleanTextSample}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filing Info */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{analysis.filing.companyName}</span>
                  <Badge className="bg-[#0C213A] text-white">
                    {analysis.filing.filingType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Ticker</p>
                    <p className="font-semibold">{analysis.filing.ticker}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Filing Date</p>
                    <p className="font-semibold">
                      {analysis.filing.filingDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fiscal Year</p>
                    <p className="font-semibold">
                      {analysis.filing.fiscalYear}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">CIK</p>
                    <p className="font-semibold">{analysis.filing.cik}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Summary */}
            {analysis.sections.business.summary && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🏢</span>
                    Business Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {analysis.sections.business.summary}
                  </p>
                  {analysis.sections.business.keyProducts.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Key Products/Services:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.sections.business.keyProducts.map((p, i) => (
                          <Badge key={i} variant="outline">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.sections.business.markets.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Primary Markets:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.sections.business.markets.map((m, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-blue-50"
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {analysis.sections.risks.length > 0 && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Risk Factors ({analysis.sections.risks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.sections.risks.map((risk) => (
                    <div
                      key={risk.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {risk.title}
                        </h4>
                        <Badge
                          className={
                            risk.severity === "high"
                              ? "bg-red-500"
                              : risk.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {risk.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {risk.category}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* MD&A Section */}
            {analysis.sections.mdna.executiveSummary && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Management Discussion & Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Executive Summary</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {analysis.sections.mdna.executiveSummary}
                    </p>
                  </div>
                  {analysis.sections.mdna.keyTrends.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Trends</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {analysis.sections.mdna.keyTrends.map((trend, i) => (
                          <li key={i}>{trend}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.sections.mdna.futureOutlook && (
                    <div>
                      <h4 className="font-semibold mb-2">Future Outlook</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {analysis.sections.mdna.futureOutlook}
                      </p>
                    </div>
                  )}
                  {analysis.sections.mdna.liquidity && (
                    <div>
                      <h4 className="font-semibold mb-2">Liquidity</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {analysis.sections.mdna.liquidity}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Financial Metrics */}
            {analysis.sections.financials.revenue.value && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Key Financial Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.sections.financials.revenue.value && (
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">
                          {analysis.sections.financials.revenue.name}
                        </h4>
                        <p className="text-2xl font-bold text-[#2A324B] mb-1">
                          {analysis.sections.financials.revenue.value}
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          {analysis.sections.financials.revenue.change}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {analysis.sections.financials.revenue.analysis}
                        </p>
                      </div>
                    )}

                    {analysis.sections.financials.netIncome.value && (
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">
                          {analysis.sections.financials.netIncome.name}
                        </h4>
                        <p className="text-2xl font-bold text-[#2A324B] mb-1">
                          {analysis.sections.financials.netIncome.value}
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          {analysis.sections.financials.netIncome.change}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {analysis.sections.financials.netIncome.analysis}
                        </p>
                      </div>
                    )}

                    {analysis.sections.financials.eps.value && (
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">
                          {analysis.sections.financials.eps.name}
                        </h4>
                        <p className="text-2xl font-bold text-[#2A324B] mb-1">
                          {analysis.sections.financials.eps.value}
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          {analysis.sections.financials.eps.change}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {analysis.sections.financials.eps.analysis}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
