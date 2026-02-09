import Link from "next/link";
import { Zap } from "lucide-react";
import Image from "next/image";

const HeroSection = () => {
  return (
    <div className="bg-[#212121] mt-6 min-h-screen flex items-center px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl w-full mx-auto py-16 flex flex-col lg:flex-row justify-between items-center">
        <div className="w-full lg:w-1/2 mb-12 lg:mb-0 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[#2C2C2C] rounded-full">
            <span className="text-green-400 text-sm font-medium">✓ Open Source</span>
            <span className="text-zinc-400 text-sm">•</span>
            <span className="text-blue-400 text-sm font-medium">Production Ready</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-[#CFCFCF] leading-tight">
            Full-Stack SaaS
            <br />
            <span className="bg-[#CFCFCF] text-[#2E1A05] px-2">in Minutes</span>
          </h1>

          <p className="text-base text-[#CFCFCF] mb-8 max-w-2xl mx-auto lg:mx-0">
            Production-ready boilerplate combining{" "}
            <span className="text-[#FFBE1A] font-semibold">Spring Boot 3</span> backend with{" "}
            <span className="text-[#FFBE1A] font-semibold">Next.js 16</span> frontend.
            Includes authentication, payments, email, and all the features you need to launch fast.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start mb-8">
            <Link
              href="https://github.com/bapierre/Java-Next-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#FFBE1A] hover:bg-yellow-500 text-black px-8 py-3 rounded-xl font-medium text-lg transition-colors duration-300"
            >
              <Zap fill="#000000" className="w-5 h-5" />
              Get Started
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#CFCFCF] hover:bg-[#CFCFCF] hover:text-[#212121] text-[#CFCFCF] px-8 py-3 rounded-xl font-medium text-lg transition-all duration-300"
            >
              View Features
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
            <div className="text-center lg:text-left">
              <div className="text-[#FFBE1A] font-bold text-2xl">Spring Boot</div>
              <div className="text-zinc-400 text-sm">Backend</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-[#FFBE1A] font-bold text-2xl">Next.js 16</div>
              <div className="text-zinc-400 text-sm">Frontend</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-[#FFBE1A] font-bold text-2xl">Supabase</div>
              <div className="text-zinc-400 text-sm">Auth + DB</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-[#FFBE1A] font-bold text-2xl">Stripe</div>
              <div className="text-zinc-400 text-sm">Payments</div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
          <Image
            src="/techstack.webp"
            alt="Tech Stack Visualization"
            width={500}
            height={500}
            priority
            className="w-full max-w-md lg:max-w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
