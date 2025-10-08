// components/sec-analysis/AnalysisForm.tsx
import React from "react";

interface AnalysisFormProps {
  ticker: string;
  setTicker: (value: string) => void;
  filingType: string;
  setFilingType: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function AnalysisForm({
  ticker,
  setTicker,
  filingType,
  setFilingType,
  year,
  setYear,
  loading,
  handleSubmit,
}: AnalysisFormProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto mb-8"
    >
      <div className="mb-4">
        <label
          htmlFor="ticker"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Ticker:
        </label>
        <input
          type="text"
          id="ticker"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="filingType"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Filing Type:
        </label>
        <select
          id="filingType"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={filingType}
          onChange={(e) => setFilingType(e.target.value)}
          required
        >
          <option value="10-K">10-K</option>
          <option value="10-Q">10-Q</option>
        </select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="year"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Year:
        </label>
        <input
          type="text"
          id="year"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g., 2023"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Start Analysis"}
      </button>
    </form>
  );
}
