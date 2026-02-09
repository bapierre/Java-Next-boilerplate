interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What platforms does MarketiStats support?",
    answer:
      "Currently, MarketiStats tracks TikTok, Instagram, and YouTube Shorts. We're focusing on short-form video content across these three major platforms to give you a complete view of your marketing performance.",
  },
  {
    question: "How often does the data sync?",
    answer:
      "Free plan: Daily sync updates. Pro plan: Hourly sync updates. You can also manually trigger a sync anytime from your dashboard to get the latest stats.",
  },
  {
    question: "Can I track multiple SaaS projects?",
    answer:
      "Yes! Pro plan users get unlimited projects. This is perfect if you're managing marketing for multiple products and want to see all your stats in one place.",
  },
  {
    question: "Do I need API keys for each platform?",
    answer:
      "Yes, you'll need to connect your accounts through OAuth or provide API keys for each platform you want to track. We provide step-by-step guides for each integration.",
  },
  {
    question: "How far back can I see historical data?",
    answer:
      "Free plan: 7-day data history. Pro plan: 90-day data history. This lets you track trends and compare performance over time to optimize your marketing strategy.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! You can start with our free Starter plan (no credit card required). Pro plan also includes a 14-day free trial so you can test all premium features before committing.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Pro plan users can export data in CSV or PDF format. This is great for reporting, sharing with your team, or analyzing data in your preferred tools.",
  },
  {
    question: "What metrics do you track?",
    answer:
      "We track views, likes, comments, shares, follower growth, engagement rates, and watch time for each post. You'll also get channel-level stats and performance comparisons across platforms.",
  },
];

export default function FAQ() {
  return (
    <div
      id="faq"
      className="min-h-screen bg-purple-50 px-4 py-24 md:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-purple-700 font-bold mb-4 uppercase tracking-wider text-sm text-center">FAQ</p>
        <h2 className="mb-6 text-center text-5xl md:text-6xl font-extrabold text-gray-900">
          Frequently Asked Questions
        </h2>
        <p className="mb-16 text-center text-xl text-gray-700 font-medium">
          Have another question?{" "}
          <a
            href="mailto:support@marketistats.com"
            className="text-purple-700 hover:text-purple-800 underline font-bold"
          >
            Contact us
          </a>
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group overflow-hidden rounded-xl border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all">
              <summary className="flex w-full cursor-pointer items-center justify-between bg-white px-6 py-5 text-left transition-colors hover:bg-gray-50 list-none [&::-webkit-details-marker]:hidden">
                <span className="text-lg font-bold text-gray-900">
                  {faq.question}
                </span>
                <span className="ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-purple-600 bg-purple-50">
                  <PlusIcon className="h-4 w-4 text-purple-700 transition-transform duration-200 group-open:rotate-45 stroke-[3]" />
                </span>
              </summary>
              <div className="bg-gray-50 px-6 py-5 text-base text-gray-700 border-t-2 border-gray-200 font-medium leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}
