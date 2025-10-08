// app/test-sec-analysis/page.tsx (Main component - updated)
"use client";

import React, { useState } from "react";
import { AnalysisForm } from "@/components/sec-test-components/AnalysisForm";
import { ErrorAlert } from "@/components/sec-test-components/ErrorAlert";
import { BusinessSection } from "@/components/sec-test-components/BusinessSection";
import { PropertiesSection } from "@/components/sec-test-components/PropertiesSection";
import { RisksSection } from "@/components/sec-test-components/RisksSection";
import { LegalSection } from "@/components/sec-test-components/LegalSection";
import { MDASection } from "@/components/sec-test-components/MDASection";
import { MarketRiskSection } from "@/components/sec-test-components/MarketRiskSection";
import { FinancialsSection } from "@/components/sec-test-components/FinancialsSection";
import {
  BusinessAnalysis,
  LegalAnalysis,
  MDAAnalysis,
  PropertyAnalysis,
  RiskAnalysis,
  MarketRiskAnalysis,
  FinancialAnalysis,
  ControlsAnalysis,
  DirectorsAnalysis,
} from "@/app/api/analyze-sec/schemas";
import { ControlsSection } from "@/components/sec-test-components/ControlsSection";
import { DirectorsSection } from "@/components/sec-test-components/DirectorsSection";

interface SECAnalysisDisplay {
  filing: {
    ticker: string;
    filingType: string;
    filingDate: string;
    companyName: string;
    htmlUrl: string;
  };
  sections: {
    business?: BusinessAnalysis;
    properties?: PropertyAnalysis;
    risks?: RiskAnalysis;
    legal?: LegalAnalysis;
    mdna?: MDAAnalysis;
    marketRisks?: MarketRiskAnalysis;
    financials?: FinancialAnalysis;
    controls?: ControlsAnalysis;
    directors?: DirectorsAnalysis;
  };
  generatedAt: string;
}

export default function SecAnalysisTester() {
  const [ticker, setTicker] = useState("AAPL");
  const [filingType, setFilingType] = useState("10-K");
  const [year, setYear] = useState("2023");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<SECAnalysisDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalHtml, setOriginalHtml] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnalysisResult(null);
    setError(null);
    setOriginalHtml(null);

    try {
      const response = await fetch("/api/analyze-sec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, filingType, year }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occurred.");
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      setOriginalHtml(data.originalHtml);
      console.log("Analysis Result:", data.analysis);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        SEC Analysis Test Tool
      </h1>

      <AnalysisForm
        ticker={ticker}
        setTicker={setTicker}
        filingType={filingType}
        setFilingType={setFilingType}
        year={year}
        setYear={setYear}
        loading={loading}
        handleSubmit={handleSubmit}
      />

      {error && <ErrorAlert error={error} />}

      {analysisResult && (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Analysis Results
          </h2>

          {/* Filing Info */}
          <div className="mb-4">
            <p className="mb-2">
              <strong>Company:</strong> {analysisResult.filing.companyName} (
              {analysisResult.filing.ticker})
            </p>
            <p className="mb-2">
              <strong>Filing Type:</strong> {analysisResult.filing.filingType}
            </p>
            <p className="mb-4">
              <strong>Filing Date:</strong> {analysisResult.filing.filingDate}
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Sections:
          </h3>

          {Object.keys(analysisResult.sections).length === 0 && (
            <p>No sections analyzed or sections are empty.</p>
          )}

          {analysisResult.sections.business && (
            <BusinessSection data={analysisResult.sections.business} />
          )}
          {analysisResult.sections.properties && (
            <PropertiesSection data={analysisResult.sections.properties} />
          )}
          {analysisResult.sections.risks && (
            <RisksSection data={analysisResult.sections.risks} />
          )}
          {analysisResult.sections.legal && (
            <LegalSection data={analysisResult.sections.legal} />
          )}
          {analysisResult.sections.mdna && (
            <MDASection data={analysisResult.sections.mdna} />
          )}
          {analysisResult.sections.marketRisks && (
            <MarketRiskSection data={analysisResult.sections.marketRisks} />
          )}
          {/* FinancialsSection'ı buraya ekleyin */}
          {analysisResult.sections.financials && (
            <FinancialsSection data={analysisResult.sections.financials} />
          )}
          {analysisResult.sections.controls && (
            <ControlsSection data={analysisResult.sections.controls} />
          )}
          {/* DirectorsSection'ı buraya ekleyin */}
          {analysisResult.sections.directors && (
            <DirectorsSection data={analysisResult.sections.directors} />
          )}

          <p className="text-xs text-gray-400 mt-4">
            Generated at:{" "}
            {new Date(analysisResult.generatedAt).toLocaleString()}
          </p>

          {/* Original HTML Preview */}
          <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
            Original HTML (First 1000 characters):
          </h3>
          <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
            {originalHtml
              ? originalHtml.substring(0, 1000) + "..."
              : "No HTML content."}
          </pre>
        </div>
      )}
    </div>
  );
}
