"use client";

import React from "react";
import Header from "../landing/Header";
import HeroSection from "../landing/HeroSection";
import FeaturesSection from "../landing/FeaturesSection";
import PricingSection from "../landing/PricingSection";
import CTASection from "../landing/CTASection";
import Footer from "../landing/Footer";

const ModernLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default ModernLandingPage;
