import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">SEC Reader</div>
          </div>
          <Link
            href="/insights"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            Try Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block mb-4 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Free • No signup required • 3 PDFs/month
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Read 10-Ks with
          <br />
          <span className="text-blue-600">Verified AI Insights</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          ChatGPT hallucinates. We show exact sources. Every insight links to
          the original paragraph. No guessing, only verified facts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/insights"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            Try Free Now
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-white text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border border-gray-200"
          >
            See How It Works
          </a>
        </div>

        <p className="text-sm text-gray-500">
          No credit card • No email required • Start analyzing in 30 seconds
        </p>
      </section>

      {/* Demo Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
              <div className="w-3 h-3 rounded-full bg-white/30"></div>
            </div>
            <div className="ml-4 text-white text-sm font-medium">
              sec-reader.app
            </div>
          </div>
          <div className="p-8 bg-gray-50">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 mb-3">
                  PDF DOCUMENT
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-blue-200 rounded w-4/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="text-xs font-semibold text-red-600 mb-1">
                    KEY RISK
                  </div>
                  <div className="font-bold text-gray-900 text-sm mb-1">
                    Declining Subscriber Base
                  </div>
                  <div className="text-xs text-gray-600">
                    Lost subscribers for 2 consecutive years...
                  </div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    → Page 45 ←
                  </div>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                  <div className="text-xs font-semibold text-green-600 mb-1">
                    OPPORTUNITY
                  </div>
                  <div className="font-bold text-gray-900 text-sm mb-1">
                    Emerging Market Expansion
                  </div>
                  <div className="text-xs text-gray-600">
                    New stores in Vietnam, Indonesia, Brazil...
                  </div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    → Page 52 ←
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Three steps to better 10-K analysis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Upload PDF
            </h3>
            <p className="text-gray-600">
              Drop any 10-K or 10-Q filing. No signup required for your first 3
              PDFs.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. AI Analyzes
            </h3>
            <p className="text-gray-600">
              AI extracts key risks, metrics, and opportunities. Takes 30-60
              seconds.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. Verify Sources
            </h3>
            <p className="text-gray-600">
              Click any insight to jump to the exact paragraph. Every claim is
              verified.
            </p>
          </div>
        </div>
      </section>

      {/* Why Better */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why SEC Reader?
            </h2>
            <p className="text-xl text-gray-600">
              Built for investors who verify their sources
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    ChatGPT / Claude
                  </h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>
                      • Makes up facts ({'"'}hallucinations{'"'})
                    </li>
                    <li>• No source citations</li>
                    <li>• Can{"'"}t verify claims</li>
                    <li>• General purpose, not SEC-focused</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Other Tools</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Complex dashboards</li>
                    <li>• Expensive ($50-100/month)</li>
                    <li>• Steep learning curve</li>
                    <li>• Enterprise-focused</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">SEC Reader</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Every insight links to source</li>
                    <li>• Click to jump to exact paragraph</li>
                    <li>• Verify any claim instantly</li>
                    <li>• No hallucinations</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Fast & Simple
                  </h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Start in 30 seconds</li>
                    <li>• No training needed</li>
                    <li>• Free tier: 3 PDFs/month</li>
                    <li>• Pro: $9/month (coming soon)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
            <div className="text-sm font-semibold text-gray-500 mb-2">FREE</div>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              $0
              <span className="text-lg text-gray-500 font-normal">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-600">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>3 PDFs per month</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified insights</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No signup required</span>
              </li>
            </ul>
            <Link
              href="/insights"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg text-center font-semibold hover:bg-gray-200 transition"
            >
              Start Free
            </Link>
          </div>

          <div className="bg-blue-600 rounded-2xl p-8 border-2 border-blue-600 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold">
              COMING SOON
            </div>
            <div className="text-sm font-semibold text-blue-200 mb-2">PRO</div>
            <div className="text-4xl font-bold text-white mb-6">
              $9
              <span className="text-lg text-blue-200 font-normal">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-blue-50">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>20 PDFs per month</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Priority analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Email support</span>
              </li>
            </ul>
            <div className="block w-full px-6 py-3 bg-white text-blue-600 rounded-lg text-center font-semibold cursor-not-allowed opacity-75">
              Coming Soon
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
            <div className="text-sm font-semibold text-gray-500 mb-2">
              TEAMS
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              $29
              <span className="text-lg text-gray-500 font-normal">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-600">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Unlimited PDFs</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>5 team members</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Priority support</span>
              </li>
            </ul>
            <div className="block w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg text-center font-semibold cursor-not-allowed opacity-75">
              Coming Soon
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to read smarter?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start analyzing 10-Ks with verified AI insights. No signup required.
          </p>
          <Link
            href="/insights"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg text-lg font-bold hover:bg-blue-50 transition shadow-xl"
          >
            Try Free Now
          </Link>
          <p className="mt-6 text-blue-100 text-sm">
            3 PDFs free • No credit card • Takes 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">SEC Reader</div>
            <p className="text-sm mb-6">
              Read SEC filings with verified AI insights
            </p>
            <div className="text-xs">
              © 2025 SEC Reader. Built for investors.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
