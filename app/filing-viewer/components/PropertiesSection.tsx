// app/filing-viewer/components/PropertiesSection.tsx
import { PropertyAnalysis } from "@/app/api/analyze-sec/schemas";
import { InfoBlock } from "./shared/InfoBlock";
import { ExcerptLink } from "./shared/ExcerptLink";
import { CollapsibleCard } from "./shared/CollapsibleCard";

interface PropertiesSectionProps {
  data: PropertyAnalysis;
  onExcerptClick: (id: string) => void;
}

export function PropertiesSection({
  data,
  onExcerptClick,
}: PropertiesSectionProps) {
  return (
    <CollapsibleCard
      title="Properties & Facilities"
      badge={`${data.keyProperties?.length || 0} Properties`}
      icon={
        <svg
          className="w-6 h-6 text-teal-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      }
    >
      {/* Overview */}
      <InfoBlock title="Properties Overview" variant="info">
        <p>{data.propertiesOverview?.summary}</p>
        <div className="mt-2">
          <span className="font-medium text-sm">Ownership Type:</span>
          <span className="ml-2 text-sm">
            {data.propertiesOverview?.ownershipType}
          </span>
        </div>
        <ExcerptLink
          excerptId={(data.propertiesOverview as any)?.excerptId}
          onClick={onExcerptClick}
        />
      </InfoBlock>

      {/* Key Properties */}
      {data.keyProperties && data.keyProperties.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {data.keyProperties.map((property, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{property.type}</h5>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    property.status === "Owned"
                      ? "bg-green-100 text-green-800"
                      : property.status === "Leased"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {property.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="font-medium text-gray-900">
                    {property.location}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <p className="font-medium text-gray-900">{property.size}</p>
                </div>
                <div>
                  <span className="text-gray-500">Primary Use:</span>
                  <p className="font-medium text-gray-900">
                    {property.primaryUse}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Capacity:</span>
                  <p className="font-medium text-gray-900">
                    {property.capacity}
                  </p>
                </div>
              </div>

              {property.notes && property.notes !== "None" && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{property.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Strategy */}
      <InfoBlock title="Property Strategy & Utilization">
        <div className="space-y-2">
          <div>
            <span className="font-medium">Strategy:</span>
            <p className="mt-1">
              {data.propertyStrategyAndUtilization?.strategy}
            </p>
          </div>
          <div>
            <span className="font-medium">Utilization:</span>
            <p className="mt-1">
              {data.propertyStrategyAndUtilization?.utilization}
            </p>
          </div>
        </div>
      </InfoBlock>

      {/* Takeaways */}
      {data.keyTakeawaysConcerns && data.keyTakeawaysConcerns.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Takeaways</h4>
          <ul className="space-y-1">
            {data.keyTakeawaysConcerns.map((takeaway, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 flex items-start gap-2"
              >
                <span className="text-teal-600 mt-1">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CollapsibleCard>
  );
}
