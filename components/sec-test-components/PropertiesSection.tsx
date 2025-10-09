// components/sec-test-components/PropertiesSection.tsx
import { PropertyAnalysis } from "@/app/api/analyze-sec/schemas";

interface PropertiesSectionProps {
  data: PropertyAnalysis;
}

export function PropertiesSection({ data }: PropertiesSectionProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <h4 className="text-lg font-medium text-green-600 mb-2">
        Properties Analysis
      </h4>

      {/* Properties Overview */}
      <div className="mb-4">
        <h5 className="font-semibold">Overview:</h5>
        <p>{data.propertiesOverview?.summary}</p>
        <p className="text-sm">
          <strong>Ownership Type:</strong>{" "}
          {data.propertiesOverview?.ownershipType}
        </p>
        {data.propertiesOverview?.excerpt !== "No excerpt available." && (
          <p className="text-sm italic text-gray-600">
            Excerpt: {data.propertiesOverview?.excerpt}
          </p>
        )}
      </div>

      {/* Key Properties */}
      {data.keyProperties && data.keyProperties.length > 0 && (
        <div className="mb-4">
          <h5 className="font-semibold">Key Properties:</h5>
          <div className="ml-3 space-y-2">
            {data.keyProperties.map((prop, index) => (
              <div
                key={index}
                className="p-2 bg-gray-50 rounded border-l-4 border-green-400"
              >
                <p>
                  <strong>{prop.type}</strong> - {prop.location}
                </p>
                <div className="text-sm text-gray-700 ml-2">
                  <p>• Status: {prop.status}</p>
                  {prop.size !== "Not disclosed" && <p>• Size: {prop.size}</p>}
                  {prop.primaryUse !== "Not specified" && (
                    <p>• Primary Use: {prop.primaryUse}</p>
                  )}
                  {prop.capacity !== "Not disclosed" && (
                    <p>• Capacity: {prop.capacity}</p>
                  )}
                  {prop.notes !== "None" && <p>• Notes: {prop.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Strategy and Utilization */}
      {data.propertyStrategyAndUtilization && (
        <div className="mb-4">
          <h5 className="font-semibold">Property Strategy & Utilization:</h5>
          <div className="ml-3">
            <p className="text-sm">
              <strong>Strategy:</strong>{" "}
              {data.propertyStrategyAndUtilization.strategy}
            </p>
            <p className="text-sm">
              <strong>Utilization:</strong>{" "}
              {data.propertyStrategyAndUtilization.utilization}
            </p>
          </div>
        </div>
      )}

      {/* Key Takeaways/Concerns */}
      {data.keyTakeawaysConcerns && data.keyTakeawaysConcerns.length > 0 && (
        <div className="mb-4">
          <h5 className="font-semibold">Key Takeaways/Concerns:</h5>
          <ul className="list-disc ml-5 text-sm">
            {data.keyTakeawaysConcerns.map((concern, index) => (
              <li key={index}>{concern}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
