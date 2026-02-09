import { CloudRain } from "lucide-react";

function HackerNewsIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M0 0v24h24V0H0zm12.3 13.3c-.1 0-.2.1-.3.1s-.2 0-.3-.1l-3.6-6.4h1.8l2.1 4 2.1-4h1.8l-3.6 6.4zm-.3 5.3h-.1v-4.7h.2v4.7h-.1z" />
    </svg>
  );
}

function ProductHuntIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 0 0 1.8-1.8 1.8 1.8 0 0 0-1.8-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 0 1 4.199 4.2 4.2 4.2 0 0 1-4.2 4.2z" />
    </svg>
  );
}

function TwitterIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z" />
    </svg>
  );
}

function GitHubIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function FeaturedTime() {
  const timeBreakdown = [
    { time: 4, task: "to set up emails" },
    { time: 6, task: "designing a landing page" },
    { time: 4, task: "to handle Stripe webhooks" },
    { time: 2, task: "for SEO tags" },
    { time: 1, task: "applying for Google Oauth" },
    { time: 3, task: "for DNS records" },
    { time: 2, task: "for protected API routes" },
    { time: "∞", task: "overthinking..." },
  ];

  return (
    <div className="bg-[#212121] text-gray-300 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-20">
        {/* Featured section */}
        <div className="text-center space-y-6">
          <p className="text-gray-300 text-lg uppercase tracking-wider mb-6">
            Featured on
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-gray-400">
              <HackerNewsIcon className="w-6 h-6" />
              <span className="text-base">Hacker News</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <ProductHuntIcon className="w-6 h-6" />
              <span className="text-base">Product Hunt</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <TwitterIcon className="w-6 h-6" />
              <span className="text-base">Twitter</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <GitHubIcon className="w-6 h-6" />
              <span className="text-base">GitHub</span>
            </div>
          </div>
        </div>

        {/* Time breakdown section */}
        <div className="max-w-lg mx-auto bg-[#1a1208] rounded-lg p-8 space-y-3 text-center">
          {timeBreakdown.map((item, index) => (
            <div
              key={index}
              className="flex justify-center items-center gap-2 text-lg"
            >
              {index !== 0 && <span className="text-gray-500">+</span>}
              <span className="text-red-400 font-semibold">
                {item.time} {typeof item.time === "number" && "hrs"}
              </span>
              <span className="text-gray-400">{item.task}</span>
            </div>
          ))}

          <div className="flex justify-center items-center gap-3 pt-4 text-xl font-semibold">
            <span className="text-gray-500">=</span>
            <span className="text-red-400">22+ hours</span>
            <span className="text-gray-300">of headaches</span>
            <CloudRain className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Bottom arrow */}
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">&darr;</div>
          <p className="text-sm">There&apos;s an easier way</p>
        </div>
      </div>
    </div>
  );
}
