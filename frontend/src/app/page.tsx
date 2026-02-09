import { Metadata } from "next";
import CTA from "@/app/(site)/Cta";
import FAQ from "@/app/(site)/Faq";
import Footer from "@/app/(site)/Footer";
import HeroSection from "@/app/(site)/Hero";
import Navbar from "@/app/(site)/Navbar";
import PricingSection from "@/app/(site)/pricing";
import FeaturesSection from "@/app/(site)/Features";

// Metadata for the homepage
export const metadata: Metadata = {
  title: "MarketiStats - All Your Marketing Stats in One Dashboard",
};

export default function Home() {
  return (
    <div className="bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
