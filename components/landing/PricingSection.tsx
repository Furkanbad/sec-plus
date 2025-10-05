"use client";

import React, { useState } from "react";
import { CheckIcon } from "./icons";

interface PricingCardProps {
  planType: string;
  title: string;
  description: string;
  price: string;
  pricePer?: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
  highlightColor?: string; // Tailwind color class suffix, e.g., "gray-200"
  ctaBg?: string; // Tailwind background class, e.g., "bg-white"
  ctaTextClass?: string; // Tailwind text color class, e.g., "text-gray-700"
  ctaHoverBg?: string; // Tailwind hover background class, e.g., "hover:bg-gray-50"
  priceColor?: string; // Tailwind text color class, e.g., "text-gray-900"
  planTypeBg?: string; // Tailwind background class for planType badge
  planTypeTextColor?: string; // Tailwind text color class for planType badge
}

const PricingCard: React.FC<PricingCardProps> = ({
  planType,
  title,
  description,
  price,
  pricePer,
  features,
  ctaText,
  isPopular = false,
  highlightColor = "gray-200",
  ctaBg = "bg-white",
  ctaTextClass = "text-gray-700",
  ctaHoverBg = "hover:bg-gray-50",
  priceColor = "text-gray-900",
  planTypeBg = "bg-gray-100", // Default value
  planTypeTextColor = "text-gray-700", // Default value
}) => {
  return (
    <div
      className={`relative rounded-2xl border-2 ${
        isPopular ? "border-[#0C213A]" : `border-${highlightColor}`
      } bg-white p-8 ${isPopular ? "shadow-xl" : "shadow-lg"}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0C213A] px-4 py-1">
          <span className="text-xs font-bold uppercase text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <div
          className={`mb-2 inline-block rounded-full ${planTypeBg} px-3 py-1`}
        >
          <span className={`text-xs font-bold uppercase ${planTypeTextColor}`}>
            {planType}
          </span>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="mb-4">
        <div className={`text-4xl font-bold ${priceColor}`}>
          {price}{" "}
          {pricePer && (
            <span className="text-lg font-normal text-gray-500">
              {pricePer}
            </span>
          )}
        </div>
      </div>

      {isPopular && (
        <div className="mb-6 text-sm text-[#0C213A] font-medium">
          14 Day Money Back Guarantee
        </div>
      )}

      <div className="mb-8 space-y-3">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <CheckIcon />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <button
        className={`w-full rounded-full ${
          isPopular
            ? "bg-[#0C213A] text-white hover:bg-[#0A1A2E] shadow-md"
            : `${ctaBg} border-2 border-${highlightColor} ${ctaTextClass} ${ctaHoverBg}`
        } py-3 text-base font-semibold transition-all`}
      >
        {ctaText}
      </button>
    </div>
  );
};

const PricingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"individual" | "commercial">(
    "individual"
  );

  const individualPlans: PricingCardProps[] = [
    {
      planType: "Free",
      title: "Starter",
      description: "Perfect for trying out SEC Plus.",
      price: "$0",
      pricePer: "/month",
      features: [
        "3 PDFs per month",
        "All AI insights with citations",
        "Basic analysis features",
        "No signup required",
      ],
      ctaText: "Get Started",
      highlightColor: "gray-300",
      planTypeBg: "bg-gray-100",
      planTypeTextColor: "text-gray-700",
    },
    {
      planType: "Pro",
      title: "Professional",
      description: "For serious investors and analysts.",
      price: "$49",
      pricePer: "/month",
      features: [
        "50 PDFs per month",
        "Advanced AI analysis",
        "Comparative insights",
        "Priority processing",
        "Export & share reports",
        "Email support",
      ],
      ctaText: "Start Free Trial",
      isPopular: true,
      planTypeBg: "bg-blue-100",
      planTypeTextColor: "text-[#0C213A]",
    },
    {
      planType: "Enterprise",
      title: "Enterprise",
      description: "For teams and institutions.",
      price: "Custom",
      features: [
        "Unlimited PDFs",
        "Multi-user accounts",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Training & onboarding",
      ],
      ctaText: "Contact Sales",
      highlightColor: "gray-300",
      planTypeBg: "bg-blue-100",
      planTypeTextColor: "text-blue-700",
    },
  ];

  // Placeholder for commercial plans. You can fill this array with actual data
  const commercialPlans: PricingCardProps[] = [
    {
      planType: "Team Basic",
      title: "Small Teams",
      description: "For growing teams needing collaborative features.",
      price: "$99",
      pricePer: "/month",
      features: [
        "100 PDFs per month",
        "5 User Accounts",
        "Shared Workspaces",
        "Advanced AI analysis",
        "Dedicated Email Support",
      ],
      ctaText: "Start Team Trial",
      highlightColor: "blue-300",
      planTypeBg: "bg-purple-100",
      planTypeTextColor: "text-purple-700",
    },
    {
      planType: "Corporate",
      title: "Corporate",
      description: "Comprehensive solutions for large organizations.",
      price: "Custom",
      features: [
        "Unlimited PDFs",
        "Unlimited User Accounts",
        "Full API access",
        "Advanced Security Features",
        "Dedicated Account Manager",
        "On-site Training",
      ],
      ctaText: "Contact Sales",
      highlightColor: "blue-500",
      planTypeBg: "bg-indigo-100",
      planTypeTextColor: "text-indigo-700",
    },
  ];

  return (
    <section id="pricing" className="bg-white py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold text-gray-900">
            Pricing Plans
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Choose the plan that fits your SEC filing analysis needs. All plans
            include verified AI insights with exact source citations.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-lg bg-white p-1 shadow-md">
            <button
              onClick={() => setActiveTab("individual")}
              className={`rounded-lg px-8 py-3 text-base font-semibold transition-all ${
                activeTab === "individual"
                  ? "bg-[#0C213A] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setActiveTab("commercial")}
              className={`rounded-lg px-8 py-3 text-base font-semibold transition-all ${
                activeTab === "commercial"
                  ? "bg-[#0C213A] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Teams
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {activeTab === "individual" &&
            individualPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          {activeTab === "commercial" &&
            commercialPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          {/* If there are no commercial plans, you might render a message or a single contact card */}
          {activeTab === "commercial" && commercialPlans.length === 0 && (
            <div className="md:col-span-3 text-center text-gray-500 py-10">
              No commercial plans defined yet. Please contact sales for team
              solutions.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
