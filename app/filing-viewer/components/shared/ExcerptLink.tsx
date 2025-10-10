// app/filing-viewer/components/shared/ExcerptLink.tsx
interface ExcerptLinkProps {
  excerptId: string | undefined;
  onClick: (id: string) => void;
  label?: string;
}

export function ExcerptLink({
  excerptId,
  onClick,
  label = "View in document",
}: ExcerptLinkProps) {
  if (!excerptId) return null;

  return (
    <button
      onClick={() => onClick(excerptId)}
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      {label}
    </button>
  );
}
