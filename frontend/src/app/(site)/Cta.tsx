export default function CTA() {
  return (
    <section className="relative bg-gradient-to-br from-purple-600 to-purple-800 px-4 py-32 md:py-40">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
          Start Tracking Your Marketing Today
        </h2>
        <p className="mb-10 text-xl text-purple-100 md:text-2xl font-semibold">
          Join marketers who are simplifying their analytics workflow with MarketiStats.
        </p>
        <a
          href="/auth/register"
          className="inline-flex items-center gap-3 rounded-xl bg-white px-12 py-5 text-xl font-extrabold text-purple-700 transition-all hover:bg-gray-50 shadow-2xl hover:shadow-3xl hover:scale-105"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 10V3L4 14H11V21L20 10H13Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Get Started Free
        </a>
      </div>
    </section>
  );
}
