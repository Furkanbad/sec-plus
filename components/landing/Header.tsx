"use client";

import React, { useState } from "react";
import Link from "next/link";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto max-w-screen-2xl px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C213A]">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <h1 className="text-xl font-normal text-gray-900">
              <span className="font-semibold text-[#0C213A]">SEC</span> Plus+
            </h1>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#faq"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              FAQ
            </a>
            <Link
              href="/available-data"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Data
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Pricing
            </a>
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:block">
            <Link href="/insights" passHref legacyBehavior>
              <button className="rounded-md bg-[#0C213A] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0A1A2E] transition shadow-md cursor-pointer">
                {" "}
                {/* rounded-full -> rounded-md olarak değiştirildi */}
                Free Trial
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5"
            aria-label="Toggle menu"
          >
            <span className="h-0.5 w-6 bg-gray-900"></span>
            <span className="h-0.5 w-6 bg-gray-900"></span>
            <span className="h-0.5 w-6 bg-gray-900"></span>
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#faq" className="text-sm font-medium text-gray-700">
                FAQ
              </a>
              <Link
                href="/available-data"
                className="text-sm font-medium text-gray-700"
              >
                Data
              </Link>
              <a href="#features" className="text-sm font-medium text-gray-700">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-700">
                Pricing
              </a>
              {/* CTA Button (Mobile) */}
              <Link href="/insights" passHref legacyBehavior>
                <button className="rounded-md bg-[#0C213A] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0A1A2E] transition shadow-md cursor-pointer">
                  {" "}
                  {/* rounded-full -> rounded-md olarak değiştirildi */}
                  Free Trial
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
