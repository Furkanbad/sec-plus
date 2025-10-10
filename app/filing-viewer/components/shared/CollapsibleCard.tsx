// app/filing-viewer/components/shared/CollapsibleCard.tsx
"use client";

import { useState, ReactNode } from "react";

interface CollapsibleCardProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: string;
  badgeColor?: string;
}

export function CollapsibleCard({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
  badgeColor = "bg-blue-100 text-blue-800",
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
            >
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
