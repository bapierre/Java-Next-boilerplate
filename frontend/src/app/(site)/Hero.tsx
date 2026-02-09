import Link from "next/link";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-white mt-6 min-h-screen flex items-center px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl w-full mx-auto py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-purple-100 rounded-full border-2 border-purple-300">
            <Activity className="w-5 h-5 text-purple-700" />
            <span className="text-purple-700 text-base font-bold">Live Analytics</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-purple-700 text-base font-bold">Multi-Channel</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black mb-8 text-gray-900 leading-tight">
            All Your Marketing Stats
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
              In One Place
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-2xl text-gray-700 mb-14 max-w-4xl mx-auto leading-relaxed font-semibold">
            Track TikTok, Instagram, and YouTube Shorts performance across all your SaaS products.
            Stop switching between platforms—see everything in one unified dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center mb-20">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-5 rounded-xl font-extrabold text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              <TrendingUp className="w-6 h-6" />
              Start Tracking Free
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 border-3 border-purple-400 hover:border-purple-500 text-purple-700 hover:bg-purple-100 px-10 py-5 rounded-xl font-extrabold text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="w-6 h-6" />
              See How It Works
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-8 hover:border-purple-400 hover:shadow-xl transition-all">
              <div className="text-5xl font-black text-purple-700 mb-3">3+</div>
              <div className="text-gray-700 text-base font-bold">Platforms Supported</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-8 hover:border-purple-400 hover:shadow-xl transition-all">
              <div className="text-5xl font-black text-purple-700 mb-3">Real-time</div>
              <div className="text-gray-700 text-base font-bold">Analytics Tracking</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-8 hover:border-purple-400 hover:shadow-xl transition-all">
              <div className="text-5xl font-black text-purple-700 mb-3">Unlimited</div>
              <div className="text-gray-700 text-base font-bold">Projects & Channels</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
