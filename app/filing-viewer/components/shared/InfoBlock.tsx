import { ReactNode } from "react";

// app/filing-viewer/components/shared/InfoBlock.tsx
interface InfoBlockProps {
  title?: string;
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export function InfoBlock({
  title,
  children,
  variant = "default",
}: InfoBlockProps) {
  const variants = {
    default: "bg-gray-50 border-gray-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className={`rounded-lg border ${variants[variant]} p-4`}>
      {title && <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>}
      <div className="text-sm text-gray-700 space-y-2">{children}</div>
    </div>
  );
}
