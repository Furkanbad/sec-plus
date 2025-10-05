"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";

interface Insight {
  id: string;
  type: "risk" | "financial" | "opportunity" | "metric" | "general";
  title: string;
  description: string;
  pageNumber: number;
  searchText: string;
  emoji: string;
  color: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = dynamic(() => import("../../components/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-20">
      <div className="animate-spin text-4xl">⏳</div>
      <p className="mt-4 text-gray-600">Loading PDF viewer...</p>
    </div>
  ),
});

export default function SECReader() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [highlightedId, setHighlightedId] = useState<string>("");
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setFile(uploadedFile);
    setError("");
    setInsights([]);
    await analyzeDocument(uploadedFile);
  };

  const analyzeDocument = async (pdfFile: File) => {
    setLoading(true);
    setError("");

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let text = "";
      const maxPages = Math.min(pdf.numPages, 50);

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        text += pageText + "\n";
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.substring(0, 100000) }),
      });

      const data = await response.json();

      if (response.status === 403 && data.limitReached) {
        setError(data.message);
        setUsageRemaining(0);
        return;
      }

      if (!response.ok) throw new Error("Analysis failed");

      setInsights(data.insights);
      if (data.usage) {
        setUsageRemaining(data.usage.remaining);
      }
    } catch (err) {
      setError("Failed to analyze document. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const jumpToInsight = (insight: Insight) => {
    setHighlightedId(insight.id);
    const pageElement = document.getElementById(`page-${insight.pageNumber}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightedId(""), 3000);
  };

  const getInsightStyle = (type: Insight["type"]) => {
    switch (type) {
      case "risk":
        return "bg-red-50 border-red-500";
      case "financial":
        return "bg-yellow-50 border-yellow-500";
      case "opportunity":
        return "bg-green-50 border-green-500";
      case "metric":
        return "bg-blue-50 border-blue-500";
      default:
        return "bg-gray-50 border-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SEC Reader</h1>
              <p className="text-sm text-gray-500">
                AI-powered 10-K analysis with verified insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              {usageRemaining !== null && (
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                  {usageRemaining} free PDFs remaining
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  📄 {file ? "Upload New PDF" : "Upload 10-K PDF"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {!file ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload a 10-K to Get Started
            </h2>
            <p className="text-gray-600 mb-6">
              AI will extract verified insights with source citations
            </p>
            <label className="cursor-pointer inline-block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg">
                Choose PDF File
              </span>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Document ({numPages || "..."} pages)
              </h3>
              <PDFViewer file={file} onLoadSuccess={onDocumentLoadSuccess} />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                AI Insights (Verified)
              </h3>

              {loading && (
                <div className="text-center py-10">
                  <div className="animate-spin text-4xl mb-4">🤖</div>
                  <p className="text-gray-600">Analyzing document...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take 30-60 seconds
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold mb-2">{error}</p>
                  {usageRemaining === 0 && (
                    <p className="text-sm text-gray-600">
                      Sign up to get 17 more PDFs per month. Coming soon!
                    </p>
                  )}
                </div>
              )}

              {!loading && insights.length === 0 && !error && file && (
                <div className="text-center py-10 text-gray-500">
                  <p>Waiting for analysis...</p>
                </div>
              )}

              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    onClick={() => jumpToInsight(insight)}
                    className={`${getInsightStyle(
                      insight.type
                    )} border-l-4 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-x-1 ${
                      highlightedId === insight.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{insight.emoji}</div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-600 mb-1 uppercase">
                          {insight.type}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                          {insight.description}
                        </p>
                        <div className="text-xs text-blue-600 font-medium">
                          → Page {insight.pageNumber} ←
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {insights.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>💡 How it works:</strong> Click any insight to jump
                    to the source page.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
