// app/filing-viewer/components/shared/MetricCard.tsx
interface MetricCardProps {
  label: string;
  current: string | undefined;
  previous?: string | undefined;
  change?: string | undefined;
  changePercentage?: string | undefined;
}

export function MetricCard({
  label,
  current,
  previous,
  change,
  changePercentage,
}: MetricCardProps) {
  const isNegative = changePercentage?.includes("-") || change?.includes("-");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="space-y-2">
        {current && (
          <div>
            <span className="text-xs text-gray-500 mr-2">Current:</span>
            <span className="text-base font-semibold text-gray-900">
              {current}
            </span>
          </div>
        )}
        {previous && (
          <div>
            <span className="text-xs text-gray-500 mr-2">Previous:</span>
            <span className="text-sm text-gray-700">{previous}</span>
          </div>
        )}
        {(change || changePercentage) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Change:</span>
            <span
              className={`text-sm font-medium ${
                isNegative ? "text-red-600" : "text-green-600"
              }`}
            >
              {changePercentage || change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
