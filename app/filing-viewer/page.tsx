// app/filing-viewer/page.tsx
"use client";

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { SECAnalysis } from "@/app/api/analyze-sec/models/sec-analysis";
import { BusinessSection } from "./components/BusinessSection";
import { RiskSection } from "./components/RiskSection";
import { PropertiesSection } from "./components/PropertiesSection";
import { LegalSection } from "./components/LegalSection";
import { MDASection } from "./components/MDASection";
import { FinancialsSection } from "./components/FinancialsSection";
import { MarketRiskSection } from "./components/MarketRiskSection";
import { ControlsSection } from "./components/ControlsSection";
import { DirectorsSection } from "./components/DirectorsSection";

interface FilingData {
  analysis: SECAnalysis;
  fullOriginalHtml: string;
  filingInfo: {
    ticker: string;
    filingType: string;
    year: string;
    companyName: string;
  };
  error?: string;
}

export default function FilingViewerPage() {
  const [data, setData] = useState<FilingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("AAPL");
  const [filingType, setFilingType] = useState("10-K");
  const [year, setYear] = useState("2023");
  const [activeExcerptId, setActiveExcerptId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    setActiveExcerptId(null);

    try {
      const response = await fetch("/api/analyze-sec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, filingType, year }),
      });

      const result: FilingData = await response.json();

      if (response.ok && !result.error) {
        const sanitizedHtml = DOMPurify.sanitize(result.fullOriginalHtml, {
          ADD_TAGS: ["span"],
          ADD_ATTR: ["id", "class"],
        });
        setData({ ...result, fullOriginalHtml: sanitizedHtml });
      } else {
        setData({
          ...result,
          error: result.error || "Failed to fetch data",
        } as FilingData);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setData({
        analysis: {} as SECAnalysis,
        fullOriginalHtml: "",
        filingInfo: { ticker, filingType, year, companyName: "N/A" },
        error: error.message || "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .highlight-excerpt {
        background-color: rgba(255, 255, 0, 0.2);
        border-bottom: 2px dashed #ffd700;
        transition: all 0.3s ease;
        cursor: pointer;
        padding: 0 2px;
      }
      .highlight-excerpt:hover {
        background-color: rgba(255, 255, 0, 0.4);
      }
      .highlight-excerpt.active-highlight {
        background-color: #ffeb3b;
        box-shadow: 0 0 15px #ffeb3b;
        animation: pulse 1.5s ease-in-out;
      }
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 5px #ffeb3b; }
        50% { box-shadow: 0 0 20px #ffeb3b; }
      }
      .sec-document table { 
        width: 100% !important; 
        border-collapse: collapse; 
      }
      .sec-document td, .sec-document th { 
        padding: 8px; 
        border: 1px solid #ddd; 
      }
    `;
    document.head.appendChild(style);

    // Temizleme fonksiyonunu doğrudan döndürün
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const scrollToExcerpt = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      if (activeExcerptId) {
        const prevActive = document.getElementById(activeExcerptId);
        prevActive?.classList.remove("active-highlight");
      }

      element.classList.add("active-highlight");
      setActiveExcerptId(id);
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        element.classList.remove("active-highlight");
        setActiveExcerptId(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              SEC Filing Viewer
            </h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="px-3 py-2 border rounded-lg text-sm w-24"
              />
              <select
                value={filingType}
                onChange={(e) => setFilingType(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="10-K">10-K</option>
                <option value="10-Q">10-Q</option>
                <option value="8-K">8-K</option>
              </select>
              <input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-20"
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {loading ? "Loading..." : "Fetch Filing"}
              </button>
            </div>
          </div>

          {data?.filingInfo && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{data.filingInfo.companyName}</span>{" "}
              •<span className="ml-2">{data.filingInfo.filingType}</span> •
              <span className="ml-2">FY {data.filingInfo.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing SEC filing...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {data?.error && !loading && (
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{data.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {data && !loading && !data.error && (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel: Original SEC Document */}
          <div className="flex-1 overflow-auto bg-white border-r">
            <div className="p-6">
              <div
                className="sec-document prose max-w-none"
                dangerouslySetInnerHTML={{ __html: data.fullOriginalHtml }}
              />
            </div>
          </div>

          {/* Right Panel: AI Insights - Scrollable vertical layout */}
          <div className="w-2/5 overflow-auto bg-gray-50">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 sticky top-0 bg-gray-50 py-2 z-10">
                AI Analysis
              </h2>

              {data.analysis?.sections?.business && (
                <BusinessSection
                  data={data.analysis.sections.business}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.risks && (
                <RiskSection
                  data={data.analysis.sections.risks}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.properties && (
                <PropertiesSection
                  data={data.analysis.sections.properties}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.legal && (
                <LegalSection
                  data={data.analysis.sections.legal}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.mdna && (
                <MDASection
                  data={data.analysis.sections.mdna}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.financials && (
                <FinancialsSection
                  data={data.analysis.sections.financials}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.marketRisks && (
                <MarketRiskSection
                  data={data.analysis.sections.marketRisks}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.controls && (
                <ControlsSection
                  data={data.analysis.sections.controls}
                  onExcerptClick={scrollToExcerpt}
                />
              )}

              {data.analysis?.sections?.directors && (
                <DirectorsSection
                  data={data.analysis.sections.directors}
                  onExcerptClick={scrollToExcerpt}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
