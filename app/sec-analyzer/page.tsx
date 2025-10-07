// app/sec-analyzer/page.tsx
"use client";
import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/ErrorBoundary";

const SplitViewAnalyzer = dynamic(
  () => import("@/components/SplitViewAnalyzer"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
            <span className="text-3xl">📄</span>
          </div>
          <p className="text-gray-700">Loading analyzer...</p>
        </div>
      </div>
    ),
  }
);

export default function SecAnalyzerPage() {
  return (
    <ErrorBoundary>
      <SplitViewAnalyzer />
    </ErrorBoundary>
  );
}
