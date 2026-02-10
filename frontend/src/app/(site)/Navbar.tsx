import Link from "next/link";
import { Zap } from "lucide-react";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Zap
              className="h-8 w-8"
              fill="#7C3AED"
              stroke="white"
              strokeWidth={1.4}
            />
            <span className="text-lg font-bold text-gray-900">MarketiStats</span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-base text-gray-600 transition hover:text-purple-600 font-medium"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-base text-gray-600 transition hover:text-purple-600 font-medium"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-base text-gray-600 transition hover:text-purple-600 font-medium"
          >
            FAQ
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/dashboard"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            Login
          </Link>
        </div>

        <MobileMenu />
      </div>
    </nav>
  );
}
