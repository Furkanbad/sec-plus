import { ExcerptLink } from "./ExcerptLink";

// app/filing-viewer/components/shared/ListItem.tsx
interface ListItemProps {
  title?: string;
  description: string;
  excerptId?: string;
  onExcerptClick?: (id: string) => void;
  badge?: string;
  badgeColor?: string;
}

export function ListItem({
  title,
  description,
  excerptId,
  onExcerptClick,
  badge,
  badgeColor = "bg-gray-100 text-gray-800",
}: ListItemProps) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {title && <h5 className="font-medium text-gray-900 mb-1">{title}</h5>}
          <p className="text-sm text-gray-700">{description}</p>
        </div>
        {badge && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      {excerptId && onExcerptClick && (
        <div className="mt-2">
          <ExcerptLink excerptId={excerptId} onClick={onExcerptClick} />
        </div>
      )}
    </div>
  );
}
