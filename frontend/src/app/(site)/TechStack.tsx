export default function TechStack() {
  const techCategories = [
    {
      category: "Backend",
      color: "text-green-400",
      technologies: [
        { name: "Spring Boot 3.2", description: "Enterprise Java framework" },
        { name: "Java 21", description: "Virtual threads & modern features" },
        { name: "Spring Security", description: "JWT authentication" },
        { name: "Spring Data JPA", description: "Database abstraction" },
        { name: "Flyway", description: "Database migrations" },
        { name: "Lombok", description: "Reduce boilerplate" }
      ]
    },
    {
      category: "Frontend",
      color: "text-blue-400",
      technologies: [
        { name: "Next.js 16", description: "React framework with App Router" },
        { name: "React 19", description: "Latest React features" },
        { name: "TypeScript", description: "Type-safe development" },
        { name: "Tailwind CSS v4", description: "Utility-first styling" },
        { name: "Radix UI", description: "Accessible components" },
        { name: "Lucide Icons", description: "Beautiful icons" }
      ]
    },
    {
      category: "Infrastructure",
      color: "text-purple-400",
      technologies: [
        { name: "PostgreSQL", description: "Relational database" },
        { name: "Supabase", description: "Auth & database hosting" },
        { name: "Docker", description: "Containerization" },
        { name: "Docker Compose", description: "Multi-container setup" }
      ]
    },
    {
      category: "Integrations",
      color: "text-yellow-400",
      technologies: [
        { name: "Stripe", description: "Payments & subscriptions" },
        { name: "Mailgun", description: "Transactional emails" },
        { name: "Supabase Auth", description: "Authentication provider" }
      ]
    }
  ];

  return (
    <div className="bg-[#212121] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#FFBE18] font-medium mb-4">Technology Stack</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Modern, Battle-Tested Technologies
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Built with industry-standard tools that scale. No experimental frameworks, just proven technologies used by thousands of companies.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techCategories.map((category, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className={`text-xl font-bold ${category.color}`}>
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.technologies.map((tech, techIdx) => (
                  <div key={techIdx} className="bg-[#1C1C1C] p-4 rounded-lg border border-zinc-800">
                    <p className="text-white font-semibold text-sm mb-1">
                      {tech.name}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {tech.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-zinc-400 mb-4">
            Everything is configured and ready to use. Just clone, configure your API keys, and start building.
          </p>
          <a
            href="https://github.com/bapierre/Java-Next-boilerplate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#FFBE18] hover:text-yellow-500 font-semibold transition-colors"
          >
            View Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}
