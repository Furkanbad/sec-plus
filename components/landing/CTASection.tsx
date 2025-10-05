import React from "react";

const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-[#0C213A] to-[#0A1A2E] py-20">
      <div className="container mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
          Start Analyzing SEC Filings Today
        </h2>
        <p className="mb-10 text-xl text-blue-100">
          Join investors who trust AI-powered insights with verified sources
        </p>
        <button className="h-14 rounded-full bg-white px-10 text-lg font-semibold text-[#0C213A] shadow-xl hover:bg-gray-50 transition-all">
          Try Free Now
        </button>
        <p className="mt-6 text-sm text-blue-100">
          3 PDFs free • No credit card • Takes 30 seconds
        </p>
      </div>
    </section>
  );
};

export default CTASection;
