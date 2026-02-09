import { Video, BarChart2, TrendingUp, Zap, Users, Eye, Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeaturesSection() {
  const features: Feature[] = [
    {
      icon: <Video className="w-7 h-7 text-white" />,
      title: "Multi-Platform Tracking",
      description: "Connect TikTok, Instagram, and YouTube Shorts accounts. Track all your short-form video content in one dashboard."
    },
    {
      icon: <BarChart2 className="w-7 h-7 text-white" />,
      title: "Performance Analytics",
      description: "See views, likes, comments, and shares for each post. Identify your best-performing content at a glance."
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      title: "Growth Tracking",
      description: "Monitor follower growth, engagement rates, and channel performance over time with historical data."
    },
    {
      icon: <Zap className="w-7 h-7 text-white" />,
      title: "Real-Time Updates",
      description: "Get the latest stats for your channels and posts. Stay on top of trending content as it happens."
    },
    {
      icon: <Users className="w-7 h-7 text-white" />,
      title: "Multi-Project Support",
      description: "Managing multiple SaaS products? Track marketing stats for all your projects in one place."
    },
    {
      icon: <Eye className="w-7 h-7 text-white" />,
      title: "Content Insights",
      description: "Compare post performance across platforms. See what content resonates best with your audience."
    },
    {
      icon: <Heart className="w-7 h-7 text-white" />,
      title: "Engagement Metrics",
      description: "Track engagement rates, watch time, and audience interaction metrics for every piece of content."
    },
    {
      icon: <MessageCircle className="w-7 h-7 text-white" />,
      title: "Channel Overview",
      description: "Get a bird's-eye view of all your social channels. See total reach, engagement, and content performance."
    }
  ];

  return (
    <div id="features" className="bg-purple-100 py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-purple-700 font-bold mb-4 uppercase tracking-wider text-sm">Features</p>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Everything You Need to Track Your Marketing
          </h2>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto font-medium">
            Stop juggling multiple analytics dashboards. MarketiStats brings all your marketing data together.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-4 p-3 bg-purple-600 rounded-xl w-fit">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-700 mb-6 text-lg font-medium">
            Ready to see your marketing stats in action?
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </div>
  );
}
