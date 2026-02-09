interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Java-Next Boilerplate?",
    answer:
      "A full-stack SaaS boilerplate combining Spring Boot 3 (Java 21) backend with Next.js 16 frontend. It includes authentication, payments, email, and everything you need to launch a production-ready SaaS application.",
  },
  {
    question: "Is this really free?",
    answer:
      "Yes! Java-Next Boilerplate is open-source under the MIT license. You can use it for personal or commercial projects without any restrictions.",
  },
  {
    question: "What technologies does it use?",
    answer:
      "Backend: Spring Boot 3, Java 21, PostgreSQL, Flyway. Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4. Integrations: Supabase Auth, Stripe, Mailgun. Infrastructure: Docker, Docker Compose.",
  },
  {
    question: "What do I need to get started?",
    answer:
      "You need Java 21+, Maven, Node.js 20+, npm, and accounts for Supabase (database + auth), Stripe (payments), and optionally Mailgun (emails). All are free to start.",
  },
  {
    question: "How is authentication handled?",
    answer:
      "Authentication uses Supabase Auth with JWT tokens stored in cookies. The backend validates JWTs using Spring Security with JWKS caching for performance. Supports email/password, magic links, and Google OAuth.",
  },
  {
    question: "Can I use this for commercial projects?",
    answer:
      "Absolutely! The MIT license allows you to use this boilerplate for any purpose, including commercial projects. You can modify, distribute, and sell applications built with it.",
  },
  {
    question: "How do I deploy this to production?",
    answer:
      "The project includes Docker and Docker Compose configurations for easy deployment. You can deploy to any cloud provider that supports Docker (AWS, Google Cloud, DigitalOcean, Render, Railway, etc.).",
  },
  {
    question: "Does it include a database?",
    answer:
      "Yes! It uses PostgreSQL with Flyway for version-controlled migrations. The default setup connects to Supabase's managed PostgreSQL, but you can use any PostgreSQL instance.",
  },
  {
    question: "How are payments handled?",
    answer:
      "Stripe integration is built-in with checkout sessions, subscription management, and webhook handling. The backend securely validates webhook signatures and updates your database accordingly.",
  },
  {
    question: "Can I contribute to this project?",
    answer:
      "Yes! This is an open-source project and we welcome contributions. Feel free to submit issues, feature requests, or pull requests on GitHub.",
  },
];

export default function FAQ() {
  return (
    <div
      id="faq"
      className="min-h-screen bg-[#0F0F0F] px-4 py-12 md:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-center text-4xl font-medium text-white">
          Frequently Asked Questions
        </h2>
        <p className="mb-12 text-center text-base text-zinc-500">
          Have another question? Open an issue on{" "}
          <a
            href="https://github.com/bapierre/Java-Next-boilerplate/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-200 hover:text-white underline"
          >
            GitHub
          </a>
          .
        </p>

        <div className="space-y-[2px]">
          {faqs.map((faq, index) => (
            <details key={index} className="group overflow-hidden">
              <summary className="flex w-full cursor-pointer items-center justify-between bg-zinc-900/50 px-6 py-4 text-left transition-colors hover:bg-zinc-900 list-none [&::-webkit-details-marker]:hidden">
                <span className="text-[16px] font-medium text-white">
                  {faq.question}
                </span>
                <span className="ml-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-700">
                  <PlusIcon className="h-3 w-3 text-white transition-transform duration-200 group-open:rotate-45" />
                </span>
              </summary>
              <div className="bg-zinc-900/30 px-6 py-4 text-base text-zinc-400">
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
