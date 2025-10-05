import React from "react";

const Footer: React.FC = () => {
  const productLinks = [
    "Features",
    "Pricing",
    "How it works",
    "API docs",
    "Case studies",
  ];
  const companyLinks = ["About", "Blog", "Careers", "Contact"];
  const legalLinks = ["Privacy policy", "Terms of service", "Data security"];

  return (
    <footer className="border-t border-gray-200 bg-white py-16">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0C213A]">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  <span className="text-[#0C213A]">SEC</span> Plus+
                </div>
                <div className="text-sm text-gray-600">
                  AI-powered SEC filing analysis
                </div>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">
              Product
            </h4>
            <div className="space-y-2">
              {productLinks.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">
              Company
            </h4>
            <div className="space-y-2">
              {companyLinks.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">
              Legal
            </h4>
            <div className="space-y-2">
              {legalLinks.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SEC Plus+. All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
