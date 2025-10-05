"use client";

import React, { useState } from "react";
import Link from "next/link"; // Link bileşenini import ediyoruz

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {" "}
            {/* Logo da Link olarak güncellendi */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C213A]">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <h1 className="text-xl font-normal text-gray-900">
              <span className="font-semibold text-[#0C213A]">SEC</span> Plus+
            </h1>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            {/* Navigasyon linkleri de Link bileşeniyle güncellenebilir, şimdilik hash linkleri bırakıyorum. */}
            <a
              href="#faq"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              FAQ
            </a>
            <Link
              href="/available-data" // Data sayfası için Link kullanıldı
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Data
            </Link>
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Pricing
            </a>
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:block">
            <Link href="/insights" passHref legacyBehavior>
              <button className="rounded-full bg-[#0C213A] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0A1A2E] transition shadow-md cursor-pointer">
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
              <a href="#faq" className="text-sm text-gray-600">
                FAQ
              </a>
              <Link href="/available-data" className="text-sm text-gray-600">
                {" "}
                {/* Mobile menü Data linki */}
                Data
              </Link>
              <a href="#features" className="text-sm text-gray-600">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-600">
                Pricing
              </a>
              {/* CTA Button (Mobile) */}
              <Link href="/insights" passHref legacyBehavior>
                <button className="rounded-full bg-[#0C213A] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0A1A2E] transition shadow-md cursor-pointer">
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
