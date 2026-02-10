"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <div className="flex md:hidden">
        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900"
        >
          <span className="sr-only">Toggle menu</span>
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="#features"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-purple-600"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-purple-600"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-purple-600"
              onClick={toggleMenu}
            >
              FAQ
            </Link>
            <Link
              href="/dashboard"
              className="block rounded-md px-3 py-2 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 text-center"
              onClick={toggleMenu}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
