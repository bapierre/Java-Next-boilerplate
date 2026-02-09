export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                MarketiStats
              </span>
            </div>
            <p className="text-sm text-gray-600">Track all your marketing channels in one place</p>
            <p className="text-sm text-gray-500">
              Copyright © 2025 - All rights reserved
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-700">
              Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/bapierre/Java-Next-boilerplate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-700">
              Legal
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/tos"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-700">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@marketistats.com"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/docs"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          © 2025 MarketiStats. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
