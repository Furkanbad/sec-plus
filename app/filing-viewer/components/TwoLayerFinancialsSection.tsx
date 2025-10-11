// app/filing-viewer/components/TwoLayerFinancialsSection.tsx
import {
  TwoLayerFinancials,
  IntegratedFinancialItem,
} from "@/app/api/analyze-sec/schemas/TwoLayerFinancialsSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

// İkonlar için React Icons veya özel SVG'ler kullanabilirsiniz.
// Basitlik adına inline SVG'ler bırakılmıştır.
// Eğer react-icons kullanıyorsanız:
// import { FaChartLine, FaBalanceScale, FaMoneyBillWave, FaCalculator, FaFileContract, FaRegLightbulb, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface TwoLayerFinancialsSectionProps {
  data: TwoLayerFinancials;
  onExcerptClick: (id: string) => void;
}

// Excerpt Link için basit bir AlertDialog kullanalım.
// Normalde bu fonksiyon dışarıdan çağrıldığında bir modal açabilir veya ilgili yere scroll yapabilir.
const ExcerptLink = ({
  excerpt,
  onClick,
  label = "View Source",
}: {
  excerpt: string | undefined;
  onClick: (id: string) => void;
  label?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!excerpt || excerpt === "No excerpt available.") {
    return null;
  }

  // Bu kısım, excerptId yerine doğrudan excerpt string'ini kullanıyor.
  // Eğer excerpt bir ID ise, onClick fonksiyonunun ID'yi beklediğini varsayıyoruz.
  const handleExcerptClick = () => {
    // Burada excerpt string'ini bir ID olarak kabul ediyoruz.
    // Gerçek bir uygulamada bu, muhtemelen backend'den gelen bir ID olacaktır.
    onClick(excerpt);
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="link"
        onClick={handleExcerptClick}
        className="p-0 h-auto text-sm"
      >
        {label}
      </Button>
      {/* Alert dialog sadece bir placeholder, gerçek uygulamada excerpt içeriğini göstermeli */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excerpt Details</AlertDialogTitle>
            <AlertDialogDescription>
              This would normally navigate you to the source document or show a
              detailed view of the excerpt:
              <p className="mt-2 text-gray-700 italic">"{excerpt}"</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ENTEGRE FİNANSAL KALEM BİLEŞENİ
const IntegratedItemRow = ({
  item,
  onExcerptClick,
}: {
  item: IntegratedFinancialItem;
  onExcerptClick: (id: string) => void;
}) => {
  const hasMetric = item.metric && item.metric.current !== "N/A";
  const isNegative = item.metric?.changePercentage?.includes("-");

  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      {/* Header: Label ve Metrik */}
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-semibold text-gray-900">{item.label}</h5>
        {hasMetric && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {item.metric!.current}
              </div>
              <div className="text-xs text-gray-500">
                Prev: {item.metric!.previous}
              </div>
            </div>
            {item.metric!.changePercentage && (
              <Badge
                className={`text-sm font-medium ${
                  isNegative
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
                variant="outline" // Shadcn Badge'i için uygun bir variant seçin
              >
                {item.metric!.changePercentage}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Narrative Summary */}
      {item.summary && ( // 'narrativeSummary' yerine 'summary' kullanıldı schema'ya göre
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
          {item.summary}
        </p>
      )}

      {/* Commentary */}
      {item.commentary && (
        <p className="text-sm text-gray-600 italic mb-3 leading-relaxed">
          <span className="font-medium">Commentary:</span> {item.commentary}
        </p>
      )}

      {/* Related Policies */}
      {item.policies.length > 0 && ( // 'relevantPolicies' yerine 'policies' kullanıldı
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Accounting Policies:
          </span>
          <div className="mt-2 space-y-2">
            {item.policies.map((policy, i) => (
              <Card key={i} className="bg-blue-50 border-l-4 border-blue-400">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {policy.policy}
                      </span>
                      <p className="text-xs text-gray-700 mt-1">
                        {policy.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ExcerptLink
                      excerpt={policy.excerpt} // Schema'ya göre excerpt string
                      onClick={onExcerptClick}
                      label="View policy source"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {item.insights.length > 0 && ( // 'keyInsights' yerine 'insights' kullanıldı
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Key Insights:
          </span>
          <div className="mt-2 space-y-2">
            {item.insights.map((insight, i) => (
              <Card
                key={i}
                className={`p-3 border-l-4 ${
                  insight.significance === "high"
                    ? "bg-red-50 border-red-500"
                    : insight.significance === "medium"
                    ? "bg-yellow-50 border-yellow-500"
                    : "bg-green-50 border-green-500"
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {insight.significance === "high"
                        ? "🔴"
                        : insight.significance === "medium"
                        ? "🟡"
                        : "🟢"}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {insight.topic}: {insight.summary}
                    </span>
                  </div>
                  <ExcerptLink
                    excerpt={insight.excerpt} // Schema'ya göre excerpt string
                    onClick={onExcerptClick}
                    label="View insight source"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {item.risks.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Risks:
          </span>
          <div className="mt-2 space-y-2">
            {item.risks.map((risk, i) => (
              <Card
                key={i}
                className="bg-orange-50 border-l-4 border-orange-500"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {risk.description}
                      </p>
                      {risk.mitigation && ( // 'mitigationStrategy' yerine 'mitigation' kullanıldı
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="font-medium">Mitigation:</span>{" "}
                          {risk.mitigation}
                        </p>
                      )}
                      <div className="mt-2">
                        <ExcerptLink
                          excerpt={risk.excerpt} // Schema'ya göre excerpt string
                          onClick={onExcerptClick}
                          label="View risk source"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* General Excerpt */}
      {item.excerpt &&
        item.excerpt !== "No excerpt available." && // Varsayılan değer kontrolü
        !item.policies.length && // 'relevantPolicies' yerine 'policies'
        !item.insights.length && ( // 'keyInsights' yerine 'insights'
          <div className="mt-2">
            <ExcerptLink
              excerpt={item.excerpt}
              onClick={onExcerptClick}
              label="View source"
            />
          </div>
        )}
    </div>
  );
};

export function TwoLayerFinancialsSection({
  data,
  onExcerptClick,
}: TwoLayerFinancialsSectionProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Integrated Financial Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Accordion
          type="multiple"
          defaultValue={["executive-summary"]}
          className="w-full"
        >
          {/* Executive Summary */}
          <AccordionItem
            value="executive-summary"
            className="mb-4 rounded-lg border bg-blue-50"
          >
            <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-blue-800">
              Executive Summary
              <svg
                className="w-5 h-5 text-blue-600 shrink-0 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <p className="text-gray-700 leading-relaxed mb-3">
                {data.executiveSummary.overview}
              </p>
              {data.executiveSummary.keyHighlights.length > 0 && (
                <ul className="list-disc ml-5 space-y-1 mb-3 text-sm text-gray-700">
                  {data.executiveSummary.keyHighlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              )}
              {data.executiveSummary.excerpt && (
                <ExcerptLink
                  excerpt={data.executiveSummary.excerpt}
                  onClick={onExcerptClick}
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* INCOME STATEMENT */}
          <AccordionItem
            value="income-statement"
            className="mb-4 rounded-lg border bg-blue-50"
          >
            <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-blue-800">
              <span className="flex items-center gap-2">
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
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Income Statement
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <div className="space-y-1">
                {Object.values(data.incomeStatement).map((item, idx) => (
                  <IntegratedItemRow
                    key={idx}
                    item={item}
                    onExcerptClick={onExcerptClick}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* BALANCE SHEET */}
          <AccordionItem
            value="balance-sheet"
            className="mb-4 rounded-lg border bg-purple-50"
          >
            <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-purple-800">
              <span className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Balance Sheet
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <div className="space-y-1">
                {Object.values(data.balanceSheet).map((item, idx) => (
                  <IntegratedItemRow
                    key={idx}
                    item={item}
                    onExcerptClick={onExcerptClick}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* CASH FLOW */}
          <AccordionItem
            value="cash-flow"
            className="mb-4 rounded-lg border bg-green-50"
          >
            <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-green-800">
              <span className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Cash Flow Statement
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <div className="space-y-1">
                {Object.values(data.cashFlow).map((item, idx) => (
                  <IntegratedItemRow
                    key={idx}
                    item={item}
                    onExcerptClick={onExcerptClick}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* KEY RATIOS */}
          <AccordionItem
            value="key-ratios"
            className="mb-4 rounded-lg border bg-amber-50"
          >
            <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-amber-800">
              <span className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Key Financial Ratios
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(data.ratios).map((item, idx) => (
                  <Card
                    key={idx}
                    className="bg-white rounded-lg p-4 border-2 border-amber-200 shadow-sm"
                  >
                    <IntegratedItemRow
                      item={item}
                      onExcerptClick={onExcerptClick}
                    />
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Global Commitments */}
          {data.globalCommitments.length > 0 && ( // 'commitmentsContingencies' yerine 'globalCommitments' kullanıldı
            <AccordionItem
              value="global-commitments"
              className="mb-4 rounded-lg border bg-orange-50"
            >
              <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-orange-800">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Global Commitments
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-3">
                  {data.globalCommitments.map((item, idx) => (
                    <Card
                      key={idx}
                      className="bg-orange-50 border-l-4 border-orange-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-semibold text-gray-900">
                            {item.type}
                          </span>
                          {item.amount && (
                            <span className="text-lg font-bold text-orange-700">
                              {item.amount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {item.description}
                        </p>
                        {/* Schema'da timing ve probability yok, kaldırıldı */}
                        <div className="mt-3">
                          <ExcerptLink
                            excerpt={item.excerpt}
                            onClick={onExcerptClick}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Global Policies */}
          {data.globalPolicies.length > 0 && (
            <AccordionItem
              value="global-policies"
              className="mb-4 rounded-lg border bg-indigo-50"
            >
              <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-indigo-800">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Global Accounting Policies
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-3">
                  {data.globalPolicies.map((policy, idx) => (
                    <Card
                      key={idx}
                      className="bg-gray-50 border border-gray-200"
                    >
                      <CardContent className="p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">
                          {policy.policy}
                        </h5>
                        <p className="text-sm text-gray-700 mb-2">
                          {policy.description}
                        </p>
                        {/* Schema'da changes yok, kaldırıldı */}
                        <div className="mt-3">
                          <ExcerptLink
                            excerpt={policy.excerpt}
                            onClick={onExcerptClick}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Global Risks */}
          {data.globalRisks.length > 0 && (
            <AccordionItem
              value="global-risks"
              className="mb-4 rounded-lg border bg-red-50"
            >
              <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-red-800">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Global Risks
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-3">
                  {data.globalRisks.map((risk, idx) => (
                    <Card
                      key={idx}
                      className="bg-orange-50 border-l-4 border-orange-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 mt-0.5">⚠️</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {risk.description}
                            </p>
                            {risk.mitigation && (
                              <p className="text-xs text-gray-700 mt-1">
                                <span className="font-medium">Mitigation:</span>{" "}
                                {risk.mitigation}
                              </p>
                            )}
                            <div className="mt-2">
                              <ExcerptLink
                                excerpt={risk.excerpt}
                                onClick={onExcerptClick}
                                label="View risk source"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* SUBSEQUENT EVENTS */}
          {data.subsequentEvents.length > 0 && (
            <AccordionItem
              value="subsequent-events"
              className="mb-4 rounded-lg border bg-blue-50"
            >
              <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-blue-800">
                <span className="flex items-center gap-2">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Subsequent Events
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-2">
                  {data.subsequentEvents.map((event, idx) => (
                    <Card
                      key={idx}
                      className="bg-blue-50 border-l-4 border-blue-500"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              {event.event}
                            </span>
                            {event.date && (
                              <span className="text-xs text-gray-600 ml-2">
                                ({event.date})
                              </span>
                            )}
                            <p className="text-sm text-gray-700 mt-1">
                              {event.impact}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <ExcerptLink
                            excerpt={event.excerpt}
                            onClick={onExcerptClick}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* OVERALL ASSESSMENT */}
          <AccordionItem
            value="overall-assessment"
            className="mb-4 rounded-lg border bg-emerald-50"
          >
            <AccordionTrigger className="flex justify-between items-center p-4 font-semibold text-lg text-emerald-800">
              <span className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-emerald-600"
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
                Overall Assessment
              </span>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              {data.overallAssessment.strengths.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-sm text-green-700 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    Strengths:
                  </span>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-700">
                    {data.overallAssessment.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.overallAssessment.concerns.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-sm text-orange-700 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.306 2.05-1.306 2.815 0l7.424 12.673c.77 1.31-.174 2.928-1.405 2.928H2.238c-1.232 0-2.176-1.618-1.406-2.928L8.257 3.099zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Concerns:
                  </span>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-700">
                    {data.overallAssessment.concerns.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.overallAssessment.unusualItems.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-sm text-purple-700 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unusual Items:
                  </span>
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-700">
                    {data.overallAssessment.unusualItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 p-4 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                <p className="text-gray-800 leading-relaxed">
                  {data.overallAssessment.summary}
                </p>
                {data.overallAssessment.excerpt && (
                  <div className="mt-3">
                    <ExcerptLink
                      excerpt={data.overallAssessment.excerpt}
                      onClick={onExcerptClick}
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
