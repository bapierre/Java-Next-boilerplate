import { CheckCircle2, Code, Database, Lock, Mail, CreditCard, Gauge, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  tech: string;
}

export default function FeaturesSection() {
  const features: Feature[] = [
    {
      icon: <Lock className="w-6 h-6 text-green-400" />,
      title: "Authentication Ready",
      description: "Complete auth system with JWT validation, cookie-based sessions, email/password, magic links, and Google OAuth.",
      tech: "Supabase Auth + Spring Security"
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-400" />,
      title: "Payment Integration",
      description: "Full Stripe integration with checkout sessions, subscription management, and secure webhook handling.",
      tech: "Stripe API + Spring Boot"
    },
    {
      icon: <Database className="w-6 h-6 text-purple-400" />,
      title: "Database Migrations",
      description: "Version-controlled database schema with Flyway migrations, PostgreSQL with Spring Data JPA.",
      tech: "Flyway + PostgreSQL"
    },
    {
      icon: <Mail className="w-6 h-6 text-yellow-400" />,
      title: "Email System",
      description: "Transactional emails with Mailgun integration, webhook signature verification, and template support.",
      tech: "Mailgun API"
    },
    {
      icon: <Code className="w-6 h-6 text-cyan-400" />,
      title: "Modern Frontend",
      description: "Next.js 16 with App Router, React 19, TypeScript, Tailwind CSS v4, and server components.",
      tech: "Next.js + React + TypeScript"
    },
    {
      icon: <Gauge className="w-6 h-6 text-orange-400" />,
      title: "Performance Optimized",
      description: "Virtual threads (Java 21), Spring Cache, async processing, AVIF/WebP image optimization.",
      tech: "Java 21 + Spring Boot 3"
    },
    {
      icon: <Shield className="w-6 h-6 text-red-400" />,
      title: "Security First",
      description: "CSP headers, CORS configuration, JWKS caching, webhook signature validation, non-root Docker containers.",
      tech: "Spring Security + Next.js"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-green-400" />,
      title: "Production Ready",
      description: "Docker Compose setup, multi-stage Dockerfiles, health checks, logging, and comprehensive documentation.",
      tech: "Docker + Docker Compose"
    }
  ];

  return (
    <div id="features" className="bg-[#0F0F0F] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#FFBE18] font-medium mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Ship Fast
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Production-ready features built with modern technologies. No more spending weeks on boilerplate code.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-[#1C1C1C] border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                {feature.description}
              </p>
              <div className="inline-block bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full">
                {feature.tech}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
