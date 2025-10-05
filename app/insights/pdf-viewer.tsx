"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button"; // Bu bileşenlerin stillerini kendi landing page'inize uygun hale getirebilirsiniz
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Aynı şekilde
import { Badge } from "@/components/ui/badge"; // Aynı şekilde
import { Skeleton } from "@/components/ui/skeleton"; // Aynı şekilde

interface Insight {
  id: string;
  type: "risk" | "financial" | "opportunity" | "metric" | "general";
  title: string;
  description: string;
  pageNumber: number;
  searchText: string;
  emoji: string;
  color: string; // Şu anda kullanılmıyor, ancak gelecekte genişletilebilir.
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// PDFViewer bileşeninin yolunu kontrol edin, '../components/PDFViewer' olarak görünüyor
// Eğer `app` klasörünüzün kökündeyse veya başka bir yerde ise yolu düzeltmeniz gerekebilir.
const PDFViewer = dynamic(() => import("../../components/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 p-6">
      <Skeleton className="h-[600px] w-full rounded-lg bg-gray-100" />
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
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null); // Null'dan başlasın

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setFile(uploadedFile);
    setError("");
    setInsights([]); // Önceki içgörüleri temizle
    setNumPages(0); // Sayfa sayısını sıfırla
    setUsageRemaining(null); // Kullanım limitini sıfırla

    await analyzeDocument(uploadedFile);
  };

  const analyzeDocument = async (pdfFile: File) => {
    setLoading(true);
    setError("");

    try {
      // PDF'i yükle ve metni çıkar
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages); // PDF yüklendiğinde sayfa sayısını ayarla

      let text = "";
      // İlk 50 sayfayı analiz et (performans için sınır)
      const maxPagesToProcess = Math.min(pdf.numPages, 50);

      for (let i = 1; i <= maxPagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // @ts-ignore
        const pageText = content.items.map((item) => item.str).join(" ");
        text += pageText + "\n";
      }

      // API çağrısı
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Metnin ilk 100.000 karakterini gönder
        body: JSON.stringify({ text: text.substring(0, 100000) }),
      });

      const data = await response.json();

      if (response.status === 403 && data.limitReached) {
        setError(data.message);
        setUsageRemaining(0);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setInsights(data.insights || []);
      if (data.usage) {
        setUsageRemaining(data.usage.remaining);
      } else {
        setUsageRemaining(null); // Kullanım bilgisi yoksa null yap
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze document. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    // numPages state'i zaten analyzeDocument içinde ayarlanıyor,
    // ancak PDFViewer'ın kendi yükleme başarısı callback'i için burada bırakabiliriz.
    // setNumPages(numPages); // Duplicate olmaması için yorum satırı yapıldı
  };

  const jumpToInsight = (insight: Insight) => {
    setHighlightedId(insight.id);
    const pageElement = document.getElementById(`page-${insight.pageNumber}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Vurgulamayı 3 saniye sonra kaldır
    setTimeout(() => setHighlightedId(""), 3000);
  };

  const getInsightConfig = (type: Insight["type"]) => {
    const configs = {
      risk: {
        bg: "bg-red-50",
        border: "border-red-400",
        badge: "bg-red-500",
        text: "text-red-800",
      },
      financial: {
        bg: "bg-yellow-50",
        border: "border-yellow-400",
        badge: "bg-yellow-500",
        text: "text-yellow-800",
      },
      opportunity: {
        bg: "bg-emerald-50", // Daha yeşile yakın ton
        border: "border-emerald-400",
        badge: "bg-emerald-500",
        text: "text-emerald-800",
      },
      metric: {
        bg: "bg-blue-50",
        border: "border-blue-400",
        badge: "bg-blue-500",
        text: "text-blue-800",
      },
      general: {
        bg: "bg-gray-50",
        border: "border-gray-300",
        badge: "bg-gray-500",
        text: "text-gray-800",
      },
    };
    return configs[type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C213A]">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <h1 className="text-xl font-normal text-gray-900">
                <span className="font-semibold text-[#0C213A]">SEC</span> Plus+
              </h1>
            </a>

            {/* CTA Button and Usage */}
            <div className="flex items-center gap-4">
              {usageRemaining !== null && (
                <Badge
                  className={`py-1 px-3 text-xs font-medium rounded-full ${
                    usageRemaining === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-[#0C213A]"
                  }`}
                >
                  {usageRemaining} {usageRemaining === 1 ? "PDF" : "PDFs"}{" "}
                  remaining
                </Badge>
              )}

              <input
                id="file-upload-header"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload-header">
                <Button
                  asChild
                  className="h-10 rounded-full bg-[#0C213A] px-6 text-sm font-medium text-white shadow-lg hover:bg-[#0A1A2E] transition-all hover:shadow-xl cursor-pointer"
                >
                  <span>
                    {loading
                      ? "Analyzing..."
                      : file
                      ? "Upload New"
                      : "Upload 10-K"}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-12">
        {!file ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="mb-8">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#0C213A] to-blue-800 flex items-center justify-center text-6xl shadow-2xl shadow-[#0C213A]/30">
                📄
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your SEC Filing Analysis
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
              Transform complex 10-K, 10-Q, and 8-K filings into clear,
              actionable insights. AI-powered, with verified source citations.
            </p>
            <label className="cursor-pointer inline-block">
              <input
                id="file-upload-main"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-[#0C213A] px-10 text-lg font-medium text-white shadow-lg hover:bg-[#0A1A2E] transition-all hover:shadow-xl cursor-pointer"
              >
                <span>Choose PDF File</span>
              </Button>
            </label>
            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Free tier included
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span> No credit card
                required
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Fast analysis (30-60s)
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PDF Viewer */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border border-gray-200 rounded-2xl overflow-hidden max-h-[calc(100vh-160px)] flex flex-col">
                <CardHeader className="border-b border-gray-200 bg-gray-50 py-4 px-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
                    <span>Document View</span>
                    <Badge
                      variant="outline"
                      className="text-sm font-medium bg-white text-gray-700 border-gray-300"
                    >
                      {numPages > 0 ? `${numPages} pages` : "Loading..."}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                  {file && (
                    <PDFViewer
                      file={file}
                      onLoadSuccess={onDocumentLoadSuccess}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Insights Panel */}
            <div className="lg:col-span-1 space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
              <Card className="shadow-xl border border-gray-200 rounded-2xl sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4 pt-6 px-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">💡</span>
                    AI Insights
                    {insights.length > 0 && (
                      <Badge className="ml-2 bg-[#0C213A] text-white font-medium">
                        {insights.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>

              {loading && (
                <Card className="shadow-lg border border-gray-200 rounded-2xl">
                  <CardContent className="py-10 text-center bg-gray-50">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#0C213A] to-blue-800 flex items-center justify-center text-3xl animate-pulse">
                      🤖
                    </div>
                    <p className="font-semibold text-gray-900 mb-2 text-lg">
                      Analyzing document...
                    </p>
                    <p className="text-sm text-gray-600">
                      Extracting key insights from your 10-K
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-1">
                      <div className="w-2.5 h-2.5 bg-[#0C213A] rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-[#0C213A] rounded-full animate-bounce delay-100" />
                      <div className="w-2.5 h-2.5 bg-[#0C213A] rounded-full animate-bounce delay-200" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Card className="shadow-lg border border-red-300 rounded-2xl bg-red-50">
                  <CardContent className="py-6 px-6">
                    <p className="font-semibold text-red-800 mb-2">
                      <span className="text-xl mr-2">🚨</span>
                      {error}
                    </p>
                    {usageRemaining === 0 && (
                      <p className="text-sm text-red-700 mt-3">
                        You have reached your free limit. Sign up to get more
                        PDF analyses each month (coming soon).
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {!loading && insights.length === 0 && !error && file && (
                <Card className="shadow-lg border border-gray-200 rounded-2xl">
                  <CardContent className="py-10 text-center text-gray-500 bg-gray-50">
                    <p className="text-lg font-medium">
                      No insights found for this document, or waiting for
                      analysis to start.
                    </p>
                    <p className="text-sm mt-2">
                      Please ensure the document is a valid 10-K, 10-Q, or 8-K
                      filing.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {insights.map((insight) => {
                  const config = getInsightConfig(insight.type);
                  return (
                    <Card
                      key={insight.id}
                      onClick={() => jumpToInsight(insight)}
                      className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 duration-200
                        border border-gray-200 rounded-xl
                        ${config.bg} ${
                        highlightedId === insight.id
                          ? "ring-2 ring-[#0C213A] shadow-xl scale-[1.01]"
                          : "shadow-md"
                      }`}
                    >
                      <CardHeader className="pb-3 px-6 pt-5">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl leading-none flex-shrink-0">
                            {insight.emoji}
                          </div>
                          <div className="flex-1">
                            <Badge
                              className={`${config.badge} mb-2 text-xs font-semibold py-1 px-3 rounded-full text-white`}
                            >
                              {insight.type.toUpperCase()}
                            </Badge>
                            <CardTitle className="text-base font-bold text-gray-900 leading-snug">
                              {insight.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 pb-5">
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#0C213A]">
                          <span>→</span>
                          <span>Jump to Page {insight.pageNumber}</span>
                          <span>←</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {insights.length > 0 && (
                <Card className="shadow-lg border border-gray-200 rounded-2xl bg-white">
                  <CardContent className="py-6 px-6">
                    <p className="text-sm text-gray-600 flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 leading-none">
                        💡
                      </span>
                      <span>
                        <strong>How it works:</strong> Click on any insight card
                        to automatically scroll and highlight the corresponding
                        source in the PDF. All insights are AI-generated and
                        directly verifiable from the document.
                      </span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
      <style jsx global>{`
        /* Custom scrollbar for better aesthetics */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; /* gray-300 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; /* gray-400 */
        }
      `}</style>
    </div>
  );
}
