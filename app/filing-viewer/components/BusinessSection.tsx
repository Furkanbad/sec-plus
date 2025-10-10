// app/filing-viewer/components/BusinessSection.tsx
"use client";

import { BusinessAnalysis } from "@/app/api/analyze-sec/schemas";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { ExcerptLink } from "./shared/ExcerptLink";
import { InfoBlock } from "./shared/InfoBlock";
import { ListItem } from "./shared/ListItem";

interface BusinessSectionProps {
  data: BusinessAnalysis;
  onExcerptClick: (id: string) => void;
}

export function BusinessSection({
  data,
  onExcerptClick,
}: BusinessSectionProps) {
  return (
    <CollapsibleCard
      title="Business Overview"
      icon={
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      }
    >
      {/* Summary */}
      <InfoBlock title="Business Summary" variant="info">
        <p className="leading-relaxed">{data.summary}</p>
        <ExcerptLink
          excerptId={(data as any).summaryExcerptId}
          onClick={onExcerptClick}
        />
      </InfoBlock>

      {/* Markets */}
      {data.markets && data.markets.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Geographic Markets
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.markets.map((market, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {market}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Products */}
      {data.keyProducts && data.keyProducts.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Key Products & Services
          </h4>
          <div className="space-y-3">
            {data.keyProducts.map((product, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{product.name}</h5>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {product.marketPosition}
                </p>
                <ExcerptLink
                  excerptId={(product as any).originalExcerptId}
                  onClick={onExcerptClick}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Advantages */}
      {data.competitiveAdvantages && data.competitiveAdvantages.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Competitive Advantages
          </h4>
          <div className="space-y-2">
            {data.competitiveAdvantages.map((advantage, idx) => (
              <ListItem
                key={idx}
                description={advantage.description}
                excerptId={(advantage as any).originalExcerptId}
                onExcerptClick={onExcerptClick}
                badge={`#${idx + 1}`}
                badgeColor="bg-green-100 text-green-800"
              />
            ))}
          </div>
        </div>
      )}

      {/* Growth Strategies */}
      {data.growthStrategiesOpportunities &&
        data.growthStrategiesOpportunities.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Growth Strategies & Opportunities
            </h4>
            <div className="space-y-2">
              {data.growthStrategiesOpportunities.map((strategy, idx) => (
                <ListItem
                  key={idx}
                  description={strategy.description}
                  excerptId={(strategy as any).originalExcerptId}
                  onExcerptClick={onExcerptClick}
                  badge={`#${idx + 1}`}
                  badgeColor="bg-purple-100 text-purple-800"
                />
              ))}
            </div>
          </div>
        )}

      {/* Target Customers */}
      {data.targetCustomers && data.targetCustomers.description && (
        <InfoBlock title="Target Customers & Segments" variant="default">
          <p>{data.targetCustomers.description}</p>
          <ExcerptLink
            excerptId={(data.targetCustomers as any).originalExcerptId}
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}

      {/* Partnerships */}
      {data.partnershipsCollaborations &&
        data.partnershipsCollaborations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Partnerships & Collaborations
            </h4>
            <div className="space-y-2">
              {data.partnershipsCollaborations.map((partnership, idx) => (
                <ListItem
                  key={idx}
                  description={partnership.description}
                  excerptId={(partnership as any).originalExcerptId}
                  onExcerptClick={onExcerptClick}
                  badge={`#${idx + 1}`}
                  badgeColor="bg-indigo-100 text-indigo-800"
                />
              ))}
            </div>
          </div>
        )}

      {/* Business Model */}
      {data.businessModel && data.businessModel.description && (
        <InfoBlock title="Business Model" variant="success">
          <p>{data.businessModel.description}</p>
          <ExcerptLink
            excerptId={(data.businessModel as any).originalExcerptId}
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}
    </CollapsibleCard>
  );
}
