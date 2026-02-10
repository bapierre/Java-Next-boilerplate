import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — MarketiStats",
};

export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-gray-500 hover:text-gray-900 text-sm inline-flex items-center gap-1 mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
            clipRule="evenodd"
          />
        </svg>
        Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: 10 February 2026</p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6 text-[15px] leading-relaxed">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
          MarketiStats website at{" "}
          <a href="https://marketistats.com" className="text-purple-600 hover:underline">
            marketistats.com
          </a>{" "}
          (the &quot;Service&quot;), operated by MarketiStats (&quot;we&quot;, &quot;us&quot;,
          or &quot;our&quot;). By creating an account or using the Service, you agree to be
          bound by these Terms. If you do not agree, do not use the Service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">1. Description of the Service</h2>
        <p>
          MarketiStats is a software-as-a-service (SaaS) platform that allows users to connect
          their social media accounts (TikTok, Instagram, YouTube, X/Twitter, Facebook) and view aggregated marketing analytics in a single dashboard. The Service
          may include free and paid subscription tiers.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">2. Eligibility</h2>
        <p>
          You must be at least 16 years of age and have the legal capacity to enter into a
          binding agreement to use the Service. By using the Service, you represent and warrant
          that you meet these requirements. If you are using the Service on behalf of an
          organisation, you represent that you have the authority to bind that organisation to
          these Terms.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">3. Account Registration</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            You must provide accurate and complete information when creating your account.
          </li>
          <li>
            You are responsible for maintaining the confidentiality of your login credentials
            and for all activities that occur under your account.
          </li>
          <li>
            You must notify us immediately at{" "}
            <a href="mailto:contact@marketistats.com" className="text-purple-600 hover:underline">
              contact@marketistats.com
            </a>{" "}
            if you suspect any unauthorised access to your account.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">4. Connected Social Media Accounts</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            When you connect a social media platform, you authorise MarketiStats to access your
            public channel data and analytics through the platform&apos;s official API using
            OAuth tokens.
          </li>
          <li>
            We only request read-only access to analytics data. We do not post, modify, or
            delete any content on your social media accounts.
          </li>
          <li>
            You may disconnect any connected platform at any time from your dashboard. Upon
            disconnection, the associated OAuth tokens are deleted immediately.
          </li>
          <li>
            You remain solely responsible for your social media accounts and for complying with
            each platform&apos;s own terms of service.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">5. Subscriptions and Payments</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Paid features are available through subscription plans. Prices and plan details are
            displayed on the Service before purchase.
          </li>
          <li>
            All payments are processed securely by Stripe. We do not store your credit card
            information.
          </li>
          <li>
            Subscriptions renew automatically at the end of each billing period unless cancelled
            before the renewal date.
          </li>
          <li>
            You may cancel your subscription at any time from your account settings. Cancellation
            takes effect at the end of the current billing period — no partial refunds are issued
            for the remaining days.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">6. Right of Withdrawal (EU Consumers)</h2>
        <p>
          Under the EU Consumer Rights Directive (2011/83/EU), if you are a consumer in the
          European Union, you have the right to withdraw from your purchase within 14 days of
          the subscription start date without giving any reason. To exercise this right, contact
          us at{" "}
          <a href="mailto:contact@marketistats.com" className="text-purple-600 hover:underline">
            contact@marketistats.com
          </a>{" "}
          with your account email and a clear statement of your decision to withdraw. If you
          have already used the Service during the withdrawal period, we may deduct a
          proportional amount for the service provided.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">7. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Use the Service for any unlawful purpose or in violation of any applicable laws or
            regulations.
          </li>
          <li>
            Attempt to gain unauthorised access to the Service, other accounts, or any related
            systems or networks.
          </li>
          <li>
            Reverse engineer, decompile, or otherwise attempt to derive the source code of the
            Service.
          </li>
          <li>
            Use automated means (bots, scrapers) to access the Service beyond the features
            explicitly provided.
          </li>
          <li>
            Resell, sublicense, or redistribute the Service or any data obtained through it
            without our prior written consent.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">8. Intellectual Property</h2>
        <p>
          All content, design, code, and trademarks associated with the Service are the
          exclusive property of MarketiStats or its licensors. Your use of the Service does not
          grant you any ownership rights. The analytics data retrieved from your connected
          social accounts remains yours — we claim no ownership over it.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">9. Availability and Warranties</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            The Service is provided &quot;as is&quot; and &quot;as available&quot;. We strive for
            high uptime but do not guarantee uninterrupted or error-free operation.
          </li>
          <li>
            Analytics data depends on third-party social media APIs, which may be temporarily
            unavailable, rate-limited, or changed by the platform at any time.
          </li>
          <li>
            We do not warrant the accuracy, completeness, or timeliness of analytics data
            retrieved from third-party platforms.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, MarketiStats shall not be liable
          for any indirect, incidental, special, consequential, or punitive damages, including
          loss of profits, data, or business opportunities, arising out of or related to your
          use of the Service. Our total aggregate liability shall not exceed the amount you paid
          to us in the 12 months preceding the event giving rise to the claim. Nothing in these
          Terms excludes or limits liability for death or personal injury caused by negligence,
          fraud, or any other liability that cannot be excluded under applicable EU law.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">11. Account Termination</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            You may delete your account at any time. Upon deletion, your personal data will be
            erased in accordance with our{" "}
            <Link href="/privacy-policy" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </li>
          <li>
            We may suspend or terminate your account if you materially breach these Terms, after
            providing reasonable notice where practicable.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">12. Data Protection</h2>
        <p>
          We process personal data in accordance with the General Data Protection Regulation
          (EU) 2016/679. For full details on data collection, use, retention, and your rights,
          please refer to our{" "}
          <Link href="/privacy-policy" className="text-purple-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">13. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of France,
          without regard to its conflict of law provisions. Any dispute arising out of or in
          connection with these Terms shall be submitted to the exclusive jurisdiction of the
          competent courts of France. If you are an EU consumer, you retain the right to bring
          proceedings in the courts of your country of residence as provided by Regulation (EU)
          No 1215/2012.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">14. Changes to These Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be
          communicated via email at least 14 days before they take effect. Your continued use of
          the Service after the effective date constitutes acceptance of the revised Terms. If
          you do not agree with the changes, you must stop using the Service and delete your
          account.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">15. Severability</h2>
        <p>
          If any provision of these Terms is held to be invalid or unenforceable by a court of
          competent jurisdiction, the remaining provisions shall remain in full force and effect.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">16. Contact</h2>
        <p>
          For any questions about these Terms, contact us at:
        </p>
        <p>
          MarketiStats<br />
          Email:{" "}
          <a href="mailto:contact@marketistats.com" className="text-purple-600 hover:underline">
            contact@marketistats.com
          </a>
        </p>
      </div>
    </main>
  );
}
