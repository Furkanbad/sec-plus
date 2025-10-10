// app/filing-viewer/components/MDASection.tsx
import { MDAAnalysis } from "@/app/api/analyze-sec/schemas";
import { CollapsibleCard } from "./shared/CollapsibleCard";
import { InfoBlock } from "./shared/InfoBlock";
import { ExcerptLink } from "./shared/ExcerptLink";
import { MetricCard } from "./shared/MetricCard";

interface MDASectionProps {
  data: MDAAnalysis;
  onExcerptClick: (id: string) => void;
}

export function MDASection({ data, onExcerptClick }: MDASectionProps) {
  return (
    <CollapsibleCard
      title="Management Discussion & Analysis"
      icon={
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
    >
      {/* Business Overview */}
      {data.businessOverview && (
        <InfoBlock title="Business Overview" variant="info">
          <p className="mb-2">{data.businessOverview.executiveSummary}</p>
          {data.businessOverview.keyStrategies &&
            data.businessOverview.keyStrategies.length > 0 && (
              <div className="mt-3">
                <span className="font-medium text-sm">Key Strategies:</span>
                <ul className="mt-1 ml-4 list-disc text-sm space-y-1">
                  {data.businessOverview.keyStrategies
                    .slice(0, 5)
                    .map((strategy, i) => (
                      <li key={i}>{strategy}</li>
                    ))}
                </ul>
              </div>
            )}
          {data.businessOverview.excerpts &&
            data.businessOverview.excerpts.length > 0 && (
              <div className="mt-2">
                {data.businessOverview.excerpts.map((excerpt, i) => (
                  <ExcerptLink
                    key={i}
                    excerptId={(excerpt as any).excerptId}
                    onClick={onExcerptClick}
                    label={`View excerpt ${i + 1}`}
                  />
                ))}
              </div>
            )}
        </InfoBlock>
      )}

      {/* Current Period Highlights */}
      {data.currentPeriodHighlights && (
        <InfoBlock title="Period Highlights" variant="success">
          <div className="space-y-2 text-sm">
            {data.currentPeriodHighlights.fiscalYearEnd && (
              <div>
                <span className="font-medium">Fiscal Year End:</span>
                <span className="ml-2">
                  {data.currentPeriodHighlights.fiscalYearEnd}
                </span>
              </div>
            )}

            {data.currentPeriodHighlights.keyAchievements &&
              data.currentPeriodHighlights.keyAchievements.length > 0 && (
                <div>
                  <span className="font-medium">Key Achievements:</span>
                  <ul className="mt-1 ml-4 list-disc">
                    {data.currentPeriodHighlights.keyAchievements
                      .slice(0, 3)
                      .map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                  </ul>
                </div>
              )}

            {data.currentPeriodHighlights.challenges &&
              data.currentPeriodHighlights.challenges.length > 0 && (
                <div>
                  <span className="font-medium">Challenges:</span>
                  <ul className="mt-1 ml-4 list-disc">
                    {data.currentPeriodHighlights.challenges
                      .slice(0, 3)
                      .map((challenge, i) => (
                        <li key={i}>{challenge}</li>
                      ))}
                  </ul>
                </div>
              )}
          </div>
          <ExcerptLink
            excerptId={(data.currentPeriodHighlights as any).excerptId}
            onClick={onExcerptClick}
          />
        </InfoBlock>
      )}

      {/* Revenue Analysis */}
      {data.resultsOfOperations?.revenueAnalysis && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
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
            Revenue Analysis
          </h4>

          {data.resultsOfOperations.revenueAnalysis.totalRevenue && (
            <MetricCard
              label="Total Revenue"
              current={
                data.resultsOfOperations.revenueAnalysis.totalRevenue
                  .currentPeriod?.value
              }
              previous={
                data.resultsOfOperations.revenueAnalysis.totalRevenue
                  .priorPeriod?.value
              }
              change={
                data.resultsOfOperations.revenueAnalysis.totalRevenue.change
                  ?.absolute
              }
              changePercentage={
                data.resultsOfOperations.revenueAnalysis.totalRevenue.change
                  ?.percentage
              }
            />
          )}

          {data.resultsOfOperations.revenueAnalysis.revenueDrivers &&
            data.resultsOfOperations.revenueAnalysis.revenueDrivers.length >
              0 && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <span className="font-medium text-sm">Key Drivers:</span>
                <ul className="mt-1 space-y-1 text-sm">
                  {data.resultsOfOperations.revenueAnalysis.revenueDrivers.map(
                    (driver, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>
                          {driver.driver}: {driver.impact}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Liquidity & Capital */}
      {data.liquidityAndCapitalResources && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Liquidity & Capital Resources
          </h4>

          {data.liquidityAndCapitalResources.cashPosition && (
            <InfoBlock title="Cash Position" variant="success">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Current Cash:</span>
                  <span className="ml-2 text-lg font-semibold">
                    {data.liquidityAndCapitalResources.cashPosition.currentCash}
                  </span>
                </div>
                {data.liquidityAndCapitalResources.cashPosition
                  .restrictedCash && (
                  <div>
                    <span className="font-medium">Restricted Cash:</span>
                    <span className="ml-2">
                      {
                        data.liquidityAndCapitalResources.cashPosition
                          .restrictedCash
                      }
                    </span>
                  </div>
                )}
                {data.liquidityAndCapitalResources.cashPosition
                  .availableCredit && (
                  <div>
                    <span className="font-medium">Available Credit:</span>
                    <span className="ml-2">
                      {
                        data.liquidityAndCapitalResources.cashPosition
                          .availableCredit
                      }
                    </span>
                  </div>
                )}
                <p className="mt-2">
                  {data.liquidityAndCapitalResources.cashPosition.narrative}
                </p>
                <ExcerptLink
                  excerptId={
                    (data.liquidityAndCapitalResources.cashPosition as any)
                      .excerptId
                  }
                  onClick={onExcerptClick}
                />
              </div>
            </InfoBlock>
          )}

          {/* Cash Flow Analysis */}
          {data.liquidityAndCapitalResources.cashFlowAnalysis && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {data.liquidityAndCapitalResources.cashFlowAnalysis
                .operatingActivities && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">
                    Operating Activities
                  </div>
                  <div className="font-semibold text-lg">
                    {
                      data.liquidityAndCapitalResources.cashFlowAnalysis
                        .operatingActivities.amount
                    }
                  </div>
                  {data.liquidityAndCapitalResources.cashFlowAnalysis
                    .operatingActivities.keyDrivers && (
                    <div className="text-xs text-gray-600 mt-2">
                      {data.liquidityAndCapitalResources.cashFlowAnalysis.operatingActivities.keyDrivers
                        .slice(0, 2)
                        .join(", ")}
                    </div>
                  )}
                </div>
              )}

              {data.liquidityAndCapitalResources.cashFlowAnalysis
                .investingActivities && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">
                    Investing Activities
                  </div>
                  <div className="font-semibold text-lg">
                    {
                      data.liquidityAndCapitalResources.cashFlowAnalysis
                        .investingActivities.amount
                    }
                  </div>
                </div>
              )}

              {data.liquidityAndCapitalResources.cashFlowAnalysis
                .financingActivities && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">
                    Financing Activities
                  </div>
                  <div className="font-semibold text-lg">
                    {
                      data.liquidityAndCapitalResources.cashFlowAnalysis
                        .financingActivities.amount
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Capital Structure */}
          {data.liquidityAndCapitalResources.capitalStructure && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <h5 className="font-medium text-sm mb-2">Capital Structure</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {data.liquidityAndCapitalResources.capitalStructure
                  .totalDebt && (
                  <div>
                    <span className="text-gray-600">Total Debt:</span>
                    <p className="font-semibold">
                      {
                        data.liquidityAndCapitalResources.capitalStructure
                          .totalDebt
                      }
                    </p>
                  </div>
                )}
                {data.liquidityAndCapitalResources.capitalStructure
                  .equityPosition && (
                  <div>
                    <span className="text-gray-600">Equity:</span>
                    <p className="font-semibold">
                      {
                        data.liquidityAndCapitalResources.capitalStructure
                          .equityPosition
                      }
                    </p>
                  </div>
                )}
              </div>
              <ExcerptLink
                excerptId={
                  (data.liquidityAndCapitalResources.capitalStructure as any)
                    .excerptId
                }
                onClick={onExcerptClick}
              />
            </div>
          )}
        </div>
      )}

      {/* Market Trends */}
      {data.marketTrendsAndOutlook && (
        <InfoBlock title="Market Trends & Outlook" variant="warning">
          {data.marketTrendsAndOutlook.industryTrends &&
            data.marketTrendsAndOutlook.industryTrends.length > 0 && (
              <div className="mb-3">
                <span className="font-medium text-sm">Industry Trends:</span>
                <ul className="mt-1 ml-4 list-disc text-sm">
                  {data.marketTrendsAndOutlook.industryTrends
                    .slice(0, 4)
                    .map((trend, i) => (
                      <li key={i}>{trend}</li>
                    ))}
                </ul>
              </div>
            )}

          {data.marketTrendsAndOutlook.economicFactors &&
            data.marketTrendsAndOutlook.economicFactors.length > 0 && (
              <div>
                <span className="font-medium text-sm">Economic Factors:</span>
                <div className="mt-2 space-y-2">
                  {data.marketTrendsAndOutlook.economicFactors
                    .slice(0, 3)
                    .map((factor, i) => (
                      <div key={i} className="bg-white rounded p-2 text-sm">
                        <span className="font-medium">{factor.factor}:</span>
                        <span className="ml-2">{factor.currentImpact}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </InfoBlock>
      )}

      {/* Critical Accounting Policies */}
      {data.criticalAccountingPolicies &&
        data.criticalAccountingPolicies.length > 0 &&
        data.criticalAccountingPolicies[0].policyName !== "None identified" && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Critical Accounting Policies
            </h4>
            <div className="space-y-2">
              {data.criticalAccountingPolicies
                .slice(0, 4)
                .map((policy, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-50 border border-indigo-200 rounded-lg p-3"
                  >
                    <h5 className="font-medium text-sm mb-1">
                      {policy.policyName}
                    </h5>
                    <p className="text-sm text-gray-700 mb-2">
                      {policy.description}
                    </p>
                    {policy.keyAssumptions &&
                      policy.keyAssumptions.length > 0 && (
                        <div className="text-xs">
                          <span className="font-medium">Key Assumptions:</span>
                          <div className="mt-1">
                            {policy.keyAssumptions.join(", ")}
                          </div>
                        </div>
                      )}
                    <ExcerptLink
                      excerptId={(policy as any).excerptId}
                      onClick={onExcerptClick}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Known Trends & Uncertainties */}
      {data.knownTrendsAndUncertainties && (
        <div className="grid grid-cols-2 gap-3">
          {data.knownTrendsAndUncertainties.opportunities &&
            data.knownTrendsAndUncertainties.opportunities.length > 0 && (
              <InfoBlock title="Opportunities" variant="success">
                <ul className="space-y-2 text-sm">
                  {data.knownTrendsAndUncertainties.opportunities
                    .slice(0, 3)
                    .map((opp, i) => (
                      <li key={i}>
                        <span className="font-medium">{opp.description}</span>
                        {opp.potentialImpact && (
                          <p className="text-xs text-gray-600 mt-1">
                            Impact: {opp.potentialImpact}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              </InfoBlock>
            )}

          {data.knownTrendsAndUncertainties.risks &&
            data.knownTrendsAndUncertainties.risks.length > 0 && (
              <InfoBlock title="Risks" variant="error">
                <ul className="space-y-2 text-sm">
                  {data.knownTrendsAndUncertainties.risks
                    .slice(0, 3)
                    .map((risk, i) => (
                      <li key={i}>
                        <span className="font-medium">{risk.description}</span>
                        {risk.potentialImpact && (
                          <p className="text-xs text-gray-600 mt-1">
                            Impact: {risk.potentialImpact}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              </InfoBlock>
            )}
        </div>
      )}

      {/* Key Takeaways */}
      {data.keyTakeaways && (
        <InfoBlock title="Key Takeaways" variant="info">
          {data.keyTakeaways.strengths &&
            data.keyTakeaways.strengths.length > 0 && (
              <div className="mb-3">
                <span className="font-medium text-sm">Strengths:</span>
                <ul className="mt-1 ml-4 list-disc text-sm">
                  {data.keyTakeaways.strengths
                    .slice(0, 3)
                    .map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                </ul>
              </div>
            )}

          {data.keyTakeaways.challenges &&
            data.keyTakeaways.challenges.length > 0 && (
              <div className="mb-3">
                <span className="font-medium text-sm">Challenges:</span>
                <ul className="mt-1 ml-4 list-disc text-sm">
                  {data.keyTakeaways.challenges
                    .slice(0, 3)
                    .map((challenge, i) => (
                      <li key={i}>{challenge}</li>
                    ))}
                </ul>
              </div>
            )}

          {data.keyTakeaways.managementTone && (
            <div>
              <span className="font-medium text-sm">Management Tone:</span>
              <span className="ml-2 text-sm">
                {data.keyTakeaways.managementTone}
              </span>
            </div>
          )}
        </InfoBlock>
      )}
    </CollapsibleCard>
  );
}
