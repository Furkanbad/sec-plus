"use client";

import React from "react"; // useState artık kullanılmadığı için kaldırıldı
import { CheckIcon } from "./icons";
import Link from "next/link";

interface PricingCardProps {
  planType: string;
  title: string;
  description: string;
  price: string;
  pricePer?: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
  highlightColor?: string;
  ctaBg?: string;
  ctaTextClass?: string;
  ctaHoverBg?: string;
  priceColor?: string;
  planTypeBg?: string;
  planTypeTextColor?: string;
  ctaHref?: string;
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
  planTypeBg = "bg-gray-100",
  planTypeTextColor = "text-gray-700",
  ctaHref = "#",
}) => {
  const buttonContent = (
    <button
      className={`w-full rounded-full ${
        isPopular
          ? "bg-[#0C213A] text-white hover:bg-[#0A1A2E] shadow-md"
          : `${ctaBg} border-2 border-${highlightColor} ${ctaTextClass} ${ctaHoverBg}`
      } py-3 text-base font-semibold transition-all`}
    >
      {ctaText}
    </button>
  );

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

      {ctaHref !== "#" ? (
        <Link href={ctaHref} passHref legacyBehavior>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
    </div>
  );
};

const PricingSection: React.FC = () => {
  // useState ve activeTab kaldırıldı

  // Tüm planları tek bir dizide birleştirelim
  const allPlans: PricingCardProps[] = [
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
      ctaHref: "/sec-analyzer",
    },
    {
      planType: "Pro",
      title: "Professional",
      description: "For serious investors and analysts.",
      price: "$9",
      pricePer: "/month",
      features: [
        "20 PDFs per month",
        "Advanced AI analysis",
        "Comparative insights",
        "Priority processing",
        "Export & share reports",
        "Email support",
      ],
      ctaText: "Choose Pro",
      isPopular: true,
      planTypeBg: "bg-blue-100",
      planTypeTextColor: "text-[#0C213A]",
      ctaHref: "/signup?plan=pro",
    },
    {
      planType: "Teams",
      title: "Teams",
      description: "Unlimited power for your team.",
      price: "$29",
      pricePer: "/month",
      features: [
        "Unlimited PDFs",
        "Multi-user accounts",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Training & onboarding",
      ],
      ctaText: "Choose Teams",
      highlightColor: "blue-500",
      planTypeBg: "bg-indigo-100",
      planTypeTextColor: "text-indigo-700",
      ctaHref: "/signup?plan=teams",
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

        {/* Tabs kaldırıldı */}

        {/* Pricing Cards - Tüm planlar şimdi aynı bölümde */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {allPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
