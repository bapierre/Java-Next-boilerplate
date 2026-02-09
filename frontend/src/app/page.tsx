import { Metadata } from "next";
import CTA from "@/app/(site)/Cta";
import FAQ from "@/app/(site)/Faq";
import FeaturedTime from "@/app/(site)/FeaturedTime";
import Footer from "@/app/(site)/Footer";
import HeroSection from "@/app/(site)/Hero";
import Navbar from "@/app/(site)/Navbar";
import PricingSection from "@/app/(site)/pricing";
import FeaturesSection from "@/app/(site)/Features";
import TechStack from "@/app/(site)/TechStack";

// Metadata for the homepage
export const metadata: Metadata = {
  title: "Java-Next Boilerplate - Open Source Full-Stack SaaS Starter",
};

export default function Home() {
  return (
    <div className="bg-[#212121]">
      <Navbar />
      <HeroSection />
      <FeaturedTime />
      <FeaturesSection />
      <TechStack />
      <PricingSection />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
