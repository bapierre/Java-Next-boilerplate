export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#0F0F0F] px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white">
                ⚡ ShipFree
              </span>
            </div>
            <p className="text-sm text-zinc-400">Built for makers, by makers</p>
            <p className="text-sm text-zinc-500">
              Copyright © 2025 - All rights reserved
            </p>
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-500 bg-zinc-800/50 px-4 py-2 text-xs text-zinc-400">
              Built with ⚡ ShipFree
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              🚀 Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#wall-of-love"
                  className="text-zinc-400 hover:text-white"
                >
                  Wall of love
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-zinc-400 hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/idee8agency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/idee8/shipfree"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white"
                >
                  Github
                </a>
              </li>
              <li>
                <a
                  href="https://shipfree.idee8.agency/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              📜 Legal
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/tos"
                  className="text-zinc-400 hover:text-white"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-zinc-400 hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* By the Creator Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              🌎 By the Creator of ShipFree
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://idee8.agency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white"
                >
                  Idee8
                </a>
              </li>
              <li>
                <a
                  href="https://codementor.idee8.agency"
                  className="text-zinc-400 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code Mentor
                </a>
              </li>
              <li>
                <a
                  href="https://reactai.idee8.agency"
                  className="text-zinc-400 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  React AI
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-500">
          © 2025 ShipFree. All Rights Reserved. Cooked for you by{" "}
          <a
            href="https://idee8.agency"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white"
          >
            idee8.agency
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
