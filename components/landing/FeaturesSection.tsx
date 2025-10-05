import React from "react";
import { AnalysisIcon, ComparisonChartIcon } from "./icons";

interface FeatureCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  reverse?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  children,
  reverse = false,
}) => {
  return (
    <div
      className={`mb-32 flex flex-col items-center gap-12 ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}
    >
      <div className="flex-1">
        <h2 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
          {title}
        </h2>
        <p className="text-xl text-gray-300 leading-relaxed">{description}</p>
      </div>

      <div className="flex-1">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          {/* MacOS style traffic lights */}
          <div className="absolute left-4 top-4 h-3 w-3 rounded-full bg-red-500"></div>
          <div className="absolute left-10 top-4 h-3 w-3 rounded-full bg-yellow-400"></div>
          <div className="absolute left-16 top-4 h-3 w-3 rounded-full bg-green-500"></div>
          {children}
        </div>
      </div>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-[#0C213A]">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Feature 1: Extract key insights from hundreds of pages */}
        <FeatureCard
          title="Extract key insights from hundreds of pages"
          description="Our AI reads through entire SEC filings and identifies the most important risks, opportunities, and financial metrics in seconds."
          reverse={true}
        >
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 pt-12">
            <div className="p-4 h-full flex items-center justify-center">
              <div className="w-full h-full rounded-lg bg-white p-6 shadow-lg flex flex-col items-center justify-center text-center">
                <AnalysisIcon />
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Analyzing document...
                </p>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className="bg-[#0C213A] h-2.5 rounded-full w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500">
                  Key findings highlighted automatically.
                </p>
              </div>
            </div>
          </div>
        </FeatureCard>

        {/* Feature 2: Every insight linked to exact sources */}
        <FeatureCard
          title="Every insight linked to exact sources"
          description="Click any insight to jump directly to the source paragraph. No hallucinations, no guessing—just verified facts with citations."
        >
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 pt-12">
            <div className="p-4 h-full flex items-center justify-center">
              <div className="relative w-full h-full rounded-lg bg-white p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl text-green-600">✓</span>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Growth in Q3 revenue
                    </h4>
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    "The company reported a 15% increase in quarterly revenue
                    driven by strong performance in its cloud services division
                    and new market penetration..."
                  </p>
                  <a
                    href="#"
                    className="text-[#0C213A] text-sm font-medium hover:underline"
                  >
                    Source: Page 42, Paragraph 3
                  </a>
                </div>
                <div className="absolute bottom-4 right-4 bg-gray-100 px-3 py-1 rounded-md text-xs text-gray-500">
                  Click to view source
                </div>
              </div>
            </div>
          </div>
        </FeatureCard>

        {/* Feature 3: Compare filings across multiple companies */}
        <FeatureCard
          title="Compare filings across multiple companies"
          description="Analyze trends, benchmark metrics, and identify patterns across entire industries with side-by-side comparisons."
          reverse={true}
        >
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 pt-12">
            <div className="p-4 h-full flex items-center justify-center">
              <div className="w-full h-full grid grid-cols-2 gap-4">
                {/* Company 1 Card */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h5 className="font-bold text-sm text-gray-900 mb-1">
                    Company A
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">Revenue: $1.2B</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div className="bg-green-500 h-1.5 rounded-full w-4/5"></div>
                  </div>
                  <p className="text-xs text-gray-600">EPS: $3.45</p>
                </div>

                {/* Company 2 Card */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h5 className="font-bold text-sm text-gray-900 mb-1">
                    Company B
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">Revenue: $980M</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div className="bg-red-500 h-1.5 rounded-full w-3/5"></div>
                  </div>
                  <p className="text-xs text-gray-600">EPS: $2.10</p>
                </div>

                {/* Comparison Chart Placeholder */}
                <div className="col-span-2 bg-white rounded-lg p-4 shadow-md flex items-center justify-center text-gray-400 text-sm">
                  <ComparisonChartIcon />
                  Comparison Chart
                </div>
              </div>
            </div>
          </div>
        </FeatureCard>
      </div>
    </section>
  );
};

export default FeaturesSection;
