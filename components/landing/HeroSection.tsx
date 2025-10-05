import React from "react";
import Link from "next/link";
import {
  DocumentIcon,
  AiAnalysisArrowIcon,
  DocType10K10Q,
  DocType8K,
} from "./icons";

interface InsightCardProps {
  type: string;
  title: string;
  description: string;
  source: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  description,
  source,
  icon,
  bgColor,
  textColor,
}) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md border border-gray-200">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-md ${bgColor} flex-shrink-0 mt-0.5`}
        >
          <span className={`text-sm font-bold ${textColor}`}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {type}
          </div>
          <div className="text-sm font-medium text-gray-900 mb-2">{title}</div>
          <div className="text-xs text-gray-600 mb-2">{description}</div>
          <div className="text-xs font-medium text-[#0C213A]">
            Source: {source}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 flex items-center min-h-[calc(100vh-5rem)] py-8">
      <div className="container mx-auto max-w-screen-2xl px-6">
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Left side - Text */}
          <div>
            <h1 className="mb-4 text-4xl font-semibold leading-tight text-[#2A324B] md:text-5xl tracking-tight">
              AI-Powered SEC Filing Analysis in Minutes
            </h1>
            <div className="mb-6 h-1 w-20 bg-[#0C213A] rounded-full"></div>
            <h3 className="mb-9 text-lg font-normal text-[#000000] leading-[1.5] max-w-2xl">
              No more copy-paste. No more updating data manually. Instant access
              to SEC filing insights with AI-powered analysis and exact source
              citations.
            </h3>
            <div className="flex flex-col items-start gap-3">
              <Link href="/insights" passHref legacyBehavior>
                <button className="h-11 rounded-full bg-[#0C213A] px-7 text-sm font-medium text-white shadow-lg hover:bg-[#0A1A2E] transition-all hover:shadow-xl cursor-pointer">
                  Start Free Trial
                </button>
              </Link>
              <p className="text-sm text-gray-700">
                ✓ 3 PDFs free • No credit card • Start in 30 seconds
              </p>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="text-center">
                <div className="mb-1 inline-flex h-10 w-10 items-center justify-center">
                  <DocType10K10Q />
                </div>
                <p className="text-xs font-normal text-gray-700">10-K & 10-Q</p>
              </div>
              <div className="text-center">
                <div className="mb-1 inline-flex h-10 w-10 items-center justify-center">
                  <DocType8K />
                </div>
                <p className="text-xs font-normal text-gray-700">8-K & More</p>
              </div>
            </div>
          </div>
          {/* Right side - Visual */}
          <div className="relative">
            <div className="relative rounded-2xl bg-gray-50 p-6 shadow-xl border border-gray-200">
              {/* PDF Upload Visual */}
              <div className="mb-4 rounded-xl bg-white p-4 shadow-md border border-gray-200">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0C213A]">
                    <DocumentIcon />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      AAPL_10K_2024.pdf
                    </div>
                    <div className="text-xs text-gray-500">
                      Analyzing document...
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <div className="h-1.5 w-full rounded-full bg-[#0C213A]"></div>
                </div>
              </div>
              {/* Arrow */}
              <div className="mb-4 flex justify-center">
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  <div className="h-0.5 w-6 rounded-full bg-[#0C213A]"></div>
                  <AiAnalysisArrowIcon />
                  <div className="text-xs font-semibold text-[#0C213A]">
                    AI Analysis
                  </div>
                </div>
              </div>
              {/* Insights Output */}
              <div className="space-y-2">
                <InsightCard
                  type="Key Risk"
                  title="Revenue decline in Q4"
                  description="Year-over-year revenue decreased by 8.2% in the fourth quarter, primarily due to reduced consumer spending..."
                  source="Page 23"
                  icon="⚠"
                  bgColor="bg-red-100"
                  textColor="text-red-700"
                />
                <InsightCard
                  type="Opportunity"
                  title="Market expansion initiative"
                  description="New Southeast Asia operations expected to generate $200M in additional revenue by Q3 2025..."
                  source="Page 45"
                  icon="✓"
                  bgColor="bg-green-100"
                  textColor="text-green-700"
                />
                <InsightCard
                  type="Financial Metric"
                  title="EPS growth exceeds forecasts"
                  description="Earnings per share increased 23% year-over-year to $4.87, surpassing analyst expectations..."
                  source="Page 67"
                  icon="i"
                  bgColor="bg-blue-100"
                  textColor="text-blue-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Güncellenmiş Stats Section - Daha yuvarlak */}
        <div className="w-full mt-6 py-6 px-6 sm:px-12 md:px-24 lg:px-32 xl:px-48 mx-auto max-w-screen-lg bg-white rounded-4xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-around gap-y-8 md:gap-y-0">
          {/* rounded-2xl yerine rounded-3xl kullanıldı */}
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              <span>100</span>K+
            </h2>
            <h3 className="text-sm font-medium text-gray-600">
              Documents Analyzed
            </h3>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300"></div>{" "}
          {/* Dikey ayırıcı */}
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              <span>99.9</span>%
            </h2>
            <h3 className="text-sm font-medium text-gray-600">
              AI Summarization Accuracy
            </h3>
          </div>
          <div className="hidden md:block w-px h-4 bg-gray-300"></div>{" "}
          {/* Dikey ayırıcı */}
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              <span>&lt; 5</span>s
            </h2>
            <h3 className="text-sm font-medium text-gray-600">
              Average Response Time
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
