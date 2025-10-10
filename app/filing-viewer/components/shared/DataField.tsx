// app/filing-viewer/components/shared/DataField.tsx
interface DataFieldProps {
  label: string;
  value: string | number | undefined | null;
  valueClassName?: string;
}

export function DataField({
  label,
  value,
  valueClassName = "",
}: DataFieldProps) {
  if (
    !value ||
    value === "N/A" ||
    value === "Not specified" ||
    value === "Not available"
  ) {
    return null;
  }

  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 ${valueClassName}`}>
        {value}
      </dd>
    </div>
  );
}
